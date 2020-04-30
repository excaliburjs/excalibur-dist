import { ColorBlindCorrector } from './PostProcessing/Index';
var ColorBlindFlags = /** @class */ (function () {
    function ColorBlindFlags(engine) {
        this._engine = engine;
    }
    ColorBlindFlags.prototype.correct = function (colorBlindness) {
        this._engine.postProcessors.push(new ColorBlindCorrector(this._engine, false, colorBlindness));
    };
    ColorBlindFlags.prototype.simulate = function (colorBlindness) {
        this._engine.postProcessors.push(new ColorBlindCorrector(this._engine, true, colorBlindness));
    };
    return ColorBlindFlags;
}());
export { ColorBlindFlags };
//# sourceMappingURL=DebugFlags.js.map