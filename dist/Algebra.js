var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as Util from './Util/Util';
import { obsolete } from './Util/Decorators';
/**
 * A 2D vector on a plane.
 */
export class Vector {
    /**
     * @param x  X component of the Vector
     * @param y  Y component of the Vector
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * A (0, 0) vector
     */
    static get Zero() {
        return new Vector(0, 0);
    }
    /**
     * A (1, 1) vector
     */
    static get One() {
        return new Vector(1, 1);
    }
    /**
     * A (0.5, 0.5) vector
     */
    static get Half() {
        return new Vector(0.5, 0.5);
    }
    /**
     * A unit vector pointing up (0, -1)
     */
    static get Up() {
        return new Vector(0, -1);
    }
    /**
     * A unit vector pointing down (0, 1)
     */
    static get Down() {
        return new Vector(0, 1);
    }
    /**
     * A unit vector pointing left (-1, 0)
     */
    static get Left() {
        return new Vector(-1, 0);
    }
    /**
     * A unit vector pointing right (1, 0)
     */
    static get Right() {
        return new Vector(1, 0);
    }
    /**
     * Returns a vector of unit length in the direction of the specified angle in Radians.
     * @param angle The angle to generate the vector
     */
    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
    /**
     * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
     */
    static isValid(vec) {
        if (vec === null || vec === undefined) {
            return false;
        }
        if (isNaN(vec.x) || isNaN(vec.y)) {
            return false;
        }
        if (vec.x === Infinity || vec.y === Infinity || vec.x === -Infinity || vec.y === -Infinity) {
            return false;
        }
        return true;
    }
    /**
     * Calculates distance between two Vectors
     * @param vec1
     * @param vec2
     */
    static distance(vec1, vec2) {
        return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2));
    }
    /**
     * Sets the x and y components at once
     */
    setTo(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Compares this point against another and tests for equality
     * @param vector The other point to compare to
     * @param tolerance Amount of euclidean distance off we are willing to tolerate
     */
    equals(vector, tolerance = 0.001) {
        return Math.abs(this.x - vector.x) <= tolerance && Math.abs(this.y - vector.y) <= tolerance;
    }
    /**
     * The distance to another vector. If no other Vector is specified, this will return the [[magnitude]].
     * @param v  The other vector. Leave blank to use origin vector.
     */
    distance(v) {
        if (!v) {
            v = Vector.Zero;
        }
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    }
    /**
     * The magnitude (size) of the Vector
     * @obsolete magnitude will be removed in favour of '.size' in version 0.25.0
     */
    magnitude() {
        return this.distance();
    }
    /**
     * The size(magnitude) of the Vector
     */
    get size() {
        return this.distance();
    }
    set size(newLength) {
        const v = this.normalize().scale(newLength);
        this.x = v.x;
        this.y = v.y;
    }
    /**
     * Normalizes a vector to have a magnitude of 1.
     */
    normalize() {
        const d = this.distance();
        if (d > 0) {
            return new Vector(this.x / d, this.y / d);
        }
        else {
            return new Vector(0, 1);
        }
    }
    /**
     * Returns the average (midpoint) between the current point and the specified
     */
    average(vec) {
        return this.add(vec).scale(0.5);
    }
    scale(sizeOrScale) {
        if (sizeOrScale instanceof Vector) {
            return new Vector(this.x * sizeOrScale.x, this.y * sizeOrScale.y);
        }
        else {
            return new Vector(this.x * sizeOrScale, this.y * sizeOrScale);
        }
    }
    /**
     * Adds one vector to another
     * @param v The vector to add
     */
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    /**
     * Subtracts a vector from another, if you subtract vector `B.sub(A)` the resulting vector points from A -> B
     * @param v The vector to subtract
     */
    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    /**
     * Adds one vector to this one modifying the original
     * @param v The vector to add
     */
    addEqual(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    /**
     * Subtracts a vector from this one modifying the original
     * @param v The vector to subtract
     */
    subEqual(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    /**
     * Scales this vector by a factor of size and modifies the original
     */
    scaleEqual(size) {
        this.x *= size;
        this.y *= size;
        return this;
    }
    /**
     * Performs a dot product with another vector
     * @param v  The vector to dot
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v) {
        if (v instanceof Vector) {
            return this.x * v.y - this.y * v.x;
        }
        else if (typeof v === 'number') {
            return new Vector(v * this.y, -v * this.x);
        }
    }
    /**
     * Returns the perpendicular vector to this one
     */
    perpendicular() {
        return new Vector(this.y, -this.x);
    }
    /**
     * Returns the normal vector to this one, same as the perpendicular of length 1
     */
    normal() {
        return this.perpendicular().normalize();
    }
    /**
     * Negate the current vector
     */
    negate() {
        return this.scale(-1);
    }
    /**
     * Returns the angle of this vector.
     */
    toAngle() {
        return Math.atan2(this.y, this.x);
    }
    /**
     * Rotates the current vector around a point by a certain number of
     * degrees in radians
     */
    rotate(angle, anchor) {
        if (!anchor) {
            anchor = new Vector(0, 0);
        }
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
        const y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
        return new Vector(x, y);
    }
    /**
     * Creates new vector that has the same values as the previous.
     */
    clone() {
        return new Vector(this.x, this.y);
    }
    /**
     * Returns a string representation of the vector.
     */
    toString() {
        return `(${this.x}, ${this.y})`;
    }
}
__decorate([
    obsolete({ message: 'will be removed in favour of `.size` in version 0.25.0' })
], Vector.prototype, "magnitude", null);
/**
 * A 2D ray that can be cast into the scene to do collision detection
 */
export class Ray {
    /**
     * @param pos The starting position for the ray
     * @param dir The vector indicating the direction of the ray
     */
    constructor(pos, dir) {
        this.pos = pos;
        this.dir = dir.normalize();
    }
    /**
     * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
     * This number indicates the mathematical intersection time.
     * @param line  The line to test
     */
    intersect(line) {
        const numerator = line.begin.sub(this.pos);
        // Test is line and ray are parallel and non intersecting
        if (this.dir.cross(line.getSlope()) === 0 && numerator.cross(this.dir) !== 0) {
            return -1;
        }
        // Lines are parallel
        const divisor = this.dir.cross(line.getSlope());
        if (divisor === 0) {
            return -1;
        }
        const t = numerator.cross(line.getSlope()) / divisor;
        if (t >= 0) {
            const u = numerator.cross(this.dir) / divisor / line.getLength();
            if (u >= 0 && u <= 1) {
                return t;
            }
        }
        return -1;
    }
    /**
     * Returns the point of intersection given the intersection time
     */
    getPoint(time) {
        return this.pos.add(this.dir.scale(time));
    }
}
/**
 * A 2D line segment
 */
export class Line {
    /**
     * @param begin  The starting point of the line segment
     * @param end  The ending point of the line segment
     */
    constructor(begin, end) {
        this.begin = begin;
        this.end = end;
    }
    /**
     * Gets the raw slope (m) of the line. Will return (+/-)Infinity for vertical lines.
     */
    get slope() {
        return (this.end.y - this.begin.y) / (this.end.x - this.begin.x);
    }
    /**
     * Gets the Y-intercept (b) of the line. Will return (+/-)Infinity if there is no intercept.
     */
    get intercept() {
        return this.begin.y - this.slope * this.begin.x;
    }
    /**
     * Gets the normal of the line
     */
    normal() {
        return this.end.sub(this.begin).normal();
    }
    /**
     * Returns the slope of the line in the form of a vector of length 1
     */
    getSlope() {
        const begin = this.begin;
        const end = this.end;
        const distance = begin.distance(end);
        return end.sub(begin).scale(1 / distance);
    }
    /**
     * Returns the edge of the line as vector, the length of the vector is the length of the edge
     */
    getEdge() {
        const begin = this.begin;
        const end = this.end;
        return end.sub(begin);
    }
    /**
     * Returns the length of the line segment in pixels
     */
    getLength() {
        const begin = this.begin;
        const end = this.end;
        const distance = begin.distance(end);
        return distance;
    }
    /**
     * Returns the midpoint of the edge
     */
    get midpoint() {
        return this.begin.add(this.end).scale(0.5);
    }
    /**
     * Flips the direction of the line segment
     */
    flip() {
        return new Line(this.end, this.begin);
    }
    /**
     * Find the perpendicular distance from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * @param point
     */
    distanceToPoint(point) {
        const x0 = point.x;
        const y0 = point.y;
        const l = this.getLength();
        const dy = this.end.y - this.begin.y;
        const dx = this.end.x - this.begin.x;
        const distance = Math.abs(dy * x0 - dx * y0 + this.end.x * this.begin.y - this.end.y * this.begin.x) / l;
        return distance;
    }
    /**
     * Find the perpendicular line from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * (a - p) - ((a - p) * n)n
     * a is a point on the line
     * p is the arbitrary point above the line
     * n is a unit vector in direction of the line
     * @param point
     */
    findVectorToPoint(point) {
        const aMinusP = this.begin.sub(point);
        const n = this.getSlope();
        return aMinusP.sub(n.scale(aMinusP.dot(n)));
    }
    /**
     * Finds a point on the line given only an X or a Y value. Given an X value, the function returns
     * a new point with the calculated Y value and vice-versa.
     *
     * @param x The known X value of the target point
     * @param y The known Y value of the target point
     * @returns A new point with the other calculated axis value
     */
    findPoint(x = null, y = null) {
        const m = this.slope;
        const b = this.intercept;
        if (x !== null) {
            return new Vector(x, m * x + b);
        }
        else if (y !== null) {
            return new Vector((y - b) / m, y);
        }
        else {
            throw new Error('You must provide an X or a Y value');
        }
    }
    /**
     * @see http://stackoverflow.com/a/11908158/109458
     */
    hasPoint() {
        let currPoint;
        let threshold = 0;
        if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
            currPoint = new Vector(arguments[0], arguments[1]);
            threshold = arguments[2] || 0;
        }
        else if (arguments[0] instanceof Vector) {
            currPoint = arguments[0];
            threshold = arguments[1] || 0;
        }
        else {
            throw 'Could not determine the arguments for Vector.hasPoint';
        }
        const dxc = currPoint.x - this.begin.x;
        const dyc = currPoint.y - this.begin.y;
        const dx1 = this.end.x - this.begin.x;
        const dy1 = this.end.y - this.begin.y;
        const cross = dxc * dy1 - dyc * dx1;
        // check whether point lines on the line
        if (Math.abs(cross) > threshold) {
            return false;
        }
        // check whether point lies in-between start and end
        if (Math.abs(dx1) >= Math.abs(dy1)) {
            return dx1 > 0 ? this.begin.x <= currPoint.x && currPoint.x <= this.end.x : this.end.x <= currPoint.x && currPoint.x <= this.begin.x;
        }
        else {
            return dy1 > 0 ? this.begin.y <= currPoint.y && currPoint.y <= this.end.y : this.end.y <= currPoint.y && currPoint.y <= this.begin.y;
        }
    }
}
/**
 * A 1 dimensional projection on an axis, used to test overlaps
 */
export class Projection {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    overlaps(projection) {
        return this.max > projection.min && projection.max > this.min;
    }
    getOverlap(projection) {
        if (this.overlaps(projection)) {
            if (this.max > projection.max) {
                return projection.max - this.min;
            }
            else {
                return this.max - projection.min;
            }
        }
        return 0;
    }
}
export class GlobalCoordinates {
    constructor(worldPos, pagePos, screenPos) {
        this.worldPos = worldPos;
        this.pagePos = pagePos;
        this.screenPos = screenPos;
    }
    static fromPagePosition(xOrPos, yOrEngine, engineOrUndefined) {
        let pageX;
        let pageY;
        let pagePos;
        let engine;
        if (arguments.length === 3) {
            pageX = xOrPos;
            pageY = yOrEngine;
            pagePos = new Vector(pageX, pageY);
            engine = engineOrUndefined;
        }
        else {
            pagePos = xOrPos;
            pageX = pagePos.x;
            pageY = pagePos.y;
            engine = yOrEngine;
        }
        const screenX = pageX - Util.getPosition(engine.canvas).x;
        const screenY = pageY - Util.getPosition(engine.canvas).y;
        const screenPos = new Vector(screenX, screenY);
        const worldPos = engine.screenToWorldCoordinates(screenPos);
        return new GlobalCoordinates(worldPos, pagePos, screenPos);
    }
}
/**
 * Shorthand for creating new Vectors - returns a new Vector instance with the
 * provided X and Y components.
 *
 * @param x  X component of the Vector
 * @param y  Y component of the Vector
 */
export function vec(x, y) {
    return new Vector(x, y);
}
//# sourceMappingURL=Algebra.js.map