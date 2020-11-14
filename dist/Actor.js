var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Texture } from './Resources/Texture';
import { KillEvent, PreUpdateEvent, PreDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent, PostKillEvent, PreKillEvent } from './Events';
import { Color } from './Drawing/Color';
import { Sprite } from './Drawing/Sprite';
import { Animation } from './Drawing/Animation';
import { Logger } from './Util/Log';
import { ActionContext } from './Actions/ActionContext';
import { ActionQueue } from './Actions/Action';
import { Vector } from './Algebra';
import { Body } from './Collision/Body';
import { Configurable } from './Configurable';
import * as Traits from './Traits/Index';
import * as Util from './Util/Util';
import { CollisionType } from './Collision/CollisionType';
import { obsolete } from './Util/Decorators';
import { Collider } from './Collision/Collider';
import { Shape } from './Collision/Shape';
import { Entity } from './EntityComponentSystem/Entity';
import { CanvasDrawComponent } from './Drawing/CanvasDrawComponent';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
/**
 * Type guard for checking if something is an Actor
 * @param x
 */
export function isActor(x) {
    return x instanceof Actor;
}
/**
 * @hidden
 */
export class ActorImpl extends Entity {
    // #endregion
    /**
     * @param xOrConfig The starting x coordinate of the actor, or an option bag of [[ActorArgs]]
     * @param y         The starting y coordinate of the actor
     * @param width     The starting width of the actor
     * @param height    The starting height of the actor
     * @param color     The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
     * initial [[opacity]].
     */
    constructor(xOrConfig, y, width, height, color) {
        super();
        this._height = 0;
        this._width = 0;
        /**
         * Indicates whether the actor is physically in the viewport
         */
        this.isOffScreen = false;
        /**
         * The visibility of an actor
         */
        this.visible = true;
        /**
         * The opacity of an actor. Passing in a color in the [[constructor]] will use the
         * color's opacity.
         */
        this.opacity = 1;
        this.previousOpacity = 1;
        /**
         * Convenience reference to the global logger
         */
        this.logger = Logger.getInstance();
        /**
         * The scene that the actor is in
         */
        this.scene = null;
        /**
         * The parent of this actor
         */
        this.parent = null;
        /**
         * The children of this actor
         */
        this.children = [];
        this.frames = {};
        /**
         * Access to the current drawing for the actor, this can be
         * an [[Animation]], [[Sprite]], or [[Polygon]].
         * Set drawings with [[setDrawing]].
         */
        this.currentDrawing = null;
        /**
         * Draggable helper
         */
        this._draggable = false;
        this._dragging = false;
        this._pointerDragStartHandler = () => {
            this._dragging = true;
        };
        this._pointerDragEndHandler = () => {
            this._dragging = false;
        };
        this._pointerDragMoveHandler = (pe) => {
            if (this._dragging) {
                this.pos = pe.pointer.lastWorldPos;
            }
        };
        this._pointerDragLeaveHandler = (pe) => {
            if (this._dragging) {
                this.pos = pe.pointer.lastWorldPos;
            }
        };
        /**
         * Modify the current actor update pipeline.
         */
        this.traits = [];
        /**
         * Whether or not to enable the [[CapturePointer]] trait that propagates
         * pointer events to this actor
         */
        this.enableCapturePointer = false;
        /**
         * Configuration for [[CapturePointer]] trait
         */
        this.capturePointer = {
            captureMoveEvents: false,
            captureDragEvents: false
        };
        this._isKilled = false;
        // #region Events
        this._capturePointerEvents = [
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
        this._captureMoveEvents = [
            'pointermove',
            'pointerenter',
            'pointerleave',
            'pointerdragmove',
            'pointerdragenter',
            'pointerdragleave'
        ];
        this._captureDragEvents = [
            'pointerdragstart',
            'pointerdragend',
            'pointerdragmove',
            'pointerdragenter',
            'pointerdragleave'
        ];
        // initialize default options
        this._initDefaults();
        this.addComponent(new TransformComponent());
        this.addComponent(new CanvasDrawComponent((ctx, delta) => this.draw(ctx, delta)));
        let shouldInitializeBody = true;
        let collisionType = CollisionType.Passive;
        if (xOrConfig && typeof xOrConfig === 'object') {
            const config = xOrConfig;
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
                this.body = config.body;
            }
            if (config.anchor) {
                this.anchor = config.anchor;
            }
            if (config.collisionType) {
                collisionType = config.collisionType;
            }
        }
        // Body and collider bounds are still determined by actor width/height
        this._width = width || 0;
        this._height = height || 0;
        // Initialize default collider to be a box
        if (shouldInitializeBody) {
            this.body = new Body({
                collider: new Collider({
                    type: collisionType,
                    shape: Shape.Box(this._width, this._height, this.anchor)
                })
            });
        }
        // Position uses body to store values must be initialized after body
        this.pos.x = xOrConfig || 0;
        this.pos.y = y || 0;
        if (color) {
            this.color = color;
            // set default opacity of an actor to the color
            this.opacity = color.a;
        }
        // Build default pipeline
        this.traits.push(new Traits.TileMapCollisionDetection());
        this.traits.push(new Traits.OffscreenCulling());
        this.traits.push(new Traits.CapturePointer());
        // Build the action queue
        this.actionQueue = new ActionQueue(this);
        this.actions = new ActionContext(this);
    }
    /**
     * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
     * acceleration, mass, inertia, etc.
     */
    get body() {
        return this._body;
    }
    set body(body) {
        this._body = body;
        this._body.actor = this;
    }
    /**
     * Gets the position vector of the actor in pixels
     */
    get pos() {
        return this.body.pos;
    }
    /**
     * Sets the position vector of the actor in pixels
     */
    set pos(thePos) {
        this.body.pos.setTo(thePos.x, thePos.y);
    }
    /**
     * Gets the position vector of the actor from the last frame
     */
    get oldPos() {
        return this.body.oldPos;
    }
    /**
     * Sets the position vector of the actor in the last frame
     */
    set oldPos(thePos) {
        this.body.oldPos.setTo(thePos.x, thePos.y);
    }
    /**
     * Gets the velocity vector of the actor in pixels/sec
     */
    get vel() {
        return this.body.vel;
    }
    /**
     * Sets the velocity vector of the actor in pixels/sec
     */
    set vel(theVel) {
        this.body.vel.setTo(theVel.x, theVel.y);
    }
    /**
     * Gets the velocity vector of the actor from the last frame
     */
    get oldVel() {
        return this.body.oldVel;
    }
    /**
     * Sets the velocity vector of the actor from the last frame
     */
    set oldVel(theVel) {
        this.body.oldVel.setTo(theVel.x, theVel.y);
    }
    /**
     * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
     * useful to simulate a gravitational effect.
     */
    get acc() {
        return this.body.acc;
    }
    /**
     * Sets the acceleration vector of teh actor in pixels/second/second
     */
    set acc(theAcc) {
        this.body.acc.setTo(theAcc.x, theAcc.y);
    }
    /**
     * Sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
     */
    set oldAcc(theAcc) {
        this.body.oldAcc.setTo(theAcc.x, theAcc.y);
    }
    /**
     * Gets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
     */
    get oldAcc() {
        return this.body.oldAcc;
    }
    /**
     * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
     */
    get rotation() {
        return this.body.rotation;
    }
    /**
     * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
     */
    set rotation(theAngle) {
        this.body.rotation = theAngle;
    }
    /**
     * Gets the rotational velocity of the actor in radians/second
     */
    get rx() {
        return this.body.rx;
    }
    /**
     * Sets the rotational velocity of the actor in radians/sec
     */
    set rx(angularVelocity) {
        this.body.rx = angularVelocity;
    }
    /**
     * Gets the scale vector of the actor
     * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
     */
    get scale() {
        return this.body.scale;
    }
    /**
     * Sets the scale vector of the actor for
     * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
     */
    set scale(scale) {
        this.body.scale = scale;
    }
    /**
     * Gets the old scale of the actor last frame
     * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
     */
    get oldScale() {
        return this.body.oldScale;
    }
    /**
     * Sets the the old scale of the actor last frame
     * @obsolete ex.Actor.scale will be removed in v0.25.0, set width and height directly in constructor
     */
    set oldScale(scale) {
        this.body.oldScale = scale;
    }
    /**
     * Gets the x scalar velocity of the actor in scale/second
     * @obsolete ex.Actor.sx will be removed in v0.25.0, set width and height directly in constructor
     */
    get sx() {
        return this.body.sx;
    }
    /**
     * Sets the x scalar velocity of the actor in scale/second
     * @obsolete ex.Actor.sx will be removed in v0.25.0, set width and height directly in constructor
     */
    set sx(scalePerSecondX) {
        this.body.sx = scalePerSecondX;
    }
    /**
     * Gets the y scalar velocity of the actor in scale/second
     * @obsolete ex.Actor.sy will be removed in v0.25.0, set width and height directly in constructor
     */
    get sy() {
        return this.body.sy;
    }
    /**
     * Sets the y scale velocity of the actor in scale/second
     * @obsolete ex.Actor.sy will be removed in v0.25.0, set width and height directly in constructor
     */
    set sy(scalePerSecondY) {
        this.body.sy = scalePerSecondY;
    }
    get draggable() {
        return this._draggable;
    }
    set draggable(isDraggable) {
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
    }
    /**
     * Sets the color of the actor. A rectangle of this color will be
     * drawn if no [[Drawable]] is specified as the actors drawing.
     *
     * The default is `null` which prevents a rectangle from being drawn.
     */
    get color() {
        return this._color;
    }
    set color(v) {
        this._color = v.clone();
    }
    /**
     * `onInitialize` is called before the first update of the actor. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    onInitialize(_engine) {
        // Override me
    }
    /**
     * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * @internal
     */
    _initialize(engine) {
        super._initialize(engine);
        for (const child of this.children) {
            child._initialize(engine);
        }
    }
    _initDefaults() {
        this.anchor = Actor.defaults.anchor.clone();
    }
    _checkForPointerOptIn(eventName) {
        if (eventName) {
            const normalized = eventName.toLowerCase();
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
    }
    on(eventName, handler) {
        this._checkForPointerOptIn(eventName);
        super.on(eventName, handler);
    }
    once(eventName, handler) {
        this._checkForPointerOptIn(eventName);
        super.once(eventName, handler);
    }
    off(eventName, handler) {
        super.off(eventName, handler);
    }
    // #endregion
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _prekill handler for [[onPreKill]] lifecycle event
     * @internal
     */
    _prekill(_scene) {
        super.emit('prekill', new PreKillEvent(this));
        this.onPreKill(_scene);
    }
    /**
     * Safe to override onPreKill lifecycle event handler. Synonymous with `.on('prekill', (evt) =>{...})`
     *
     * `onPreKill` is called directly before an actor is killed and removed from its current [[Scene]].
     */
    onPreKill(_scene) {
        // Override me
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _prekill handler for [[onPostKill]] lifecycle event
     * @internal
     */
    _postkill(_scene) {
        super.emit('postkill', new PostKillEvent(this));
        this.onPostKill(_scene);
    }
    /**
     * Safe to override onPostKill lifecycle event handler. Synonymous with `.on('postkill', (evt) => {...})`
     *
     * `onPostKill` is called directly after an actor is killed and remove from its current [[Scene]].
     */
    onPostKill(_scene) {
        // Override me
    }
    /**
     * If the current actor is a member of the scene, this will remove
     * it from the scene graph. It will no longer be drawn or updated.
     */
    kill() {
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
    }
    /**
     * If the current actor is killed, it will now not be killed.
     */
    unkill() {
        this._isKilled = false;
    }
    /**
     * Indicates wether the actor has been killed.
     */
    isKilled() {
        return this._isKilled;
    }
    /**
     * Adds a child actor to this actor. All movement of the child actor will be
     * relative to the parent actor. Meaning if the parent moves the child will
     * move with it.
     * @param actor The child actor to add
     */
    add(actor) {
        actor.body.collider.type = CollisionType.PreventCollision;
        if (Util.addItemToArray(actor, this.children)) {
            actor.parent = this;
            if (this.scene) {
                this.scene.world.add(actor);
            }
        }
    }
    /**
     * Removes a child actor from this actor.
     * @param actor The child actor to remove
     */
    remove(actor) {
        if (Util.removeItemFromArray(actor, this.children)) {
            actor.parent = null;
        }
    }
    setDrawing(key) {
        key = key.toString();
        if (this.currentDrawing !== this.frames[key]) {
            if (this.frames[key] != null) {
                this.frames[key].reset();
                this.currentDrawing = this.frames[key];
            }
            else {
                Logger.getInstance().error(`the specified drawing key ${key} does not exist`);
            }
        }
        if (this.currentDrawing && this.currentDrawing instanceof Animation) {
            this.currentDrawing.tick(0);
        }
    }
    addDrawing() {
        if (arguments.length === 2) {
            this.frames[arguments[0]] = arguments[1];
            if (!this.currentDrawing) {
                this.currentDrawing = arguments[1];
            }
        }
        else {
            if (arguments[0] instanceof Sprite) {
                this.addDrawing('default', arguments[0]);
            }
            if (arguments[0] instanceof Texture) {
                this.addDrawing('default', arguments[0].asSprite());
            }
        }
    }
    get z() {
        return this.getZIndex();
    }
    set z(newZ) {
        this.setZIndex(newZ);
    }
    /**
     * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     * @deprecated Use actor.z
     */
    getZIndex() {
        return this.components.transform.z;
    }
    /**
     * Sets the z-index of an actor and updates it in the drawing list for the scene.
     * The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     * @param newIndex new z-index to assign
     * @deprecated Use actor.z
     */
    setZIndex(newIndex) {
        this.components.transform.z = newIndex;
    }
    /**
     * Get the center point of an actor
     */
    get center() {
        return new Vector(this.pos.x + this.width / 2 - this.anchor.x * this.width, this.pos.y + this.height / 2 - this.anchor.y * this.height);
    }
    get width() {
        return this._width * this.getGlobalScale().x;
    }
    set width(width) {
        this._width = width / this.scale.x;
        this.body.collider.shape = Shape.Box(this._width, this._height, this.anchor);
        this.body.markCollisionShapeDirty();
    }
    get height() {
        return this._height * this.getGlobalScale().y;
    }
    set height(height) {
        this._height = height / this.scale.y;
        this.body.collider.shape = Shape.Box(this._width, this._height, this.anchor);
        this.body.markCollisionShapeDirty();
    }
    /**
     * Gets this actor's rotation taking into account any parent relationships
     *
     * @returns Rotation angle in radians
     */
    getWorldRotation() {
        if (!this.parent) {
            return this.rotation;
        }
        return this.rotation + this.parent.getWorldRotation();
    }
    /**
     * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
     *
     * @returns Position in world coordinates
     */
    getWorldPos() {
        if (!this.parent) {
            return this.pos.clone();
        }
        // collect parents
        const parents = [];
        let root = this;
        parents.push(this);
        // find parents
        while (root.parent) {
            root = root.parent;
            parents.push(root);
        }
        // calculate position
        const x = parents.reduceRight((px, p) => {
            if (p.parent) {
                return px + p.pos.x * p.getGlobalScale().x;
            }
            return px + p.pos.x;
        }, 0);
        const y = parents.reduceRight((py, p) => {
            if (p.parent) {
                return py + p.pos.y * p.getGlobalScale().y;
            }
            return py + p.pos.y;
        }, 0);
        // rotate around root anchor
        const ra = root.getWorldPos(); // 10, 10
        const r = this.getWorldRotation();
        return new Vector(x, y).rotate(r, ra);
    }
    /**
     * Gets the global scale of the Actor
     */
    getGlobalScale() {
        if (!this.parent) {
            return new Vector(this.scale.x, this.scale.y);
        }
        const parentScale = this.parent.getGlobalScale();
        return new Vector(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
    }
    // #region Collision
    /**
     * Tests whether the x/y specified are contained in the actor
     * @param x  X coordinate to test (in world coordinates)
     * @param y  Y coordinate to test (in world coordinates)
     * @param recurse checks whether the x/y are contained in any child actors (if they exist).
     */
    contains(x, y, recurse = false) {
        // These shenanigans are to handle child actor containment,
        // the only time getWorldPos and pos are different is a child actor
        const childShift = this.getWorldPos().sub(this.pos);
        const containment = this.body.collider.bounds.translate(childShift).contains(new Vector(x, y));
        if (recurse) {
            return (containment ||
                this.children.some((child) => {
                    return child.contains(x, y, true);
                }));
        }
        return containment;
    }
    /**
     * Returns true if the two actor.body.collider.shape's surfaces are less than or equal to the distance specified from each other
     * @param actor     Actor to test
     * @param distance  Distance in pixels to test
     */
    within(actor, distance) {
        return this.body.collider.shape.getClosestLineBetween(actor.body.collider.shape).getLength() <= distance;
    }
    // #endregion
    // #region Update
    /**
     * Called by the Engine, updates the state of the actor
     * @param engine The reference to the current game engine
     * @param delta  The time elapsed since the last update in milliseconds
     */
    update(engine, delta) {
        this._initialize(engine);
        this._preupdate(engine, delta);
        // Tick animations
        const drawing = this.currentDrawing;
        if (drawing && drawing instanceof Animation) {
            drawing.tick(delta, engine.stats.currFrame.id);
        }
        // Update action queue
        this.actionQueue.update(delta);
        // Update color only opacity
        if (this.color) {
            this.color.a = this.opacity;
        }
        if (this.opacity === 0) {
            this.visible = false;
        }
        // capture old transform
        this.body.captureOldTransform();
        // Run Euler integration
        this.body.integrate(delta);
        // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
        for (const trait of this.traits) {
            trait.update(this, engine, delta);
        }
        // Update child actors
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update(engine, delta);
        }
        this._postupdate(engine, delta);
    }
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an actor is updated.
     */
    onPreUpdate(_engine, _delta) {
        // Override me
    }
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an actor is updated.
     */
    onPostUpdate(_engine, _delta) {
        // Override me
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    _preupdate(engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    _postupdate(engine, delta) {
        this.emit('postupdate', new PreUpdateEvent(engine, delta, this));
        this.onPostUpdate(engine, delta);
    }
    // endregion
    // #region Drawing
    /**
     * Called by the Engine, draws the actor to the screen
     * @param ctx   The rendering context
     * @param delta The time since the last draw in milliseconds
     */
    draw(ctx, delta) {
        // translate canvas by anchor offset
        ctx.save();
        ctx.translate(-(this._width * this.anchor.x), -(this._height * this.anchor.y));
        this._predraw(ctx, delta);
        if (this.currentDrawing) {
            const drawing = this.currentDrawing;
            // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
            const offsetX = (this._width - drawing.width * drawing.scale.x) * this.anchor.x;
            const offsetY = (this._height - drawing.height * drawing.scale.y) * this.anchor.y;
            this.currentDrawing.draw({ ctx, x: offsetX, y: offsetY, opacity: this.opacity });
        }
        else {
            if (this.color && this.body && this.body.collider && this.body.collider.shape) {
                this.body.collider.shape.draw(ctx, this.color, new Vector(0, 0));
            }
        }
        ctx.restore();
        this._postdraw(ctx, delta);
    }
    /**
     * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('predraw', (evt) =>{...})`
     *
     * `onPreDraw` is called directly before an actor is drawn, but after local transforms are made.
     */
    onPreDraw(_ctx, _delta) {
        // Override me
    }
    /**
     * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('postdraw', (evt) =>{...})`
     *
     * `onPostDraw` is called directly after an actor is drawn, and before local transforms are removed.
     */
    onPostDraw(_ctx, _delta) {
        // Override me
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _predraw handler for [[onPreDraw]] lifecycle event
     * @internal
     */
    _predraw(ctx, delta) {
        this.emit('predraw', new PreDrawEvent(ctx, delta, this));
        this.onPreDraw(ctx, delta);
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _postdraw handler for [[onPostDraw]] lifecycle event
     * @internal
     */
    _postdraw(ctx, delta) {
        this.emit('postdraw', new PreDrawEvent(ctx, delta, this));
        this.onPostDraw(ctx, delta);
    }
    /**
     * Called by the Engine, draws the actors debugging to the screen
     * @param ctx The rendering context
     */
    /* istanbul ignore next */
    debugDraw(ctx) {
        this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));
        this.body.collider.debugDraw(ctx);
        // Draw actor bounding box
        const bb = this.body.collider.localBounds.translate(this.getWorldPos());
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
        for (let j = 0; j < this.traits.length; j++) {
            if (this.traits[j] instanceof Traits.OffscreenCulling) {
                this.traits[j].cullingBox.debugDraw(ctx); // eslint-disable-line
            }
        }
        // Unit Circle debug draw
        ctx.strokeStyle = Color.Yellow.toString();
        ctx.beginPath();
        const radius = Math.min(this.width, this.height);
        ctx.arc(this.getWorldPos().x, this.getWorldPos().y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        const ticks = {
            '0 Pi': 0,
            'Pi/2': Math.PI / 2,
            Pi: Math.PI,
            '3/2 Pi': (3 * Math.PI) / 2
        };
        const oldFont = ctx.font;
        for (const tick in ticks) {
            ctx.fillStyle = Color.Yellow.toString();
            ctx.font = '14px';
            ctx.textAlign = 'center';
            ctx.fillText(tick, this.getWorldPos().x + Math.cos(ticks[tick]) * (radius + 10), this.getWorldPos().y + Math.sin(ticks[tick]) * (radius + 10));
        }
        ctx.font = oldFont;
        // Draw child actors
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].debugDraw(ctx);
        }
        this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
    }
    /**
     * Returns the full array of ancestors
     */
    getAncestors() {
        const path = [this];
        let currentActor = this;
        let parent;
        while ((parent = currentActor.parent)) {
            currentActor = parent;
            path.push(currentActor);
        }
        return path.reverse();
    }
}
// #region Properties
/**
 * Indicates the next id to be set
 */
ActorImpl.defaults = {
    anchor: Vector.Half
};
__decorate([
    obsolete({ message: 'ex.Actor.sx will be removed in v0.25.0', alternateMethod: 'Set width and height directly in constructor' })
], ActorImpl.prototype, "sx", null);
__decorate([
    obsolete({ message: 'ex.Actor.sy will be removed in v0.25.0', alternateMethod: 'Set width and height directly in constructor' })
], ActorImpl.prototype, "sy", null);
/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events,
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a [[Scene]] for it to be drawn to the screen.
 */
export class Actor extends Configurable(ActorImpl) {
    constructor(xOrConfig, y, width, height, color) {
        super(xOrConfig, y, width, height, color);
    }
}
//# sourceMappingURL=Actor.js.map