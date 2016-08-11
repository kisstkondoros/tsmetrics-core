"use strict";
var MetricsConfiguration = (function () {
    function MetricsConfiguration() {
        this.MetricsForClassDeclarationsToggled = true;
        this.MetricsForConstructorDescriptionsToggled = true;
        this.MetricsForEnumDeclarationDescriptionsToggled = true;
        this.MetricsForFunctionDeclarationsToggled = true;
        this.MetricsForFunctionExpressionsToggled = true;
        this.MetricsForMethodDeclarationsToggled = true;
        this.MetricsForArrowFunctionsToggled = true;
        this.ComplexityLevelExtreme = 25;
        this.ComplexityLevelHigh = 10;
        this.ComplexityLevelNormal = 5;
        this.ComplexityLevelLow = 0;
        this.CodeLensHiddenUnder = 3;
        this.ComplexityLevelExtremeDescription = 'Bloody hell...';
        this.ComplexityLevelHighDescription = 'You must be kidding';
        this.ComplexityLevelNormalDescription = 'It\'s time to do something...';
        this.ComplexityLevelLowDescription = 'Everything is cool!';
        this.ComplexityTemplate = 'Complexity is {0} {1}';
        this.AnyKeyword = 1;
        this.AnyKeywordDescription = 'Any keyword';
        this.ArrayBindingPattern = 0;
        this.ArrayBindingPatternDescription = 'Array binding pattern';
        this.ArrayLiteralExpression = 0;
        this.ArrayLiteralExpressionDescription = 'Array literal expression';
        this.ArrowFunction = 1;
        this.ArrowFunctionDescription = 'Arrow function';
        this.BinaryExpression = 1;
        this.BinaryExpressionDescription = 'Binary expression';
        this.BindingElement = 0;
        this.BindingElementDescription = 'Binding element';
        this.Block = 0;
        this.BlockDescription = 'Block';
        this.BreakStatement = 1;
        this.BreakStatementDescription = 'Break statement';
        this.CallExpression = 0;
        this.CallExpressionDescription = 'Call expression';
        this.CallSignature = 0;
        this.CallSignatureDescription = 'Call signature';
        this.CaseClause = 1;
        this.CaseClauseDescription = 'Case clause';
        this.ClassDeclaration = 0;
        this.ClassDeclarationDescription = 'Class declaration';
        this.CatchClause = 1;
        this.CatchClauseDescription = 'Catch clause';
        this.ConditionalExpression = 1;
        this.ConditionalExpressionDescription = 'Conditional expression';
        this.Constructor = 1;
        this.ConstructorDescription = 'Constructor';
        this.ConstructorType = 0;
        this.ConstructorTypeDescription = 'Constructor type';
        this.ContinueStatement = 1;
        this.ContinueStatementDescription = 'Continue statement';
        this.DebuggerStatement = 0;
        this.DebuggerStatementDescription = 'Debugger statement';
        this.DefaultClause = 1;
        this.DefaultClauseDescription = 'Default case';
        this.DoStatement = 1;
        this.DoStatementDescription = 'Do statement';
        this.ElementAccessExpression = 0;
        this.ElementAccessExpressionDescription = 'Element access expression';
        this.EnumDeclaration = 1;
        this.EnumDeclarationDescription = 'Enum declaration';
        this.ExportAssignment = 1;
        this.ExportAssignmentDescription = 'Export assignment';
        this.ExpressionStatement = 0;
        this.ExpressionStatementDescription = 'Expression statement';
        this.ForStatement = 1;
        this.ForStatementDescription = 'For statement';
        this.ForInStatement = 1;
        this.ForInStatementDescription = 'For in statement';
        this.ForOfStatement = 1;
        this.ForOfStatementDescription = 'For of statement';
        this.FunctionDeclaration = 1;
        this.FunctionDeclarationDescription = 'Function declaration';
        this.FunctionExpression = 1;
        this.FunctionExpressionDescription = 'Function expression';
        this.FunctionType = 1;
        this.FunctionTypeDescription = 'Function type';
        this.GetAccessor = 0;
        this.GetAccessorDescription = 'Get accessor';
        this.Identifier = 0;
        this.IdentifierDescription = 'Identifier';
        this.IfWithElseStatement = 2;
        this.IfWithElseStatementDescription = 'If with else statement';
        this.IfStatement = 1;
        this.IfStatementDescription = 'If statement';
        this.ImportDeclaration = 0;
        this.ImportDeclarationDescription = 'Import declaration';
        this.ImportEqualsDeclaration = 0;
        this.ImportEqualsDeclarationDescription = 'Import equals declaration';
        this.IndexSignature = 0;
        this.IndexSignatureDescription = 'Index signature';
        this.InterfaceDeclaration = 0;
        this.InterfaceDeclarationDescription = 'Interface declaration';
        this.JsxElement = 1;
        this.JsxElementDescription = 'Jsx element';
        this.JsxSelfClosingElement = 1;
        this.JsxSelfClosingElementDescription = 'Jsx self closingElement';
        this.LabeledStatement = 1;
        this.LabeledStatementDescription = 'Labeled statement';
        this.MethodDeclaration = 1;
        this.MethodDeclarationDescription = 'Method declaration';
        this.MethodSignature = 0;
        this.MethodSignatureDescription = 'Method signature';
        this.ModuleDeclaration = 0;
        this.ModuleDeclarationDescription = 'Module declaration';
        this.NamedImports = 0;
        this.NamedImportsDescription = 'Named imports';
        this.NamespaceImport = 0;
        this.NamespaceImportDescription = 'Namespace import';
        this.NewExpression = 0;
        this.NewExpressionDescription = 'New expression';
        this.ObjectBindingPattern = 0;
        this.ObjectBindingPatternDescription = '';
        this.ObjectLiteralExpression = 1;
        this.ObjectLiteralExpressionDescription = 'Object literal expression';
        this.Parameter = 0;
        this.ParameterDescription = 'Parameter';
        this.PostfixUnaryExpression = 0;
        this.PostfixUnaryExpressionDescription = 'Postfix unary expression';
        this.PrefixUnaryExpression = 0;
        this.PrefixUnaryExpressionDescription = 'Prefix unary expression';
        this.PropertyAccessExpression = 0;
        this.PropertyAccessExpressionDescription = 'Property access expression';
        this.PropertyAssignment = 0;
        this.PropertyAssignmentDescription = 'Property assignment';
        this.PropertyDeclaration = 0;
        this.PropertyDeclarationDescription = 'Property declaration';
        this.PropertySignature = 0;
        this.PropertySignatureDescription = 'Property signature';
        this.RegularExpressionLiteral = 0;
        this.RegularExpressionLiteralDescription = 'Regular expression literal';
        this.ReturnStatement = 1;
        this.ReturnStatementDescription = 'Return statement';
        this.SetAccessor = 0;
        this.SetAccessorDescription = 'Set accessor';
        this.SourceFile = 0;
        this.SourceFileDescription = 'Source file';
        this.StringLiteral = 0;
        this.StringLiteralDescription = 'String literal';
        this.SwitchStatement = 1;
        this.SwitchStatementDescription = 'Switch statement';
        this.TemplateExpression = 0;
        this.TemplateExpressionDescription = 'Template expression';
        this.ThrowStatement = 1;
        this.ThrowStatementDescription = 'Throw statement';
        this.TryStatement = 1;
        this.TryStatementDescription = 'Try statement';
        this.TypeAssertionExpression = 0;
        this.TypeAssertionExpressionDescription = 'Type assertion expression';
        this.TypeLiteral = 0;
        this.TypeLiteralDescription = 'Type literal';
        this.TypeReference = 0;
        this.TypeReferenceDescription = 'Type reference';
        this.VariableDeclaration = 0;
        this.VariableDeclarationDescription = 'Variable declaration';
        this.VariableStatement = 0;
        this.VariableStatementDescription = 'Variable statement';
        this.WhileStatement = 1;
        this.WhileStatementDescription = 'While statement';
        this.WithStatement = 1;
        this.WithStatementDescription = 'With statement';
    }
    return MetricsConfiguration;
}());
exports.MetricsConfiguration = MetricsConfiguration;
//# sourceMappingURL=MetricsConfiguration.js.map