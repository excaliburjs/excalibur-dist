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
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';
import { Vector, Projection } from '../Algebra';
import { Physics } from '../Physics';
import { Color } from '../Drawing/Color';
import { ClosestLineJumpTable } from './ClosestLineJumpTable';
/**
 * This is a circle collision shape for the excalibur rigid body physics simulation
 *
 * Example:
 * [[include:CircleShape.md]]
 */
var Circle = /** @class */ (function () {
    function Circle(options) {
        /**
         * Position of the circle relative to the collider, by default (0, 0) meaning the shape is positioned on top of the collider.
         */
        this.offset = Vector.Zero;
        this.offset = options.offset || Vector.Zero;
        this.radius = options.radius || 0;
        this.collider = options.collider || null;
        // @obsolete Remove next release in v0.24.0, code exists for backwards compat
        if (options.body) {
            this.collider = options.body.collider;
            this.body = this.collider.body;
        }
        // ==================================
    }
    Object.defineProperty(Circle.prototype, "worldPos", {
        get: function () {
            if (this.collider && this.collider.body) {
                return this.collider.body.pos.add(this.offset);
            }
            return this.offset;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns a clone of this shape, not associated with any collider
     */
    Circle.prototype.clone = function () {
        return new Circle({
            offset: this.offset.clone(),
            radius: this.radius,
            collider: null,
            body: null
        });
    };
    Object.defineProperty(Circle.prototype, "center", {
        /**
         * Get the center of the collision shape in world coordinates
         */
        get: function () {
            if (this.collider && this.collider.body) {
                return this.offset.add(this.collider.body.pos);
            }
            return this.offset;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Tests if a point is contained in this collision shape
     */
    Circle.prototype.contains = function (point) {
        var pos = this.offset;
        if (this.collider && this.collider.body) {
            pos = this.collider.body.pos;
        }
        var distance = pos.distance(point);
        if (distance <= this.radius) {
            return true;
        }
        return false;
    };
    /**
     * Casts a ray at the Circl shape and returns the nearest point of collision
     * @param ray
     */
    Circle.prototype.rayCast = function (ray, max) {
        if (max === void 0) { max = Infinity; }
        //https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection
        var c = this.center;
        var dir = ray.dir;
        var orig = ray.pos;
        var discriminant = Math.sqrt(Math.pow(dir.dot(orig.sub(c)), 2) - Math.pow(orig.sub(c).distance(), 2) + Math.pow(this.radius, 2));
        if (discriminant < 0) {
            // no intersection
            return null;
        }
        else {
            var toi = 0;
            if (discriminant === 0) {
                toi = -dir.dot(orig.sub(c));
                if (toi > 0 && toi < max) {
                    return ray.getPoint(toi);
                }
                return null;
            }
            else {
                var toi1 = -dir.dot(orig.sub(c)) + discriminant;
                var toi2 = -dir.dot(orig.sub(c)) - discriminant;
                var positiveToi = [];
                if (toi1 >= 0) {
                    positiveToi.push(toi1);
                }
                if (toi2 >= 0) {
                    positiveToi.push(toi2);
                }
                var mintoi = Math.min.apply(Math, positiveToi);
                if (mintoi <= max) {
                    return ray.getPoint(mintoi);
                }
                return null;
            }
        }
    };
    Circle.prototype.getClosestLineBetween = function (shape) {
        if (shape instanceof Circle) {
            return ClosestLineJumpTable.CircleCircleClosestLine(this, shape);
        }
        else if (shape instanceof ConvexPolygon) {
            return ClosestLineJumpTable.PolygonCircleClosestLine(shape, this).flip();
        }
        else if (shape instanceof Edge) {
            return ClosestLineJumpTable.CircleEdgeClosestLine(this, shape).flip();
        }
        else {
            throw new Error("Polygon could not collide with unknown CollisionShape " + typeof shape);
        }
    };
    /**
     * @inheritdoc
     */
    Circle.prototype.collide = function (shape) {
        if (shape instanceof Circle) {
            return CollisionJumpTable.CollideCircleCircle(this, shape);
        }
        else if (shape instanceof ConvexPolygon) {
            return CollisionJumpTable.CollideCirclePolygon(this, shape);
        }
        else if (shape instanceof Edge) {
            return CollisionJumpTable.CollideCircleEdge(this, shape);
        }
        else {
            throw new Error("Circle could not collide with unknown CollisionShape " + typeof shape);
        }
    };
    /**
     * Find the point on the shape furthest in the direction specified
     */
    Circle.prototype.getFurthestPoint = function (direction) {
        return this.center.add(direction.normalize().scale(this.radius));
    };
    Object.defineProperty(Circle.prototype, "bounds", {
        /**
         * Get the axis aligned bounding box for the circle shape in world coordinates
         */
        get: function () {
            var bodyPos = Vector.Zero;
            if (this.collider && this.collider.body) {
                bodyPos = this.collider.body.pos;
            }
            return new BoundingBox(this.offset.x + bodyPos.x - this.radius, this.offset.y + bodyPos.y - this.radius, this.offset.x + bodyPos.x + this.radius, this.offset.y + bodyPos.y + this.radius);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "localBounds", {
        /**
         * Get the axis aligned bounding box for the circle shape in local coordinates
         */
        get: function () {
            return new BoundingBox(this.offset.x - this.radius, this.offset.y - this.radius, this.offset.x + this.radius, this.offset.y + this.radius);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "axes", {
        /**
         * Get axis not implemented on circles, since there are infinite axis in a circle
         */
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "inertia", {
        /**
         * Returns the moment of inertia of a circle given it's mass
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        get: function () {
            var mass = this.collider ? this.collider.mass : Physics.defaultMass;
            return (mass * this.radius * this.radius) / 2;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Tests the separating axis theorem for circles against polygons
     */
    Circle.prototype.testSeparatingAxisTheorem = function (polygon) {
        var axes = polygon.axes;
        var pc = polygon.center;
        // Special SAT with circles
        var closestPointOnPoly = polygon.getFurthestPoint(this.offset.sub(pc));
        axes.push(this.offset.sub(closestPointOnPoly).normalize());
        var minOverlap = Number.MAX_VALUE;
        var minAxis = null;
        var minIndex = -1;
        for (var i = 0; i < axes.length; i++) {
            var proj1 = polygon.project(axes[i]);
            var proj2 = this.project(axes[i]);
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
        if (minIndex < 0) {
            return null;
        }
        return minAxis.normalize().scale(minOverlap);
    };
    /* istanbul ignore next */
    Circle.prototype.recalc = function () {
        // circles don't cache
    };
    /**
     * Project the circle along a specified axis
     */
    Circle.prototype.project = function (axis) {
        var scalars = [];
        var point = this.center;
        var dotProduct = point.dot(axis);
        scalars.push(dotProduct);
        scalars.push(dotProduct + this.radius);
        scalars.push(dotProduct - this.radius);
        return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
    };
    Circle.prototype.draw = function (ctx, color, pos) {
        if (color === void 0) { color = Color.Green; }
        if (pos === void 0) { pos = Vector.Zero; }
        var newPos = pos.add(this.offset);
        ctx.beginPath();
        ctx.fillStyle = color.toString();
        ctx.arc(newPos.x, newPos.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    };
    /* istanbul ignore next */
    Circle.prototype.debugDraw = function (ctx, color) {
        if (color === void 0) { color = Color.Green; }
        var body = this.collider.body;
        var pos = body ? body.pos.add(this.offset) : this.offset;
        var rotation = body ? body.rotation : 0;
        ctx.beginPath();
        ctx.strokeStyle = color.toString();
        ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(Math.cos(rotation) * this.radius + pos.x, Math.sin(rotation) * this.radius + pos.y);
        ctx.closePath();
        ctx.stroke();
    };
    return Circle;
}());
export { Circle };
/**
 * @obsolete Use [[Circle]], CircleArea will be removed in v0.24.0
 */
var CircleArea = /** @class */ (function (_super) {
    __extends(CircleArea, _super);
    function CircleArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CircleArea;
}(Circle));
export { CircleArea };
