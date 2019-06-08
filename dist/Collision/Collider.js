import { Color } from '../Drawing/Color';
import * as DrawUtil from '../Util/DrawUtil';
import { Vector } from '../Algebra';
import { Physics } from '../Physics';
import { BoundingBox } from './BoundingBox';
import { CollisionType } from './CollisionType';
import { CollisionGroup } from './CollisionGroup';
import { EventDispatcher } from '../EventDispatcher';
import { Pair } from './Pair';
/**
 * Type guard function to determine whether something is a Collider
 */
export function isCollider(x) {
    return x instanceof Collider;
}
/**
 * Collider describes material properties like shape,
 * bounds, friction of the physics object. Only **one** collider can be associated with a body at a time
 */
var Collider = /** @class */ (function () {
    function Collider(_a) {
        var body = _a.body, type = _a.type, group = _a.group, shape = _a.shape, offset = _a.offset, _b = _a.useShapeInertia, useShapeInertia = _b === void 0 ? true : _b;
        this._events = new EventDispatcher(this);
        /**
         * Gets or sets the current collision type of this collider. By
         * default it is ([[CollisionType.PreventCollision]]).
         */
        this.type = CollisionType.PreventCollision;
        /**
         * Gets or sets the current [[CollisionGroup|collision group]] for the collider, colliders with like collision groups do not collide.
         * By default, the collider will collide with [[CollisionGroup|all groups]].
         */
        this.group = CollisionGroup.All;
        /**
         * The current mass of the actor, mass can be thought of as the resistance to acceleration.
         */
        this.mass = 1.0;
        /**
         * The current moment of inertia, moment of inertia can be thought of as the resistance to rotation.
         */
        this.inertia = 1000;
        /**
         * The coefficient of friction on this actor
         */
        this.friction = 0.99;
        /**
         * The also known as coefficient of restitution of this actor, represents the amount of energy preserved after collision or the
         * bounciness. If 1, it is 100% bouncy, 0 it completely absorbs.
         */
        this.bounciness = 0.2;
        // If shape is not supplied see if the body has an existing collider with a shape
        if (body && body.collider && !shape) {
            this._shape = body.collider.shape;
        }
        else {
            this._shape = shape;
            this.body = body;
        }
        this.useShapeInertia = useShapeInertia;
        this._shape.collider = this;
        this.type = type || this.type;
        this.group = group || this.group;
        this.offset = offset || Vector.Zero;
    }
    /**
     * Returns a clone of the current collider, not associated with any body
     */
    Collider.prototype.clone = function () {
        return new Collider({
            body: null,
            type: this.type,
            shape: this._shape.clone(),
            group: this.group,
            offset: this.offset
        });
    };
    Object.defineProperty(Collider.prototype, "id", {
        /**
         * Get the unique id of the collider
         */
        get: function () {
            return this.body ? this.body.id : -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collider.prototype, "shape", {
        /*
         * Get the shape of the collider as a [[CollisionShape]]
         */
        get: function () {
            return this._shape;
        },
        /**
         * Set the shape of the collider as a [[CollisionShape]], if useShapeInertia is set the collider will use inertia from the shape.
         */
        set: function (shape) {
            this._shape = shape;
            this._shape.collider = this;
            if (this.useShapeInertia) {
                this.inertia = isNaN(this._shape.inertia) ? this.inertia : this._shape.inertia;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collider.prototype, "center", {
        /**
         * The center of the collider in world space
         */
        get: function () {
            return this.bounds.center;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collider.prototype, "active", {
        /**
         * Is this collider active, if false it wont collide
         */
        get: function () {
            return this.body.active;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Collide 2 colliders and product a collision contact if there is a collision, null if none
     *
     * Collision vector is in the direction of the other collider. Away from this collider, this -> other.
     * @param other
     */
    Collider.prototype.collide = function (other) {
        return this.shape.collide(other.shape);
    };
    /**
     * Find the closest line between 2 colliders
     *
     * Line is in the direction of the other collider. Away from this collider, this -> other.
     * @param other Other collider
     */
    Collider.prototype.getClosestLineBetween = function (other) {
        return this.shape.getClosestLineBetween(other.shape);
    };
    Object.defineProperty(Collider.prototype, "offset", {
        /**
         * Gets the current pixel offset of the collider
         */
        get: function () {
            return this.shape.offset.clone();
        },
        /**
         * Sets the pixel offset of the collider
         */
        set: function (offset) {
            this.shape.offset = offset.clone();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns a boolean indicating whether this body collided with
     * or was in stationary contact with
     * the body of the other [[Collider]]
     */
    Collider.prototype.touching = function (other) {
        var pair = new Pair(this, other);
        pair.collide();
        if (pair.collision) {
            return true;
        }
        return false;
    };
    Object.defineProperty(Collider.prototype, "bounds", {
        /**
         * Returns the collider's [[BoundingBox]] calculated for this instant in world space.
         * If there is no shape, a point bounding box is returned
         */
        get: function () {
            if (this.shape) {
                return this.shape.bounds;
            }
            if (this.body) {
                return new BoundingBox().translate(this.body.pos);
            }
            return new BoundingBox();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collider.prototype, "localBounds", {
        /**
         * Returns the collider's [[BoundingBox]] relative to the body's position.
         * If there is no shape, a point boudning box is returned
         */
        get: function () {
            if (this.shape) {
                return this.shape.localBounds;
            }
            return new BoundingBox();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Updates the collision shapes geometry and internal caches if needed
     */
    Collider.prototype.update = function () {
        if (this.shape) {
            this.shape.recalc();
        }
    };
    Collider.prototype.emit = function (eventName, event) {
        this._events.emit(eventName, event);
    };
    Collider.prototype.on = function (eventName, handler) {
        this._events.on(eventName, handler);
    };
    Collider.prototype.off = function (eventName, handler) {
        this._events.off(eventName, handler);
    };
    Collider.prototype.once = function (eventName, handler) {
        this._events.once(eventName, handler);
    };
    Collider.prototype.clear = function () {
        this._events.clear();
    };
    /* istanbul ignore next */
    Collider.prototype.debugDraw = function (ctx) {
        // Draw motion vectors
        if (Physics.showMotionVectors) {
            DrawUtil.vector(ctx, Color.Yellow, this.body.pos, this.body.acc.add(Physics.acc));
            DrawUtil.vector(ctx, Color.Red, this.body.pos, this.body.vel);
            DrawUtil.point(ctx, Color.Red, this.body.pos);
        }
        if (Physics.showBounds) {
            this.bounds.debugDraw(ctx, Color.Yellow);
        }
        if (Physics.showArea) {
            this.shape.debugDraw(ctx, Color.Green);
        }
    };
    return Collider;
}());
export { Collider };
