import { Color } from '../Drawing/Color';
import { BoundingBox } from './BoundingBox';
import { CollisionContact } from './CollisionContact';
import { CollisionShape } from './CollisionShape';
import { Body } from './Body';
import { Vector, Line, Ray, Projection } from '../Algebra';
import { Collider } from './Collider';
export interface ConvexPolygonOptions {
    /**
     * Pixel offset relative to a collider's position
     */
    offset?: Vector;
    /**
     * Points in the polygon in order around the perimeter in local coordinates
     */
    points: Vector[];
    /**
     * Whether points are specified in clockwise or counter clockwise order, default counter-clockwise
     */
    clockwiseWinding?: boolean;
    /**
     * Collider to associate optionally with this shape
     */
    collider?: Collider;
    /**
     * @obsolete Will be removed in v0.24.0 please use [[collider]] to set and retrieve body information
     */
    body?: Body;
}
/**
 * Polygon collision shape for detecting collisions
 *
 * Example:
 * [[include:BoxAndPolygonShape.md]]
 */
export declare class ConvexPolygon implements CollisionShape {
    offset: Vector;
    points: Vector[];
    /**
     * @obsolete Will be removed in v0.24.0 please use [[collider]] to set and retrieve body information
     */
    body: Body;
    /**
     * Collider associated with this shape
     */
    collider?: Collider;
    private _transformedPoints;
    private _axes;
    private _sides;
    constructor(options: ConvexPolygonOptions);
    /**
     * Returns a clone of this ConvexPolygon, not associated with any collider
     */
    clone(): ConvexPolygon;
    readonly worldPos: Vector;
    /**
     * Get the center of the collision shape in world coordinates
     */
    readonly center: Vector;
    /**
     * Calculates the underlying transformation from the body relative space to world space
     */
    private _calculateTransformation;
    /**
     * Gets the points that make up the polygon in world space, from actor relative space (if specified)
     */
    getTransformedPoints(): Vector[];
    /**
     * Gets the sides of the polygon in world space
     */
    getSides(): Line[];
    recalc(): void;
    /**
     * Tests if a point is contained in this collision shape in world space
     */
    contains(point: Vector): boolean;
    getClosestLineBetween(shape: CollisionShape): Line;
    /**
     * Returns a collision contact if the 2 collision shapes collide, otherwise collide will
     * return null.
     * @param shape
     */
    collide(shape: CollisionShape): CollisionContact;
    /**
     * Find the point on the shape furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector;
    /**
     * Finds the closes face to the point using perpendicular distance
     * @param point point to test against polygon
     */
    getClosestFace(point: Vector): {
        distance: Vector;
        face: Line;
    };
    /**
     * Get the axis aligned bounding box for the polygon shape in world coordinates
     */
    readonly bounds: BoundingBox;
    /**
     * Get the axis aligned bounding box for the polygon shape in local coordinates
     */
    readonly localBounds: BoundingBox;
    /**
     * Get the moment of inertia for an arbitrary polygon
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    readonly inertia: number;
    /**
     * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
     */
    rayCast(ray: Ray, max?: number): Vector;
    /**
     * Get the axis associated with the convex polygon
     */
    readonly axes: Vector[];
    /**
     * Perform Separating Axis test against another polygon, returns null if no overlap in polys
     * Reference http://www.dyn4j.org/2010/01/sat/
     */
    testSeparatingAxisTheorem(other: ConvexPolygon): Vector;
    /**
     * Project the edges of the polygon along a specified axis
     */
    project(axis: Vector): Projection;
    draw(ctx: CanvasRenderingContext2D, color?: Color, pos?: Vector): void;
    debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
}
/**
 * @obsolete Use [[ConvexPolygonOptions]], PolygonAreaOptions will be removed in v0.24.0
 */
export interface PolygonAreaOptions extends ConvexPolygonOptions {
}
export declare class PolygonArea extends ConvexPolygon {
}
