import { ConvexPolygon } from './ConvexPolygon';
import { Circle } from './Circle';
import { Edge } from './Edge';
import { BoundingBox } from './BoundingBox';
import { Vector } from '../Algebra';
/**
 * Excalibur shape helper for defining collision shapes quickly
 */
var Shape = /** @class */ (function () {
    function Shape() {
    }
    /**
     * Creates a box collision shape, under the hood defines a [[ConvexPolygon]] collision shape
     * @param width Width of the box
     * @param height Height of the box
     * @param anchor Anchor of the box (default (.5, .5)) which positions the box relative to the center of the collider's position
     * @param center Optional offset relative to the collider in local coordinates
     */
    Shape.Box = function (width, height, anchor, center) {
        if (anchor === void 0) { anchor = Vector.Half; }
        if (center === void 0) { center = Vector.Zero; }
        return new ConvexPolygon({
            points: new BoundingBox(-width * anchor.x, -height * anchor.y, width - width * anchor.x, height - height * anchor.y).getPoints(),
            pos: center
        });
    };
    /**
     * Creates a new [[arbitrary polygon|ConvexPolygon]] collision shape
     * @param points Points specified in counter clockwise
     * @param clockwiseWinding Optionally changed the winding of points, by default false meaning counter-clockwise winding.
     * @param center Optional offset relative to the collider in local coordinates
     */
    Shape.Polygon = function (points, clockwiseWinding, center) {
        if (clockwiseWinding === void 0) { clockwiseWinding = false; }
        if (center === void 0) { center = Vector.Zero; }
        return new ConvexPolygon({
            points: points,
            pos: center,
            clockwiseWinding: clockwiseWinding
        });
    };
    /**
     * Creates a new [[circle|Circle]] collision shape
     * @param radius Radius of the circle shape
     * @param center Optional offset relative to the collider in local coordinates
     */
    Shape.Circle = function (radius, center) {
        if (center === void 0) { center = Vector.Zero; }
        return new Circle({
            radius: radius,
            pos: center
        });
    };
    /**
     * Creates a new [[edge|Edge]] collision shape
     * @param begin Beginning of the edge in local coordinates to the collider
     * @param end Ending of the edge in local coordinates to the collider
     */
    Shape.Edge = function (begin, end) {
        return new Edge({
            begin: begin,
            end: end
        });
    };
    return Shape;
}());
export { Shape };
//# sourceMappingURL=Shape.js.map