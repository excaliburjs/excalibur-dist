var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var SpriteImpl = /** @class */ (function () {
    /**
     * @param image   The backing image texture to build the Sprite
     * @param x      The x position of the sprite
     * @param y      The y position of the sprite
     * @param width  The width of the sprite in pixels
     * @param height The height of the sprite in pixels
     */
    function SpriteImpl(imageOrConfig, x, y, width, height) {
        var _this = this;
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
        this._dirtyEffect = false;
        this._opacity = 1;
        var image = imageOrConfig;
        if (imageOrConfig && !(imageOrConfig instanceof Texture)) {
            x = imageOrConfig.x | 0;
            y = imageOrConfig.y | 0;
            width = imageOrConfig.width | 0;
            height = imageOrConfig.height | 0;
            image = imageOrConfig.image;
            if (!image) {
                var message = 'An image texture is required to contsruct a sprite';
                throw new Error(message);
            }
        }
        this.x = x || 0;
        this.y = y || 0;
        this._texture = image;
        this._spriteCanvas = document.createElement('canvas');
        this._spriteCanvas.width = width;
        this._spriteCanvas.height = height;
        this._spriteCtx = this._spriteCanvas.getContext('2d'); // eslint-disable-line
        this._texture.loaded
            .then(function () {
            _this.width = _this.width || _this._texture.image.naturalWidth;
            _this.height = _this.height || _this._texture.image.naturalHeight;
            _this._spriteCanvas.width = _this._spriteCanvas.width || _this._texture.image.naturalWidth;
            _this._spriteCanvas.height = _this._spriteCanvas.height || _this._texture.image.naturalHeight;
            _this._loadPixels();
            _this._dirtyEffect = true;
        })
            .error(function (e) {
            _this.logger.error('Error loading texture ', _this._texture.path, e);
        });
        this.width = width;
        this.height = height;
    }
    Object.defineProperty(SpriteImpl.prototype, "drawWidth", {
        get: function () {
            return this.width * this.scale.x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteImpl.prototype, "drawHeight", {
        get: function () {
            return this.height * this.scale.y;
        },
        enumerable: false,
        configurable: true
    });
    SpriteImpl.prototype._loadPixels = function () {
        if (this._texture.isLoaded() && !this._pixelsLoaded) {
            var naturalWidth = this._texture.image.naturalWidth || 0;
            var naturalHeight = this._texture.image.naturalHeight || 0;
            if (this.width > naturalWidth) {
                this.logger.warn("The sprite width " + this.width + " exceeds the width \n                              " + naturalWidth + " of the backing texture " + this._texture.path);
            }
            if (this.width <= 0 || naturalWidth <= 0) {
                throw new Error("The width of a sprite cannot be 0 or negative, sprite width: " + this.width + ", original width: " + naturalWidth);
            }
            if (this.height > naturalHeight) {
                this.logger.warn("The sprite height " + this.height + " exceeds the height \n                              " + naturalHeight + " of the backing texture " + this._texture.path);
            }
            if (this.height <= 0 || naturalHeight <= 0) {
                throw new Error("The height of a sprite cannot be 0 or negative, sprite height: " + this.height + ", original height: " + naturalHeight);
            }
            this._spriteCtx.drawImage(this._texture.image, clamp(this.x, 0, naturalWidth), clamp(this.y, 0, naturalHeight), clamp(this.width, 0, naturalWidth), clamp(this.height, 0, naturalHeight), 0, 0, this.width, this.height);
            this._pixelsLoaded = true;
        }
    };
    /**
     * Applies the [[Opacity]] effect to a sprite, setting the alpha of all pixels to a given value
     */
    SpriteImpl.prototype.opacity = function (value) {
        this._opacity = value;
    };
    /**
     * Applies the [[Grayscale]] effect to a sprite, removing color information.
     */
    SpriteImpl.prototype.grayscale = function () {
        this.addEffect(new Effects.Grayscale());
    };
    /**
     * Applies the [[Invert]] effect to a sprite, inverting the pixel colors.
     */
    SpriteImpl.prototype.invert = function () {
        this.addEffect(new Effects.Invert());
    };
    /**
     * Applies the [[Fill]] effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
     */
    SpriteImpl.prototype.fill = function (color) {
        this.addEffect(new Effects.Fill(color));
    };
    /**
     * Applies the [[Colorize]] effect to a sprite, changing the color channels of all pixels to be the average of the original color
     * and the provided color.
     */
    SpriteImpl.prototype.colorize = function (color) {
        this.addEffect(new Effects.Colorize(color));
    };
    /**
     * Applies the [[Lighten]] effect to a sprite, changes the lightness of the color according to HSL
     */
    SpriteImpl.prototype.lighten = function (factor) {
        if (factor === void 0) { factor = 0.1; }
        this.addEffect(new Effects.Lighten(factor));
    };
    /**
     * Applies the [[Darken]] effect to a sprite, changes the darkness of the color according to HSL
     */
    SpriteImpl.prototype.darken = function (factor) {
        if (factor === void 0) { factor = 0.1; }
        this.addEffect(new Effects.Darken(factor));
    };
    /**
     * Applies the [[Saturate]] effect to a sprite, saturates the color according to HSL
     */
    SpriteImpl.prototype.saturate = function (factor) {
        if (factor === void 0) { factor = 0.1; }
        this.addEffect(new Effects.Saturate(factor));
    };
    /**
     * Applies the [[Desaturate]] effect to a sprite, desaturates the color according to HSL
     */
    SpriteImpl.prototype.desaturate = function (factor) {
        if (factor === void 0) { factor = 0.1; }
        this.addEffect(new Effects.Desaturate(factor));
    };
    /**
     * Adds a new [[SpriteEffect]] to this drawing.
     * @param effect  Effect to add to the this drawing
     */
    SpriteImpl.prototype.addEffect = function (effect) {
        this.effects.push(effect);
        // We must check if the texture and the backing sprite pixels are loaded as well before
        // an effect can be applied
        if (!this._texture.isLoaded() || !this._pixelsLoaded) {
            this._dirtyEffect = true;
        }
        else {
            this._applyEffects();
        }
    };
    SpriteImpl.prototype.removeEffect = function (param) {
        var indexToRemove = -1;
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
    };
    SpriteImpl.prototype._applyEffects = function () {
        var naturalWidth = this._texture.image.naturalWidth || 0;
        var naturalHeight = this._texture.image.naturalHeight || 0;
        this._spriteCtx.clearRect(0, 0, this.width, this.height);
        this._spriteCtx.drawImage(this._texture.image, clamp(this.x, 0, naturalWidth), clamp(this.y, 0, naturalHeight), clamp(this.width, 0, naturalWidth), clamp(this.height, 0, naturalHeight), 0, 0, this.width, this.height);
        if (this.effects.length > 0) {
            this._pixelData = this._spriteCtx.getImageData(0, 0, this.width, this.height);
            var len = this.effects.length;
            for (var i = 0; i < len; i++) {
                for (var y = 0; y < this.height; y++) {
                    for (var x = 0; x < this.width; x++) {
                        this.effects[i].updatePixel(x, y, this._pixelData);
                    }
                }
            }
            this._spriteCtx.clearRect(0, 0, this.width, this.height);
            this._spriteCtx.putImageData(this._pixelData, 0, 0);
        }
        this._dirtyEffect = false;
    };
    /**
     * Clears all effects from the drawing and return it to its original state.
     */
    SpriteImpl.prototype.clearEffects = function () {
        this.effects.length = 0;
        this._applyEffects();
    };
    /**
     * Resets the internal state of the drawing (if any)
     */
    SpriteImpl.prototype.reset = function () {
        // do nothing
    };
    SpriteImpl.prototype.debugDraw = function (ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        var xpoint = this.drawWidth * this.anchor.x;
        var ypoint = this.drawHeight * this.anchor.y;
        ctx.strokeStyle = Color.Black.toString();
        ctx.strokeRect(-xpoint, -ypoint, this.drawWidth, this.drawHeight);
        ctx.restore();
    };
    SpriteImpl.prototype.draw = function (ctxOrOptions, x, y) {
        if (ctxOrOptions instanceof CanvasRenderingContext2D) {
            this._drawWithOptions({ ctx: ctxOrOptions, x: x, y: y });
        }
        else {
            this._drawWithOptions(ctxOrOptions);
        }
    };
    SpriteImpl.prototype._drawWithOptions = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var _j = __assign(__assign({}, options), { rotation: (_a = options.rotation) !== null && _a !== void 0 ? _a : this.rotation, drawWidth: (_b = options.drawWidth) !== null && _b !== void 0 ? _b : this.drawWidth, drawHeight: (_c = options.drawHeight) !== null && _c !== void 0 ? _c : this.drawHeight, flipHorizontal: (_d = options.flipHorizontal) !== null && _d !== void 0 ? _d : this.flipHorizontal, flipVertical: (_e = options.flipVertical) !== null && _e !== void 0 ? _e : this.flipVertical, anchor: (_f = options.anchor) !== null && _f !== void 0 ? _f : this.anchor, offset: (_g = options.offset) !== null && _g !== void 0 ? _g : this.offset, opacity: (_h = options.opacity) !== null && _h !== void 0 ? _h : this._opacity }), ctx = _j.ctx, x = _j.x, y = _j.y, rotation = _j.rotation, drawWidth = _j.drawWidth, drawHeight = _j.drawHeight, anchor = _j.anchor, offset = _j.offset, opacity = _j.opacity, flipHorizontal = _j.flipHorizontal, flipVertical = _j.flipVertical;
        if (this._dirtyEffect) {
            this._applyEffects();
        }
        // calculating current dimensions
        ctx.save();
        var xpoint = drawWidth * anchor.x + offset.x;
        var ypoint = drawHeight * anchor.y + offset.y;
        ctx.translate(x, y);
        ctx.rotate(rotation);
        // todo cache flipped sprites
        if (flipHorizontal) {
            ctx.translate(drawWidth, 0);
            ctx.scale(-1, 1);
        }
        if (flipVertical) {
            ctx.translate(0, drawHeight);
            ctx.scale(1, -1);
        }
        if (this._dirtyEffect) {
            this._applyEffects();
        }
        var oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = opacity !== null && opacity !== void 0 ? opacity : 1;
        ctx.drawImage(this._spriteCanvas, 0, 0, this.width, this.height, -xpoint, -ypoint, drawWidth, drawHeight);
        ctx.globalAlpha = oldAlpha;
        ctx.restore();
    };
    /**
     * Produces a copy of the current sprite
     */
    SpriteImpl.prototype.clone = function () {
        var result = new Sprite(this._texture, this.x, this.y, this.width, this.height);
        result.scale = this.scale.clone();
        result.rotation = this.rotation;
        result.flipHorizontal = this.flipHorizontal;
        result.flipVertical = this.flipVertical;
        var len = this.effects.length;
        for (var i = 0; i < len; i++) {
            result.addEffect(this.effects[i]);
        }
        return result;
    };
    return SpriteImpl;
}());
export { SpriteImpl };
/**
 * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
 * images or parts of images from a [[Texture]] resource to the screen.
 *
 * [[include:Sprites.md]]
 */
var Sprite = /** @class */ (function (_super) {
    __extends(Sprite, _super);
    function Sprite(imageOrConfig, x, y, width, height) {
        return _super.call(this, imageOrConfig, x, y, width, height) || this;
    }
    return Sprite;
}(Configurable(SpriteImpl)));
export { Sprite };
//# sourceMappingURL=Sprite.js.map