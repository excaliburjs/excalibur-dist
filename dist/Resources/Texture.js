var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Resource } from './Resource';
import { Sprite } from '../Drawing/Sprite';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[Loadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 */
export class Texture extends Resource {
    /**
     * @param path       Path to the image resource or a base64 string representing an image "data:image/png;base64,iVB..."
     * @param bustCache  Optionally load texture with cache busting
     */
    constructor(path, bustCache = true) {
        super(path, 'blob', bustCache);
        this.path = path;
        this.bustCache = bustCache;
        this.loaded = new Promise((resolve) => {
            this._loadedResolve = resolve;
        });
        this._isLoaded = false;
        this._sprite = null;
        this._sprite = new Sprite(this, 0, 0, 0, 0);
    }
    /**
     * Returns true if the Texture is completely loaded and is ready
     * to be drawn.
     */
    isLoaded() {
        return this._isLoaded;
    }
    /**
     * Begins loading the texture and returns a promise to be resolved on completion
     */
    load() {
        const _super = Object.create(null, {
            load: { get: () => super.load }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const complete = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.image = new Image();
                this.image.addEventListener('load', () => {
                    this._isLoaded = true;
                    this.width = this._sprite.width = this.image.naturalWidth;
                    this.height = this._sprite.height = this.image.naturalHeight;
                    this._sprite = new Sprite(this, 0, 0, this.width, this.height);
                    this._loadedResolve(this.image);
                    resolve(this.image);
                });
                if (this.path.indexOf('data:image/') > -1) {
                    this.image.src = this.path;
                    this.oncomplete();
                }
                else {
                    try {
                        this.image.src = yield _super.load.call(this);
                    }
                    catch (e) {
                        reject('Error loading texture');
                    }
                }
            }));
            return complete;
        });
    }
    asSprite() {
        return this._sprite;
    }
}
//# sourceMappingURL=Texture.js.map