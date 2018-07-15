import { BoundingBox } from './BoundingBox';
import { CollisionJumpTable } from './CollisionJumpTable';
import { CircleArea } from './CircleArea';
import { PolygonArea } from './PolygonArea';
import { Vector, Projection } from '../Algebra';
import { Physics } from '../Physics';
import { Color } from '../Drawing/Color';
var EdgeArea = /** @class */ (function () {
    function EdgeArea(options) {
        this.begin = options.begin || Vector.Zero.clone();
        this.end = options.end || Vector.Zero.clone();
        this.body = options.body || null;
        this.pos = this.getCenter();
    }
    /**
     * Get the center of the collision area in world coordinates
     */
    EdgeArea.prototype.getCenter = function () {
        var pos = this.begin.average(this.end).add(this._getBodyPos());
        return pos;
    };
    EdgeArea.prototype._getBodyPos = function () {
        var bodyPos = Vector.Zero.clone();
        if (this.body.pos) {
            bodyPos = this.body.pos;
        }
        return bodyPos;
    };
    EdgeArea.prototype._getTransformedBegin = function () {
        var angle = this.body ? this.body.rotation : 0;
        return this.begin.rotate(angle).add(this._getBodyPos());
    };
    EdgeArea.prototype._getTransformedEnd = function () {
        var angle = this.body ? this.body.rotation : 0;
        return this.end.rotate(angle).add(this._getBodyPos());
    };
    /**
     * Returns the slope of the line in the form of a vector
     */
    EdgeArea.prototype.getSlope = function () {
        var begin = this._getTransformedBegin();
        var end = this._getTransformedEnd();
        var distance = begin.distance(end);
        return end.sub(begin).scale(1 / distance);
    };
    /**
     * Returns the length of the line segment in pixels
     */
    EdgeArea.prototype.getLength = function () {
        var begin = this._getTransformedBegin();
        var end = this._getTransformedEnd();
        var distance = begin.distance(end);
        return distance;
    };
    /**
     * Tests if a point is contained in this collision area
     */
    EdgeArea.prototype.contains = function () {
        return false;
    };
    /**
     * @inheritdoc
     */
    EdgeArea.prototype.rayCast = function (ray, max) {
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
     * @inheritdoc
     */
    EdgeArea.prototype.collide = function (area) {
        if (area instanceof CircleArea) {
            return CollisionJumpTable.CollideCircleEdge(area, this);
        }
        else if (area instanceof PolygonArea) {
            return CollisionJumpTable.CollidePolygonEdge(area, this);
        }
        else if (area instanceof EdgeArea) {
            return CollisionJumpTable.CollideEdgeEdge();
        }
        else {
            throw new Error("Edge could not collide with unknown ICollisionArea " + typeof area);
        }
    };
    /**
     * Find the point on the shape furthest in the direction specified
     */
    EdgeArea.prototype.getFurthestPoint = function (direction) {
        var transformedBegin = this._getTransformedBegin();
        var transformedEnd = this._getTransformedEnd();
        if (direction.dot(transformedBegin) > 0) {
            return transformedBegin;
        }
        else {
            return transformedEnd;
        }
    };
    /**
     * Get the axis aligned bounding box for the circle area
     */
    EdgeArea.prototype.getBounds = function () {
        var transformedBegin = this._getTransformedBegin();
        var transformedEnd = this._getTransformedEnd();
        return new BoundingBox(Math.min(transformedBegin.x, transformedEnd.x), Math.min(transformedBegin.y, transformedEnd.y), Math.max(transformedBegin.x, transformedEnd.x), Math.max(transformedBegin.y, transformedEnd.y));
    };
    /**
     * Get the axis associated with the edge
     */
    EdgeArea.prototype.getAxes = function () {
        var e = this._getTransformedEnd().sub(this._getTransformedBegin());
        var edgeNormal = e.normal();
        var axes = [];
        axes.push(edgeNormal);
        axes.push(edgeNormal.negate());
        axes.push(edgeNormal.normal());
        axes.push(edgeNormal.normal().negate());
        return axes;
    };
    /**
     * Get the moment of inertia for an edge
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    EdgeArea.prototype.getMomentOfInertia = function () {
        var mass = this.body ? this.body.mass : Physics.defaultMass;
        var length = this.end.sub(this.begin).distance() / 2;
        return mass * length * length;
    };
    /**
     * @inheritdoc
     */
    EdgeArea.prototype.recalc = function () {
        // edges don't have any cached data
    };
    /**
     * Project the edge along a specified axis
     */
    EdgeArea.prototype.project = function (axis) {
        var scalars = [];
        var points = [this._getTransformedBegin(), this._getTransformedEnd()];
        var len = points.length;
        for (var i = 0; i < len; i++) {
            scalars.push(points[i].dot(axis));
        }
        return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
    };
    /* istanbul ignore next */
    EdgeArea.prototype.debugDraw = function (ctx, color) {
        if (color === void 0) { color = Color.Red.clone(); }
        ctx.strokeStyle = color.toString();
        ctx.beginPath();
        ctx.moveTo(this.begin.x, this.begin.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.closePath();
        ctx.stroke();
    };
    return EdgeArea;
}());
export { EdgeArea };
//# sourceMappingURL=EdgeArea.js.map