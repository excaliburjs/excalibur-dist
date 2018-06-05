import { ICollisionArea } from './ICollisionArea';
import { Vector } from '../Algebra';
import { CollisionResolutionStrategy } from '../Physics';
/**
 * Collision contacts are used internally by Excalibur to resolve collision between actors. This
 * Pair prevents collisions from being evaluated more than one time
 */
export declare class CollisionContact {
    /**
     * The id of this collision contact
     */
    id: string;
    /**
     * The first rigid body in the collision
     */
    bodyA: ICollisionArea;
    /**
     * The second rigid body in the collision
     */
    bodyB: ICollisionArea;
    /**
     * The minimum translation vector to resolve penetration, pointing away from bodyA
     */
    mtv: Vector;
    /**
     * The point of collision shared between bodyA and bodyB
     */
    point: Vector;
    /**
     * The collision normal, pointing away from bodyA
     */
    normal: Vector;
    constructor(bodyA: ICollisionArea, bodyB: ICollisionArea, mtv: Vector, point: Vector, normal: Vector);
    resolve(strategy: CollisionResolutionStrategy): void;
    private _applyBoxImpulse(bodyA, bodyB, mtv);
    private _resolveBoxCollision();
    private _resolveRigidBodyCollision();
}
