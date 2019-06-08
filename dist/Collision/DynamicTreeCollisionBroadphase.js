import { Physics } from './../Physics';
import { DynamicTree } from './DynamicTree';
import { Pair } from './Pair';
import { Vector, Ray } from '../Algebra';
import { Logger } from '../Util/Log';
import { CollisionStartEvent, CollisionEndEvent } from '../Events';
import { CollisionType } from './CollisionType';
var DynamicTreeCollisionBroadphase = /** @class */ (function () {
    function DynamicTreeCollisionBroadphase() {
        this._dynamicCollisionTree = new DynamicTree();
        this._collisionHash = {};
        this._collisionPairCache = [];
        this._lastFramePairs = [];
        this._lastFramePairsHash = {};
    }
    /**
     * Tracks a physics body for collisions
     */
    DynamicTreeCollisionBroadphase.prototype.track = function (target) {
        if (!target) {
            Logger.getInstance().warn('Cannot track null physics body');
            return;
        }
        this._dynamicCollisionTree.trackBody(target);
    };
    /**
     * Untracks a physics body
     */
    DynamicTreeCollisionBroadphase.prototype.untrack = function (target) {
        if (!target) {
            Logger.getInstance().warn('Cannot untrack a null physics body');
            return;
        }
        this._dynamicCollisionTree.untrackBody(target);
    };
    DynamicTreeCollisionBroadphase.prototype._shouldGenerateCollisionPair = function (colliderA, colliderB) {
        // if the collision pair has been calculated already short circuit
        var hash = Pair.calculatePairHash(colliderA, colliderB);
        if (this._collisionHash[hash]) {
            return false; // pair exists easy exit return false
        }
        return Pair.canCollide(colliderA, colliderB);
    };
    /**
     * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
     */
    DynamicTreeCollisionBroadphase.prototype.broadphase = function (targets, delta, stats) {
        var _this = this;
        var seconds = delta / 1000;
        // Retrieve the list of potential colliders, exclude killed, prevented, and self
        var potentialColliders = targets.map(function (t) { return t.collider; }).filter(function (other) {
            return other.active && other.type !== CollisionType.PreventCollision;
        });
        // clear old list of collision pairs
        this._collisionPairCache = [];
        this._collisionHash = {};
        // check for normal collision pairs
        var collider;
        for (var j = 0, l = potentialColliders.length; j < l; j++) {
            collider = potentialColliders[j];
            // Query the collision tree for potential colliders
            this._dynamicCollisionTree.query(collider.body, function (other) {
                if (_this._shouldGenerateCollisionPair(collider, other.collider)) {
                    var pair = new Pair(collider, other.collider);
                    _this._collisionHash[pair.id] = true;
                    _this._collisionPairCache.push(pair);
                }
                // Always return false, to query whole tree. Returning true in the query method stops searching
                return false;
            });
        }
        if (stats) {
            stats.physics.pairs = this._collisionPairCache.length;
        }
        // Check dynamic tree for fast moving objects
        // Fast moving objects are those moving at least there smallest bound per frame
        if (Physics.checkForFastBodies) {
            var _loop_1 = function (collider_1) {
                // Skip non-active objects. Does not make sense on other collison types
                if (collider_1.type !== CollisionType.Active) {
                    return "continue";
                }
                // Maximum travel distance next frame
                var updateDistance = collider_1.body.vel.magnitude() * seconds + // velocity term
                    collider_1.body.acc.magnitude() * 0.5 * seconds * seconds; // acc term
                // Find the minimum dimension
                var minDimension = Math.min(collider_1.bounds.height, collider_1.bounds.width);
                if (Physics.disableMinimumSpeedForFastBody || updateDistance > minDimension / 2) {
                    if (stats) {
                        stats.physics.fastBodies++;
                    }
                    // start with the oldPos because the integration for actors has already happened
                    // objects resting on a surface may be slightly penatrating in the current position
                    var updateVec = collider_1.body.pos.sub(collider_1.body.oldPos);
                    var centerPoint = collider_1.shape.center;
                    var furthestPoint = collider_1.shape.getFurthestPoint(collider_1.body.vel);
                    var origin_1 = furthestPoint.sub(updateVec);
                    var ray_1 = new Ray(origin_1, collider_1.body.vel);
                    // back the ray up by -2x surfaceEpsilon to account for fast moving objects starting on the surface
                    ray_1.pos = ray_1.pos.add(ray_1.dir.scale(-2 * Physics.surfaceEpsilon));
                    var minBody_1;
                    var minTranslate_1 = new Vector(Infinity, Infinity);
                    this_1._dynamicCollisionTree.rayCastQuery(ray_1, updateDistance + Physics.surfaceEpsilon * 2, function (other) {
                        if (collider_1.body !== other && other.collider.shape && Pair.canCollide(collider_1, other.collider)) {
                            var hitPoint = other.collider.shape.rayCast(ray_1, updateDistance + Physics.surfaceEpsilon * 10);
                            if (hitPoint) {
                                var translate = hitPoint.sub(origin_1);
                                if (translate.magnitude() < minTranslate_1.magnitude()) {
                                    minTranslate_1 = translate;
                                    minBody_1 = other;
                                }
                            }
                        }
                        return false;
                    });
                    if (minBody_1 && Vector.isValid(minTranslate_1)) {
                        var pair = new Pair(collider_1, minBody_1.collider);
                        if (!this_1._collisionHash[pair.id]) {
                            this_1._collisionHash[pair.id] = true;
                            this_1._collisionPairCache.push(pair);
                        }
                        // move the fast moving object to the other body
                        // need to push into the surface by ex.Physics.surfaceEpsilon
                        var shift = centerPoint.sub(furthestPoint);
                        collider_1.body.pos = origin_1
                            .add(shift)
                            .add(minTranslate_1)
                            .add(ray_1.dir.scale(2 * Physics.surfaceEpsilon));
                        collider_1.shape.recalc();
                        if (stats) {
                            stats.physics.fastBodyCollisions++;
                        }
                    }
                }
            };
            var this_1 = this;
            for (var _i = 0, potentialColliders_1 = potentialColliders; _i < potentialColliders_1.length; _i++) {
                var collider_1 = potentialColliders_1[_i];
                _loop_1(collider_1);
            }
        }
        // return cache
        return this._collisionPairCache;
    };
    /**
     * Applies narrow phase on collision pairs to find actual area intersections
     * Adds actual colliding pairs to stats' Frame data
     */
    DynamicTreeCollisionBroadphase.prototype.narrowphase = function (pairs, stats) {
        for (var i = 0; i < pairs.length; i++) {
            pairs[i].collide();
            if (stats && pairs[i].collision) {
                stats.physics.collisions++;
                stats.physics.collidersHash[pairs[i].id] = pairs[i];
            }
        }
        return pairs.filter(function (p) { return p.collision; });
    };
    /**
     * Perform collision resolution given a strategy (rigid body or box) and move objects out of intersect.
     */
    DynamicTreeCollisionBroadphase.prototype.resolve = function (pairs, delta, strategy) {
        for (var _i = 0, pairs_1 = pairs; _i < pairs_1.length; _i++) {
            var pair = pairs_1[_i];
            pair.resolve(strategy);
            if (pair.collision) {
                pair.colliderA.body.applyMtv();
                pair.colliderB.body.applyMtv();
                // todo still don't like this, this is a small integration step to resolve narrowphase collisions
                pair.colliderA.body.integrate(delta * Physics.collisionShift);
                pair.colliderB.body.integrate(delta * Physics.collisionShift);
            }
        }
        return pairs.filter(function (p) { return p.canCollide; });
    };
    DynamicTreeCollisionBroadphase.prototype.runCollisionStartEnd = function (pairs) {
        var currentFrameHash = {};
        for (var _i = 0, pairs_2 = pairs; _i < pairs_2.length; _i++) {
            var p = pairs_2[_i];
            // load currentFrameHash
            currentFrameHash[p.id] = p;
            // find all new collisions
            if (!this._lastFramePairsHash[p.id]) {
                var actor1 = p.colliderA;
                var actor2 = p.colliderB;
                actor1.emit('collisionstart', new CollisionStartEvent(actor1, actor2, p));
                actor2.emit('collisionstart', new CollisionStartEvent(actor2, actor1, p));
            }
        }
        // find all old collisions
        for (var _a = 0, _b = this._lastFramePairs; _a < _b.length; _a++) {
            var p = _b[_a];
            if (!currentFrameHash[p.id]) {
                var actor1 = p.colliderA;
                var actor2 = p.colliderB;
                actor1.emit('collisionend', new CollisionEndEvent(actor1, actor2));
                actor2.emit('collisionend', new CollisionEndEvent(actor2, actor1));
            }
        }
        // reset the last frame cache
        this._lastFramePairs = pairs;
        this._lastFramePairsHash = currentFrameHash;
    };
    /**
     * Update the dynamic tree positions
     */
    DynamicTreeCollisionBroadphase.prototype.update = function (targets) {
        var updated = 0;
        var len = targets.length;
        for (var i = 0; i < len; i++) {
            if (this._dynamicCollisionTree.updateBody(targets[i])) {
                updated++;
            }
        }
        return updated;
    };
    /* istanbul ignore next */
    DynamicTreeCollisionBroadphase.prototype.debugDraw = function (ctx) {
        if (Physics.broadphaseDebug) {
            this._dynamicCollisionTree.debugDraw(ctx);
        }
        if (Physics.showContacts || Physics.showCollisionNormals) {
            for (var _i = 0, _a = this._collisionPairCache; _i < _a.length; _i++) {
                var pair = _a[_i];
                pair.debugDraw(ctx);
            }
        }
    };
    return DynamicTreeCollisionBroadphase;
}());
export { DynamicTreeCollisionBroadphase };
