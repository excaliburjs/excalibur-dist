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
export class Texture {
    /**
     * @param path       Path to the image resource or a base64 string representing an image "data:image/png;base64,iVB..."
     * @param bustCache  Optionally load texture with cache busting
     */
    constructor(path, bustCache = true) {
        this.path = path;
        this.bustCache = bustCache;
        this._sprite = null;
        this.loaded = new Promise(resolve => {
            this._loadedResolve = resolve;
        });
        this._resource = new Resource(path, 'blob', bustCache);
        this._sprite = new Sprite(this, 0, 0, 0, 0);
    }
    get image() {
        return this.data;
    }
    /**
     * Returns true if the Texture is completely loaded and is ready
     * to be drawn.
     */
    isLoaded() {
        return !!this.data;
    }
    /**
     * Begins loading the texture and returns a promise to be resolved on completion
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Load base64 or blob if needed
                let url;
                if (!this.path.includes('data:image/')) {
                    const blob = yield this._resource.load();
                    url = URL.createObjectURL(blob);
                }
                else {
                    url = this.path;
                }
                // Decode the image
                const image = new Image();
                image.src = url;
                yield image.decode();
                // Set results
                this.data = image;
                this.width = this._sprite.width = image.naturalWidth;
                this.height = this._sprite.height = image.naturalHeight;
                this._sprite = new Sprite(this, 0, 0, this.width, this.height);
            }
            catch (_a) {
                yield Promise.reject('Error loading texture');
            }
            // todo emit complete
            this._loadedResolve(this.data);
            return this.data;
        });
    }
    asSprite() {
        return this._sprite;
    }
}
//# sourceMappingURL=Texture.js.map