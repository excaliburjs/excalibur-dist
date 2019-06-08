import { Eventable } from '../Interfaces/Index';
import { GameEvent } from '../Events';
import { Actor } from '../Actor';
import { Body } from './Body';
import { CollisionShape } from './CollisionShape';
import { Vector, Line } from '../Algebra';
import { BoundingBox } from './BoundingBox';
import { CollisionType } from './CollisionType';
import { CollisionGroup } from './CollisionGroup';
import { CollisionContact } from './CollisionContact';
import { Clonable } from '../Interfaces/Clonable';
/**
 * Type guard function to determine whether something is a Collider
 */
export declare function isCollider(x: Actor | Collider): x is Collider;
export interface ColliderOptions {
    /**
     * Optional [[shape|Shape]] to use with this collider, the shape defines the collidable region along with the [[bounding box|BoundingBox]]
     */
    shape?: CollisionShape;
    /**
     * Optional body to associate with this collider
     */
    body?: Body;
    /**
     * Optional pixel offset from the position of the body
     */
    offset?: Vector;
    /**
     * Optional collision group on this collider
     */
    group?: CollisionGroup;
    /**
     * Optional [[collision type|CollisionType]], if not specified the default is [[CollisionType.PreventCollision]]
     */
    type?: CollisionType;
    /**
     * Optional local bounds if other bounds are required instead of the bounding box from the shape. This overrides shape bounds.
     */
    localBounds?: BoundingBox;
    /**
     * Optional flag to indicate moment of inertia from the shape should be used, by default it is true.
     */
    useShapeInertia?: boolean;
}
/**
 * Collider describes material properties like shape,
 * bounds, friction of the physics object. Only **one** collider can be associated with a body at a time
 */
export declare class Collider implements Eventable, Clonable<Collider> {
    private _shape;
    useShapeInertia: boolean;
    private _events;
    constructor({ body, type, group, shape, offset, useShapeInertia }: ColliderOptions);
    /**
     * Returns a clone of the current collider, not associated with any body
     */
    clone(): Collider;
    /**
     * Get the unique id of the collider
     */
    readonly id: number;
    /**
     * Gets or sets the current collision type of this collider. By
     * default it is ([[CollisionType.PreventCollision]]).
     */
    type: CollisionType;
    /**
     * Gets or sets the current [[CollisionGroup|collision group]] for the collider, colliders with like collision groups do not collide.
     * By default, the collider will collide with [[CollisionGroup|all groups]].
     */
    group: CollisionGroup;
    /**
    * Set the shape of the collider as a [[CollisionShape]], if useShapeInertia is set the collider will use inertia from the shape.
    */
    shape: CollisionShape;
    /**
     * Return a reference to the body associated with this collider
     */
    body: Body;
    /**
     * The center of the collider in world space
     */
    readonly center: Vector;
    /**
     * Is this collider active, if false it wont collide
     */
    readonly active: boolean;
    /**
     * Collide 2 colliders and product a collision contact if there is a collision, null if none
     *
     * Collision vector is in the direction of the other collider. Away from this collider, this -> other.
     * @param other
     */
    collide(other: Collider): CollisionContact | null;
    /**
     * Find the closest line between 2 colliders
     *
     * Line is in the direction of the other collider. Away from this collider, this -> other.
     * @param other Other collider
     */
    getClosestLineBetween(other: Collider): Line;
    /**
     * Gets the current pixel offset of the collider
     */
    /**
    * Sets the pixel offset of the collider
    */
    offset: Vector;
    /**
     * The current mass of the actor, mass can be thought of as the resistance to acceleration.
     */
    mass: number;
    /**
     * The current moment of inertia, moment of inertia can be thought of as the resistance to rotation.
     */
    inertia: number;
    /**
     * The coefficient of friction on this actor
     */
    friction: number;
    /**
     * The also known as coefficient of restitution of this actor, represents the amount of energy preserved after collision or the
     * bounciness. If 1, it is 100% bouncy, 0 it completely absorbs.
     */
    bounciness: number;
    /**
     * Returns a boolean indicating whether this body collided with
     * or was in stationary contact with
     * the body of the other [[Collider]]
     */
    touching(other: Collider): boolean;
    /**
     * Returns the collider's [[BoundingBox]] calculated for this instant in world space.
     * If there is no shape, a point bounding box is returned
     */
    readonly bounds: BoundingBox;
    /**
     * Returns the collider's [[BoundingBox]] relative to the body's position.
     * If there is no shape, a point boudning box is returned
     */
    readonly localBounds: BoundingBox;
    /**
     * Updates the collision shapes geometry and internal caches if needed
     */
    update(): void;
    emit(eventName: string, event: GameEvent<Collider>): void;
    on(eventName: string, handler: (event: GameEvent<Collider>) => void): void;
    off(eventName: string, handler?: (event: GameEvent<Collider>) => void): void;
    once(eventName: string, handler: (event: GameEvent<Collider>) => void): void;
    clear(): void;
    debugDraw(ctx: CanvasRenderingContext2D): void;
}
