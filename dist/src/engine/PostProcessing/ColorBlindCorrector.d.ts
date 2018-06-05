import { IPostProcessor } from './IPostProcessor';
import { Engine } from '../Engine';
export declare enum ColorBlindness {
    Protanope = 0,
    Deuteranope = 1,
    Tritanope = 2,
}
/**
 * This post processor can correct colors and simulate color blindness.
 * It is possible to use this on every game, but the game's performance
 * will suffer measurably. It's better to use it as a helpful tool while developing your game.
 * Remember, the best practice is to design with color blindness in mind.
 *
 * [[include:ColorBlind.md]]
 */
export declare class ColorBlindCorrector implements IPostProcessor {
    engine: Engine;
    simulate: boolean;
    colorMode: ColorBlindness;
    private _vertexShader;
    private _fragmentShader;
    private _internalCanvas;
    private _gl;
    private _program;
    constructor(engine: Engine, simulate?: boolean, colorMode?: ColorBlindness);
    private _getFragmentShaderByMode(colorMode);
    private _setRectangle(x, y, width, height);
    private _getShader(type, program);
    process(image: ImageData, out: CanvasRenderingContext2D): void;
}
