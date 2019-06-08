var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Class } from './Class';
import { BoundingBox } from './Collision/BoundingBox';
import { Texture } from './Resources/Texture';
import { InitializeEvent, KillEvent, PreUpdateEvent, PreDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent, PostKillEvent, PreKillEvent } from './Events';
import { Color } from './Drawing/Color';
import { Sprite } from './Drawing/Sprite';
import { Logger } from './Util/Log';
import { ActionContext } from './Actions/ActionContext';
import { ActionQueue } from './Actions/Action';
import { Vector } from './Algebra';
import { Body } from './Collision/Body';
import { Side } from './Collision/Side';
import { Configurable } from './Configurable';
import * as Traits from './Traits/Index';
import * as Effects from './Drawing/SpriteEffects';
import * as Util from './Util/Util';
import { CollisionType } from './Collision/CollisionType';
import { obsolete } from './Util/Decorators';
import { Collider } from './Collision/Collider';
import { Shape } from './Collision/Shape';
export function isActor(x) {
    return x instanceof Actor;
}
/**
 * @hidden
 */
var ActorImpl = /** @class */ (function (_super) {
    __extends(ActorImpl, _super);
    // #endregion
    /**
     * @param x       The starting x coordinate of the actor
     * @param y       The starting y coordinate of the actor
     * @param width   The starting width of the actor
     * @param height  The starting height of the actor
     * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
     * initial [[opacity]].
     */
    function ActorImpl(xOrConfig, y, width, height, color) {
        var _this = _super.call(this) || this;
        /**
         * The unique identifier for the actor
         */
        _this.id = ActorImpl.maxId++;
        _this._height = 0;
        _this._width = 0;
        /**
         * Indicates whether the actor is physically in the viewport
         */
        _this.isOffScreen = false;
        /**
         * The visibility of an actor
         */
        _this.visible = true;
        /**
         * The opacity of an actor. Passing in a color in the [[constructor]] will use the
         * color's opacity.
         */
        _this.opacity = 1;
        _this.previousOpacity = 1;
        /**
         * Convenience reference to the global logger
         */
        _this.logger = Logger.getInstance();
        /**
         * The scene that the actor is in
         */
        _this.scene = null;
        /**
         * The parent of this actor
         */
        _this.parent = null;
        /**
         * The children of this actor
         */
        _this.children = [];
        /**
         * @obsolete Legacy collision groups will be removed in v0.24.0, use [[Actor.body.collider.collisionGroup]]
         */
        _this.collisionGroups = [];
        _this._collisionHandlers = {};
        _this._isInitialized = false;
        _this.frames = {};
        _this._effectsDirty = false;
        /**
         * Access to the current drawing for the actor, this can be
         * an [[Animation]], [[Sprite]], or [[Polygon]].
         * Set drawings with [[setDrawing]].
         */
        _this.currentDrawing = null;
        /**
         * Modify the current actor update pipeline.
         */
        _this.traits = [];
        /**
         * Whether or not to enable the [[CapturePointer]] trait that propagates
         * pointer events to this actor
         */
        _this.enableCapturePointer = false;
        /**
         * Configuration for [[CapturePointer]] trait
         */
        _this.capturePointer = {
            captureMoveEvents: false,
            captureDragEvents: false
        };
        _this._zIndex = 0;
        _this._isKilled = false;
        _this._opacityFx = new Effects.Opacity(_this.opacity);
        // #region Events
        _this._capturePointerEvents = [
            'pointerup',
            'pointerdown',
            'pointermove',
            'pointerenter',
            'pointerleave',
            'pointerdragstart',
            'pointerdragend',
            'pointerdragmove',
            'pointerdragenter',
            'pointerdragleave'
        ];
        _this._captureMoveEvents = [
            'pointermove',
            'pointerenter',
            'pointerleave',
            'pointerdragmove',
            'pointerdragenter',
            'pointerdragleave'
        ];
        _this._captureDragEvents = [
            'pointerdragstart',
            'pointerdragend',
            'pointerdragmove',
            'pointerdragenter',
            'pointerdragleave'
        ];
        // initialize default options
        _this._initDefaults();
        var shouldInitializeBody = true;
        if (xOrConfig && typeof xOrConfig === 'object') {
            var config = xOrConfig;
            xOrConfig = config.pos ? config.pos.x : config.x;
            y = config.pos ? config.pos.y : config.y;
            width = config.width;
            height = config.height;
            if (config.body) {
                shouldInitializeBody = false;
                _this.body = config.body;
            }
            if (config.anchor) {
                _this.anchor = config.anchor;
            }
        }
        // Body and collider bounds are still determined by actor width/height
        _this._width = width || 0;
        _this._height = height || 0;
        // Initialize default collider to be a box
        if (shouldInitializeBody) {
            _this.body = new Body({
                collider: new Collider({
                    type: CollisionType.Passive,
                    shape: Shape.Box(_this._width, _this._height, _this.anchor)
                })
            });
        }
        // Position uses body to store values must be initialized after body
        _this.pos.x = xOrConfig || 0;
        _this.pos.y = y || 0;
        if (color) {
            _this.color = color;
            // set default opacity of an actor to the color
            _this.opacity = color.a;
        }
        // Build default pipeline
        _this.traits.push(new Traits.TileMapCollisionDetection());
        _this.traits.push(new Traits.OffscreenCulling());
        _this.traits.push(new Traits.CapturePointer());
        // Build the action queue
        _this.actionQueue = new ActionQueue(_this);
        _this.actions = new ActionContext(_this);
        return _this;
    }
    Object.defineProperty(ActorImpl.prototype, "body", {
        /**
         * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
         * acceleration, mass, inertia, etc.
         */
        get: function () {
            return this._body;
        },
        set: function (body) {
            this._body = body;
            this._body.actor = this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "collisionArea", {
        /**
         * Gets the collision geometry shape to use for collision possible options are [Circle|circles], [ConvexPolygon|polygons], and
         * [Edge|edges].
         * @obsolete Use Actor.body.collider.shape, collisionArea will be removed in v0.24.0
         */
        get: function () {
            return this.body.collider.shape;
        },
        /**
         * Gets the collision geometry shape to use for collision possible options are [Circle|circles], [ConvexPolygon|polygons], and
         * [Edge|edges].
         * @obsolete use Actor.body.collider.shape, collisionArea will be removed in v0.24.0
         */
        set: function (area) {
            this.body.collider.shape = area;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "x", {
        /**
         * Gets the x position of the actor relative to it's parent (if any)
         * @obsolete ex.Actor.x will be removed in v0.24.0, use ex.Actor.pos.x
         */
        get: function () {
            return this.body.pos.x;
        },
        /**
         * Sets the x position of the actor relative to it's parent (if any)
         * @obsolete ex.Actor.x will be removed in v0.24.0, use ex.Actor.pos.x
         */
        set: function (theX) {
            this.body.pos.x = theX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "y", {
        /**
         * Gets the y position of the actor relative to it's parent (if any)
         * @obsolete ex.Actor.y will be removed in v0.24.0, use ex.Actor.pos.y
         */
        get: function () {
            return this.body.pos.y;
        },
        /**
         * Sets the y position of the actor relative to it's parent (if any)
         * @obsolete ex.Actor.y will be removed in v0.24.0, use ex.Actor.pos.y
         */
        set: function (theY) {
            this.body.pos.y = theY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "pos", {
        /**
         * Gets the position vector of the actor in pixels
         */
        get: function () {
            return this.body.pos;
        },
        /**
         * Sets the position vector of the actor in pixels
         */
        set: function (thePos) {
            this.body.pos.setTo(thePos.x, thePos.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "oldPos", {
        /**
         * Gets the position vector of the actor from the last frame
         */
        get: function () {
            return this.body.oldPos;
        },
        /**
         * Sets the position vector of the actor in the last frame
         */
        set: function (thePos) {
            this.body.oldPos.setTo(thePos.x, thePos.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "vel", {
        /**
         * Gets the velocity vector of the actor in pixels/sec
         */
        get: function () {
            return this.body.vel;
        },
        /**
         * Sets the velocity vector of the actor in pixels/sec
         */
        set: function (theVel) {
            this.body.vel.setTo(theVel.x, theVel.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "oldVel", {
        /**
         * Gets the velocity vector of the actor from the last frame
         */
        get: function () {
            return this.body.oldVel;
        },
        /**
         * Sets the velocity vector of the actor from the last frame
         */
        set: function (theVel) {
            this.body.oldVel.setTo(theVel.x, theVel.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "acc", {
        /**
         * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
         * useful to simulate a gravitational effect.
         */
        get: function () {
            return this.body.acc;
        },
        /**
         * Sets the acceleration vector of teh actor in pixels/second/second
         */
        set: function (theAcc) {
            this.body.acc.setTo(theAcc.x, theAcc.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "oldAcc", {
        /**
         * Gets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
         */
        get: function () {
            return this.body.oldAcc;
        },
        /**
         * Sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
         */
        set: function (theAcc) {
            this.body.oldAcc.setTo(theAcc.x, theAcc.y);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "rotation", {
        /**
         * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
         */
        get: function () {
            return this.body.rotation;
        },
        /**
         * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
         */
        set: function (theAngle) {
            this.body.rotation = theAngle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "rx", {
        /**
         * Gets the rotational velocity of the actor in radians/second
         */
        get: function () {
            return this.body.rx;
        },
        /**
         * Sets the rotational velocity of the actor in radians/sec
         */
        set: function (angularVelocity) {
            this.body.rx = angularVelocity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "torque", {
        /**
         * Gets the current torque applied to the actor. Torque can be thought of as rotational force
         * @obsolete ex.Actor.torque will be removed in v0.24.0, use ex.Actor.body.torque
         */
        get: function () {
            return this.body.torque;
        },
        /**
         * Sets the current torque applied to the actor. Torque can be thought of as rotational force
         * @obsolete ex.Actor.torque will be removed in v0.24.0, use ex.Actor.body.torque
         */
        set: function (theTorque) {
            this.body.torque = theTorque;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "mass", {
        /**
         * Get the current mass of the actor, mass can be thought of as the resistance to acceleration.
         * @obsolete ex.Actor.mass will be removed in v0.24.0, use ex.Actor.body.collider.mass
         */
        get: function () {
            return this.body.collider.mass;
        },
        /**
         * Sets the mass of the actor, mass can be thought of as the resistance to acceleration.
         * @obsolete ex.Actor.mass will be removed in v0.24.0, use ex.Actor.body.collider.mass
         */
        set: function (theMass) {
            this.body.collider.mass = theMass;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "moi", {
        /**
         * Gets the current moment of inertia, moi can be thought of as the resistance to rotation.
         * @obsolete ex.Actor.moi will be removed in v0.24.0, use ex.Actor.body.collider.inertia
         */
        get: function () {
            return this.body.collider.inertia;
        },
        /**
         * Sets the current moment of inertia, moi can be thought of as the resistance to rotation.
         * @obsolete ex.Actor.moi will be removed in v0.24.0, use ex.Actor.body.collider.inertia
         */
        set: function (theMoi) {
            this.body.collider.inertia = theMoi;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "friction", {
        /**
         * Gets the coefficient of friction on this actor, this can be thought of as how sticky or slippery an object is.
         * @obsolete ex.Actor.friction will be removed in v0.24.0, use ex.Actor.body.collider.friction
         */
        get: function () {
            return this.body.collider.friction;
        },
        /**
         * Sets the coefficient of friction of this actor, this can ve thought of as how stick or slippery an object is.
         */
        set: function (theFriction) {
            this.body.collider.friction = theFriction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "restitution", {
        /**
         * Gets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
         * as bounciness.
         * @obsolete ex.Actor.restitution will be removed in v0.24.0, use ex.Actor.body.collider.restitution
         */
        get: function () {
            return this.body.collider.bounciness;
        },
        /**
         * Sets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
         * as bounciness.
         * @obsolete ex.Actor.restitution will be removed in v0.24.0, use ex.Actor.body.collider.restitution
         */
        set: function (theRestitution) {
            this.body.collider.bounciness = theRestitution;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "scale", {
        /**
         * Gets the scale vector of the actor
         * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.scale;
        },
        /**
         * Sets the scale vector of the actor for
         * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
         */
        set: function (scale) {
            this.body.scale = scale;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "oldScale", {
        /**
         * Gets the old scale of the actor last frame
         * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.oldScale;
        },
        /**
         * Sets the the old scale of the acotr last frame
         * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
         */
        set: function (scale) {
            this.body.oldScale = scale;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "sx", {
        /**
         * Gets the x scalar velocity of the actor in scale/second
         * @obsolete ex.Actor.sx will be removed in v0.24.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.sx;
        },
        /**
         * Sets the x scalar velocity of the actor in scale/second
         * @obsolete ex.Actor.sx will be removed in v0.24.0, set width and height directly in constructor
         */
        set: function (scalePerSecondX) {
            this.body.sx = scalePerSecondX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "sy", {
        /**
         * Gets the y scalar velocity of the actor in scale/second
         * @obsolete ex.Actor.sy will be removed in v0.24.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.sy;
        },
        /**
         * Sets the y scale velocity of the actor in scale/second
         * @obsolete ex.Actor.sy will be removed in v0.24.0, set width and height directly in constructor
         */
        set: function (scalePerSecondY) {
            this.body.sy = scalePerSecondY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "collisionType", {
        /**
         * Gets or sets the current collision type of this actor. By
         * default it is ([[CollisionType.PreventCollision]]).
         * @obsolete ex.Actor.collisionType will be removed in v0.24.0, use ex.Actor.body.collider.type
         */
        get: function () {
            return this.body.collider.type;
        },
        /**
         * Gets or sets the current collision type of this actor. By
         * default it is ([[CollisionType.PreventCollision]]).
         *  @obsolete ex.Actor.collisionType will be removed in v0.24.0, use ex.Actor.body.collider.type
         */
        set: function (type) {
            this.body.collider.type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "color", {
        /**
         * Sets the color of the actor. A rectangle of this color will be
         * drawn if no [[IDrawable]] is specified as the actors drawing.
         *
         * The default is `null` which prevents a rectangle from being drawn.
         */
        get: function () {
            return this._color;
        },
        set: function (v) {
            this._color = v.clone();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `onInitialize` is called before the first update of the actor. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    ActorImpl.prototype.onInitialize = function (_engine) {
        // Override me
    };
    Object.defineProperty(ActorImpl.prototype, "isInitialized", {
        /**
         * Gets whether the actor is Initialized
         */
        get: function () {
            return this._isInitialized;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * @internal
     */
    ActorImpl.prototype._initialize = function (engine) {
        if (!this.isInitialized) {
            this.onInitialize(engine);
            _super.prototype.emit.call(this, 'initialize', new InitializeEvent(engine, this));
            this._isInitialized = true;
        }
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child._initialize(engine);
        }
    };
    ActorImpl.prototype._initDefaults = function () {
        this.anchor = Actor.defaults.anchor.clone();
    };
    ActorImpl.prototype._checkForPointerOptIn = function (eventName) {
        if (eventName) {
            var normalized = eventName.toLowerCase();
            if (this._capturePointerEvents.indexOf(normalized) !== -1) {
                this.enableCapturePointer = true;
                if (this._captureMoveEvents.indexOf(normalized) !== -1) {
                    this.capturePointer.captureMoveEvents = true;
                }
                if (this._captureDragEvents.indexOf(normalized) !== -1) {
                    this.capturePointer.captureDragEvents = true;
                }
            }
        }
    };
    ActorImpl.prototype.on = function (eventName, handler) {
        this._checkForPointerOptIn(eventName);
        _super.prototype.on.call(this, eventName, handler);
    };
    ActorImpl.prototype.once = function (eventName, handler) {
        this._checkForPointerOptIn(eventName);
        _super.prototype.once.call(this, eventName, handler);
    };
    ActorImpl.prototype.off = function (eventName, handler) {
        _super.prototype.off.call(this, eventName, handler);
    };
    // #endregion
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _prekill handler for [[onPreKill]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._prekill = function (_scene) {
        _super.prototype.emit.call(this, 'prekill', new PreKillEvent(this));
        this.onPreKill(_scene);
    };
    /**
     * Safe to override onPreKill lifecycle event handler. Synonymous with `.on('prekill', (evt) =>{...})`
     *
     * `onPreKill` is called directly before an actor is killed and removed from its current [[Scene]].
     */
    ActorImpl.prototype.onPreKill = function (_scene) {
        // Override me
    };
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _prekill handler for [[onPostKill]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._postkill = function (_scene) {
        _super.prototype.emit.call(this, 'postkill', new PostKillEvent(this));
        this.onPostKill(_scene);
    };
    /**
     * Safe to override onPostKill lifecycle event handler. Synonymous with `.on('postkill', (evt) => {...})`
     *
     * `onPostKill` is called directly after an actor is killed and remove from its current [[Scene]].
     */
    ActorImpl.prototype.onPostKill = function (_scene) {
        // Override me
    };
    /**
     * If the current actor is a member of the scene, this will remove
     * it from the scene graph. It will no longer be drawn or updated.
     */
    ActorImpl.prototype.kill = function () {
        if (this.scene) {
            this._prekill(this.scene);
            this.emit('kill', new KillEvent(this));
            this._isKilled = true;
            this.scene.remove(this);
            this._postkill(this.scene);
        }
        else {
            this.logger.warn('Cannot kill actor, it was never added to the Scene');
        }
    };
    /**
     * If the current actor is killed, it will now not be killed.
     */
    ActorImpl.prototype.unkill = function () {
        this._isKilled = false;
    };
    /**
     * Indicates wether the actor has been killed.
     */
    ActorImpl.prototype.isKilled = function () {
        return this._isKilled;
    };
    /**
     * Adds a child actor to this actor. All movement of the child actor will be
     * relative to the parent actor. Meaning if the parent moves the child will
     * move with it.
     * @param actor The child actor to add
     */
    ActorImpl.prototype.add = function (actor) {
        actor.body.collider.type = CollisionType.PreventCollision;
        if (Util.addItemToArray(actor, this.children)) {
            actor.parent = this;
        }
    };
    /**
     * Removes a child actor from this actor.
     * @param actor The child actor to remove
     */
    ActorImpl.prototype.remove = function (actor) {
        if (Util.removeItemFromArray(actor, this.children)) {
            actor.parent = null;
        }
    };
    ActorImpl.prototype.setDrawing = function (key) {
        key = key.toString();
        if (this.currentDrawing !== this.frames[key]) {
            if (this.frames[key] != null) {
                this.frames[key].reset();
                this.currentDrawing = this.frames[key];
            }
            else {
                Logger.getInstance().error("the specified drawing key " + key + " does not exist");
            }
        }
    };
    ActorImpl.prototype.addDrawing = function () {
        if (arguments.length === 2) {
            this.frames[arguments[0]] = arguments[1];
            if (!this.currentDrawing) {
                this.currentDrawing = arguments[1];
            }
            this._effectsDirty = true;
        }
        else {
            if (arguments[0] instanceof Sprite) {
                this.addDrawing('default', arguments[0]);
            }
            if (arguments[0] instanceof Texture) {
                this.addDrawing('default', arguments[0].asSprite());
            }
        }
    };
    Object.defineProperty(ActorImpl.prototype, "z", {
        get: function () {
            return this.getZIndex();
        },
        set: function (newZ) {
            this.setZIndex(newZ);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     */
    ActorImpl.prototype.getZIndex = function () {
        return this._zIndex;
    };
    /**
     * Sets the z-index of an actor and updates it in the drawing list for the scene.
     * The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     * @param newIndex new z-index to assign
     */
    ActorImpl.prototype.setZIndex = function (newIndex) {
        this.scene.cleanupDrawTree(this);
        this._zIndex = newIndex;
        this.scene.updateDrawTree(this);
    };
    /**
     * Adds an actor to a collision group. Actors with no named collision groups are
     * considered to be in every collision group.
     *
     * Once in a collision group(s) actors will only collide with other actors in
     * that group.
     *
     * @param name The name of the collision group
     * @obsolete Use [[Actor.body.collider.collisionGroup]], legacy collisionGroups will be removed in v0.24.0
     */
    ActorImpl.prototype.addCollisionGroup = function (name) {
        this.collisionGroups.push(name);
    };
    /**
     * Removes an actor from a collision group.
     * @param name The name of the collision group
     * @obsolete Use [[Actor.body.collider.collisionGroup]], legacy collisionGroups will be removed in v0.24.0
     */
    ActorImpl.prototype.removeCollisionGroup = function (name) {
        var index = this.collisionGroups.indexOf(name);
        if (index !== -1) {
            this.collisionGroups.splice(index, 1);
        }
    };
    /**
     * Get the center point of an actor
     */
    ActorImpl.prototype.getCenter = function () {
        return new Vector(this.pos.x + this.width / 2 - this.anchor.x * this.width, this.pos.y + this.height / 2 - this.anchor.y * this.height);
    };
    Object.defineProperty(ActorImpl.prototype, "center", {
        /**
         * Get the center point of an actor
         */
        get: function () {
            return new Vector(this.pos.x + this.width / 2 - this.anchor.x * this.width, this.pos.y + this.height / 2 - this.anchor.y * this.height);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "width", {
        get: function () {
            return this._width * this.getGlobalScale().x;
        },
        set: function (width) {
            this._width = width / this.scale.x;
            this.body.collider.shape = Shape.Box(this._width, this._height, this.anchor);
            this.body.markCollisionShapeDirty();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the calculated width of an actor, factoring in scale
     */
    ActorImpl.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Sets the width of an actor, factoring in the current scale
     */
    ActorImpl.prototype.setWidth = function (width) {
        this.width = width;
    };
    Object.defineProperty(ActorImpl.prototype, "height", {
        get: function () {
            return this._height * this.getGlobalScale().y;
        },
        set: function (height) {
            this._height = height / this.scale.y;
            this.body.collider.shape = Shape.Box(this._width, this._height, this.anchor);
            this.body.markCollisionShapeDirty();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the calculated height of an actor, factoring in scale
     */
    ActorImpl.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Sets the height of an actor, factoring in the current scale
     */
    ActorImpl.prototype.setHeight = function (height) {
        this.height = height;
    };
    /**
     * Gets the left edge of the actor
     */
    ActorImpl.prototype.getLeft = function () {
        return this.getBounds().left;
    };
    /**
     * Gets the right edge of the actor
     */
    ActorImpl.prototype.getRight = function () {
        return this.getBounds().right;
    };
    /**
     * Gets the top edge of the actor
     */
    ActorImpl.prototype.getTop = function () {
        return this.getBounds().top;
    };
    /**
     * Gets the bottom edge of the actor
     */
    ActorImpl.prototype.getBottom = function () {
        return this.getBounds().bottom;
    };
    /**
     * Gets this actor's rotation taking into account any parent relationships
     *
     * @returns Rotation angle in radians
     */
    ActorImpl.prototype.getWorldRotation = function () {
        if (!this.parent) {
            return this.rotation;
        }
        return this.rotation + this.parent.getWorldRotation();
    };
    /**
     * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
     *
     * @returns Position in world coordinates
     */
    ActorImpl.prototype.getWorldPos = function () {
        if (!this.parent) {
            return this.pos.clone();
        }
        // collect parents
        var parents = [];
        var root = this;
        parents.push(this);
        // find parents
        while (root.parent) {
            root = root.parent;
            parents.push(root);
        }
        // calculate position
        var x = parents.reduceRight(function (px, p) {
            if (p.parent) {
                return px + p.pos.x * p.getGlobalScale().x;
            }
            return px + p.pos.x;
        }, 0);
        var y = parents.reduceRight(function (py, p) {
            if (p.parent) {
                return py + p.pos.y * p.getGlobalScale().y;
            }
            return py + p.pos.y;
        }, 0);
        // rotate around root anchor
        var ra = root.getWorldPos(); // 10, 10
        var r = this.getWorldRotation();
        return new Vector(x, y).rotate(r, ra);
    };
    /**
     * Gets the global scale of the Actor
     */
    ActorImpl.prototype.getGlobalScale = function () {
        if (!this.parent) {
            return new Vector(this.scale.x, this.scale.y);
        }
        var parentScale = this.parent.getGlobalScale();
        return new Vector(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
    };
    // #region Collision
    /**
     * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
     */
    ActorImpl.prototype.getBounds = function (rotated) {
        if (rotated === void 0) { rotated = true; }
        // todo cache bounding box
        var anchor = this._getCalculatedAnchor();
        var pos = this.getWorldPos();
        var bb = new BoundingBox(pos.x - anchor.x, pos.y - anchor.y, pos.x + this.width - anchor.x, pos.y + this.height - anchor.y);
        return rotated ? bb.rotate(this.rotation, pos) : bb;
    };
    /**
     * Returns the actor's [[BoundingBox]] relative to the actor's position.
     */
    ActorImpl.prototype.getRelativeBounds = function (rotated) {
        if (rotated === void 0) { rotated = true; }
        // todo cache bounding box
        var anchor = this._getCalculatedAnchor();
        var bb = new BoundingBox(-anchor.x, -anchor.y, this.width - anchor.x, this.height - anchor.y);
        return rotated ? bb.rotate(this.rotation) : bb;
    };
    /**
     * Returns the actors unrotated geometry in world coordinates
     */
    ActorImpl.prototype.getGeometry = function () {
        return this.getBounds(false).getPoints();
    };
    /**
     * Return the actor's unrotated geometry relative to the actor's position
     */
    ActorImpl.prototype.getRelativeGeometry = function () {
        return this.getRelativeBounds(false).getPoints();
    };
    /**
     * Tests whether the x/y specified are contained in the actor
     * @param x  X coordinate to test (in world coordinates)
     * @param y  Y coordinate to test (in world coordinates)
     * @param recurse checks whether the x/y are contained in any child actors (if they exist).
     */
    ActorImpl.prototype.contains = function (x, y, recurse) {
        if (recurse === void 0) { recurse = false; }
        // These shenanigans are to handle child actor containment,
        // the only time getWorldPos and pos are different is a child actor
        var childShift = this.getWorldPos().sub(this.pos);
        var containment = this.body.collider.bounds.translate(childShift).contains(new Vector(x, y));
        if (recurse) {
            return (containment ||
                this.children.some(function (child) {
                    return child.contains(x, y, true);
                }));
        }
        return containment;
    };
    /**
     * Returns the side of the collision based on the intersection
     * @param intersect The displacement vector returned by a collision
     * @obsolete Actor.getSideFromIntersect will be removed in v0.24.0, use [[BoundingBox.sideFromIntersection]]
     */
    ActorImpl.prototype.getSideFromIntersect = function (intersect) {
        if (intersect) {
            if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
                if (intersect.x < 0) {
                    return Side.Right;
                }
                return Side.Left;
            }
            else {
                if (intersect.y < 0) {
                    return Side.Bottom;
                }
                return Side.Top;
            }
        }
        return Side.None;
    };
    /**
     * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
     * @param actor The other actor to test
     * @obsolete Actor.collidesWithSide will be removed in v0.24.0, use [[Actor.bounds.intersectWithSide]]
     */
    ActorImpl.prototype.collidesWithSide = function (actor) {
        var separationVector = this.collides(actor);
        if (!separationVector) {
            return Side.None;
        }
        if (Math.abs(separationVector.x) > Math.abs(separationVector.y)) {
            if (this.pos.x < actor.pos.x) {
                return Side.Right;
            }
            else {
                return Side.Left;
            }
        }
        else {
            if (this.pos.y < actor.pos.y) {
                return Side.Bottom;
            }
            else {
                return Side.Top;
            }
        }
    };
    /**
     * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
     * `null` when there is no collision;
     * @param actor The other actor to test
     * @obsolete Actor.collides will be removed in v0.24.0, use [[Actor.bounds.interesect]] to get boudings intersection,
     * or [[Actor.body.collider.collide]] to collide with another collider
     */
    ActorImpl.prototype.collides = function (actor) {
        var bounds = this.body.collider.bounds;
        var otherBounds = actor.body.collider.bounds;
        var intersect = bounds.intersect(otherBounds);
        return intersect;
    };
    /**
     * Register a handler to fire when this actor collides with another in a specified group
     * @param group The group name to listen for
     * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
     */
    ActorImpl.prototype.onCollidesWith = function (group, func) {
        if (!this._collisionHandlers[group]) {
            this._collisionHandlers[group] = [];
        }
        this._collisionHandlers[group].push(func);
    };
    ActorImpl.prototype.getCollisionHandlers = function () {
        return this._collisionHandlers;
    };
    /**
     * Removes all collision handlers for this group on this actor
     * @param group Group to remove all handlers for on this actor.
     */
    ActorImpl.prototype.removeCollidesWith = function (group) {
        this._collisionHandlers[group] = [];
    };
    /**
     * Returns true if the two actor.body.collider.shape's surfaces are less than or equal to the distance specified from each other
     * @param actor     Actor to test
     * @param distance  Distance in pixels to test
     */
    ActorImpl.prototype.within = function (actor, distance) {
        return this.body.collider.shape.getClosestLineBetween(actor.body.collider.shape).getLength() <= distance;
    };
    // #endregion
    ActorImpl.prototype._getCalculatedAnchor = function () {
        return new Vector(this.width * this.anchor.x, this.height * this.anchor.y);
    };
    ActorImpl.prototype._reapplyEffects = function (drawing) {
        drawing.removeEffect(this._opacityFx);
        drawing.addEffect(this._opacityFx);
    };
    // #region Update
    /**
     * Called by the Engine, updates the state of the actor
     * @param engine The reference to the current game engine
     * @param delta  The time elapsed since the last update in milliseconds
     */
    ActorImpl.prototype.update = function (engine, delta) {
        this._initialize(engine);
        this._preupdate(engine, delta);
        // Update action queue
        this.actionQueue.update(delta);
        // Update color only opacity
        if (this.color) {
            this.color.a = this.opacity;
        }
        // calculate changing opacity
        if (this.previousOpacity !== this.opacity) {
            this.previousOpacity = this.opacity;
            this._opacityFx.opacity = this.opacity;
            this._effectsDirty = true;
        }
        // capture old transform
        this.body.captureOldTransform();
        // Run Euler integration
        this.body.integrate(delta);
        // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
        for (var _i = 0, _a = this.traits; _i < _a.length; _i++) {
            var trait = _a[_i];
            trait.update(this, engine, delta);
        }
        // Update child actors
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].update(engine, delta);
        }
        this._postupdate(engine, delta);
    };
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an actor is updated.
     */
    ActorImpl.prototype.onPreUpdate = function (_engine, _delta) {
        // Override me
    };
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an actor is updated.
     */
    ActorImpl.prototype.onPostUpdate = function (_engine, _delta) {
        // Override me
    };
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._preupdate = function (engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    };
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._postupdate = function (engine, delta) {
        this.emit('postupdate', new PreUpdateEvent(engine, delta, this));
        this.onPostUpdate(engine, delta);
    };
    // endregion
    // #region Drawing
    /**
     * Called by the Engine, draws the actor to the screen
     * @param ctx   The rendering context
     * @param delta The time since the last draw in milliseconds
     */
    ActorImpl.prototype.draw = function (ctx, delta) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale.x, this.scale.y);
        // translate canvas by anchor offset
        ctx.save();
        ctx.translate(-(this._width * this.anchor.x), -(this._height * this.anchor.y));
        this._predraw(ctx, delta);
        if (this.currentDrawing) {
            var drawing = this.currentDrawing;
            // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
            var offsetX = (this._width - drawing.width * drawing.scale.x) * this.anchor.x;
            var offsetY = (this._height - drawing.height * drawing.scale.y) * this.anchor.y;
            if (this._effectsDirty) {
                this._reapplyEffects(this.currentDrawing);
                this._effectsDirty = false;
            }
            this.currentDrawing.draw(ctx, offsetX, offsetY);
        }
        else {
            if (this.color && this.body && this.body.collider && this.body.collider.shape) {
                this.body.collider.shape.draw(ctx, this.color, new Vector(this.width * this.anchor.x, this.height * this.anchor.y));
            }
        }
        ctx.restore();
        // Draw child actors
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].visible) {
                this.children[i].draw(ctx, delta);
            }
        }
        this._postdraw(ctx, delta);
        ctx.restore();
    };
    /**
     * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('predraw', (evt) =>{...})`
     *
     * `onPreDraw` is called directly before an actor is drawn, but after local transforms are made.
     */
    ActorImpl.prototype.onPreDraw = function (_ctx, _delta) {
        // Override me
    };
    /**
     * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('postdraw', (evt) =>{...})`
     *
     * `onPostDraw` is called directly after an actor is drawn, and before local transforms are removed.
     */
    ActorImpl.prototype.onPostDraw = function (_ctx, _delta) {
        // Override me
    };
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _predraw handler for [[onPreDraw]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._predraw = function (ctx, delta) {
        this.emit('predraw', new PreDrawEvent(ctx, delta, this));
        this.onPreDraw(ctx, delta);
    };
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _postdraw handler for [[onPostDraw]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._postdraw = function (ctx, delta) {
        this.emit('postdraw', new PreDrawEvent(ctx, delta, this));
        this.onPostDraw(ctx, delta);
    };
    /**
     * Called by the Engine, draws the actors debugging to the screen
     * @param ctx The rendering context
     */
    /* istanbul ignore next */
    ActorImpl.prototype.debugDraw = function (ctx) {
        this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));
        this.body.collider.debugDraw(ctx);
        // Draw actor bounding box
        var bb = this.body.collider.localBounds.translate(this.getWorldPos());
        bb.debugDraw(ctx);
        // Draw actor Id
        ctx.fillText('id: ' + this.id, bb.left + 3, bb.top + 10);
        // Draw actor anchor Vector
        ctx.fillStyle = Color.Yellow.toString();
        ctx.beginPath();
        ctx.arc(this.getWorldPos().x, this.getWorldPos().y, 3, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        // Culling Box debug draw
        for (var j = 0; j < this.traits.length; j++) {
            if (this.traits[j] instanceof Traits.OffscreenCulling) {
                this.traits[j].cullingBox.debugDraw(ctx);
            }
        }
        // Unit Circle debug draw
        ctx.strokeStyle = Color.Yellow.toString();
        ctx.beginPath();
        var radius = Math.min(this.width, this.height);
        ctx.arc(this.getWorldPos().x, this.getWorldPos().y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        var ticks = {
            '0 Pi': 0,
            'Pi/2': Math.PI / 2,
            Pi: Math.PI,
            '3/2 Pi': (3 * Math.PI) / 2
        };
        var oldFont = ctx.font;
        for (var tick in ticks) {
            ctx.fillStyle = Color.Yellow.toString();
            ctx.font = '14px';
            ctx.textAlign = 'center';
            ctx.fillText(tick, this.getWorldPos().x + Math.cos(ticks[tick]) * (radius + 10), this.getWorldPos().y + Math.sin(ticks[tick]) * (radius + 10));
        }
        ctx.font = oldFont;
        // Draw child actors
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].debugDraw(ctx);
        }
        this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
    };
    /**
     * Returns the full array of ancestors
     */
    ActorImpl.prototype.getAncestors = function () {
        var path = [this];
        var currentActor = this;
        var parent;
        while ((parent = currentActor.parent)) {
            currentActor = parent;
            path.push(currentActor);
        }
        return path.reverse();
    };
    // #region Properties
    /**
     * Indicates the next id to be set
     */
    ActorImpl.defaults = {
        anchor: Vector.Half
    };
    /**
     * Indicates the next id to be set
     */
    ActorImpl.maxId = 0;
    __decorate([
        obsolete({ message: 'Actor.collisionArea will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.shape' })
    ], ActorImpl.prototype, "collisionArea", null);
    __decorate([
        obsolete({ message: 'ex.Actor.x will be removed in v0.24.0', alternateMethod: 'ex.Actor.pos.x, or ex.Actor.body.pos.x' })
    ], ActorImpl.prototype, "x", null);
    __decorate([
        obsolete({ message: 'ex.Actor.y will be removed in v0.24.0', alternateMethod: 'ex.Actor.pos.y, or ex.Actor.body.pos.y' })
    ], ActorImpl.prototype, "y", null);
    __decorate([
        obsolete({ message: 'ex.Actor.torque will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.torque' })
    ], ActorImpl.prototype, "torque", null);
    __decorate([
        obsolete({ message: 'ex.Actor.mass will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.mass' })
    ], ActorImpl.prototype, "mass", null);
    __decorate([
        obsolete({ message: 'ex.Actor.moi will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.inertia' })
    ], ActorImpl.prototype, "moi", null);
    __decorate([
        obsolete({ message: 'ex.Actor.friction will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.friction' })
    ], ActorImpl.prototype, "friction", null);
    __decorate([
        obsolete({ message: 'ex.Actor.restitution will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.bounciness' })
    ], ActorImpl.prototype, "restitution", null);
    __decorate([
        obsolete({ message: 'ex.Actor.sx will be removed in v0.24.0', alternateMethod: 'Set width and height directly in constructor' })
    ], ActorImpl.prototype, "sx", null);
    __decorate([
        obsolete({ message: 'ex.Actor.sy will be removed in v0.24.0', alternateMethod: 'Set width and height directly in constructor' })
    ], ActorImpl.prototype, "sy", null);
    __decorate([
        obsolete({ message: 'ex.Actor.collisionType will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.type' })
    ], ActorImpl.prototype, "collisionType", null);
    __decorate([
        obsolete({ message: 'Legacy collision groups will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.collisionGroup' })
    ], ActorImpl.prototype, "addCollisionGroup", null);
    __decorate([
        obsolete({ message: 'Legacy collision groups will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.collisionGroup' })
    ], ActorImpl.prototype, "removeCollisionGroup", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.center' })
    ], ActorImpl.prototype, "getCenter", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.width' })
    ], ActorImpl.prototype, "getWidth", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.width' })
    ], ActorImpl.prototype, "setWidth", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.height' })
    ], ActorImpl.prototype, "getHeight", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.height' })
    ], ActorImpl.prototype, "setHeight", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.left' })
    ], ActorImpl.prototype, "getLeft", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.right' })
    ], ActorImpl.prototype, "getRight", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.top' })
    ], ActorImpl.prototype, "getTop", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.bottom' })
    ], ActorImpl.prototype, "getBottom", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds' })
    ], ActorImpl.prototype, "getBounds", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.localBounds' })
    ], ActorImpl.prototype, "getRelativeBounds", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.getPoints()' })
    ], ActorImpl.prototype, "getGeometry", null);
    __decorate([
        obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.localBounds.getPoints()' })
    ], ActorImpl.prototype, "getRelativeGeometry", null);
    __decorate([
        obsolete({ message: 'Actor.getSideFromIntersect will be removed in v0.24.0', alternateMethod: 'BoundingBox.sideFromIntersection' })
    ], ActorImpl.prototype, "getSideFromIntersect", null);
    __decorate([
        obsolete({ message: 'Actor.collidesWithSide will be removed in v0.24.0', alternateMethod: 'Actor.bounds.intersectWithSide' })
    ], ActorImpl.prototype, "collidesWithSide", null);
    __decorate([
        obsolete({ message: 'Actor.collides will be removed  in v0.24.0', alternateMethod: 'Actor.bounds.intersect or Actor.' })
    ], ActorImpl.prototype, "collides", null);
    __decorate([
        obsolete({ message: 'Actor.onCollidesWIth will be removed  in v0.24.0', alternateMethod: 'Actor.collider.canCollide' })
    ], ActorImpl.prototype, "onCollidesWith", null);
    __decorate([
        obsolete({ message: 'Actor.getCollisionHandlers will be removed  in v0.24.0' })
    ], ActorImpl.prototype, "getCollisionHandlers", null);
    __decorate([
        obsolete({ message: 'Actor.getCollisionHandlers will be removed  in v0.24.0' })
    ], ActorImpl.prototype, "removeCollidesWith", null);
    return ActorImpl;
}(Class));
export { ActorImpl };
/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events,
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a [[Scene]] for it to be drawn to the screen.
 *
 * [[include:Actors.md]]
 *
 *
 * [[include:Constructors.md]]
 *
 */
var Actor = /** @class */ (function (_super) {
    __extends(Actor, _super);
    function Actor(xOrConfig, y, width, height, color) {
        return _super.call(this, xOrConfig, y, width, height, color) || this;
    }
    return Actor;
}(Configurable(ActorImpl)));
export { Actor };
