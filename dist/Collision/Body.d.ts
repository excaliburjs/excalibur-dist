import { Vector } from '../Algebra';
import { Actor } from '../Actor';
import { Collider } from './Collider';
import { Clonable } from '../Interfaces/Clonable';
export interface BodyOptions {
    /**
     * Optionally the actory associated with this body
     */
    actor?: Actor;
    /**
     * An optional collider to use in this body, if none is specified a default Box collider will be created.
     */
    collider?: Collider;
}
/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity
 */
export declare class Body implements Clonable<Body> {
    private _collider;
    actor: Actor;
    /**
     * Constructs a new physics body associated with an actor
     */
    constructor({ actor, collider }: BodyOptions);
    readonly id: number;
    /**
     * Returns a clone of this body, not associated with any actor
     */
    clone(): Body;
    readonly active: boolean;
    readonly center: Vector;
    collider: Collider;
    /**
     * The (x, y) position of the actor this will be in the middle of the actor if the
     * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
     * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
     */
    pos: Vector;
    /**
     * The position of the actor last frame (x, y) in pixels
     */
    oldPos: Vector;
    /**
     * The current velocity vector (vx, vy) of the actor in pixels/second
     */
    vel: Vector;
    /**
     * The velocity of the actor last frame (vx, vy) in pixels/second
     */
    oldVel: Vector;
    /**
     * The curret acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
     * be useful to simulate a gravitational effect.
     */
    acc: Vector;
    /**
     * Gets/sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
     */
    oldAcc: Vector;
    /**
     * The current torque applied to the actor
     */
    torque: number;
    /**
     * The current "motion" of the actor, used to calculated sleep in the physics simulation
     */
    motion: number;
    /**
     * Gets/sets the rotation of the body from the last frame.
     */
    oldRotation: number;
    /**
     * The rotation of the actor in radians
     */
    rotation: number;
    /**
     * The scale vector of the actor
     * @obsolete ex.Body.scale will be removed in v0.24.0
     */
    scale: Vector;
    /**
     * The scale of the actor last frame
     * @obsolete ex.Body.scale will be removed in v0.24.0
     */
    oldScale: Vector;
    /**
     * The x scalar velocity of the actor in scale/second
     * @obsolete ex.Body.scale will be removed in v0.24.0
     */
    sx: number;
    /**
     * The y scalar velocity of the actor in scale/second
     * @obsolete ex.Body.scale will be removed in v0.24.0
     */
    sy: number;
    /**
     * The rotational velocity of the actor in radians/second
     */
    rx: number;
    private _geometryDirty;
    private _totalMtv;
    /**
     * Add minimum translation vectors accumulated during the current frame to resolve collisions.
     */
    addMtv(mtv: Vector): void;
    /**
     * Applies the accumulated translation vectors to the actors position
     */
    applyMtv(): void;
    /**
     * Flags the shape dirty and must be recalculated in world space
     */
    markCollisionShapeDirty(): void;
    readonly isColliderShapeDirty: boolean;
    /**
     * Sets the old versions of pos, vel, acc, and scale.
     */
    captureOldTransform(): void;
    /**
     * Perform euler integration at the specified time step
     */
    integrate(delta: number): void;
    /**
     * Sets up a box geometry based on the current bounds of the associated actor of this physics body.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useBoxCollider(width: number, height: number, anchor?: Vector, center?: Vector): Collider;
    /**
     * @obsolete Body.useBoxCollision will be removed in v0.24.0 use [[Body.useBoxCollider]]
     */
    useBoxCollision(center?: Vector): void;
    /**
     * Sets up a [[ConvexPolygon|convex polygon]] collision geometry based on a list of of points relative
     *  to the anchor of the associated actor
     * of this physics body.
     *
     * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    usePolygonCollider(points: Vector[], center?: Vector): Collider;
    /**
     * @obsolete Body.usePolygonCollision will be removed in v0.24.0 use [[Body.usePolygonCollider]]
     */
    usePolygonCollision(points: Vector[], center?: Vector): void;
    /**
     * Sets up a [[Circle|circle collision geometry]] with a specified radius in pixels.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useCircleCollider(radius: number, center?: Vector): Collider;
    /**
     * @obsolete Body.useCircleCollision will be removed in v0.24.0, use [[Body.useCircleCollider]]
     */
    useCircleCollision(radius?: number, center?: Vector): void;
    /**
     * Sets up an [[Edge|edge collision geometry]] with a start point and an end point relative to the anchor of the associated actor
     * of this physics body.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useEdgeCollider(begin: Vector, end: Vector): Collider;
    /**
     * @obsolete Body.useEdgeCollision will be removed in v0.24.0, use [[Body.useEdgeCollider]]
     */
    useEdgeCollision(begin: Vector, end: Vector): void;
    private _wireColliderEventsToActor;
}
