import { Resource } from './Resource';
import { Sprite } from '../Drawing/Sprite';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[Loadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 */
export declare class Texture extends Resource<string> {
    path: string;
    bustCache: boolean;
    /**
     * The width of the texture in pixels
     */
    width: number;
    /**
     * The height of the texture in pixels
     */
    height: number;
    /**
     * A [[Promise]] that resolves when the Texture is loaded.
     */
    private _loadedResolve;
    loaded: Promise<HTMLImageElement>;
    private _isLoaded;
    private _sprite;
    /**
     * Populated once loading is complete
     */
    image: HTMLImageElement;
    /**
     * @param path       Path to the image resource or a base64 string representing an image "data:image/png;base64,iVB..."
     * @param bustCache  Optionally load texture with cache busting
     */
    constructor(path: string, bustCache?: boolean);
    /**
     * Returns true if the Texture is completely loaded and is ready
     * to be drawn.
     */
    isLoaded(): boolean;
    /**
     * Begins loading the texture and returns a promise to be resolved on completion
     */
    load(): Promise<HTMLImageElement>;
    asSprite(): Sprite;
}
