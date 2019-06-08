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
import { BoundingBox } from './BoundingBox';
import { CollisionJumpTable } from './CollisionJumpTable';
import { Circle } from './Circle';
import { ConvexPolygon } from './ConvexPolygon';
import { Vector, Projection, Line } from '../Algebra';
import { Physics } from '../Physics';
import { Color } from '../Drawing/Color';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
/**
 * Edge is a single line collision shape to create collisions with a single line.
 *
 * Example:
 * [[include:EdgeShape.md]]
 */
var Edge = /** @class */ (function () {
    function Edge(options) {
        this.begin = options.begin || Vector.Zero;
        this.end = options.end || Vector.Zero;
        this.collider = options.collider || null;
        this.offset = this.center;
        // @obsolete Remove next release in v0.24.0, code exists for backwards compat
        if (options.body) {
            this.collider = options.body.collider;
            this.body = this.collider.body;
        }
        // ==================================
    }
    /**
     * Returns a clone of this Edge, not associated with any collider
     */
    Edge.prototype.clone = function () {
        return new Edge({
            begin: this.begin.clone(),
            end: this.end.clone(),
            collider: null,
            body: null
        });
    };
    Object.defineProperty(Edge.prototype, "worldPos", {
        get: function () {
            if (this.collider && this.collider.body) {
                return this.collider.body.pos.add(this.offset);
            }
            return this.offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Edge.prototype, "center", {
        /**
         * Get the center of the collision area in world coordinates
         */
        get: function () {
            var pos = this.begin.average(this.end).add(this._getBodyPos());
            return pos;
        },
        enumerable: true,
        configurable: true
    });
    Edge.prototype._getBodyPos = function () {
        var bodyPos = Vector.Zero;
        if (this.collider && this.collider.body) {
            bodyPos = this.collider.body.pos;
        }
        return bodyPos;
    };
    Edge.prototype._getTransformedBegin = function () {
        var body = this.collider ? this.collider.body : null;
        var angle = body ? body.rotation : 0;
        return this.begin.rotate(angle).add(this._getBodyPos());
    };
    Edge.prototype._getTransformedEnd = function () {
        var body = this.collider ? this.collider.body : null;
        var angle = body ? body.rotation : 0;
        return this.end.rotate(angle).add(this._getBodyPos());
    };
    /**
     * Returns the slope of the line in the form of a vector
     */
    Edge.prototype.getSlope = function () {
        var begin = this._getTransformedBegin();
        var end = this._getTransformedEnd();
        var distance = begin.distance(end);
        return end.sub(begin).scale(1 / distance);
    };
    /**
     * Returns the length of the line segment in pixels
     */
    Edge.prototype.getLength = function () {
        var begin = this._getTransformedBegin();
        var end = this._getTransformedEnd();
        var distance = begin.distance(end);
        return distance;
    };
    /**
     * Tests if a point is contained in this collision area
     */
    Edge.prototype.contains = function () {
        return false;
    };
    /**
     * @inheritdoc
     */
    Edge.prototype.rayCast = function (ray, max) {
        if (max === void 0) { max = Infinity; }
        var numerator = this._getTransformedBegin().sub(ray.pos);
        // Test is line and ray are parallel and non intersecting
        if (ray.dir.cross(this.getSlope()) === 0 && numerator.cross(ray.dir) !== 0) {
            return null;
        }
        // Lines are parallel
        var divisor = ray.dir.cross(this.getSlope());
        if (divisor === 0) {
            return null;
        }
        var t = numerator.cross(this.getSlope()) / divisor;
        if (t >= 0 && t <= max) {
            var u = numerator.cross(ray.dir) / divisor / this.getLength();
            if (u >= 0 && u <= 1) {
                return ray.getPoint(t);
            }
        }
        return null;
    };
    /**
     * Returns the closes line between this and another shape, from this -> shape
     * @param shape
     */
    Edge.prototype.getClosestLineBetween = function (shape) {
        if (shape instanceof Circle) {
            return ClosestLineJumpTable.CircleEdgeClosestLine(shape, this);
        }
        else if (shape instanceof ConvexPolygon) {
            return ClosestLineJumpTable.PolygonEdgeClosestLine(shape, this).flip();
        }
        else if (shape instanceof Edge) {
            return ClosestLineJumpTable.EdgeEdgeClosestLine(this, shape);
        }
        else {
            throw new Error("Polygon could not collide with unknown CollisionShape " + typeof shape);
        }
    };
    /**
     * @inheritdoc
     */
    Edge.prototype.collide = function (shape) {
        if (shape instanceof Circle) {
            return CollisionJumpTable.CollideCircleEdge(shape, this);
        }
        else if (shape instanceof ConvexPolygon) {
            return CollisionJumpTable.CollidePolygonEdge(shape, this);
        }
        else if (shape instanceof Edge) {
            return CollisionJumpTable.CollideEdgeEdge();
        }
        else {
            throw new Error("Edge could not collide with unknown CollisionShape " + typeof shape);
        }
    };
    /**
     * Find the point on the shape furthest in the direction specified
     */
    Edge.prototype.getFurthestPoint = function (direction) {
        var transformedBegin = this._getTransformedBegin();
        var transformedEnd = this._getTransformedEnd();
        if (direction.dot(transformedBegin) > 0) {
            return transformedBegin;
        }
        else {
            return transformedEnd;
        }
    };
    Edge.prototype._boundsFromBeginEnd = function (begin, end) {
        return new BoundingBox(Math.min(begin.x, end.x), Math.min(begin.y, end.y), Math.max(begin.x, end.x), Math.max(begin.y, end.y));
    };
    Object.defineProperty(Edge.prototype, "bounds", {
        /**
         * Get the axis aligned bounding box for the edge shape in world space
         */
        get: function () {
            var transformedBegin = this._getTransformedBegin();
            var transformedEnd = this._getTransformedEnd();
            return this._boundsFromBeginEnd(transformedBegin, transformedEnd);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Edge.prototype, "localBounds", {
        /**
         * Get the axis aligned bounding box for the edge shape in local space
         */
        get: function () {
            return this._boundsFromBeginEnd(this.begin, this.end);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns this edge represented as a line in world coordinates
     */
    Edge.prototype.asLine = function () {
        return new Line(this._getTransformedBegin(), this._getTransformedEnd());
    };
    Edge.prototype.asLocalLine = function () {
        return new Line(this.begin, this.end);
    };
    Object.defineProperty(Edge.prototype, "axes", {
        /**
         * Get the axis associated with the edge
         */
        get: function () {
            var e = this._getTransformedEnd().sub(this._getTransformedBegin());
            var edgeNormal = e.normal();
            var axes = [];
            axes.push(edgeNormal);
            axes.push(edgeNormal.negate());
            axes.push(edgeNormal.normal());
            axes.push(edgeNormal.normal().negate());
            return axes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Edge.prototype, "inertia", {
        /**
         * Get the moment of inertia for an edge
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        get: function () {
            var mass = this.collider ? this.collider.mass : Physics.defaultMass;
            var length = this.end.sub(this.begin).distance() / 2;
            return mass * length * length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @inheritdoc
     */
    Edge.prototype.recalc = function () {
        // edges don't have any cached data
    };
    /**
     * Project the edge along a specified axis
     */
    Edge.prototype.project = function (axis) {
        var scalars = [];
        var points = [this._getTransformedBegin(), this._getTransformedEnd()];
        var len = points.length;
        for (var i = 0; i < len; i++) {
            scalars.push(points[i].dot(axis));
        }
        return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
    };
    Edge.prototype.draw = function (ctx, color, pos) {
        if (color === void 0) { color = Color.Green; }
        if (pos === void 0) { pos = Vector.Zero; }
        var begin = this.begin.add(pos);
        var end = this.end.add(pos);
        ctx.strokeStyle = color.toString();
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke();
    };
    /* istanbul ignore next */
    Edge.prototype.debugDraw = function (ctx, color) {
        if (color === void 0) { color = Color.Red; }
        var begin = this._getTransformedBegin();
        var end = this._getTransformedEnd();
        ctx.strokeStyle = color.toString();
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke();
    };
    return Edge;
}());
export { Edge };
/**
 * @obsolete Use [[Edge]], EdgeArea will be removed in v0.24.0
 */
var EdgeArea = /** @class */ (function (_super) {
    __extends(EdgeArea, _super);
    function EdgeArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EdgeArea;
}(Edge));
export { EdgeArea };
