import { Physics } from './../Physics';
import { Color } from './../Drawing/Color';
import * as DrawUtil from '../Util/DrawUtil';
import { CollisionType } from './CollisionType';
/**
 * Models a potential collision between 2 bodies
 */
var Pair = /** @class */ (function () {
    function Pair(colliderA, colliderB) {
        this.colliderA = colliderA;
        this.colliderB = colliderB;
        this.id = null;
        this.collision = null;
        this.id = Pair.calculatePairHash(colliderA, colliderB);
    }
    Pair.canCollide = function (colliderA, colliderB) {
        // If both are in the same collision group short circuit
        if (!colliderA.group.canCollide(colliderB.group)) {
            return false;
        }
        // if both are fixed short circuit
        if (colliderA.type === CollisionType.Fixed && colliderB.type === CollisionType.Fixed) {
            return false;
        }
        // if the either is prevent collision short circuit
        if (colliderB.type === CollisionType.PreventCollision || colliderA.type === CollisionType.PreventCollision) {
            return false;
        }
        // if either is dead short circuit
        if (!colliderA.active || !colliderB.active) {
            return false;
        }
        return true;
    };
    Object.defineProperty(Pair.prototype, "canCollide", {
        /**
         * Returns whether or not it is possible for the pairs to collide
         */
        get: function () {
            var actorA = this.colliderA;
            var actorB = this.colliderB;
            return Pair.canCollide(actorA, actorB);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Runs the collison intersection logic on the members of this pair
     */
    Pair.prototype.collide = function () {
        this.collision = this.colliderA.collide(this.colliderB);
    };
    /**
     * Resovles the collision body position and velocity if a collision occured
     */
    Pair.prototype.resolve = function (strategy) {
        if (this.collision) {
            this.collision.resolve(strategy);
        }
    };
    /**
     * Calculates the unique pair hash id for this collision pair
     */
    Pair.calculatePairHash = function (colliderA, colliderB) {
        if (colliderA.id < colliderB.id) {
            return "#" + colliderA.id + "+" + colliderB.id;
        }
        else {
            return "#" + colliderB.id + "+" + colliderA.id;
        }
    };
    /* istanbul ignore next */
    Pair.prototype.debugDraw = function (ctx) {
        if (this.collision) {
            if (Physics.showContacts) {
                DrawUtil.point(ctx, Color.Red, this.collision.point);
            }
            if (Physics.showCollisionNormals) {
                DrawUtil.vector(ctx, Color.Cyan, this.collision.point, this.collision.normal, 30);
            }
        }
    };
    return Pair;
}());
export { Pair };
