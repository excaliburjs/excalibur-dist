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
import { Texture } from './Resources/Texture';
import { InitializeEvent, KillEvent, PreUpdateEvent, PreDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent, PostKillEvent, PreKillEvent } from './Events';
import { Color } from './Drawing/Color';
import { Sprite } from './Drawing/Sprite';
import { Logger } from './Util/Log';
import { ActionContext } from './Actions/ActionContext';
import { ActionQueue } from './Actions/Action';
import { Vector } from './Algebra';
import { Body } from './Collision/Body';
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
         * Draggable helper
         */
        _this._draggable = false;
        _this._dragging = false;
        _this._pointerDragStartHandler = function () {
            _this._dragging = true;
        };
        _this._pointerDragEndHandler = function () {
            _this._dragging = false;
        };
        _this._pointerDragMoveHandler = function (pe) {
            if (_this._dragging) {
                _this.pos = pe.pointer.lastWorldPos;
            }
        };
        _this._pointerDragLeaveHandler = function (pe) {
            if (_this._dragging) {
                _this.pos = pe.pointer.lastWorldPos;
            }
        };
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
        var collisionType = CollisionType.Passive;
        if (xOrConfig && typeof xOrConfig === 'object') {
            var config = xOrConfig;
            if (config.pos) {
                xOrConfig = config.pos ? config.pos.x : 0;
                y = config.pos ? config.pos.y : 0;
            }
            else {
                xOrConfig = config.x || 0;
                y = config.y || 0;
            }
            width = config.width;
            height = config.height;
            if (config.body) {
                shouldInitializeBody = false;
                _this.body = config.body;
            }
            if (config.anchor) {
                _this.anchor = config.anchor;
            }
            if (config.collisionType) {
                collisionType = config.collisionType;
            }
        }
        // Body and collider bounds are still determined by actor width/height
        _this._width = width || 0;
        _this._height = height || 0;
        // Initialize default collider to be a box
        if (shouldInitializeBody) {
            _this.body = new Body({
                collider: new Collider({
                    type: collisionType,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "scale", {
        /**
         * Gets the scale vector of the actor
         * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.scale;
        },
        /**
         * Sets the scale vector of the actor for
         * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
         */
        set: function (scale) {
            this.body.scale = scale;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "oldScale", {
        /**
         * Gets the old scale of the actor last frame
         * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.oldScale;
        },
        /**
         * Sets the the old scale of the actor last frame
         * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
         */
        set: function (scale) {
            this.body.oldScale = scale;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "sx", {
        /**
         * Gets the x scalar velocity of the actor in scale/second
         * @obsolete ex.Actor.sx will be removed in v0.25.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.sx;
        },
        /**
         * Sets the x scalar velocity of the actor in scale/second
         * @obsolete ex.Actor.sx will be removed in v0.25.0, set width and height directly in constructor
         */
        set: function (scalePerSecondX) {
            this.body.sx = scalePerSecondX;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "sy", {
        /**
         * Gets the y scalar velocity of the actor in scale/second
         * @obsolete ex.Actor.sy will be removed in v0.25.0, set width and height directly in constructor
         */
        get: function () {
            return this.body.sy;
        },
        /**
         * Sets the y scale velocity of the actor in scale/second
         * @obsolete ex.Actor.sy will be removed in v0.25.0, set width and height directly in constructor
         */
        set: function (scalePerSecondY) {
            this.body.sy = scalePerSecondY;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "draggable", {
        get: function () {
            return this._draggable;
        },
        set: function (isDraggable) {
            if (isDraggable) {
                if (isDraggable && !this._draggable) {
                    this.on('pointerdragstart', this._pointerDragStartHandler);
                    this.on('pointerdragend', this._pointerDragEndHandler);
                    this.on('pointerdragmove', this._pointerDragMoveHandler);
                    this.on('pointerdragleave', this._pointerDragLeaveHandler);
                }
                else if (!isDraggable && this._draggable) {
                    this.off('pointerdragstart', this._pointerDragStartHandler);
                    this.off('pointerdragend', this._pointerDragEndHandler);
                    this.off('pointerdragmove', this._pointerDragMoveHandler);
                    this.off('pointerdragleave', this._pointerDragLeaveHandler);
                }
                this._draggable = isDraggable;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "color", {
        /**
         * Sets the color of the actor. A rectangle of this color will be
         * drawn if no [[Drawable]] is specified as the actors drawing.
         *
         * The default is `null` which prevents a rectangle from being drawn.
         */
        get: function () {
            return this._color;
        },
        set: function (v) {
            this._color = v.clone();
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    /**
     * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
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
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
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
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
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
        enumerable: false,
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
    Object.defineProperty(ActorImpl.prototype, "center", {
        /**
         * Get the center point of an actor
         */
        get: function () {
            return new Vector(this.pos.x + this.width / 2 - this.anchor.x * this.width, this.pos.y + this.height / 2 - this.anchor.y * this.height);
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ActorImpl.prototype, "height", {
        get: function () {
            return this._height * this.getGlobalScale().y;
        },
        set: function (height) {
            this._height = height / this.scale.y;
            this.body.collider.shape = Shape.Box(this._width, this._height, this.anchor);
            this.body.markCollisionShapeDirty();
        },
        enumerable: false,
        configurable: true
    });
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
     * Returns true if the two actor.body.collider.shape's surfaces are less than or equal to the distance specified from each other
     * @param actor     Actor to test
     * @param distance  Distance in pixels to test
     */
    ActorImpl.prototype.within = function (actor, distance) {
        return this.body.collider.shape.getClosestLineBetween(actor.body.collider.shape).getLength() <= distance;
    };
    // #endregion
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
        if (this.opacity === 0) {
            this.visible = false;
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
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._preupdate = function (engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
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
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _predraw handler for [[onPreDraw]] lifecycle event
     * @internal
     */
    ActorImpl.prototype._predraw = function (ctx, delta) {
        this.emit('predraw', new PreDrawEvent(ctx, delta, this));
        this.onPreDraw(ctx, delta);
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
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
                this.traits[j].cullingBox.debugDraw(ctx); // eslint-disable-line
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
        obsolete({ message: 'ex.Actor.sx will be removed in v0.25.0', alternateMethod: 'Set width and height directly in constructor' })
    ], ActorImpl.prototype, "sx", null);
    __decorate([
        obsolete({ message: 'ex.Actor.sy will be removed in v0.25.0', alternateMethod: 'Set width and height directly in constructor' })
    ], ActorImpl.prototype, "sy", null);
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
//# sourceMappingURL=Actor.js.map