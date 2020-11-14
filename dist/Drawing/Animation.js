import * as Effects from './SpriteEffects';
import { Vector } from '../Algebra';
import { Engine } from '../Engine';
import * as Util from '../Util/Util';
import { Configurable } from '../Configurable';
/**
 * @hidden
 */
export class AnimationImpl {
    /**
     * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
     *
     * @param engineOrConfig  Reference to the current game engine
     * @param sprites  An array of sprites to create the frames for the animation
     * @param speed   The number in milliseconds to display each frame in the animation
     * @param loop    Indicates whether the animation should loop after it is completed
     */
    constructor(engineOrConfig, sprites, speed, loop) {
        /**
         * The sprite frames to play, in order. See [[SpriteSheet.getAnimationForAll]] to quickly
         * generate an [[Animation]].
         */
        this.sprites = [];
        /**
         * Current frame index being shown
         */
        this.currentFrame = 0;
        this._timeLeftInFrame = 0;
        this._idempotencyToken = -1;
        this.anchor = Vector.Zero;
        this.rotation = 0.0;
        this.scale = Vector.One;
        /**
         * Indicates whether the animation should loop after it is completed
         */
        this.loop = true;
        /**
         * Indicates the frame index the animation should freeze on for a non-looping
         * animation. By default it is the last frame.
         */
        this.freezeFrame = -1;
        /**
         * Flip each frame vertically. Sets [[Sprite.flipVertical]].
         */
        this.flipVertical = false;
        /**
         * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
         */
        this.flipHorizontal = false;
        this.drawWidth = 0;
        this.drawHeight = 0;
        this.width = 0;
        this.height = 0;
        this._opacity = 1;
        let engine = engineOrConfig;
        if (engineOrConfig && !(engineOrConfig instanceof Engine)) {
            const config = engineOrConfig;
            engine = config.engine;
            sprites = config.sprites;
            speed = config.speed;
            loop = config.loop;
        }
        this.sprites = sprites;
        this.speed = speed;
        this._engine = engine;
        this._timeLeftInFrame = this.speed;
        if (loop != null) {
            this.loop = loop;
        }
        if (sprites && sprites[0]) {
            this.drawHeight = sprites[0] ? sprites[0].drawHeight : 0;
            this.drawWidth = sprites[0] ? sprites[0].drawWidth : 0;
            this.width = sprites[0] ? sprites[0].width : 0;
            this.height = sprites[0] ? sprites[0].height : 0;
            this.freezeFrame = sprites.length - 1;
        }
    }
    /**
     * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
     */
    opacity(value) {
        this._opacity = value;
    }
    /**
     * Applies the grayscale effect to a sprite, removing color information.
     */
    grayscale() {
        this.addEffect(new Effects.Grayscale());
    }
    /**
     * Applies the invert effect to a sprite, inverting the pixel colors.
     */
    invert() {
        this.addEffect(new Effects.Invert());
    }
    /**
     * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
     */
    fill(color) {
        this.addEffect(new Effects.Fill(color));
    }
    /**
     * Applies the colorize effect to a sprite, changing the color channels of all pixels to be the average of the original color and the
     * provided color.
     */
    colorize(color) {
        this.addEffect(new Effects.Colorize(color));
    }
    /**
     * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
     */
    lighten(factor = 0.1) {
        this.addEffect(new Effects.Lighten(factor));
    }
    /**
     * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
     */
    darken(factor = 0.1) {
        this.addEffect(new Effects.Darken(factor));
    }
    /**
     * Applies the saturate effect to a sprite, saturates the color according to hsl
     */
    saturate(factor = 0.1) {
        this.addEffect(new Effects.Saturate(factor));
    }
    /**
     * Applies the desaturate effect to a sprite, desaturates the color according to hsl
     */
    desaturate(factor = 0.1) {
        this.addEffect(new Effects.Desaturate(factor));
    }
    /**
     * Add a [[SpriteEffect]] manually
     */
    addEffect(effect) {
        for (const i in this.sprites) {
            this.sprites[i].addEffect(effect);
        }
    }
    removeEffect(param) {
        for (const i in this.sprites) {
            this.sprites[i].removeEffect(param);
        }
    }
    /**
     * Clear all sprite effects
     */
    clearEffects() {
        for (const i in this.sprites) {
            this.sprites[i].clearEffects();
        }
    }
    _setAnchor(point) {
        //if (!this.anchor.equals(point)) {
        for (const i in this.sprites) {
            this.sprites[i].anchor.setTo(point.x, point.y);
        }
        //}
    }
    _setRotation(radians) {
        //if (this.rotation !== radians) {
        for (const i in this.sprites) {
            this.sprites[i].rotation = radians;
        }
        //}
    }
    _setScale(scale) {
        //if (!this.scale.equals(scale)) {
        for (const i in this.sprites) {
            this.sprites[i].scale = scale;
        }
        //}
    }
    /**
     * Resets the animation to first frame.
     */
    reset() {
        this.currentFrame = 0;
    }
    /**
     * Indicates whether the animation is complete, animations that loop are never complete.
     */
    isDone() {
        return !this.loop && this.currentFrame >= this.sprites.length;
    }
    /**
     * Not meant to be called by game developers. Ticks the animation forward internally and
     * calculates whether to change to the frame.
     * @internal
     */
    tick(elapsed, idempotencyToken) {
        if (this._idempotencyToken === idempotencyToken) {
            return;
        }
        this._idempotencyToken = idempotencyToken;
        this._timeLeftInFrame -= elapsed;
        if (this._timeLeftInFrame <= 0) {
            this.currentFrame = this.loop ? (this.currentFrame + 1) % this.sprites.length : this.currentFrame + 1;
            this._timeLeftInFrame = this.speed;
        }
        this._updateValues();
        const current = this.sprites[this.currentFrame];
        if (current) {
            this.width = current.width;
            this.height = current.height;
            this.drawWidth = current.drawWidth;
            this.drawHeight = current.drawHeight;
        }
    }
    _updateValues() {
        this._setAnchor(this.anchor);
        this._setRotation(this.rotation);
        this._setScale(this.scale);
    }
    /**
     * Skips ahead a specified number of frames in the animation
     * @param frames  Frames to skip ahead
     */
    skip(frames) {
        this.currentFrame = (this.currentFrame + frames) % this.sprites.length;
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
        var _a, _b, _c, _d, _e, _f, _g;
        const animOptions = Object.assign(Object.assign({}, options), { rotation: (_a = options.rotation) !== null && _a !== void 0 ? _a : this.rotation, drawWidth: (_b = options.drawWidth) !== null && _b !== void 0 ? _b : this.drawWidth, drawHeight: (_c = options.drawHeight) !== null && _c !== void 0 ? _c : this.drawHeight, flipHorizontal: (_d = options.flipHorizontal) !== null && _d !== void 0 ? _d : this.flipHorizontal, flipVertical: (_e = options.flipVertical) !== null && _e !== void 0 ? _e : this.flipVertical, anchor: (_f = options.anchor) !== null && _f !== void 0 ? _f : this.anchor, opacity: (_g = options.opacity) !== null && _g !== void 0 ? _g : this._opacity });
        this._updateValues();
        let currSprite;
        if (this.currentFrame < this.sprites.length) {
            currSprite = this.sprites[this.currentFrame];
            currSprite.draw(animOptions);
        }
        if (this.freezeFrame !== -1 && this.currentFrame >= this.sprites.length) {
            currSprite = this.sprites[Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
            currSprite.draw(animOptions);
        }
        // add the calculated width
        if (currSprite) {
            this.drawWidth = currSprite.drawWidth;
            this.drawHeight = currSprite.drawHeight;
        }
    }
    /**
     * Plays an animation at an arbitrary location in the game.
     * @param x  The x position in the game to play
     * @param y  The y position in the game to play
     */
    play(x, y) {
        this.reset();
        this._engine.playAnimation(this, x, y);
    }
}
/**
 * Animations allow you to display a series of images one after another,
 * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
 */
export class Animation extends Configurable(AnimationImpl) {
    constructor(engineOrConfig, images, speed, loop) {
        super(engineOrConfig, images, speed, loop);
    }
}
//# sourceMappingURL=Animation.js.map