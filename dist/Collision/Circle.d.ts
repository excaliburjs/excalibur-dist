import { BoundingBox } from './BoundingBox';
import { CollisionContact } from './CollisionContact';
import { CollisionShape } from './CollisionShape';
import { ConvexPolygon } from './ConvexPolygon';
import { Vector, Ray, Projection, Line } from '../Algebra';
import { Color } from '../Drawing/Color';
import { Collider } from './Collider';
import { Body } from './Body';
export interface CircleOptions {
    /**
     * Optional pixel offset to shift the circle relative to the collider, by default (0, 0).
     */
    offset?: Vector;
    /**
     * Required radius of the circle
     */
    radius: number;
    /**
     * Optional collider to associate with this shape
     */
    collider?: Collider;
    body?: Body;
}
/**
 * This is a circle collision shape for the excalibur rigid body physics simulation
 *
 * Example:
 * [[include:CircleShape.md]]
 */
export declare class Circle implements CollisionShape {
    /**
     * Position of the circle relative to the collider, by default (0, 0) meaning the shape is positioned on top of the collider.
     */
    offset: Vector;
    readonly worldPos: Vector;
    /**
     * This is the radius of the circle
     */
    radius: number;
    /**
     * Reference to the actor associated with this collision shape
     * @obsolete Will be removed in v0.24.0 please use [[collider]] to retrieve body information
     */
    body: Body;
    /**
     * The collider associated for this shape, if any.
     */
    collider?: Collider;
    constructor(options: CircleOptions);
    /**
     * Returns a clone of this shape, not associated with any collider
     */
    clone(): Circle;
    /**
     * Get the center of the collision shape in world coordinates
     */
    readonly center: Vector;
    /**
     * Tests if a point is contained in this collision shape
     */
    contains(point: Vector): boolean;
    /**
     * Casts a ray at the Circl shape and returns the nearest point of collision
     * @param ray
     */
    rayCast(ray: Ray, max?: number): Vector;
    getClosestLineBetween(shape: CollisionShape): Line;
    /**
     * @inheritdoc
     */
    collide(shape: CollisionShape): CollisionContact;
    /**
     * Find the point on the shape furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector;
    /**
     * Get the axis aligned bounding box for the circle shape in world coordinates
     */
    readonly bounds: BoundingBox;
    /**
     * Get the axis aligned bounding box for the circle shape in local coordinates
     */
    readonly localBounds: BoundingBox;
    /**
     * Get axis not implemented on circles, since there are infinite axis in a circle
     */
    readonly axes: Vector[];
    /**
     * Returns the moment of inertia of a circle given it's mass
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    readonly inertia: number;
    /**
     * Tests the separating axis theorem for circles against polygons
     */
    testSeparatingAxisTheorem(polygon: ConvexPolygon): Vector;
    recalc(): void;
    /**
     * Project the circle along a specified axis
     */
    project(axis: Vector): Projection;
    draw(ctx: CanvasRenderingContext2D, color?: Color, pos?: Vector): void;
    debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
}
/**
 * @obsolete Use [[CircleOptions]], CircleAreaOptions will be removed in v0.24.0
 */
export interface CircleAreaOptions extends CircleOptions {
}
/**
 * @obsolete Use [[Circle]], CircleArea will be removed in v0.24.0
 */
export declare class CircleArea extends Circle {
}
