import { Vector } from '../Algebra';
import { CollisionResolutionStrategy } from '../Physics';
import { Collider } from './Collider';
/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
export declare class CollisionContact {
    /**
     * The id of this collision contact
     */
    id: string;
    /**
     * The first collider in the collision
     */
    colliderA: Collider;
    /**
     * The second collider in the collision
     */
    colliderB: Collider;
    /**
     * The minimum translation vector to resolve penetration, pointing away from colliderA
     */
    mtv: Vector;
    /**
     * The point of collision shared between colliderA and colliderB
     */
    point: Vector;
    /**
     * The collision normal, pointing away from colliderA
     */
    normal: Vector;
    constructor(colliderA: Collider, colliderB: Collider, mtv: Vector, point: Vector, normal: Vector);
    resolve(strategy: CollisionResolutionStrategy): void;
    private _applyBoxImpulse;
    private _resolveBoxCollision;
    private _resolveRigidBodyCollision;
}
