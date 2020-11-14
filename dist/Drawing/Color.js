var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { obsolete } from '../Util/Decorators';
/**
 * Provides standard colors (e.g. [[Color.Black]])
 * but you can also create custom colors using RGB, HSL, or Hex. Also provides
 * useful color operations like [[Color.lighten]], [[Color.darken]], and more.
 */
export class Color {
    /**
     * Creates a new instance of Color from an r, g, b, a
     *
     * @param r  The red component of color (0-255)
     * @param g  The green component of color (0-255)
     * @param b  The blue component of color (0-255)
     * @param a  The alpha component of color (0-1.0)
     */
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a != null ? a : 1;
    }
    /**
     * Creates a new instance of Color from an r, g, b, a
     *
     * @param r  The red component of color (0-255)
     * @param g  The green component of color (0-255)
     * @param b  The blue component of color (0-255)
     * @param a  The alpha component of color (0-1.0)
     */
    static fromRGB(r, g, b, a) {
        return new Color(r, g, b, a);
    }
    /**
     * Creates a new instance of Color from a rgb string
     *
     * @param string  CSS color string of the form rgba(255, 255, 255, 1) or rgb(255, 255, 255)
     */
    static fromRGBString(string) {
        const rgbaRegEx = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/i;
        let match = null;
        if ((match = string.match(rgbaRegEx))) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);
            let a = 1;
            if (match[4]) {
                a = parseFloat(match[4]);
            }
            return new Color(r, g, b, a);
        }
        else {
            throw new Error('Invalid rgb/a string: ' + string);
        }
    }
    /**
     * Creates a new instance of Color from a hex string
     *
     * @param hex  CSS color string of the form #ffffff, the alpha component is optional
     */
    static fromHex(hex) {
        const hexRegEx = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
        let match = null;
        if ((match = hex.match(hexRegEx))) {
            const r = parseInt(match[1], 16);
            const g = parseInt(match[2], 16);
            const b = parseInt(match[3], 16);
            let a = 1;
            if (match[4]) {
                a = parseInt(match[4], 16) / 255;
            }
            return new Color(r, g, b, a);
        }
        else {
            throw new Error('Invalid hex string: ' + hex);
        }
    }
    /**
     * Creates a new instance of Color from hsla values
     *
     * @param h  Hue is represented [0-1]
     * @param s  Saturation is represented [0-1]
     * @param l  Luminance is represented [0-1]
     * @param a  Alpha is represented [0-1]
     */
    static fromHSL(h, s, l, a = 1.0) {
        const temp = new HSLColor(h, s, l, a);
        return temp.toRGBA();
    }
    /**
     * Lightens the current color by a specified amount
     *
     * @param factor  The amount to lighten by [0-1]
     */
    lighten(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.l += (1 - temp.l) * factor;
        return temp.toRGBA();
    }
    /**
     * Darkens the current color by a specified amount
     *
     * @param factor  The amount to darken by [0-1]
     */
    darken(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.l -= temp.l * factor;
        return temp.toRGBA();
    }
    /**
     * Saturates the current color by a specified amount
     *
     * @param factor  The amount to saturate by [0-1]
     */
    saturate(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.s += temp.s * factor;
        return temp.toRGBA();
    }
    /**
     * Desaturates the current color by a specified amount
     *
     * @param factor  The amount to desaturate by [0-1]
     */
    desaturate(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.s -= temp.s * factor;
        return temp.toRGBA();
    }
    /**
     * Multiplies a color by another, results in a darker color
     *
     * @param color  The other color
     */
    multiply(color) {
        const newR = (((color.r / 255) * this.r) / 255) * 255;
        const newG = (((color.g / 255) * this.g) / 255) * 255;
        const newB = (((color.b / 255) * this.b) / 255) * 255;
        const newA = color.a * this.a;
        return new Color(newR, newG, newB, newA);
    }
    /**
     * Multiplies a color by another, results in a darker color
     * @param color
     * @obsolete Alias for incorrect spelling used in older versions, use multiply instead, will be removed in v0.25.0
     */
    mulitiply(color) {
        return this.multiply(color);
    }
    /**
     * Screens a color by another, results in a lighter color
     *
     * @param color  The other color
     */
    screen(color) {
        const color1 = color.invert();
        const color2 = color.invert();
        return color1.multiply(color2).invert();
    }
    /**
     * Inverts the current color
     */
    invert() {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1.0 - this.a);
    }
    /**
     * Averages the current color with another
     *
     * @param color  The other color
     */
    average(color) {
        const newR = (color.r + this.r) / 2;
        const newG = (color.g + this.g) / 2;
        const newB = (color.b + this.b) / 2;
        const newA = (color.a + this.a) / 2;
        return new Color(newR, newG, newB, newA);
    }
    /**
     * Returns a CSS string representation of a color.
     *
     * @param format Color representation, accepts: rgb, hsl, or hex
     */
    toString(format = 'rgb') {
        switch (format) {
            case 'rgb':
                return this.toRGBA();
            case 'hsl':
                return this.toHSLA();
            case 'hex':
                return this.toHex();
            default:
                throw new Error('Invalid Color format');
        }
    }
    /**
     * Returns Hex Value of a color component
     * @param c color component
     * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     */
    _componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    /**
     * Return Hex representation of a color.
     */
    toHex() {
        return '#' + this._componentToHex(this.r) + this._componentToHex(this.g) + this._componentToHex(this.b);
    }
    /**
     * Return RGBA representation of a color.
     */
    toRGBA() {
        const result = String(this.r.toFixed(0)) + ', ' + String(this.g.toFixed(0)) + ', ' + String(this.b.toFixed(0));
        if (this.a !== undefined || this.a !== null) {
            return 'rgba(' + result + ', ' + String(this.a) + ')';
        }
        return 'rgb(' + result + ')';
    }
    /**
     * Return HSLA representation of a color.
     */
    toHSLA() {
        return HSLColor.fromRGBA(this.r, this.g, this.b, this.a).toString();
    }
    /**
     * Returns a CSS string representation of a color.
     */
    fillStyle() {
        return this.toString();
    }
    /**
     * Returns a clone of the current color.
     */
    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }
    /**
     * Black (#000000)
     */
    static get Black() {
        return Color.fromHex('#000000');
    }
    /**
     * White (#FFFFFF)
     */
    static get White() {
        return Color.fromHex('#FFFFFF');
    }
    /**
     * Gray (#808080)
     */
    static get Gray() {
        return Color.fromHex('#808080');
    }
    /**
     * Light gray (#D3D3D3)
     */
    static get LightGray() {
        return Color.fromHex('#D3D3D3');
    }
    /**
     * Dark gray (#A9A9A9)
     */
    static get DarkGray() {
        return Color.fromHex('#A9A9A9');
    }
    /**
     * Yellow (#FFFF00)
     */
    static get Yellow() {
        return Color.fromHex('#FFFF00');
    }
    /**
     * Orange (#FFA500)
     */
    static get Orange() {
        return Color.fromHex('#FFA500');
    }
    /**
     * Red (#FF0000)
     */
    static get Red() {
        return Color.fromHex('#FF0000');
    }
    /**
     * Vermilion (#FF5B31)
     */
    static get Vermilion() {
        return Color.fromHex('#FF5B31');
    }
    /**
     * Vermilion (#FF5B31)
     * @obsolete Alias for incorrect spelling used in older versions, use multiply instead, will be removed in v0.25.0
     */
    static get Vermillion() {
        return Color.Vermilion;
    }
    /**
     * Rose (#FF007F)
     */
    static get Rose() {
        return Color.fromHex('#FF007F');
    }
    /**
     * Magenta (#FF00FF)
     */
    static get Magenta() {
        return Color.fromHex('#FF00FF');
    }
    /**
     * Violet (#7F00FF)
     */
    static get Violet() {
        return Color.fromHex('#7F00FF');
    }
    /**
     * Blue (#0000FF)
     */
    static get Blue() {
        return Color.fromHex('#0000FF');
    }
    /**
     * Azure (#007FFF)
     */
    static get Azure() {
        return Color.fromHex('#007FFF');
    }
    /**
     * Cyan (#00FFFF)
     */
    static get Cyan() {
        return Color.fromHex('#00FFFF');
    }
    /**
     * Viridian (#59978F)
     */
    static get Viridian() {
        return Color.fromHex('#59978F');
    }
    /**
     * Green (#00FF00)
     */
    static get Green() {
        return Color.fromHex('#00FF00');
    }
    /**
     * Chartreuse (#7FFF00)
     */
    static get Chartreuse() {
        return Color.fromHex('#7FFF00');
    }
    /**
     * Transparent (#FFFFFF00)
     */
    static get Transparent() {
        return Color.fromHex('#FFFFFF00');
    }
}
__decorate([
    obsolete({ message: 'Alias for incorrect spelling used in older versions, use multiply instead, will be removed in v0.25.0' })
], Color.prototype, "mulitiply", null);
__decorate([
    obsolete({
        message: 'Alias for incorrect spelling used in older versions',
        alternateMethod: 'Vermilion'
    })
], Color, "Vermillion", null);
/**
 * Internal HSL Color representation
 *
 * http://en.wikipedia.org/wiki/HSL_and_HSV
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
class HSLColor {
    constructor(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
    static hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    static fromRGBA(r, g, b, a) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;
        if (max === min) {
            h = s = 0; // achromatic
        }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return new HSLColor(h, s, l, a);
    }
    toRGBA() {
        let r, g, b;
        if (this.s === 0) {
            r = g = b = this.l; // achromatic
        }
        else {
            const q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
            const p = 2 * this.l - q;
            r = HSLColor.hue2rgb(p, q, this.h + 1 / 3);
            g = HSLColor.hue2rgb(p, q, this.h);
            b = HSLColor.hue2rgb(p, q, this.h - 1 / 3);
        }
        return new Color(r * 255, g * 255, b * 255, this.a);
    }
    toString() {
        const h = this.h.toFixed(0), s = this.s.toFixed(0), l = this.l.toFixed(0), a = this.a.toFixed(0);
        return `hsla(${h}, ${s}, ${l}, ${a})`;
    }
}
//# sourceMappingURL=Color.js.map