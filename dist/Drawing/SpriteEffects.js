/**
 * These effects can be applied to any bitmap image but are mainly used
 * for [[Sprite]] effects or [[Animation]] effects.
 */
/**
 * @typedoc
 */
import { Color } from './Color';
/**
 * Applies the "Grayscale" effect to a sprite, removing color information.
 */
export class Grayscale {
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        const avg = (pixel[firstPixel + 0] + pixel[firstPixel + 1] + pixel[firstPixel + 2]) / 3;
        pixel[firstPixel + 0] = avg;
        pixel[firstPixel + 1] = avg;
        pixel[firstPixel + 2] = avg;
    }
}
/**
 * Applies the "Invert" effect to a sprite, inverting the pixel colors.
 */
export class Invert {
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        pixel[firstPixel + 0] = 255 - pixel[firstPixel + 0];
        pixel[firstPixel + 1] = 255 - pixel[firstPixel + 1];
        pixel[firstPixel + 2] = 255 - pixel[firstPixel + 2];
    }
}
/**
 * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
 */
export class Opacity {
    /**
     * @param opacity  The new opacity of the sprite from 0-1.0
     */
    constructor(opacity) {
        this.opacity = opacity;
    }
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        if (pixel[firstPixel + 3] !== 0) {
            pixel[firstPixel + 3] = Math.round(this.opacity * pixel[firstPixel + 3]);
        }
    }
}
/**
 * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an
 * average of the original color and the provided color
 */
export class Colorize {
    /**
     * @param color  The color to apply to the sprite
     */
    constructor(color) {
        this.color = color;
    }
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        if (pixel[firstPixel + 3] !== 0) {
            pixel[firstPixel + 0] = (pixel[firstPixel + 0] + this.color.r) / 2;
            pixel[firstPixel + 1] = (pixel[firstPixel + 1] + this.color.g) / 2;
            pixel[firstPixel + 2] = (pixel[firstPixel + 2] + this.color.b) / 2;
        }
    }
}
/**
 * Applies the "Lighten" effect to a sprite, changes the lightness of the color according to HSL
 */
export class Lighten {
    /**
     * @param factor  The factor of the effect between 0-1
     */
    constructor(factor = 0.1) {
        this.factor = factor;
    }
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        const color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).lighten(this.factor);
        pixel[firstPixel + 0] = color.r;
        pixel[firstPixel + 1] = color.g;
        pixel[firstPixel + 2] = color.b;
        pixel[firstPixel + 3] = color.a;
    }
}
/**
 * Applies the "Darken" effect to a sprite, changes the darkness of the color according to HSL
 */
export class Darken {
    /**
     * @param factor  The factor of the effect between 0-1
     */
    constructor(factor = 0.1) {
        this.factor = factor;
    }
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        const color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).darken(this.factor);
        pixel[firstPixel + 0] = color.r;
        pixel[firstPixel + 1] = color.g;
        pixel[firstPixel + 2] = color.b;
        pixel[firstPixel + 3] = color.a;
    }
}
/**
 * Applies the "Saturate" effect to a sprite, saturates the color according to HSL
 */
export class Saturate {
    /**
     * @param factor  The factor of the effect between 0-1
     */
    constructor(factor = 0.1) {
        this.factor = factor;
    }
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        const color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).saturate(this.factor);
        pixel[firstPixel + 0] = color.r;
        pixel[firstPixel + 1] = color.g;
        pixel[firstPixel + 2] = color.b;
        pixel[firstPixel + 3] = color.a;
    }
}
/**
 * Applies the "Desaturate" effect to a sprite, desaturates the color according to HSL
 */
export class Desaturate {
    /**
     * @param factor  The factor of the effect between 0-1
     */
    constructor(factor = 0.1) {
        this.factor = factor;
    }
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        const color = Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).desaturate(this.factor);
        pixel[firstPixel + 0] = color.r;
        pixel[firstPixel + 1] = color.g;
        pixel[firstPixel + 2] = color.b;
        pixel[firstPixel + 3] = color.a;
    }
}
/**
 * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
 * a given color
 */
export class Fill {
    /**
     * @param color  The color to apply to the sprite
     */
    constructor(color) {
        this.color = color;
    }
    updatePixel(x, y, imageData) {
        const firstPixel = (x + y * imageData.width) * 4;
        const pixel = imageData.data;
        if (pixel[firstPixel + 3] !== 0) {
            pixel[firstPixel + 0] = this.color.r;
            pixel[firstPixel + 1] = this.color.g;
            pixel[firstPixel + 2] = this.color.b;
        }
    }
}
//# sourceMappingURL=SpriteEffects.js.map