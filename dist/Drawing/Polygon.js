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
import { Vector } from '../Algebra';
/**
 * Creates a closed polygon drawing given a list of [[Vector]]s.
 *
 * @warning Use sparingly as Polygons are performance intensive
 */
var Polygon = /** @class */ (function () {
    /**
     * @param points  The vectors to use to build the polygon in order
     */
    function Polygon(points) {
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
        var minX = this._points.reduce(function (prev, curr) {
            return Math.min(prev, curr.x);
        }, 0);
        var maxX = this._points.reduce(function (prev, curr) {
            return Math.max(prev, curr.x);
        }, 0);
        this.drawWidth = maxX - minX;
        var minY = this._points.reduce(function (prev, curr) {
            return Math.min(prev, curr.y);
        }, 0);
        var maxY = this._points.reduce(function (prev, curr) {
            return Math.max(prev, curr.y);
        }, 0);
        this.drawHeight = maxY - minY;
        this.height = this.drawHeight;
        this.width = this.drawWidth;
    }
    /**
     * @notimplemented Effects are not supported on `Polygon`
     */
    Polygon.prototype.addEffect = function () {
        // not supported on polygons
    };
    /**
     * @notimplemented Effects are not supported on `Polygon`
     */
    Polygon.prototype.removeEffect = function () {
        // not supported on polygons
    };
    /**
     * @notimplemented Effects are not supported on `Polygon`
     */
    Polygon.prototype.clearEffects = function () {
        // not supported on polygons
    };
    Polygon.prototype.reset = function () {
        //pass
    };
    Polygon.prototype.draw = function (ctxOrOptions, x, y) {
        if (ctxOrOptions instanceof CanvasRenderingContext2D) {
            this._drawWithOptions({ ctx: ctxOrOptions, x: x, y: y });
        }
        else {
            this._drawWithOptions(ctxOrOptions);
        }
    };
    Polygon.prototype._drawWithOptions = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var _j = __assign(__assign({}, options), { rotation: (_a = options.rotation) !== null && _a !== void 0 ? _a : this.rotation, drawWidth: (_b = options.drawWidth) !== null && _b !== void 0 ? _b : this.drawWidth, drawHeight: (_c = options.drawHeight) !== null && _c !== void 0 ? _c : this.drawHeight, flipHorizontal: (_d = options.flipHorizontal) !== null && _d !== void 0 ? _d : this.flipHorizontal, flipVertical: (_e = options.flipVertical) !== null && _e !== void 0 ? _e : this.flipVertical, anchor: (_f = options.anchor) !== null && _f !== void 0 ? _f : this.anchor, offset: (_g = options.offset) !== null && _g !== void 0 ? _g : this.offset, opacity: (_h = options.opacity) !== null && _h !== void 0 ? _h : this.opacity }), ctx = _j.ctx, x = _j.x, y = _j.y, rotation = _j.rotation, drawWidth = _j.drawWidth, drawHeight = _j.drawHeight, anchor = _j.anchor, offset = _j.offset, opacity = _j.opacity, flipHorizontal = _j.flipHorizontal, flipVertical = _j.flipVertical;
        var xpoint = drawWidth * anchor.x + offset.x + x;
        var ypoint = drawHeight * anchor.y + offset.y + y;
        ctx.save();
        ctx.translate(xpoint, ypoint);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        // Iterate through the supplied points and construct a 'polygon'
        var firstPoint = this._points[0];
        ctx.moveTo(firstPoint.x, firstPoint.y);
        var i = 0;
        var len = this._points.length;
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
        var oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = opacity !== null && opacity !== void 0 ? opacity : 1;
        ctx.stroke();
        ctx.globalAlpha = oldAlpha;
        ctx.restore();
    };
    return Polygon;
}());
export { Polygon };
//# sourceMappingURL=Polygon.js.map