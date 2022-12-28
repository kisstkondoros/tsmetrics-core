import { readFileSync } from "fs";
import * as ts from "typescript";

import { MetricsModel, IMetricsModel, CollectorType } from "./MetricsModel";
import { IMetricsConfiguration } from "./MetricsConfiguration";

interface CodeMetricsTsExpression {
  __code_metrics_ignore?: boolean;
}

export interface IMetricsParseResult {
  file: string;
  metrics: IMetricsModel;
}

export interface IMetricsParser {
  getMetrics(
    fileName: string,
    configuration: IMetricsConfiguration,
    target: ts.ScriptTarget
  ): IMetricsParseResult;
  getMetricsFromText(
    fileName: string,
    content: string,
    configuration: IMetricsConfiguration,
    target: ts.ScriptTarget
  ): IMetricsParseResult;
}

export class MetricsParserImpl implements IMetricsParser {
  public getMetrics(
    fileName: string,
    configuration: IMetricsConfiguration,
    target: ts.ScriptTarget
  ): IMetricsParseResult {
    const content = readFileSync(fileName);
    return this.getMetricsFromText(
      fileName,
      content.toString(),
      configuration,
      target
    );
  }

  public getMetricsFromText(
    fileName: string,
    content: string,
    configuration: IMetricsConfiguration,
    target: ts.ScriptTarget
  ): IMetricsParseResult {
    let sourceFile: ts.SourceFile = ts.createSourceFile(
      fileName,
      content,
      target,
      true
    );
    let metricsVisitor: MetricsVisitor = new MetricsVisitor(sourceFile);
    let MetricsModel: MetricsModel = new TreeWalker(
      metricsVisitor,
      configuration
    ).walk(sourceFile);
    return { file: fileName, metrics: MetricsModel };
  }
}
export let MetricsParser: IMetricsParser = new MetricsParserImpl();

export interface IMetricsVisitor {
  currentModel: IMetricsModel;
  visit(
    node: ts.Node,
    complexity: number,
    description: string,
    visible?: boolean
  ): MetricsModel;
}

class MetricsVisitor implements IMetricsVisitor {
  sourceFile: ts.SourceFile;
  public currentModel: MetricsModel;
  constructor(sourceFile: ts.SourceFile) {
    this.sourceFile = sourceFile;
  }
  visit(
    node: ts.Node,
    complexity: number,
    description: string,
    visible?: boolean
  ): MetricsModel {
    let { line, character } = this.sourceFile.getLineAndCharacterOfPosition(
      node.getStart()
    );
    const collectorType: CollectorType =
      node.kind === ts.SyntaxKind.ClassDeclaration ? "MAX" : "SUM";
    let result: MetricsModel = new MetricsModel(
      node.getStart(),
      node.getEnd(),
      node.getText(),
      line + 1,
      character + 1,
      complexity,
      description,
      true,
      visible,
      collectorType
    );
    this.currentModel.children.push(result);
    return result;
  }
}

export class TreeWalker {
  visitor: IMetricsVisitor;
  configuration: IMetricsConfiguration;

  constructor(visitor: IMetricsVisitor, configuration: IMetricsConfiguration) {
    this.visitor = visitor;
    this.configuration = configuration;
  }

  protected visitNode(node: ts.Node, parent: MetricsModel) {
    this.visitor.currentModel = parent;
    let generatedLens: MetricsModel = this.getLens(node);
    if (
      generatedLens &&
      (node as CodeMetricsTsExpression).__code_metrics_ignore
    ) {
      generatedLens.complexity = 0;
    }
    let updatedParent = parent;
    if (generatedLens && generatedLens.visible) {
      updatedParent = generatedLens;
    }

    this.walkChildren(node, updatedParent);
  }

  protected getLens(node: ts.Node): MetricsModel {
    let generatedLens: MetricsModel;
    switch (node.kind) {
      case ts.SyntaxKind.AnyKeyword:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.AnyKeyword,
          this.configuration.AnyKeywordDescription
        );
        break;

      case ts.SyntaxKind.ArrayBindingPattern:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ArrayBindingPattern,
          this.configuration.ArrayBindingPatternDescription
        );
        break;

      case ts.SyntaxKind.ArrayLiteralExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ArrayLiteralExpression,
          this.configuration.ArrayLiteralExpressionDescription
        );
        break;

      case ts.SyntaxKind.ArrowFunction:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ArrowFunction,
          this.configuration.ArrowFunctionDescription,
          this.configuration.MetricsForArrowFunctionsToggled
        );
        break;

      case ts.SyntaxKind.BinaryExpression:
        let binaryExpression = <ts.BinaryExpression>node;
        if (
          binaryExpression.operatorToken.kind ==
            ts.SyntaxKind.AmpersandAmpersandToken ||
          binaryExpression.operatorToken.kind == ts.SyntaxKind.AmpersandToken ||
          binaryExpression.operatorToken.kind == ts.SyntaxKind.BarBarToken ||
          binaryExpression.operatorToken.kind == ts.SyntaxKind.BarToken
        ) {
          generatedLens = this.visitor.visit(
            node,
            this.configuration.BinaryExpression,
            this.configuration.BinaryExpressionDescription
          );
        }
        break;

      case ts.SyntaxKind.BindingElement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.BindingElement,
          this.configuration.BindingElementDescription
        );
        break;

      case ts.SyntaxKind.Block:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.Block,
          this.configuration.BlockDescription
        );
        break;

      case ts.SyntaxKind.BreakStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.BreakStatement,
          this.configuration.BreakStatementDescription
        );
        break;

      case ts.SyntaxKind.CallExpression:
        const callExpression = node as ts.CallExpression;
        const expression = callExpression.expression;
        generatedLens = this.visitor.visit(
          node,
          this.configuration.CallExpression,
          this.configuration.CallExpressionDescription
        );
        if (
          generatedLens &&
          expression &&
          expression.kind == ts.SyntaxKind.Identifier
        ) {
          const functionName = (expression as ts.Identifier).escapedText;
          const ignoredFunctionNames =
            this.configuration.IgnoredFunctionNames || [];
          if (ignoredFunctionNames.includes(functionName)) {
            callExpression.arguments.forEach(
              (argument) =>
                ((argument as CodeMetricsTsExpression).__code_metrics_ignore =
                  true)
            );
          }
        }
        break;

      case ts.SyntaxKind.CallSignature:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.CallSignature,
          this.configuration.CallSignatureDescription
        );
        break;

      case ts.SyntaxKind.CaseClause:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.CaseClause,
          this.configuration.CaseClauseDescription
        );
        break;

      case ts.SyntaxKind.ClassDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ClassDeclaration,
          this.configuration.ClassDeclarationDescription,
          this.configuration.MetricsForClassDeclarationsToggled
        );
        break;

      case ts.SyntaxKind.CatchClause:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.CatchClause,
          this.configuration.CatchClauseDescription
        );
        break;

      case ts.SyntaxKind.ConditionalExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ConditionalExpression,
          this.configuration.ConditionalExpressionDescription
        );
        break;

      case ts.SyntaxKind.Constructor:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.Constructor,
          this.configuration.ConstructorDescription,
          this.configuration.MetricsForConstructorsToggled
        );
        break;

      case ts.SyntaxKind.ConstructorType:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ConstructorType,
          this.configuration.ConstructorTypeDescription
        );
        break;

      case ts.SyntaxKind.ContinueStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ContinueStatement,
          this.configuration.ContinueStatementDescription
        );
        break;

      case ts.SyntaxKind.DebuggerStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.DebuggerStatement,
          this.configuration.DebuggerStatementDescription
        );
        break;

      case ts.SyntaxKind.DefaultClause:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.DefaultClause,
          this.configuration.DefaultClauseDescription
        );
        break;

      case ts.SyntaxKind.DoStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.DoStatement,
          this.configuration.DoStatementDescription
        );
        break;

      case ts.SyntaxKind.ElementAccessExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ElementAccessExpression,
          this.configuration.ElementAccessExpressionDescription
        );
        break;

      case ts.SyntaxKind.EnumDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.EnumDeclaration,
          this.configuration.EnumDeclarationDescription,
          this.configuration.MetricsForEnumDeclarationsToggled
        );
        break;

      case ts.SyntaxKind.ExportAssignment:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ExportAssignment,
          this.configuration.ExportAssignmentDescription
        );
        break;

      case ts.SyntaxKind.ExpressionStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ExpressionStatement,
          this.configuration.ExportAssignmentDescription
        );
        break;

      case ts.SyntaxKind.ForStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ForStatement,
          this.configuration.ForStatementDescription
        );
        break;

      case ts.SyntaxKind.ForInStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ForInStatement,
          this.configuration.ForInStatementDescription
        );
        break;

      case ts.SyntaxKind.ForOfStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ForOfStatement,
          this.configuration.ForOfStatementDescription
        );
        break;

      case ts.SyntaxKind.FunctionDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.FunctionDeclaration,
          this.configuration.FunctionDeclarationDescription,
          this.configuration.MetricsForFunctionDeclarationsToggled
        );
        break;

      case ts.SyntaxKind.FunctionExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.FunctionExpression,
          this.configuration.FunctionExpressionDescription,
          this.configuration.MetricsForFunctionExpressionsToggled
        );
        break;

      case ts.SyntaxKind.FunctionType:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.FunctionType,
          this.configuration.FunctionTypeDescription
        );
        break;

      case ts.SyntaxKind.GetAccessor:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.GetAccessor,
          this.configuration.GetAccessorDescription,
          this.configuration.MetricsForFunctionExpressionsToggled
        );
        break;

      case ts.SyntaxKind.Identifier:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.Identifier,
          this.configuration.IdentifierDescription
        );
        break;

      case ts.SyntaxKind.IfStatement:
        let ifNode = <ts.IfStatement>node;
        if (ifNode.elseStatement) {
          generatedLens = this.visitor.visit(
            ifNode,
            this.configuration.IfWithElseStatement,
            this.configuration.IfWithElseStatementDescription
          );
        } else {
          generatedLens = this.visitor.visit(
            ifNode,
            this.configuration.IfStatement,
            this.configuration.IfStatementDescription
          );
        }
        break;

      case ts.SyntaxKind.ImportDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ImportDeclaration,
          this.configuration.ImportDeclarationDescription
        );
        break;

      case ts.SyntaxKind.ImportEqualsDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ImportEqualsDeclaration,
          this.configuration.ImportEqualsDeclarationDescription
        );
        break;

      case ts.SyntaxKind.IndexSignature:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.IndexSignature,
          this.configuration.IndexSignatureDescription
        );
        break;

      case ts.SyntaxKind.InterfaceDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.InterfaceDeclaration,
          this.configuration.InterfaceDeclarationDescription
        );
        break;

      case ts.SyntaxKind.JsxElement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.JsxElement,
          this.configuration.JsxElementDescription
        );
        break;

      case ts.SyntaxKind.JsxSelfClosingElement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.JsxSelfClosingElement,
          this.configuration.JsxSelfClosingElementDescription
        );
        break;

      case ts.SyntaxKind.LabeledStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.LabeledStatement,
          this.configuration.LabeledStatementDescription
        );
        break;

      case ts.SyntaxKind.MethodDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.MethodDeclaration,
          this.configuration.MethodDeclarationDescription,
          this.configuration.MetricsForMethodDeclarationsToggled
        );
        break;

      case ts.SyntaxKind.MethodSignature:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.MethodSignature,
          this.configuration.MethodSignatureDescription
        );
        break;

      case ts.SyntaxKind.ModuleDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ModuleDeclaration,
          this.configuration.ModuleDeclarationDescription
        );
        break;

      case ts.SyntaxKind.NamedImports:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.NamedImports,
          this.configuration.NamedImportsDescription
        );
        break;

      case ts.SyntaxKind.NamespaceImport:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.NamespaceImport,
          this.configuration.NamespaceImportDescription
        );
        break;

      case ts.SyntaxKind.NewExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.NewExpression,
          this.configuration.NewExpressionDescription
        );
        break;

      case ts.SyntaxKind.ObjectBindingPattern:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ObjectBindingPattern,
          this.configuration.ObjectBindingPatternDescription
        );
        break;

      case ts.SyntaxKind.ObjectLiteralExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ObjectLiteralExpression,
          this.configuration.ObjectLiteralExpressionDescription
        );
        break;

      case ts.SyntaxKind.Parameter:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.Parameter,
          this.configuration.ParameterDescription
        );
        break;

      case ts.SyntaxKind.PostfixUnaryExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.PostfixUnaryExpression,
          this.configuration.PostfixUnaryExpressionDescription
        );
        break;

      case ts.SyntaxKind.PrefixUnaryExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.PrefixUnaryExpression,
          this.configuration.PrefixUnaryExpressionDescription
        );
        break;

      case ts.SyntaxKind.PropertyAccessExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.PropertyAccessExpression,
          this.configuration.PropertyAccessExpressionDescription
        );
        break;

      case ts.SyntaxKind.PropertyAssignment:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.PropertyAssignment,
          this.configuration.PropertyAssignmentDescription
        );
        break;

      case ts.SyntaxKind.PropertyDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.PropertyDeclaration,
          this.configuration.PropertyDeclarationDescription
        );
        break;

      case ts.SyntaxKind.PropertySignature:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.PropertySignature,
          this.configuration.PropertySignatureDescription
        );
        break;

      case ts.SyntaxKind.RegularExpressionLiteral:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.RegularExpressionLiteral,
          this.configuration.RegularExpressionLiteralDescription
        );
        break;

      case ts.SyntaxKind.ReturnStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ReturnStatement,
          this.configuration.ReturnStatementDescription
        );
        break;

      case ts.SyntaxKind.SetAccessor:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.SetAccessor,
          this.configuration.SetAccessorDescription,
          this.configuration.MetricsForFunctionExpressionsToggled
        );
        break;

      case ts.SyntaxKind.SourceFile:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.SourceFile,
          this.configuration.SourceFileDescription
        );
        break;

      case ts.SyntaxKind.StringLiteral:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.StringLiteral,
          this.configuration.StringLiteralDescription
        );
        break;

      case ts.SyntaxKind.SwitchStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.SwitchStatement,
          this.configuration.SwitchStatementDescription
        );
        break;

      case ts.SyntaxKind.TemplateExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.TemplateExpression,
          this.configuration.TemplateExpressionDescription
        );
        break;

      case ts.SyntaxKind.ThrowStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.ThrowStatement,
          this.configuration.ThrowStatementDescription
        );
        break;

      case ts.SyntaxKind.TryStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.TryStatement,
          this.configuration.TryStatementDescription
        );
        break;

      case ts.SyntaxKind.TypeAssertionExpression:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.TypeAssertionExpression,
          this.configuration.TypeAssertionExpressionDescription
        );
        break;

      case ts.SyntaxKind.TypeLiteral:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.TypeLiteral,
          this.configuration.TypeLiteralDescription
        );
        break;

      case ts.SyntaxKind.TypeReference:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.TypeReference,
          this.configuration.TypeReferenceDescription
        );
        break;

      case ts.SyntaxKind.VariableDeclaration:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.VariableDeclaration,
          this.configuration.VariableDeclarationDescription
        );
        break;

      case ts.SyntaxKind.VariableStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.VariableStatement,
          this.configuration.VariableStatementDescription
        );
        break;

      case ts.SyntaxKind.WhileStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.WhileStatement,
          this.configuration.WhileStatementDescription
        );
        break;

      case ts.SyntaxKind.WithStatement:
        generatedLens = this.visitor.visit(
          node,
          this.configuration.WithStatement,
          this.configuration.WithStatementDescription
        );
        break;

      default:
        break;
    }
    return generatedLens;
  }

  public walk(node: ts.Node): MetricsModel {
    let { line, character } = node
      .getSourceFile()
      .getLineAndCharacterOfPosition(node.getStart());
    let result: MetricsModel = new MetricsModel(
      node.getStart(),
      node.getEnd(),
      node.getText(),
      line + 1,
      character + 1,
      0,
      "Collector",
      false,
      false,
      "SUM"
    );
    this.visitNode(node, result);
    return result;
  }

  protected walkChildren(node: ts.Node, parent: MetricsModel) {
    ts.forEachChild(node, (child) => {
      this.visitNode(child, parent);
    });
  }
}
