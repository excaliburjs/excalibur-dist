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
 */
export class Edge {
    constructor(options) {
        this.begin = options.begin || Vector.Zero;
        this.end = options.end || Vector.Zero;
        this.collider = options.collider || null;
        this.offset = this.center;
    }
    /**
     * Returns a clone of this Edge, not associated with any collider
     */
    clone() {
        return new Edge({
            begin: this.begin.clone(),
            end: this.end.clone(),
            collider: null
        });
    }
    get worldPos() {
        if (this.collider && this.collider.body) {
            return this.collider.body.pos.add(this.offset);
        }
        return this.offset;
    }
    /**
     * Get the center of the collision area in world coordinates
     */
    get center() {
        const pos = this.begin.average(this.end).add(this._getBodyPos());
        return pos;
    }
    _getBodyPos() {
        let bodyPos = Vector.Zero;
        if (this.collider && this.collider.body) {
            bodyPos = this.collider.body.pos;
        }
        return bodyPos;
    }
    _getTransformedBegin() {
        const body = this.collider ? this.collider.body : null;
        const angle = body ? body.rotation : 0;
        return this.begin.rotate(angle).add(this._getBodyPos());
    }
    _getTransformedEnd() {
        const body = this.collider ? this.collider.body : null;
        const angle = body ? body.rotation : 0;
        return this.end.rotate(angle).add(this._getBodyPos());
    }
    /**
     * Returns the slope of the line in the form of a vector
     */
    getSlope() {
        const begin = this._getTransformedBegin();
        const end = this._getTransformedEnd();
        const distance = begin.distance(end);
        return end.sub(begin).scale(1 / distance);
    }
    /**
     * Returns the length of the line segment in pixels
     */
    getLength() {
        const begin = this._getTransformedBegin();
        const end = this._getTransformedEnd();
        const distance = begin.distance(end);
        return distance;
    }
    /**
     * Tests if a point is contained in this collision area
     */
    contains() {
        return false;
    }
    /**
     * @inheritdoc
     */
    rayCast(ray, max = Infinity) {
        const numerator = this._getTransformedBegin().sub(ray.pos);
        // Test is line and ray are parallel and non intersecting
        if (ray.dir.cross(this.getSlope()) === 0 && numerator.cross(ray.dir) !== 0) {
            return null;
        }
        // Lines are parallel
        const divisor = ray.dir.cross(this.getSlope());
        if (divisor === 0) {
            return null;
        }
        const t = numerator.cross(this.getSlope()) / divisor;
        if (t >= 0 && t <= max) {
            const u = numerator.cross(ray.dir) / divisor / this.getLength();
            if (u >= 0 && u <= 1) {
                return ray.getPoint(t);
            }
        }
        return null;
    }
    /**
     * Returns the closes line between this and another shape, from this -> shape
     * @param shape
     */
    getClosestLineBetween(shape) {
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
            throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof shape}`);
        }
    }
    /**
     * @inheritdoc
     */
    collide(shape) {
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
            throw new Error(`Edge could not collide with unknown CollisionShape ${typeof shape}`);
        }
    }
    /**
     * Find the point on the shape furthest in the direction specified
     */
    getFurthestPoint(direction) {
        const transformedBegin = this._getTransformedBegin();
        const transformedEnd = this._getTransformedEnd();
        if (direction.dot(transformedBegin) > 0) {
            return transformedBegin;
        }
        else {
            return transformedEnd;
        }
    }
    _boundsFromBeginEnd(begin, end) {
        return new BoundingBox(Math.min(begin.x, end.x), Math.min(begin.y, end.y), Math.max(begin.x, end.x), Math.max(begin.y, end.y));
    }
    /**
     * Get the axis aligned bounding box for the edge shape in world space
     */
    get bounds() {
        const transformedBegin = this._getTransformedBegin();
        const transformedEnd = this._getTransformedEnd();
        return this._boundsFromBeginEnd(transformedBegin, transformedEnd);
    }
    /**
     * Get the axis aligned bounding box for the edge shape in local space
     */
    get localBounds() {
        return this._boundsFromBeginEnd(this.begin, this.end);
    }
    /**
     * Returns this edge represented as a line in world coordinates
     */
    asLine() {
        return new Line(this._getTransformedBegin(), this._getTransformedEnd());
    }
    asLocalLine() {
        return new Line(this.begin, this.end);
    }
    /**
     * Get the axis associated with the edge
     */
    get axes() {
        const e = this._getTransformedEnd().sub(this._getTransformedBegin());
        const edgeNormal = e.normal();
        const axes = [];
        axes.push(edgeNormal);
        axes.push(edgeNormal.negate());
        axes.push(edgeNormal.normal());
        axes.push(edgeNormal.normal().negate());
        return axes;
    }
    /**
     * Get the moment of inertia for an edge
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    get inertia() {
        const mass = this.collider ? this.collider.mass : Physics.defaultMass;
        const length = this.end.sub(this.begin).distance() / 2;
        return mass * length * length;
    }
    /**
     * @inheritdoc
     */
    recalc() {
        // edges don't have any cached data
    }
    /**
     * Project the edge along a specified axis
     */
    project(axis) {
        const scalars = [];
        const points = [this._getTransformedBegin(), this._getTransformedEnd()];
        const len = points.length;
        for (let i = 0; i < len; i++) {
            scalars.push(points[i].dot(axis));
        }
        return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
    }
    draw(ctx, color = Color.Green, pos = Vector.Zero) {
        const begin = this.begin.add(pos);
        const end = this.end.add(pos);
        ctx.strokeStyle = color.toString();
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke();
    }
    /* istanbul ignore next */
    debugDraw(ctx, color = Color.Red) {
        const begin = this._getTransformedBegin();
        const end = this._getTransformedEnd();
        ctx.strokeStyle = color.toString();
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke();
    }
}
//# sourceMappingURL=Edge.js.map