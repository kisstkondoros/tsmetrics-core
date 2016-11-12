"use strict";
var MetricsModel = (function () {
    function MetricsModel(start, end, text, line, column, complexity, description, trim, visible) {
        this.children = [];
        this.start = start;
        this.end = end;
        this.text = text;
        this.line = line;
        this.column = column;
        this.complexity = complexity;
        this.visible = !!visible;
        this.description = description;
        this.storeText(text, trim);
    }
    MetricsModel.prototype.storeText = function (text, trim) {
        if (trim) {
            var lineFeedIndex = this.text.indexOf('\r');
            lineFeedIndex = lineFeedIndex < 0 ? this.text.length : (lineFeedIndex + 1);
            var line = this.text.substring(0, lineFeedIndex);
            if (line.length > 20) {
                this.text = line.substring(0, 20) + "...";
            }
            else {
                this.text = line;
            }
        }
        else {
            this.text = text;
        }
    };
    MetricsModel.prototype.getSumComplexity = function () {
        return this.children.reduce(function (item1, item2) { return item1 + item2.getSumComplexity(); }, this.complexity);
    };
    MetricsModel.prototype.toLogString = function (level) {
        var complexity = this.pad(this.getSumComplexity() + "", 5);
        var line = this.pad(this.line + "");
        var column = this.pad(this.column + "");
        return complexity + " - Ln " + line + " Col " + column + " " + level + " " + this.text;
    };
    MetricsModel.prototype.pad = function (str, lenghtToFit) {
        if (lenghtToFit === void 0) { lenghtToFit = 4; }
        var pad = new Array(lenghtToFit).join(" ");
        return pad.substring(0, Math.max(0, pad.length - str.length)) + str;
    };
    MetricsModel.prototype.toString = function (settings) {
        var complexitySum = this.getSumComplexity();
        var instruction = '';
        if (complexitySum > settings.ComplexityLevelExtreme) {
            instruction = settings.ComplexityLevelExtremeDescription;
        }
        else if (complexitySum > settings.ComplexityLevelHigh) {
            instruction = settings.ComplexityLevelHighDescription;
        }
        else if (complexitySum > settings.ComplexityLevelNormal) {
            instruction = settings.ComplexityLevelNormalDescription;
        }
        else if (complexitySum > settings.ComplexityLevelLow) {
            instruction = settings.ComplexityLevelLowDescription;
        }
        var template = (settings.ComplexityTemplate + '');
        if (!settings.ComplexityTemplate || template.trim().length == 0) {
            template = 'Complexity is {0} {1}';
        }
        return template.replace('{0}', complexitySum + '').replace('{1}', instruction);
    };
    MetricsModel.prototype.getExplanation = function () {
        var allRelevant = [this];
        return allRelevant.map(function (item) { return "+" + item.complexity + " for " + item.description + " in Ln " + item.line + ", Col " + item.column; }).reduce(function (item1, item2) { return item1 + item2; });
    };
    MetricsModel.prototype.clone = function (deepClone) {
        var model = new MetricsModel(this.start, this.end, this.text, this.line, this.column, this.complexity, this.description, false, this.visible);
        if (deepClone) {
            model.children = this.children.map(function (item) { return item.clone(); });
        }
        return model;
    };
    return MetricsModel;
}());
exports.MetricsModel = MetricsModel;
//# sourceMappingURL=MetricsModel.js.map