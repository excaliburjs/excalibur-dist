import { Body } from './Body';
import { BoundingBox } from './BoundingBox';
import { CollisionContact } from './CollisionContact';
import { CollisionShape } from './CollisionShape';
import { Vector, Ray, Projection, Line } from '../Algebra';
import { Color } from '../Drawing/Color';
import { Collider } from './Collider';
export interface EdgeOptions {
    /**
     * The beginning of the edge defined in local coordinates to the collider
     */
    begin: Vector;
    /**
     * The ending of the edge defined in local coordinates to the collider
     */
    end: Vector;
    /**
     * Optionally the collider associated with this edge
     */
    collider?: Collider;
    body?: Body;
}
/**
 * Edge is a single line collision shape to create collisions with a single line.
 *
 * Example:
 * [[include:EdgeShape.md]]
 */
export declare class Edge implements CollisionShape {
    body: Body;
    collider?: Collider;
    offset: Vector;
    begin: Vector;
    end: Vector;
    constructor(options: EdgeOptions);
    /**
     * Returns a clone of this Edge, not associated with any collider
     */
    clone(): Edge;
    readonly worldPos: Vector;
    /**
     * Get the center of the collision area in world coordinates
     */
    readonly center: Vector;
    private _getBodyPos;
    private _getTransformedBegin;
    private _getTransformedEnd;
    /**
     * Returns the slope of the line in the form of a vector
     */
    getSlope(): Vector;
    /**
     * Returns the length of the line segment in pixels
     */
    getLength(): number;
    /**
     * Tests if a point is contained in this collision area
     */
    contains(): boolean;
    /**
     * @inheritdoc
     */
    rayCast(ray: Ray, max?: number): Vector;
    /**
     * Returns the closes line between this and another shape, from this -> shape
     * @param shape
     */
    getClosestLineBetween(shape: CollisionShape): Line;
    /**
     * @inheritdoc
     */
    collide(shape: CollisionShape): CollisionContact;
    /**
     * Find the point on the shape furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector;
    private _boundsFromBeginEnd;
    /**
     * Get the axis aligned bounding box for the edge shape in world space
     */
    readonly bounds: BoundingBox;
    /**
     * Get the axis aligned bounding box for the edge shape in local space
     */
    readonly localBounds: BoundingBox;
    /**
     * Returns this edge represented as a line in world coordinates
     */
    asLine(): Line;
    asLocalLine(): Line;
    /**
     * Get the axis associated with the edge
     */
    readonly axes: Vector[];
    /**
     * Get the moment of inertia for an edge
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    readonly inertia: number;
    /**
     * @inheritdoc
     */
    recalc(): void;
    /**
     * Project the edge along a specified axis
     */
    project(axis: Vector): Projection;
    draw(ctx: CanvasRenderingContext2D, color?: Color, pos?: Vector): void;
    debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
}
/**
 * @obsolete Use [[EdgeOptions]], EdgeAreaOptions will be removed in v0.24.0
 */
export interface EdgeAreaOptions extends EdgeOptions {
}
/**
 * @obsolete Use [[Edge]], EdgeArea will be removed in v0.24.0
 */
export declare class EdgeArea extends Edge {
}
