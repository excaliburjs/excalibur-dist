import { Engine } from './Engine';
import { ColorBlindness } from './PostProcessing/Index';
export interface DebugFlags {
    colorBlindMode: ColorBlindFlags;
}
export declare class ColorBlindFlags {
    private _engine;
    constructor(engine: Engine);
    correct(colorBlindness: ColorBlindness): void;
    simulate(colorBlindness: ColorBlindness): void;
}
