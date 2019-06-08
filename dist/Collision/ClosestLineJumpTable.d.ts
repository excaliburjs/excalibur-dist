import { Line, Vector } from '../Algebra';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';
import { Circle } from './Circle';
/**
 * Finds the closes line between 2 line segments, were the magnitude of u, v are the lengths of each segment
 * L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
 * L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
 * @param p0 Point where L1 begins
 * @param u Direction and length of L1
 * @param q0 Point were L2 begins
 * @param v Direction and lenght of L2
 */
export declare function ClosestLine(p0: Vector, u: Vector, q0: Vector, v: Vector): Line;
export declare let ClosestLineJumpTable: {
    PolygonPolygonClosestLine(polygonA: ConvexPolygon, polygonB: ConvexPolygon): Line;
    PolygonEdgeClosestLine(polygon: ConvexPolygon, edge: Edge): Line;
    PolygonCircleClosestLine(polygon: ConvexPolygon, circle: Circle): Line;
    CircleCircleClosestLine(circleA: Circle, circleB: Circle): Line;
    CircleEdgeClosestLine(circle: Circle, edge: Edge): Line;
    EdgeEdgeClosestLine(edgeA: Edge, edgeB: Edge): Line;
};
