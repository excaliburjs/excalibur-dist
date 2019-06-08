var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConvexPolygon } from './ConvexPolygon';
import { Vector } from '../Algebra';
import { Color } from '../Drawing/Color';
import { obsolete } from '../Util/Decorators';
import { Side } from './Side';
/**
 * Axis Aligned collision primitive for Excalibur.
 */
var BoundingBox = /** @class */ (function () {
    /**
     * @param left    x coordinate of the left edge
     * @param top     y coordinate of the top edge
     * @param right   x coordinate of the right edge
     * @param bottom  y coordinate of the bottom edge
     */
    function BoundingBox(left, top, right, bottom) {
        if (left === void 0) { left = 0; }
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = 0; }
        if (bottom === void 0) { bottom = 0; }
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    /**
     * Given bounding box A & B, returns the side relative to A when intersection is performed.
     * @param intersection Intersection vector between 2 bounding boxes
     */
    BoundingBox.getSideFromIntersection = function (intersection) {
        if (!intersection) {
            return Side.None;
        }
        if (intersection) {
            if (Math.abs(intersection.x) > Math.abs(intersection.y)) {
                if (intersection.x < 0) {
                    return Side.Right;
                }
                return Side.Left;
            }
            else {
                if (intersection.y < 0) {
                    return Side.Bottom;
                }
                return Side.Top;
            }
        }
        return Side.None;
    };
    BoundingBox.fromPoints = function (points) {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i = 0; i < points.length; i++) {
            if (points[i].x < minX) {
                minX = points[i].x;
            }
            if (points[i].x > maxX) {
                maxX = points[i].x;
            }
            if (points[i].y < minY) {
                minY = points[i].y;
            }
            if (points[i].y > maxY) {
                maxY = points[i].y;
            }
        }
        return new BoundingBox(minX, minY, maxX, maxY);
    };
    BoundingBox.fromDimension = function (width, height, anchor, pos) {
        if (anchor === void 0) { anchor = Vector.Half; }
        if (pos === void 0) { pos = Vector.Zero; }
        return new BoundingBox(-width * anchor.x + pos.x, -height * anchor.y + pos.y, width - width * anchor.x + pos.x, height - height * anchor.y + pos.y);
    };
    /**
     * Returns the calculated width of the bounding box
     */
    BoundingBox.prototype.getWidth = function () {
        return this.width;
    };
    Object.defineProperty(BoundingBox.prototype, "width", {
        /**
         * Returns the calculated width of the bounding box
         */
        get: function () {
            return this.right - this.left;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the calculated height of the bounding box
     */
    BoundingBox.prototype.getHeight = function () {
        return this.height;
    };
    Object.defineProperty(BoundingBox.prototype, "height", {
        /**
         * Returns the calculated height of the bounding box
         */
        get: function () {
            return this.bottom - this.top;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the center of the bounding box
     */
    BoundingBox.prototype.getCenter = function () {
        return new Vector((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    };
    Object.defineProperty(BoundingBox.prototype, "center", {
        /**
         * Returns the center of the bounding box
         */
        get: function () {
            return new Vector((this.left + this.right) / 2, (this.top + this.bottom) / 2);
        },
        enumerable: true,
        configurable: true
    });
    BoundingBox.prototype.translate = function (pos) {
        return new BoundingBox(this.left + pos.x, this.top + pos.y, this.right + pos.x, this.bottom + pos.y);
    };
    /**
     * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default. The resulting bounding
     * box is also axis-align. This is useful when a new axis-aligned bounding box is needed for rotated geometry.
     */
    BoundingBox.prototype.rotate = function (angle, point) {
        if (point === void 0) { point = Vector.Zero; }
        var points = this.getPoints().map(function (p) { return p.rotate(angle, point); });
        return BoundingBox.fromPoints(points);
    };
    BoundingBox.prototype.scale = function (scale, point) {
        if (point === void 0) { point = Vector.Zero; }
        var shifted = this.translate(point);
        return new BoundingBox(shifted.left * scale.x, shifted.top * scale.y, shifted.right * scale.x, shifted.bottom * scale.y);
    };
    /**
     * Returns the perimeter of the bounding box
     */
    BoundingBox.prototype.getPerimeter = function () {
        var wx = this.width;
        var wy = this.height;
        return 2 * (wx + wy);
    };
    BoundingBox.prototype.getPoints = function () {
        var results = [];
        results.push(new Vector(this.left, this.top));
        results.push(new Vector(this.right, this.top));
        results.push(new Vector(this.right, this.bottom));
        results.push(new Vector(this.left, this.bottom));
        return results;
    };
    /**
     * Creates a Polygon collision area from the points of the bounding box
     */
    BoundingBox.prototype.toPolygon = function (actor) {
        return new ConvexPolygon({
            body: actor ? actor.body : null,
            points: this.getPoints(),
            offset: Vector.Zero
        });
    };
    /**
     * Determines whether a ray intersects with a bounding box
     */
    BoundingBox.prototype.rayCast = function (ray, farClipDistance) {
        if (farClipDistance === void 0) { farClipDistance = Infinity; }
        // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
        var tmin = -Infinity;
        var tmax = +Infinity;
        var xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
        var yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;
        var tx1 = (this.left - ray.pos.x) * xinv;
        var tx2 = (this.right - ray.pos.x) * xinv;
        tmin = Math.min(tx1, tx2);
        tmax = Math.max(tx1, tx2);
        var ty1 = (this.top - ray.pos.y) * yinv;
        var ty2 = (this.bottom - ray.pos.y) * yinv;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
        return tmax >= Math.max(0, tmin) && tmin < farClipDistance;
    };
    BoundingBox.prototype.rayCastTime = function (ray, farClipDistance) {
        if (farClipDistance === void 0) { farClipDistance = Infinity; }
        // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
        var tmin = -Infinity;
        var tmax = +Infinity;
        var xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
        var yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;
        var tx1 = (this.left - ray.pos.x) * xinv;
        var tx2 = (this.right - ray.pos.x) * xinv;
        tmin = Math.min(tx1, tx2);
        tmax = Math.max(tx1, tx2);
        var ty1 = (this.top - ray.pos.y) * yinv;
        var ty2 = (this.bottom - ray.pos.y) * yinv;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
        if (tmax >= Math.max(0, tmin) && tmin < farClipDistance) {
            return tmin;
        }
        return -1;
    };
    BoundingBox.prototype.contains = function (val) {
        if (val instanceof Vector) {
            return this.left <= val.x && this.top <= val.y && this.bottom >= val.y && this.right >= val.x;
        }
        else if (val instanceof BoundingBox) {
            if (this.left < val.left && this.top < val.top && val.bottom < this.bottom && val.right < this.right) {
                return true;
            }
            return false;
        }
        return false;
    };
    /**
     * Combines this bounding box and another together returning a new bounding box
     * @param other  The bounding box to combine
     */
    BoundingBox.prototype.combine = function (other) {
        var compositeBB = new BoundingBox(Math.min(this.left, other.left), Math.min(this.top, other.top), Math.max(this.right, other.right), Math.max(this.bottom, other.bottom));
        return compositeBB;
    };
    Object.defineProperty(BoundingBox.prototype, "dimensions", {
        get: function () {
            return new Vector(this.width, this.height);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Test wether this bounding box intersects with another returning
     * the intersection vector that can be used to resolve the collision. If there
     * is no intersection null is returned.
     *
     * @param other  Other [[BoundingBox]] to test intersection with
     * @returns A Vector in the direction of the current BoundingBox, this <- other
     */
    BoundingBox.prototype.intersect = function (other) {
        var totalBoundingBox = this.combine(other);
        // If the total bounding box is less than or equal the sum of the 2 bounds then there is collision
        if (totalBoundingBox.width < other.width + this.width &&
            totalBoundingBox.height < other.height + this.height &&
            !totalBoundingBox.dimensions.equals(other.dimensions) &&
            !totalBoundingBox.dimensions.equals(this.dimensions)) {
            // collision
            var overlapX = 0;
            // right edge is between the other's left and right edge
            /**
             *     +-this-+
             *     |      |
             *     |    +-other-+
             *     +----|-+     |
             *          |       |
             *          +-------+
             *         <---
             *          ^ overlap
             */
            if (this.right >= other.left && this.right <= other.right) {
                overlapX = other.left - this.right;
                // right edge is past the other's right edge
                /**
                 *     +-other-+
                 *     |       |
                 *     |    +-this-+
                 *     +----|--+   |
                 *          |      |
                 *          +------+
                 *          --->
                 *          ^ overlap
                 */
            }
            else {
                overlapX = other.right - this.left;
            }
            var overlapY = 0;
            // top edge is between the other's top and bottom edge
            /**
             *     +-other-+
             *     |       |
             *     |    +-this-+   | <- overlap
             *     +----|--+   |   |
             *          |      |  \ /
             *          +------+   '
             */
            if (this.top <= other.bottom && this.top >= other.top) {
                overlapY = other.bottom - this.top;
                // top edge is above the other top edge
                /**
                 *     +-this-+         .
                 *     |      |        / \
                 *     |    +-other-+   | <- overlap
                 *     +----|-+     |   |
                 *          |       |
                 *          +-------+
                 */
            }
            else {
                overlapY = other.top - this.bottom;
            }
            if (Math.abs(overlapX) < Math.abs(overlapY)) {
                return new Vector(overlapX, 0);
            }
            else {
                return new Vector(0, overlapY);
            }
            // Case of total containment of one bounding box by another
        }
        else if (totalBoundingBox.dimensions.equals(other.dimensions) || totalBoundingBox.dimensions.equals(this.dimensions)) {
            var overlapX = 0;
            // this is wider than the other
            if (this.width - other.width >= 0) {
                // This right edge is closest to the others right edge
                if (this.right - other.right <= other.left - this.left) {
                    overlapX = other.left - this.right;
                    // This left edge is closest to the others left edge
                }
                else {
                    overlapX = other.right - this.left;
                }
                // other is wider than this
            }
            else {
                // This right edge is closest to the others right edge
                if (other.right - this.right <= this.left - other.left) {
                    overlapX = this.left - other.right;
                    // This left edge is closest to the others left edge
                }
                else {
                    overlapX = this.right - other.left;
                }
            }
            var overlapY = 0;
            // this is taller than other
            if (this.height - other.height >= 0) {
                // The bottom edge is closest to the others bottom edge
                if (this.bottom - other.bottom <= other.top - this.top) {
                    overlapY = other.top - this.bottom;
                }
                else {
                    overlapY = other.bottom - this.top;
                }
                // other is taller than this
            }
            else {
                // The bottom edge is closest to the others bottom edge
                if (other.bottom - this.bottom <= this.top - other.top) {
                    overlapY = this.top - other.bottom;
                }
                else {
                    overlapY = this.bottom - other.top;
                }
            }
            if (Math.abs(overlapX) < Math.abs(overlapY)) {
                return new Vector(overlapX, 0);
            }
            else {
                return new Vector(0, overlapY);
            }
        }
        else {
            return null;
        }
    };
    /**
     * Test whether the bounding box has intersected with another bounding box, returns the side of the current bb that intersected.
     * @param bb The other actor to test
     */
    BoundingBox.prototype.intersectWithSide = function (bb) {
        var intersect = this.intersect(bb);
        return BoundingBox.getSideFromIntersection(intersect);
    };
    /**
     * Test wether this bounding box collides with another returning,
     * the intersection vector that can be used to resolve the collision. If there
     * is no collision null is returned.
     *
     * @returns A Vector in the direction of the current BoundingBox
     * @param boundingBox  Other collidable to test
     * @obsolete BoundingBox.collides will be removed in v0.24.0, use BoundingBox.intersect
     */
    BoundingBox.prototype.collides = function (boundingBox) {
        return this.intersect(boundingBox);
    };
    /* istanbul ignore next */
    BoundingBox.prototype.debugDraw = function (ctx, color) {
        if (color === void 0) { color = Color.Yellow; }
        ctx.strokeStyle = color.toString();
        ctx.strokeRect(this.left, this.top, this.width, this.height);
    };
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'BoundingBox.width' })
    ], BoundingBox.prototype, "getWidth", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'BoundingBox.height' })
    ], BoundingBox.prototype, "getHeight", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'BoundingBox.center' })
    ], BoundingBox.prototype, "getCenter", null);
    __decorate([
        obsolete({ message: 'BoundingBox.collides will be removed in v0.24.0', alternateMethod: 'BoundingBox.intersect' })
    ], BoundingBox.prototype, "collides", null);
    return BoundingBox;
}());
export { BoundingBox };
