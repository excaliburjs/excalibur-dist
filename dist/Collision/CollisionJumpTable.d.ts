import { Circle } from './Circle';
import { CollisionContact } from './CollisionContact';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';
export declare let CollisionJumpTable: {
    CollideCircleCircle(circleA: Circle, circleB: Circle): CollisionContact;
    CollideCirclePolygon(circle: Circle, polygon: ConvexPolygon): CollisionContact;
    CollideCircleEdge(circle: Circle, edge: Edge): CollisionContact;
    CollideEdgeEdge(): CollisionContact;
    CollidePolygonEdge(polygon: ConvexPolygon, edge: Edge): CollisionContact;
    CollidePolygonPolygon(polyA: ConvexPolygon, polyB: ConvexPolygon): CollisionContact;
};
