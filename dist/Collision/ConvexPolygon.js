var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Color } from '../Drawing/Color';
import { Physics } from '../Physics';
import { BoundingBox } from './BoundingBox';
import { Edge } from './Edge';
import { CollisionJumpTable } from './CollisionJumpTable';
import { Circle } from './Circle';
import { Vector, Line, Ray, Projection } from '../Algebra';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
/**
 * Polygon collision shape for detecting collisions
 *
 * Example:
 * [[include:BoxAndPolygonShape.md]]
 */
var ConvexPolygon = /** @class */ (function () {
    function ConvexPolygon(options) {
        this._transformedPoints = [];
        this._axes = [];
        this._sides = [];
        this.offset = options.offset || Vector.Zero;
        var winding = !!options.clockwiseWinding;
        this.points = (winding ? options.points.reverse() : options.points) || [];
        this.collider = this.collider = options.collider || null;
        // @obsolete Remove next release in v0.24.0, code exists for backwards compat
        if (options.body) {
            this.collider = options.body.collider;
            this.body = this.collider.body;
        }
        // ==================================
        // calculate initial transformation
        this._calculateTransformation();
    }
    /**
     * Returns a clone of this ConvexPolygon, not associated with any collider
     */
    ConvexPolygon.prototype.clone = function () {
        return new ConvexPolygon({
            offset: this.offset.clone(),
            points: this.points.map(function (p) { return p.clone(); }),
            collider: null,
            body: null
        });
    };
    Object.defineProperty(ConvexPolygon.prototype, "worldPos", {
        get: function () {
            if (this.collider && this.collider.body) {
                return this.collider.body.pos.add(this.offset);
            }
            return this.offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConvexPolygon.prototype, "center", {
        /**
         * Get the center of the collision shape in world coordinates
         */
        get: function () {
            var body = this.collider ? this.collider.body : null;
            if (body) {
                return body.pos.add(this.offset);
            }
            return this.offset;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Calculates the underlying transformation from the body relative space to world space
     */
    ConvexPolygon.prototype._calculateTransformation = function () {
        var body = this.collider ? this.collider.body : null;
        var pos = body ? body.pos.add(this.offset) : this.offset;
        var angle = body ? body.rotation : 0;
        var scale = body ? body.scale : Vector.One;
        var len = this.points.length;
        this._transformedPoints.length = 0; // clear out old transform
        for (var i = 0; i < len; i++) {
            this._transformedPoints[i] = this.points[i]
                .scale(scale)
                .rotate(angle)
                .add(pos);
        }
    };
    /**
     * Gets the points that make up the polygon in world space, from actor relative space (if specified)
     */
    ConvexPolygon.prototype.getTransformedPoints = function () {
        // only recalculate geometry if, hasn't been calculated
        if (!this._transformedPoints.length ||
            // or the position or rotation has changed in world space
            (this.collider &&
                this.collider.body &&
                (!this.collider.body.oldPos.equals(this.collider.body.pos) ||
                    this.collider.body.oldRotation !== this.collider.body.rotation ||
                    this.collider.body.oldScale !== this.collider.body.scale))) {
            this._calculateTransformation();
        }
        return this._transformedPoints;
    };
    /**
     * Gets the sides of the polygon in world space
     */
    ConvexPolygon.prototype.getSides = function () {
        if (this._sides.length) {
            return this._sides;
        }
        var lines = [];
        var points = this.getTransformedPoints();
        var len = points.length;
        for (var i = 0; i < len; i++) {
            lines.push(new Line(points[i], points[(i - 1 + len) % len]));
        }
        this._sides = lines;
        return this._sides;
    };
    ConvexPolygon.prototype.recalc = function () {
        this._sides.length = 0;
        this._axes.length = 0;
        this._transformedPoints.length = 0;
        this.getTransformedPoints();
        this.getSides();
    };
    /**
     * Tests if a point is contained in this collision shape in world space
     */
    ConvexPolygon.prototype.contains = function (point) {
        // Always cast to the right, as long as we cast in a consitent fixed direction we
        // will be fine
        var testRay = new Ray(point, new Vector(1, 0));
        var intersectCount = this.getSides().reduce(function (accum, side) {
            if (testRay.intersect(side) >= 0) {
                return accum + 1;
            }
            return accum;
        }, 0);
        if (intersectCount % 2 === 0) {
            return false;
        }
        return true;
    };
    ConvexPolygon.prototype.getClosestLineBetween = function (shape) {
        if (shape instanceof Circle) {
            return ClosestLineJumpTable.PolygonCircleClosestLine(this, shape);
        }
        else if (shape instanceof ConvexPolygon) {
            return ClosestLineJumpTable.PolygonPolygonClosestLine(this, shape);
        }
        else if (shape instanceof Edge) {
            return ClosestLineJumpTable.PolygonEdgeClosestLine(this, shape);
        }
        else {
            throw new Error("Polygon could not collide with unknown CollisionShape " + typeof shape);
        }
    };
    /**
     * Returns a collision contact if the 2 collision shapes collide, otherwise collide will
     * return null.
     * @param shape
     */
    ConvexPolygon.prototype.collide = function (shape) {
        if (shape instanceof Circle) {
            return CollisionJumpTable.CollideCirclePolygon(shape, this);
        }
        else if (shape instanceof ConvexPolygon) {
            return CollisionJumpTable.CollidePolygonPolygon(this, shape);
        }
        else if (shape instanceof Edge) {
            return CollisionJumpTable.CollidePolygonEdge(this, shape);
        }
        else {
            throw new Error("Polygon could not collide with unknown CollisionShape " + typeof shape);
        }
    };
    /**
     * Find the point on the shape furthest in the direction specified
     */
    ConvexPolygon.prototype.getFurthestPoint = function (direction) {
        var pts = this.getTransformedPoints();
        var furthestPoint = null;
        var maxDistance = -Number.MAX_VALUE;
        for (var i = 0; i < pts.length; i++) {
            var distance = direction.dot(pts[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPoint = pts[i];
            }
        }
        return furthestPoint;
    };
    /**
     * Finds the closes face to the point using perpendicular distance
     * @param point point to test against polygon
     */
    ConvexPolygon.prototype.getClosestFace = function (point) {
        var sides = this.getSides();
        var min = Number.POSITIVE_INFINITY;
        var faceIndex = -1;
        var distance = -1;
        for (var i = 0; i < sides.length; i++) {
            var dist = sides[i].distanceToPoint(point);
            if (dist < min) {
                min = dist;
                faceIndex = i;
                distance = dist;
            }
        }
        if (faceIndex !== -1) {
            return {
                distance: sides[faceIndex].normal().scale(distance),
                face: sides[faceIndex]
            };
        }
        return null;
    };
    Object.defineProperty(ConvexPolygon.prototype, "bounds", {
        /**
         * Get the axis aligned bounding box for the polygon shape in world coordinates
         */
        get: function () {
            var points = this.getTransformedPoints();
            return BoundingBox.fromPoints(points);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConvexPolygon.prototype, "localBounds", {
        /**
         * Get the axis aligned bounding box for the polygon shape in local coordinates
         */
        get: function () {
            return BoundingBox.fromPoints(this.points);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConvexPolygon.prototype, "inertia", {
        /**
         * Get the moment of inertia for an arbitrary polygon
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        get: function () {
            var mass = this.collider ? this.collider.mass : Physics.defaultMass;
            var numerator = 0;
            var denominator = 0;
            for (var i = 0; i < this.points.length; i++) {
                var iplusone = (i + 1) % this.points.length;
                var crossTerm = this.points[iplusone].cross(this.points[i]);
                numerator +=
                    crossTerm *
                        (this.points[i].dot(this.points[i]) + this.points[i].dot(this.points[iplusone]) + this.points[iplusone].dot(this.points[iplusone]));
                denominator += crossTerm;
            }
            return (mass / 6) * (numerator / denominator);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
     */
    ConvexPolygon.prototype.rayCast = function (ray, max) {
        if (max === void 0) { max = Infinity; }
        // find the minimum contact time greater than 0
        // contact times less than 0 are behind the ray and we don't want those
        var sides = this.getSides();
        var len = sides.length;
        var minContactTime = Number.MAX_VALUE;
        var contactIndex = -1;
        for (var i = 0; i < len; i++) {
            var contactTime = ray.intersect(sides[i]);
            if (contactTime >= 0 && contactTime < minContactTime && contactTime <= max) {
                minContactTime = contactTime;
                contactIndex = i;
            }
        }
        // contact was found
        if (contactIndex >= 0) {
            return ray.getPoint(minContactTime);
        }
        // no contact found
        return null;
    };
    Object.defineProperty(ConvexPolygon.prototype, "axes", {
        /**
         * Get the axis associated with the convex polygon
         */
        get: function () {
            if (this._axes.length) {
                return this._axes;
            }
            var axes = [];
            var points = this.getTransformedPoints();
            var len = points.length;
            for (var i = 0; i < len; i++) {
                axes.push(points[i].sub(points[(i + 1) % len]).normal());
            }
            this._axes = axes;
            return this._axes;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Perform Separating Axis test against another polygon, returns null if no overlap in polys
     * Reference http://www.dyn4j.org/2010/01/sat/
     */
    ConvexPolygon.prototype.testSeparatingAxisTheorem = function (other) {
        var poly1 = this;
        var poly2 = other;
        var axes = poly1.axes.concat(poly2.axes);
        var minOverlap = Number.MAX_VALUE;
        var minAxis = null;
        var minIndex = -1;
        for (var i = 0; i < axes.length; i++) {
            var proj1 = poly1.project(axes[i]);
            var proj2 = poly2.project(axes[i]);
            var overlap = proj1.getOverlap(proj2);
            if (overlap <= 0) {
                return null;
            }
            else {
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    minAxis = axes[i];
                    minIndex = i;
                }
            }
        }
        // Sanity check
        if (minIndex === -1) {
            return null;
        }
        return minAxis.normalize().scale(minOverlap);
    };
    /**
     * Project the edges of the polygon along a specified axis
     */
    ConvexPolygon.prototype.project = function (axis) {
        var points = this.getTransformedPoints();
        var len = points.length;
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        for (var i = 0; i < len; i++) {
            var scalar = points[i].dot(axis);
            min = Math.min(min, scalar);
            max = Math.max(max, scalar);
        }
        return new Projection(min, max);
    };
    ConvexPolygon.prototype.draw = function (ctx, color, pos) {
        if (color === void 0) { color = Color.Green; }
        if (pos === void 0) { pos = Vector.Zero; }
        ctx.beginPath();
        ctx.fillStyle = color.toString();
        var newPos = pos.add(this.offset);
        // Iterate through the supplied points and construct a 'polygon'
        var firstPoint = this.points[0].add(newPos);
        ctx.moveTo(firstPoint.x, firstPoint.y);
        this.points.map(function (p) { return p.add(newPos); }).forEach(function (point) {
            ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.closePath();
        ctx.fill();
    };
    /* istanbul ignore next */
    ConvexPolygon.prototype.debugDraw = function (ctx, color) {
        if (color === void 0) { color = Color.Red; }
        ctx.beginPath();
        ctx.strokeStyle = color.toString();
        // Iterate through the supplied points and construct a 'polygon'
        var firstPoint = this.getTransformedPoints()[0];
        ctx.moveTo(firstPoint.x, firstPoint.y);
        this.getTransformedPoints().forEach(function (point) {
            ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.closePath();
        ctx.stroke();
    };
    return ConvexPolygon;
}());
export { ConvexPolygon };
var PolygonArea = /** @class */ (function (_super) {
    __extends(PolygonArea, _super);
    function PolygonArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PolygonArea;
}(ConvexPolygon));
export { PolygonArea };
