import { Vector } from '../Algebra';
/**
 * Creates a closed polygon drawing given a list of [[Vector]]s.
 *
 * @warning Use sparingly as Polygons are performance intensive
 */
export class Polygon {
    /**
     * @param points  The vectors to use to build the polygon in order
     */
    constructor(points) {
        /**
         * The width of the lines of the polygon
         */
        this.lineWidth = 5;
        /**
         * Indicates whether the polygon is filled or not.
         */
        this.filled = false;
        this._points = [];
        this.anchor = Vector.Zero;
        this.offset = Vector.Zero;
        this.rotation = 0;
        this.scale = Vector.One;
        this.opacity = 1;
        this._points = points;
        const minX = this._points.reduce((prev, curr) => {
            return Math.min(prev, curr.x);
        }, 0);
        const maxX = this._points.reduce((prev, curr) => {
            return Math.max(prev, curr.x);
        }, 0);
        this.drawWidth = maxX - minX;
        const minY = this._points.reduce((prev, curr) => {
            return Math.min(prev, curr.y);
        }, 0);
        const maxY = this._points.reduce((prev, curr) => {
            return Math.max(prev, curr.y);
        }, 0);
        this.drawHeight = maxY - minY;
        this.height = this.drawHeight;
        this.width = this.drawWidth;
    }
    /**
     * @notimplemented Effects are not supported on `Polygon`
     */
    addEffect() {
        // not supported on polygons
    }
    /**
     * @notimplemented Effects are not supported on `Polygon`
     */
    removeEffect() {
        // not supported on polygons
    }
    /**
     * @notimplemented Effects are not supported on `Polygon`
     */
    clearEffects() {
        // not supported on polygons
    }
    reset() {
        //pass
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
        const { ctx, x, y, rotation, drawWidth, drawHeight, anchor, offset, opacity, flipHorizontal, flipVertical } = Object.assign(Object.assign({}, options), { rotation: (_a = options.rotation) !== null && _a !== void 0 ? _a : this.rotation, drawWidth: (_b = options.drawWidth) !== null && _b !== void 0 ? _b : this.drawWidth, drawHeight: (_c = options.drawHeight) !== null && _c !== void 0 ? _c : this.drawHeight, flipHorizontal: (_d = options.flipHorizontal) !== null && _d !== void 0 ? _d : this.flipHorizontal, flipVertical: (_e = options.flipVertical) !== null && _e !== void 0 ? _e : this.flipVertical, anchor: (_f = options.anchor) !== null && _f !== void 0 ? _f : this.anchor, offset: (_g = options.offset) !== null && _g !== void 0 ? _g : this.offset, opacity: (_h = options.opacity) !== null && _h !== void 0 ? _h : this.opacity });
        const xpoint = drawWidth * anchor.x + offset.x + x;
        const ypoint = drawHeight * anchor.y + offset.y + y;
        ctx.save();
        ctx.translate(xpoint, ypoint);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        // Iterate through the supplied points and construct a 'polygon'
        const firstPoint = this._points[0];
        ctx.moveTo(firstPoint.x, firstPoint.y);
        let i = 0;
        const len = this._points.length;
        for (i; i < len; i++) {
            ctx.lineTo(this._points[i].x, this._points[i].y);
        }
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.closePath();
        if (this.filled) {
            ctx.fillStyle = this.fillColor.toString();
            ctx.fill();
        }
        ctx.strokeStyle = this.lineColor.toString();
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
        ctx.stroke();
        ctx.globalAlpha = oldAlpha;
        ctx.restore();
    }
}
//# sourceMappingURL=Polygon.js.map