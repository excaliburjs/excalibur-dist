import { Color } from './../Drawing/Color';
import { Physics } from './../Physics';
import { BoundingBox } from './BoundingBox';
import { EdgeArea } from './EdgeArea';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CircleArea } from './CircleArea';
import { Vector, Line, Ray, Projection } from './../Algebra';
/**
 * Polygon collision area for detecting collisions for actors, or independently
 */
var PolygonArea = /** @class */ (function () {
    function PolygonArea(options) {
        this._transformedPoints = [];
        this._axes = [];
        this._sides = [];
        this.pos = options.pos || Vector.Zero.clone();
        var winding = !!options.clockwiseWinding;
        this.points = (winding ? options.points.reverse() : options.points) || [];
        this.body = options.body || null;
        // calculate initial transformation
        this._calculateTransformation();
    }
    /**
     * Get the center of the collision area in world coordinates
     */
    PolygonArea.prototype.getCenter = function () {
        if (this.body) {
            return this.body.pos.add(this.pos);
        }
        return this.pos;
    };
    /**
     * Calculates the underlying transformation from the body relative space to world space
     */
    PolygonArea.prototype._calculateTransformation = function () {
        var pos = this.body ? this.body.pos.add(this.pos) : this.pos;
        var angle = this.body ? this.body.rotation : 0;
        var len = this.points.length;
        this._transformedPoints.length = 0; // clear out old transform
        for (var i = 0; i < len; i++) {
            this._transformedPoints[i] = this.points[i].rotate(angle).add(pos);
        }
    };
    /**
     * Gets the points that make up the polygon in world space, from actor relative space (if specified)
     */
    PolygonArea.prototype.getTransformedPoints = function () {
        if (!this._transformedPoints.length) {
            this._calculateTransformation();
        }
        return this._transformedPoints;
    };
    /**
     * Gets the sides of the polygon in world space
     */
    PolygonArea.prototype.getSides = function () {
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
    PolygonArea.prototype.recalc = function () {
        this._sides.length = 0;
        this._axes.length = 0;
        this._transformedPoints.length = 0;
        this.getTransformedPoints();
        this.getAxes();
        this.getSides();
    };
    /**
     * Tests if a point is contained in this collision area in world space
     */
    PolygonArea.prototype.contains = function (point) {
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
    /**
     * Returns a collision contact if the 2 collision areas collide, otherwise collide will
     * return null.
     * @param area
     */
    PolygonArea.prototype.collide = function (area) {
        if (area instanceof CircleArea) {
            return CollisionJumpTable.CollideCirclePolygon(area, this);
        }
        else if (area instanceof PolygonArea) {
            return CollisionJumpTable.CollidePolygonPolygon(this, area);
        }
        else if (area instanceof EdgeArea) {
            return CollisionJumpTable.CollidePolygonEdge(this, area);
        }
        else {
            throw new Error("Polygon could not collide with unknown ICollisionArea " + typeof area);
        }
    };
    /**
     * Find the point on the shape furthest in the direction specified
     */
    PolygonArea.prototype.getFurthestPoint = function (direction) {
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
    PolygonArea.prototype.getClosestFace = function (point) {
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
    /**
     * Get the axis aligned bounding box for the polygon area
     */
    PolygonArea.prototype.getBounds = function () {
        // todo there is a faster way to do this
        var points = this.getTransformedPoints();
        var minX = points.reduce(function (prev, curr) {
            return Math.min(prev, curr.x);
        }, 999999999);
        var maxX = points.reduce(function (prev, curr) {
            return Math.max(prev, curr.x);
        }, -99999999);
        var minY = points.reduce(function (prev, curr) {
            return Math.min(prev, curr.y);
        }, 9999999999);
        var maxY = points.reduce(function (prev, curr) {
            return Math.max(prev, curr.y);
        }, -9999999999);
        return new BoundingBox(minX, minY, maxX, maxY);
    };
    /**
     * Get the moment of inertia for an arbitrary polygon
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    PolygonArea.prototype.getMomentOfInertia = function () {
        var mass = this.body ? this.body.mass : Physics.defaultMass;
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
    };
    /**
     * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
     */
    PolygonArea.prototype.rayCast = function (ray, max) {
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
    /**
     * Get the axis associated with the edge
     */
    PolygonArea.prototype.getAxes = function () {
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
    };
    /**
     * Perform Separating Axis test against another polygon, returns null if no overlap in polys
     * Reference http://www.dyn4j.org/2010/01/sat/
     */
    PolygonArea.prototype.testSeparatingAxisTheorem = function (other) {
        var poly1 = this;
        var poly2 = other;
        var axes = poly1.getAxes().concat(poly2.getAxes());
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
    PolygonArea.prototype.project = function (axis) {
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
    /* istanbul ignore next */
    PolygonArea.prototype.debugDraw = function (ctx, color) {
        if (color === void 0) { color = Color.Red.clone(); }
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
    return PolygonArea;
}());
export { PolygonArea };
//# sourceMappingURL=PolygonArea.js.map