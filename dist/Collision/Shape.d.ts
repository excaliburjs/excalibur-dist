import { ConvexPolygon } from './ConvexPolygon';
import { Circle } from './Circle';
import { Edge } from './Edge';
import { Vector } from '../Algebra';
/**
 * Excalibur shape helper for defining collision shapes quickly
 */
export declare class Shape {
    /**
     * Creates a box collision shape, under the hood defines a [[ConvexPolygon]] collision shape
     * @param width Width of the box
     * @param height Height of the box
     * @param anchor Anchor of the box (default (.5, .5)) which positions the box relative to the center of the collider's position
     * @param center Optional offset relative to the collider in local coordinates
     */
    static Box(width: number, height: number, anchor?: Vector, center?: Vector): ConvexPolygon;
    /**
     * Creates a new [[arbitrary polygon|ConvexPolygon]] collision shape
     * @param points Points specified in counter clockwise
     * @param clockwiseWinding Optionally changed the winding of points, by default false meaning counter-clockwise winding.
     * @param center Optional offset relative to the collider in local coordinates
     */
    static Polygon(points: Vector[], clockwiseWinding?: boolean, center?: Vector): ConvexPolygon;
    /**
     * Creates a new [[circle|Circle]] collision shape
     * @param radius Radius of the circle shape
     * @param center Optional offset relative to the collider in local coordinates
     */
    static Circle(radius: number, center?: Vector): Circle;
    /**
     * Creates a new [[edge|Edge]] collision shape
     * @param begin Beginning of the edge in local coordinates to the collider
     * @param end Ending of the edge in local coordinates to the collider
     */
    static Edge(begin: Vector, end: Vector): Edge;
}
