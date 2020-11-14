import { ColorBlindCorrector } from './PostProcessing/Index';
export class ColorBlindFlags {
    constructor(engine) {
        this._engine = engine;
    }
    correct(colorBlindness) {
        this._engine.postProcessors.push(new ColorBlindCorrector(this._engine, false, colorBlindness));
    }
    simulate(colorBlindness) {
        this._engine.postProcessors.push(new ColorBlindCorrector(this._engine, true, colorBlindness));
    }
}
//# sourceMappingURL=DebugFlags.js.map