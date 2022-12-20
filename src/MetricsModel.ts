import { IMetricsConfiguration } from "./MetricsConfiguration";

export type CollectorType = "SUM" | "MAX";

export interface IMetricsModel {
  line: number;
  column: number;
  complexity: number;
  visible: boolean;
  children: IMetricsModel[];
  description: string;
  start: number;
  end: number;
  text: string;
  collectorType: CollectorType;
  getCollectedComplexity(): number;
  toLogString(level: string): string;
  toString(settings: IMetricsConfiguration): string;
  getExplanation(): string;
  clone(deepClone?: boolean): IMetricsModel;
}

export class MetricsModel implements IMetricsModel {
  line: number;
  column: number;
  complexity: number;
  visible: boolean;
  children: IMetricsModel[] = [];
  description: string;
  start: number;
  end: number;
  text: string;
  collectorType: CollectorType;

  constructor(
    start: number,
    end: number,
    text: string,
    line: number,
    column: number,
    complexity: number,
    description: string,
    trim: boolean,
    visible: boolean,
    collectorType: CollectorType
  ) {
    this.start = start;
    this.end = end;
    this.text = text;
    this.line = line;
    this.column = column;
    this.complexity = complexity;
    this.visible = !!visible;
    this.description = description;
    this.collectorType = collectorType;
    this.storeText(text, trim);
  }

  private storeText(text, trim) {
    if (trim) {
      var lineFeedIndex = this.text.indexOf("\r");
      lineFeedIndex = lineFeedIndex < 0 ? this.text.length : lineFeedIndex + 1;
      var line = this.text.substring(0, lineFeedIndex).trim();
      if (line.length > 70) {
        this.text = line.substring(0, 70).trim() + "...";
      } else {
        this.text = line;
      }
    } else {
      this.text = text;
    }
  }

  public getCollectedComplexity(): number {
    if (this.collectorType === "MAX") {
      return (
        this.children.reduce(
          (acc, current) => Math.max(acc, current.getCollectedComplexity()),
          0
        ) + this.complexity
      );
    } else {
      return this.children.reduce(
        (acc, current) => acc + current.getCollectedComplexity(),
        this.complexity
      );
    }
  }

  public toLogString(level: string): string {
    var complexity = this.pad(
      this.roundComplexity(this.getCollectedComplexity()) + "",
      5
    );
    var line = this.pad(this.line + "");
    var column = this.pad(this.column + "");

    return `${complexity} - Ln ${line} Col ${column} ${level} ${this.text}`;
  }

  private pad(str: string, lenghtToFit: number = 4): string {
    var pad = new Array(lenghtToFit).join(" ");
    return pad.substring(0, Math.max(0, pad.length - str.length)) + str;
  }

  public toString(settings: IMetricsConfiguration): string {
    let complexitySum: number = this.getCollectedComplexity();
    let instruction: string = "";
    if (complexitySum > settings.ComplexityLevelExtreme) {
      instruction = settings.ComplexityLevelExtremeDescription;
    } else if (complexitySum > settings.ComplexityLevelHigh) {
      instruction = settings.ComplexityLevelHighDescription;
    } else if (complexitySum > settings.ComplexityLevelNormal) {
      instruction = settings.ComplexityLevelNormalDescription;
    } else if (complexitySum > settings.ComplexityLevelLow) {
      instruction = settings.ComplexityLevelLowDescription;
    }
    let template = settings.ComplexityTemplate + "";
    if (!settings.ComplexityTemplate || template.trim().length == 0) {
      template = "Complexity is {0} {1}";
    }

    return template
      .replace("{0}", this.roundComplexity(complexitySum) + "")
      .replace("{1}", instruction);
  }

  public getExplanation(): string {
    let allRelevant: MetricsModel[] = [this];
    return allRelevant
      .map(
        (item) =>
          "+" +
          this.roundComplexity(item.getCollectedComplexity()) +
          " for " +
          item.description +
          " in Ln " +
          item.line +
          ", Col " +
          item.column
      )
      .reduce((item1, item2) => item1 + item2);
  }

  public clone(deepClone?: boolean): IMetricsModel {
    var model = new MetricsModel(
      this.start,
      this.end,
      this.text,
      this.line,
      this.column,
      this.complexity,
      this.description,
      false,
      this.visible,
      this.collectorType
    );
    if (deepClone) {
      model.children = this.children.map(function (item) {
        return item.clone();
      });
    }
    return model;
  }
  private roundComplexity(complexity: number): number {
    return Number(complexity.toFixed(2));
  }
}
