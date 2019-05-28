import { ConvexPolygon } from './ConvexPolygon';
import { Actor } from '../Actor';
import { Vector, Ray } from '../Algebra';
import { Color } from '../Drawing/Color';
import { Side } from './Side';
/**
 * Axis Aligned collision primitive for Excalibur.
 */
export declare class BoundingBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
    /**
     * @param left    x coordinate of the left edge
     * @param top     y coordinate of the top edge
     * @param right   x coordinate of the right edge
     * @param bottom  y coordinate of the bottom edge
     */
    constructor(left?: number, top?: number, right?: number, bottom?: number);
    /**
     * Given bounding box A & B, returns the side relative to A when intersection is performed.
     * @param intersection Intersection vector between 2 bounding boxes
     */
    static getSideFromIntersection(intersection: Vector): Side;
    static fromPoints(points: Vector[]): BoundingBox;
    static fromDimension(width: number, height: number, anchor?: Vector, pos?: Vector): BoundingBox;
    /**
     * Returns the calculated width of the bounding box
     */
    getWidth(): number;
    /**
     * Returns the calculated width of the bounding box
     */
    readonly width: number;
    /**
     * Returns the calculated height of the bounding box
     */
    getHeight(): number;
    /**
     * Returns the calculated height of the bounding box
     */
    readonly height: number;
    /**
     * Returns the center of the bounding box
     */
    getCenter(): Vector;
    /**
     * Returns the center of the bounding box
     */
    readonly center: Vector;
    translate(pos: Vector): BoundingBox;
    /**
     * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default. The resulting bounding
     * box is also axis-align. This is useful when a new axis-aligned bounding box is needed for rotated geometry.
     */
    rotate(angle: number, point?: Vector): BoundingBox;
    scale(scale: Vector, point?: Vector): BoundingBox;
    /**
     * Returns the perimeter of the bounding box
     */
    getPerimeter(): number;
    getPoints(): Vector[];
    /**
     * Creates a Polygon collision area from the points of the bounding box
     */
    toPolygon(actor?: Actor): ConvexPolygon;
    /**
     * Determines whether a ray intersects with a bounding box
     */
    rayCast(ray: Ray, farClipDistance?: number): boolean;
    rayCastTime(ray: Ray, farClipDistance?: number): number;
    /**
     * Tests whether a point is contained within the bounding box
     * @param p  The point to test
     */
    contains(p: Vector): boolean;
    /**
     * Tests whether another bounding box is totally contained in this one
     * @param bb  The bounding box to test
     */
    contains(bb: BoundingBox): boolean;
    /**
     * Combines this bounding box and another together returning a new bounding box
     * @param other  The bounding box to combine
     */
    combine(other: BoundingBox): BoundingBox;
    readonly dimensions: Vector;
    /**
     * Test wether this bounding box intersects with another returning
     * the intersection vector that can be used to resolve the collision. If there
     * is no intersection null is returned.
     *
     * @param other  Other [[BoundingBox]] to test intersection with
     * @returns A Vector in the direction of the current BoundingBox, this <- other
     */
    intersect(other: BoundingBox): Vector;
    /**
     * Test whether the bounding box has intersected with another bounding box, returns the side of the current bb that intersected.
     * @param bb The other actor to test
     */
    intersectWithSide(bb: BoundingBox): Side;
    /**
     * Test wether this bounding box collides with another returning,
     * the intersection vector that can be used to resolve the collision. If there
     * is no collision null is returned.
     *
     * @returns A Vector in the direction of the current BoundingBox
     * @param boundingBox  Other collidable to test
     * @obsolete BoundingBox.collides will be removed in v0.24.0, use BoundingBox.intersect
     */
    collides(boundingBox: BoundingBox): Vector;
    debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
}
