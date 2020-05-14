import { Vector } from '../Algebra';
import { CollisionType } from './CollisionType';
import { Physics } from '../Physics';
import { PreCollisionEvent, PostCollisionEvent, CollisionStartEvent, CollisionEndEvent } from '../Events';
import { Shape } from './Shape';
/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity
 */
var Body = /** @class */ (function () {
    /**
     * Constructs a new physics body associated with an actor
     */
    function Body(_a) {
        var actor = _a.actor, collider = _a.collider;
        /**
         * The (x, y) position of the actor this will be in the middle of the actor if the
         * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
         * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
         */
        this.pos = new Vector(0, 0);
        /**
         * The position of the actor last frame (x, y) in pixels
         */
        this.oldPos = new Vector(0, 0);
        /**
         * The current velocity vector (vx, vy) of the actor in pixels/second
         */
        this.vel = new Vector(0, 0);
        /**
         * The velocity of the actor last frame (vx, vy) in pixels/second
         */
        this.oldVel = new Vector(0, 0);
        /**
         * The current acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
         * be useful to simulate a gravitational effect.
         */
        this.acc = new Vector(0, 0);
        /**
         * Gets/sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
         */
        this.oldAcc = Vector.Zero;
        /**
         * The current torque applied to the actor
         */
        this.torque = 0;
        /**
         * The current "motion" of the actor, used to calculated sleep in the physics simulation
         */
        this.motion = 10;
        /**
         * Gets/sets the rotation of the body from the last frame.
         */
        this.oldRotation = 0; // radians
        /**
         * The rotation of the actor in radians
         */
        this.rotation = 0; // radians
        /**
         * The scale vector of the actor
         * @obsolete ex.Body.scale will be removed in v0.25.0
         */
        this.scale = Vector.One;
        /**
         * The scale of the actor last frame
         * @obsolete ex.Body.scale will be removed in v0.25.0
         */
        this.oldScale = Vector.One;
        /**
         * The x scalar velocity of the actor in scale/second
         * @obsolete ex.Body.scale will be removed in v0.25.0
         */
        this.sx = 0; //scale/sec
        /**
         * The y scalar velocity of the actor in scale/second
         * @obsolete ex.Body.scale will be removed in v0.25.0
         */
        this.sy = 0; //scale/sec
        /**
         * The rotational velocity of the actor in radians/second
         */
        this.rx = 0; //radians/sec
        this._geometryDirty = false;
        this._totalMtv = Vector.Zero;
        if (!actor && !collider) {
            throw new Error('An actor or collider are required to create a body');
        }
        this.actor = actor;
        if (!collider && actor) {
            this.collider = this.useBoxCollider(actor.width, actor.height, actor.anchor);
        }
        else {
            this.collider = collider;
        }
    }
    Object.defineProperty(Body.prototype, "id", {
        get: function () {
            return this.actor ? this.actor.id : -1;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a clone of this body, not associated with any actor
     */
    Body.prototype.clone = function () {
        return new Body({
            actor: null,
            collider: this.collider.clone()
        });
    };
    Object.defineProperty(Body.prototype, "active", {
        get: function () {
            return this.actor ? !this.actor.isKilled() : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "center", {
        get: function () {
            return this.pos;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "collider", {
        get: function () {
            return this._collider;
        },
        // TODO allow multiple colliders for a single body
        set: function (collider) {
            if (collider) {
                this._collider = collider;
                this._collider.body = this;
                this._wireColliderEventsToActor();
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add minimum translation vectors accumulated during the current frame to resolve collisions.
     */
    Body.prototype.addMtv = function (mtv) {
        this._totalMtv.addEqual(mtv);
    };
    /**
     * Applies the accumulated translation vectors to the actors position
     */
    Body.prototype.applyMtv = function () {
        this.pos.addEqual(this._totalMtv);
        this._totalMtv.setTo(0, 0);
    };
    /**
     * Flags the shape dirty and must be recalculated in world space
     */
    Body.prototype.markCollisionShapeDirty = function () {
        this._geometryDirty = true;
    };
    Object.defineProperty(Body.prototype, "isColliderShapeDirty", {
        get: function () {
            return this._geometryDirty;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the old versions of pos, vel, acc, and scale.
     */
    Body.prototype.captureOldTransform = function () {
        // Capture old values before integration step updates them
        this.oldVel.setTo(this.vel.x, this.vel.y);
        this.oldPos.setTo(this.pos.x, this.pos.y);
        this.oldAcc.setTo(this.acc.x, this.acc.y);
        this.oldScale.setTo(this.scale.x, this.scale.y);
        this.oldRotation = this.rotation;
    };
    /**
     * Perform euler integration at the specified time step
     */
    Body.prototype.integrate = function (delta) {
        // Update placements based on linear algebra
        var seconds = delta / 1000;
        var totalAcc = this.acc.clone();
        // Only active vanilla actors are affected by global acceleration
        if (this.collider.type === CollisionType.Active) {
            totalAcc.addEqual(Physics.acc);
        }
        this.vel.addEqual(totalAcc.scale(seconds));
        this.pos.addEqual(this.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));
        this.rx += this.torque * (1.0 / this.collider.inertia) * seconds;
        this.rotation += this.rx * seconds;
        this.scale.x += (this.sx * delta) / 1000;
        this.scale.y += (this.sy * delta) / 1000;
        if (!this.scale.equals(this.oldScale)) {
            // change in scale effects the geometry
            this._geometryDirty = true;
        }
        // Update colliders
        this.collider.update();
        this._geometryDirty = false;
    };
    /**
     * Sets up a box geometry based on the current bounds of the associated actor of this physics body.
     *
     * If no width/height are specified the body will attempt to use the associated actor's width/height.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    Body.prototype.useBoxCollider = function (width, height, anchor, center) {
        if (anchor === void 0) { anchor = Vector.Half; }
        if (center === void 0) { center = Vector.Zero; }
        if (width === null || width === undefined) {
            width = this.actor ? this.actor.width : 0;
        }
        if (height === null || height === undefined) {
            height = this.actor ? this.actor.height : 0;
        }
        this.collider.shape = Shape.Box(width, height, anchor, center);
        return this.collider;
    };
    /**
     * Sets up a [[ConvexPolygon|convex polygon]] collision geometry based on a list of of points relative
     *  to the anchor of the associated actor
     * of this physics body.
     *
     * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    Body.prototype.usePolygonCollider = function (points, center) {
        if (center === void 0) { center = Vector.Zero; }
        this.collider.shape = Shape.Polygon(points, false, center);
        return this.collider;
    };
    /**
     * Sets up a [[Circle|circle collision geometry]] with a specified radius in pixels.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    Body.prototype.useCircleCollider = function (radius, center) {
        if (center === void 0) { center = Vector.Zero; }
        this.collider.shape = Shape.Circle(radius, center);
        return this.collider;
    };
    /**
     * Sets up an [[Edge|edge collision geometry]] with a start point and an end point relative to the anchor of the associated actor
     * of this physics body.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    Body.prototype.useEdgeCollider = function (begin, end) {
        this.collider.shape = Shape.Edge(begin, end);
        return this.collider;
    };
    // TODO remove this, eventually events will stay local to the thing they are around
    Body.prototype._wireColliderEventsToActor = function () {
        var _this = this;
        this.collider.clear();
        this.collider.on('precollision', function (evt) {
            if (_this.actor) {
                _this.actor.emit('precollision', new PreCollisionEvent(evt.target.body.actor, evt.other.body.actor, evt.side, evt.intersection));
            }
        });
        this.collider.on('postcollision', function (evt) {
            if (_this.actor) {
                _this.actor.emit('postcollision', new PostCollisionEvent(evt.target.body.actor, evt.other.body.actor, evt.side, evt.intersection));
            }
        });
        this.collider.on('collisionstart', function (evt) {
            if (_this.actor) {
                _this.actor.emit('collisionstart', new CollisionStartEvent(evt.target.body.actor, evt.other.body.actor, evt.pair));
            }
        });
        this.collider.on('collisionend', function (evt) {
            if (_this.actor) {
                _this.actor.emit('collisionend', new CollisionEndEvent(evt.target.body.actor, evt.other.body.actor));
            }
        });
    };
    return Body;
}());
export { Body };
//# sourceMappingURL=Body.js.map