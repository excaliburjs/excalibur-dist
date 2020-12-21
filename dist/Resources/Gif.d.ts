import { Sprite } from '../Drawing/Sprite';
import { Texture } from './Texture';
import { Color } from '../Drawing/Color';
import { SpriteSheet } from '../Drawing/SpriteSheet';
import { Animation } from '../Drawing/Animation';
import { Engine } from '../Engine';
import { Loadable } from '../Interfaces/Index';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[Loadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 */
export declare class Gif implements Loadable<Texture[]> {
    path: string;
    color: Color;
    bustCache: boolean;
    private _resource;
    /**
     * The width of the texture in pixels
     */
    width: number;
    /**
     * The height of the texture in pixels
     */
    height: number;
    private _stream;
    private _gif;
    private _textures;
    private _animation;
    private _transparentColor;
    data: Texture[];
    /**
     * @param path       Path to the image resource
     * @param color      Optionally set the color to treat as transparent the gif, by default [[Color.Magenta]]
     * @param bustCache  Optionally load texture with cache busting
     */
    constructor(path: string, color?: Color, bustCache?: boolean);
    /**
     * Begins loading the texture and returns a promise to be resolved on completion
     */
    load(): Promise<Texture[]>;
    isLoaded(): boolean;
    asSprite(id?: number): Sprite;
    asSpriteSheet(): SpriteSheet;
    asAnimation(engine: Engine, speed: number): Animation;
    get readCheckBytes(): number[];
}
export interface Frame {
    sentinel: number;
    type: string;
    leftPos: number;
    topPos: number;
    width: number;
    height: number;
    lctFlag: boolean;
    interlaced: boolean;
    sorted: boolean;
    reserved: boolean[];
    lctSize: number;
    lzwMinCodeSize: number;
    pixels: number[];
}
export declare class Stream {
    data: any;
    len: number;
    position: number;
    constructor(dataArray: ArrayBuffer);
    readByte: () => any;
    readBytes: (n: number) => any[];
    read: (n: number) => string;
    readUnsigned: () => any;
}
export declare class ParseGif {
    private _st;
    private _handler;
    private _transparentColor;
    frames: Frame[];
    images: HTMLImageElement[];
    globalColorTable: any[];
    checkBytes: number[];
    constructor(stream: Stream, color?: Color);
    parseColorTable: (entries: any) => string[];
    readSubBlocks: () => string;
    parseHeader: () => void;
    parseExt: (block: any) => void;
    parseImg: (img: any) => void;
    parseBlock: () => void;
    arrayToImage: (frame: Frame) => void;
}
