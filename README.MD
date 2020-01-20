# TS Metrics - Core

Computes complexity in TypeScript / JavaScript files.

## Complexity calculation

The steps of the calculation:

- create an AST from the input source file
- walk through each and every node of it
- depending on the type of the node and the configuration associated with it create a new entry about the node.
  This entry contains everything necessary for further use
  (e.g. a textual representation for the node, complexity increment, child nodes etc.)
- The returned tree can be traversed to collect the complexity information.

Please note that it is not a standard metric, but it is a close approximation
of [Cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity).

Please also note that it is possible to balance the complexity calculation for the
project / team / personal taste by adjusting the relevant configuration entries.

## Packages / extensions built on top of this package

- [CodeMetrics](https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-codemetrics) - A Visual Studio Code extension
- [codemetrics-cli](https://www.npmjs.com/package/codemetrics-cli) - A CLI wrapper
- [tsmetrics-webpack-plugin](https://www.npmjs.com/package/tsmetrics-webpack-plugin) - A webpack plugin
- [gulp-tsmetrics](https://www.npmjs.com/package/gulp-tsmetrics) - A pipe for gulp
- And other packages implemented by the community

Example usage:

```TypeScript
import * as ts from 'typescript';
import { IMetricsModel, IMetricsParseResult, MetricsParser, MetricsConfiguration } from 'tsmetrics-core';

export class ExampleUsage {

    public getMetrics(filePath: string) {
        var metricsForFile: IMetricsParseResult = MetricsParser.getMetrics(filePath, MetricsConfiguration, ts.ScriptTarget.ES5);
        this.log(metricsForFile.metrics, "");
    }

    private log(model: IMetricsModel, level: string) {
        console.log(model.toLogString(level));
        model.children.forEach(element => {
            this.log(element, level + "  ");
        });
    }
}
```

### License

Licensed under MIT
