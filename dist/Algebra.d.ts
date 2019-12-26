import { Engine } from './Engine';
import { Clonable } from './Interfaces/Clonable';
/**
 * A 2D vector on a plane.
 */
export declare class Vector implements Clonable<Vector> {
    x: number;
    y: number;
    /**
     * A (0, 0) vector
     */
    static get Zero(): Vector;
    /**
     * A (1, 1) vector
     */
    static get One(): Vector;
    /**
     * A (0.5, 0.5) vector
     */
    static get Half(): Vector;
    /**
     * A unit vector pointing up (0, -1)
     */
    static get Up(): Vector;
    /**
     * A unit vector pointing down (0, 1)
     */
    static get Down(): Vector;
    /**
     * A unit vector pointing left (-1, 0)
     */
    static get Left(): Vector;
    /**
     * A unit vector pointing right (1, 0)
     */
    static get Right(): Vector;
    /**
     * Returns a vector of unit length in the direction of the specified angle in Radians.
     * @param angle The angle to generate the vector
     */
    static fromAngle(angle: number): Vector;
    /**
     * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
     */
    static isValid(vec: Vector): boolean;
    /**
     * Calculates distance between two Vectors
     * @param vec1
     * @param vec2
     */
    static distance(vec1: Vector, vec2: Vector): number;
    /**
     * @param x  X component of the Vector
     * @param y  Y component of the Vector
     */
    constructor(x: number, y: number);
    /**
     * Sets the x and y components at once
     */
    setTo(x: number, y: number): void;
    /**
     * Compares this point against another and tests for equality
     * @param point  The other point to compare to
     */
    equals(vector: Vector, tolerance?: number): boolean;
    /**
     * The distance to another vector. If no other Vector is specified, this will return the [[magnitude]].
     * @param v  The other vector. Leave blank to use origin vector.
     */
    distance(v?: Vector): number;
    /**
     * The magnitude (size) of the Vector
     * @obsolete magnitude will be removed in favour of '.size' in version 0.25.0
     */
    magnitude(): number;
    /**
     * The size(magnitude) of the Vector
     */
    get size(): number;
    set size(newLength: number);
    /**
     * Normalizes a vector to have a magnitude of 1.
     */
    normalize(): Vector;
    /**
     * Returns the average (midpoint) between the current point and the specified
     */
    average(vec: Vector): Vector;
    /**
     * Scales a vector's by a factor of size
     * @param size  The factor to scale the magnitude by
     */
    scale(scale: Vector): Vector;
    scale(size: number): Vector;
    /**
     * Adds one vector to another
     * @param v The vector to add
     */
    add(v: Vector): Vector;
    /**
     * Subtracts a vector from another, if you subtract vector `B.sub(A)` the resulting vector points from A -> B
     * @param v The vector to subtract
     */
    sub(v: Vector): Vector;
    /**
     * Adds one vector to this one modifying the original
     * @param v The vector to add
     */
    addEqual(v: Vector): Vector;
    /**
     * Subtracts a vector from this one modifying the original
     * @parallel v The vector to subtract
     */
    subEqual(v: Vector): Vector;
    /**
     * Scales this vector by a factor of size and modifies the original
     */
    scaleEqual(size: number): Vector;
    /**
     * Performs a dot product with another vector
     * @param v  The vector to dot
     */
    dot(v: Vector): number;
    /**
     * Performs a 2D cross product with scalar. 2D cross products with a scalar return a vector.
     * @param v  The scalar to cross
     */
    cross(v: number): Vector;
    /**
     * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
     * @param v  The vector to cross
     */
    cross(v: Vector): number;
    /**
     * Returns the perpendicular vector to this one
     */
    perpendicular(): Vector;
    /**
     * Returns the normal vector to this one, same as the perpendicular of length 1
     */
    normal(): Vector;
    /**
     * Negate the current vector
     */
    negate(): Vector;
    /**
     * Returns the angle of this vector.
     */
    toAngle(): number;
    /**
     * Rotates the current vector around a point by a certain number of
     * degrees in radians
     */
    rotate(angle: number, anchor?: Vector): Vector;
    /**
     * Creates new vector that has the same values as the previous.
     */
    clone(): Vector;
    /**
     * Returns a string representation of the vector.
     */
    toString(): string;
}
/**
 * A 2D ray that can be cast into the scene to do collision detection
 */
export declare class Ray {
    pos: Vector;
    dir: Vector;
    /**
     * @param pos The starting position for the ray
     * @param dir The vector indicating the direction of the ray
     */
    constructor(pos: Vector, dir: Vector);
    /**
     * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
     * This number indicates the mathematical intersection time.
     * @param line  The line to test
     */
    intersect(line: Line): number;
    /**
     * Returns the point of intersection given the intersection time
     */
    getPoint(time: number): Vector;
}
/**
 * A 2D line segment
 */
export declare class Line {
    begin: Vector;
    end: Vector;
    /**
     * @param begin  The starting point of the line segment
     * @param end  The ending point of the line segment
     */
    constructor(begin: Vector, end: Vector);
    /**
     * Gets the raw slope (m) of the line. Will return (+/-)Infinity for vertical lines.
     */
    get slope(): number;
    /**
     * Gets the Y-intercept (b) of the line. Will return (+/-)Infinity if there is no intercept.
     */
    get intercept(): number;
    /**
     * Gets the normal of the line
     */
    normal(): Vector;
    /**
     * Returns the slope of the line in the form of a vector of length 1
     */
    getSlope(): Vector;
    /**
     * Returns the edge of the line as vector, the length of the vector is the length of the edge
     */
    getEdge(): Vector;
    /**
     * Returns the length of the line segment in pixels
     */
    getLength(): number;
    /**
     * Returns the midpoint of the edge
     */
    get midpoint(): Vector;
    /**
     * Flips the direction of the line segment
     */
    flip(): Line;
    /**
     * Find the perpendicular distance from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * @param point
     */
    distanceToPoint(point: Vector): number;
    /**
     * Find the perpendicular line from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * (a - p) - ((a - p) * n)n
     * a is a point on the line
     * p is the arbitrary point above the line
     * n is a unit vector in direction of the line
     * @param point
     */
    findVectorToPoint(point: Vector): Vector;
    /**
     * Finds a point on the line given only an X or a Y value. Given an X value, the function returns
     * a new point with the calculated Y value and vice-versa.
     *
     * @param x The known X value of the target point
     * @param y The known Y value of the target point
     * @returns A new point with the other calculated axis value
     */
    findPoint(x?: number, y?: number): Vector;
    /**
     * Whether or not the given point lies on this line. This method is precise by default
     * meaning the point must lie exactly on the line. Adjust threshold to
     * loosen the strictness of the check for floating-point calculations.
     */
    hasPoint(x: number, y: number, threshold?: number): boolean;
    /**
     * Whether or not the given point lies on this line. This method is precise by default
     * meaning the point must lie exactly on the line. Adjust threshold to
     * loosen the strictness of the check for floating-point calculations.
     */
    hasPoint(v: Vector, threshold?: number): boolean;
}
/**
 * A 1 dimensional projection on an axis, used to test overlaps
 */
export declare class Projection {
    min: number;
    max: number;
    constructor(min: number, max: number);
    overlaps(projection: Projection): boolean;
    getOverlap(projection: Projection): number;
}
export declare class GlobalCoordinates {
    worldPos: Vector;
    pagePos: Vector;
    screenPos: Vector;
    static fromPagePosition(x: number, y: number, engine: Engine): GlobalCoordinates;
    static fromPagePosition(pos: Vector, engine: Engine): GlobalCoordinates;
    constructor(worldPos: Vector, pagePos: Vector, screenPos: Vector);
}
/**
 * Shorthand for creating new Vectors - returns a new Vector instance with the
 * provided X and Y components.
 *
 * @param x  X component of the Vector
 * @param y  Y component of the Vector
 */
export declare function vec(x: number, y: number): Vector;
