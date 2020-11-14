var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Effects from './SpriteEffects';
import { Color } from './Color';
import { Texture } from '../Resources/Texture';
import { Vector } from '../Algebra';
import { Logger } from '../Util/Log';
import { clamp } from '../Util/Util';
import { Configurable } from '../Configurable';
/**
 * @hidden
 */
export class SpriteImpl {
    /**
     * @param imageOrConfig  The backing image texture to build the Sprite, or Sprite option bag
     * @param x      The x position of the sprite
     * @param y      The y position of the sprite
     * @param width  The width of the sprite in pixels
     * @param height The height of the sprite in pixels
     */
    constructor(imageOrConfig, x, y, width, height) {
        this.x = 0;
        this.y = 0;
        this.rotation = 0.0;
        this.anchor = new Vector(0.0, 0.0);
        this.offset = Vector.Zero;
        this.scale = Vector.One;
        this.logger = Logger.getInstance();
        /**
         * Draws the sprite flipped vertically
         */
        this.flipVertical = false;
        /**
         * Draws the sprite flipped horizontally
         */
        this.flipHorizontal = false;
        this.effects = [];
        this.width = 0;
        this.height = 0;
        this._spriteCanvas = null;
        this._spriteCtx = null;
        this._pixelData = null;
        this._pixelsLoaded = false;
        this._dirtyEffect = true;
        this._opacity = 1;
        let image = imageOrConfig;
        if (imageOrConfig && !(imageOrConfig instanceof Texture)) {
            x = imageOrConfig.x | 0;
            y = imageOrConfig.y | 0;
            width = imageOrConfig.width | 0;
            height = imageOrConfig.height | 0;
            image = imageOrConfig.image;
            if (!image) {
                const message = 'An image texture is required to construct a sprite';
                throw new Error(message);
            }
        }
        this.x = x || 0;
        this.y = y || 0;
        this._texture = image;
        this._spriteCanvas = document.createElement('canvas');
        this._spriteCanvas.width = width;
        this._spriteCanvas.height = height;
        this._spriteCtx = this._spriteCanvas.getContext('2d');
        this._initPixelsFromTexture();
        this.width = width;
        this.height = height;
    }
    get drawWidth() {
        return this.width * this.scale.x;
    }
    get drawHeight() {
        return this.height * this.scale.y;
    }
    _initPixelsFromTexture() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const image = yield this._texture.loaded;
                this.width = this.width || image.naturalWidth;
                this.height = this.height || image.naturalHeight;
                this._spriteCanvas.width = this._spriteCanvas.width || image.naturalWidth;
                this._spriteCanvas.height = this._spriteCanvas.height || image.naturalHeight;
                this._loadPixels();
                this._dirtyEffect = true;
            }
            catch (e) {
                this.logger.error('Error loading texture ', this._texture.path, e);
            }
        });
    }
    _loadPixels() {
        if (this._texture.isLoaded() && !this._pixelsLoaded) {
            const naturalWidth = this._texture.image.naturalWidth || 0;
            const naturalHeight = this._texture.image.naturalHeight || 0;
            if (this.width > naturalWidth) {
                this.logger.warn(`The sprite width ${this.width} exceeds the width 
                              ${naturalWidth} of the backing texture ${this._texture.path}`);
            }
            if (this.width <= 0 || naturalWidth <= 0) {
                throw new Error(`The width of a sprite cannot be 0 or negative, sprite width: ${this.width}, original width: ${naturalWidth}`);
            }
            if (this.height > naturalHeight) {
                this.logger.warn(`The sprite height ${this.height} exceeds the height 
                              ${naturalHeight} of the backing texture ${this._texture.path}`);
            }
            if (this.height <= 0 || naturalHeight <= 0) {
                throw new Error(`The height of a sprite cannot be 0 or negative, sprite height: ${this.height}, original height: ${naturalHeight}`);
            }
            this._flushTexture();
            this._pixelsLoaded = true;
        }
    }
    _flushTexture() {
        const naturalWidth = this._texture.image.naturalWidth || 0;
        const naturalHeight = this._texture.image.naturalHeight || 0;
        this._spriteCtx.clearRect(0, 0, this.width, this.height);
        this._spriteCtx.drawImage(this._texture.image, clamp(this.x, 0, naturalWidth), clamp(this.y, 0, naturalHeight), clamp(this.width, 0, naturalWidth), clamp(this.height, 0, naturalHeight), 0, 0, this.width, this.height);
    }
    /**
     * Applies the [[Opacity]] effect to a sprite, setting the alpha of all pixels to a given value
     */
    opacity(value) {
        this._opacity = value;
    }
    /**
     * Applies the [[Grayscale]] effect to a sprite, removing color information.
     */
    grayscale() {
        this.addEffect(new Effects.Grayscale());
    }
    /**
     * Applies the [[Invert]] effect to a sprite, inverting the pixel colors.
     */
    invert() {
        this.addEffect(new Effects.Invert());
    }
    /**
     * Applies the [[Fill]] effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
     */
    fill(color) {
        this.addEffect(new Effects.Fill(color));
    }
    /**
     * Applies the [[Colorize]] effect to a sprite, changing the color channels of all pixels to be the average of the original color
     * and the provided color.
     */
    colorize(color) {
        this.addEffect(new Effects.Colorize(color));
    }
    /**
     * Applies the [[Lighten]] effect to a sprite, changes the lightness of the color according to HSL
     */
    lighten(factor = 0.1) {
        this.addEffect(new Effects.Lighten(factor));
    }
    /**
     * Applies the [[Darken]] effect to a sprite, changes the darkness of the color according to HSL
     */
    darken(factor = 0.1) {
        this.addEffect(new Effects.Darken(factor));
    }
    /**
     * Applies the [[Saturate]] effect to a sprite, saturates the color according to HSL
     */
    saturate(factor = 0.1) {
        this.addEffect(new Effects.Saturate(factor));
    }
    /**
     * Applies the [[Desaturate]] effect to a sprite, desaturates the color according to HSL
     */
    desaturate(factor = 0.1) {
        this.addEffect(new Effects.Desaturate(factor));
    }
    /**
     * Adds a new [[SpriteEffect]] to this drawing.
     * @param effect  Effect to add to the this drawing
     */
    addEffect(effect) {
        this.effects.push(effect);
        // We must check if the texture and the backing sprite pixels are loaded as well before
        // an effect can be applied
        if (!this._texture.isLoaded() || !this._pixelsLoaded) {
            this._dirtyEffect = true;
        }
        else {
            this._applyEffects();
        }
    }
    removeEffect(param) {
        let indexToRemove = -1;
        if (typeof param === 'number') {
            indexToRemove = param;
        }
        else {
            indexToRemove = this.effects.indexOf(param);
        }
        // bounds check
        if (indexToRemove < 0 || indexToRemove >= this.effects.length) {
            return;
        }
        this.effects.splice(indexToRemove, 1);
        // We must check if the texture and the backing sprite pixels are loaded as well before
        // an effect can be applied
        if (!this._texture.isLoaded() || !this._pixelsLoaded) {
            this._dirtyEffect = true;
        }
        else {
            this._applyEffects();
        }
    }
    _applyEffects() {
        this._flushTexture();
        if (this.effects.length > 0) {
            this._pixelData = this._spriteCtx.getImageData(0, 0, this.width, this.height);
            const len = this.effects.length;
            for (let i = 0; i < len; i++) {
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        this.effects[i].updatePixel(x, y, this._pixelData);
                    }
                }
            }
            this._spriteCtx.clearRect(0, 0, this.width, this.height);
            this._spriteCtx.putImageData(this._pixelData, 0, 0);
        }
        this._dirtyEffect = false;
    }
    /**
     * Clears all effects from the drawing and return it to its original state.
     */
    clearEffects() {
        this.effects.length = 0;
        this._applyEffects();
    }
    /**
     * Resets the internal state of the drawing (if any)
     */
    reset() {
        // do nothing
    }
    debugDraw(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        const xpoint = this.drawWidth * this.anchor.x;
        const ypoint = this.drawHeight * this.anchor.y;
        ctx.strokeStyle = Color.Black.toString();
        ctx.strokeRect(-xpoint, -ypoint, this.drawWidth, this.drawHeight);
        ctx.restore();
    }
    draw(ctxOrOptions, x, y) {
        if (ctxOrOptions instanceof CanvasRenderingContext2D) {
            this._drawWithOptions({ ctx: ctxOrOptions, x, y });
        }
        else {
            this._drawWithOptions(ctxOrOptions);
        }
    }
    _drawWithOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { ctx, x, y, rotation, drawWidth, drawHeight, anchor, offset, opacity, flipHorizontal, flipVertical } = Object.assign(Object.assign({}, options), { rotation: (_a = options.rotation) !== null && _a !== void 0 ? _a : this.rotation, drawWidth: (_b = options.drawWidth) !== null && _b !== void 0 ? _b : this.drawWidth, drawHeight: (_c = options.drawHeight) !== null && _c !== void 0 ? _c : this.drawHeight, flipHorizontal: (_d = options.flipHorizontal) !== null && _d !== void 0 ? _d : this.flipHorizontal, flipVertical: (_e = options.flipVertical) !== null && _e !== void 0 ? _e : this.flipVertical, anchor: (_f = options.anchor) !== null && _f !== void 0 ? _f : this.anchor, offset: (_g = options.offset) !== null && _g !== void 0 ? _g : this.offset, opacity: (_h = options.opacity) !== null && _h !== void 0 ? _h : this._opacity });
        if (this._dirtyEffect) {
            this._applyEffects();
        }
        // calculating current dimensions
        ctx.save();
        const xpoint = drawWidth * anchor.x + offset.x;
        const ypoint = drawHeight * anchor.y + offset.y;
        ctx.translate(x, y);
        ctx.rotate(rotation);
        if (flipHorizontal) {
            ctx.translate(drawWidth, 0);
            ctx.scale(-1, 1);
        }
        if (flipVertical) {
            ctx.translate(0, drawHeight);
            ctx.scale(1, -1);
        }
        const oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = opacity !== null && opacity !== void 0 ? opacity : 1;
        ctx.drawImage(this._spriteCanvas, 0, 0, this.width, this.height, -xpoint, -ypoint, drawWidth, drawHeight);
        ctx.globalAlpha = oldAlpha;
        ctx.restore();
    }
    /**
     * Produces a copy of the current sprite
     */
    clone() {
        const result = new Sprite(this._texture, this.x, this.y, this.width, this.height);
        result.scale = this.scale.clone();
        result.rotation = this.rotation;
        result.flipHorizontal = this.flipHorizontal;
        result.flipVertical = this.flipVertical;
        const len = this.effects.length;
        for (let i = 0; i < len; i++) {
            result.addEffect(this.effects[i]);
        }
        return result;
    }
}
/**
 * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
 * images or parts of images from a [[Texture]] resource to the screen.
 */
export class Sprite extends Configurable(SpriteImpl) {
    constructor(imageOrConfig, x, y, width, height) {
        super(imageOrConfig, x, y, width, height);
    }
}
//# sourceMappingURL=Sprite.js.map