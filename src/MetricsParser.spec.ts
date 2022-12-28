import { describe, expect, it } from "vitest";
import { MetricsConfiguration } from "./MetricsConfiguration";
import { MetricsParser } from "./MetricsParser";

describe("MetricsParser", () => {
  const src = `
    import { describe, it } from "jest";

    describe("test", () => {
        it("test case", () => {
          function isVue(languageId: string) {
            return languageId == "vue";
          }

          function isHTML(languageId: string) {
            return languageId == "html";
          }

          function isHTMLLike(languageId: string) {
            return this.isVue(languageId) || this.isHTML(languageId);
          }
        })
    });
  `;

  it("IgnoredFunctionNames is empty by default", () => {
    const result = MetricsParser.getMetricsFromText(
      "test.spec.ts",
      src,
      { ...MetricsConfiguration },
      99
    );

    expect(result.metrics.getCollectedComplexity()).toBe(9);
  });

  it("IgnoredFunctionNames can be overridden", () => {
    const result = MetricsParser.getMetricsFromText(
      "test.spec.ts",
      src,
      { ...MetricsConfiguration, IgnoredFunctionNames: [""] },
      99
    );

    expect(result.metrics.getCollectedComplexity()).toBe(9);
  });

  it("IgnoredFunctionNames can be null", () => {
    const withNullConfig = MetricsParser.getMetricsFromText(
      "test.spec.ts",
      src,
      { ...MetricsConfiguration, IgnoredFunctionNames: null },
      99
    );
    expect(withNullConfig.metrics.getCollectedComplexity()).toBe(9);
  });

  it("IgnoredFunctionNames can be configured to ignore a given function call", () => {
    const withDescribeExcluded = MetricsParser.getMetricsFromText(
      "test.spec.ts",
      src,
      { ...MetricsConfiguration, IgnoredFunctionNames: ["describe"] },
      99
    );
    expect(withDescribeExcluded.metrics.getCollectedComplexity()).toBe(8);
  });

  it("IgnoredFunctionNames can be configured to ignore multiple function calls", () => {
    const withDescribeExcluded = MetricsParser.getMetricsFromText(
      "test.spec.ts",
      src,
      { ...MetricsConfiguration, IgnoredFunctionNames: ["describe", "it"] },
      99
    );
    expect(withDescribeExcluded.metrics.getCollectedComplexity()).toBe(7);
  });
});
