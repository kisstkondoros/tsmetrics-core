# TS Metrics - Core

Computes complexity in TypeScript / JavaScript files.

Example usage:
```TypeScript
import * as ts from 'typescript';
import {IMetricsModel, IMetricsParseResult} from 'tsmetrics-core';
import {MetricsParser} from 'tsmetrics-core/MetricsParser';
import {MetricsConfiguration} from 'tsmetrics-core/MetricsConfiguration';

export class ExampleUsage {

    public getMetrics(filePath: string) {
        var metricsForFile: IMetricsParseResult = MetricsParser.getMetrics(filePath, new MetricsConfiguration(), ts.ScriptTarget.ES5);
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
