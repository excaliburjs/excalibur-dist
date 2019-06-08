import { Class } from './Class';
import { BoundingBox } from './Collision/BoundingBox';
import { Texture } from './Resources/Texture';
import { InitializeEvent, KillEvent, PreUpdateEvent, PostUpdateEvent, PreDrawEvent, PostDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent, PostCollisionEvent, PreCollisionEvent, CollisionStartEvent, CollisionEndEvent, PostKillEvent, PreKillEvent, GameEvent, ExitTriggerEvent, EnterTriggerEvent, EnterViewPortEvent, ExitViewPortEvent } from './Events';
import { PointerEvent, WheelEvent, PointerDragEvent } from './Input/Pointer';
import { Engine } from './Engine';
import { Color } from './Drawing/Color';
import { Sprite } from './Drawing/Sprite';
import { Trait } from './Interfaces/Trait';
import { Drawable } from './Interfaces/Drawable';
import { CanInitialize, CanUpdate, CanDraw, CanBeKilled } from './Interfaces/LifecycleEvents';
import { Scene } from './Scene';
import { Logger } from './Util/Log';
import { ActionContext } from './Actions/ActionContext';
import { ActionQueue } from './Actions/Action';
import { Vector } from './Algebra';
import { CollisionShape } from './Collision/CollisionShape';
import { Body } from './Collision/Body';
import { Side } from './Collision/Side';
import { Eventable } from './Interfaces/Evented';
import { Actionable } from './Actions/Actionable';
import * as Traits from './Traits/Index';
import * as Events from './Events';
import { PointerEvents } from './Interfaces/PointerEvents';
import { CollisionType } from './Collision/CollisionType';
export declare function isActor(x: any): x is Actor;
/**
 * [[include:Constructors.md]]
 */
export interface ActorArgs extends Partial<ActorImpl> {
    width?: number;
    height?: number;
    pos?: Vector;
    vel?: Vector;
    acc?: Vector;
    rotation?: number;
    rx?: number;
    z?: number;
    color?: Color;
    visible?: boolean;
    body?: Body;
}
export interface ActorDefaults {
    anchor: Vector;
}
/**
 * @hidden
 */
export declare class ActorImpl extends Class implements Actionable, Eventable, PointerEvents, CanInitialize, CanUpdate, CanDraw, CanBeKilled {
    /**
     * Indicates the next id to be set
     */
    static defaults: ActorDefaults;
    /**
     * Indicates the next id to be set
     */
    static maxId: number;
    /**
     * The unique identifier for the actor
     */
    id: number;
    /**
     * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
     * acceleration, mass, inertia, etc.
     */
    body: Body;
    private _body;
    /**
     * Gets the collision geometry shape to use for collision possible options are [Circle|circles], [ConvexPolygon|polygons], and
     * [Edge|edges].
     * @obsolete Use Actor.body.collider.shape, collisionArea will be removed in v0.24.0
     */
    /**
    * Gets the collision geometry shape to use for collision possible options are [Circle|circles], [ConvexPolygon|polygons], and
    * [Edge|edges].
    * @obsolete use Actor.body.collider.shape, collisionArea will be removed in v0.24.0
    */
    collisionArea: CollisionShape;
    /**
     * Gets the x position of the actor relative to it's parent (if any)
     * @obsolete ex.Actor.x will be removed in v0.24.0, use ex.Actor.pos.x
     */
    /**
    * Sets the x position of the actor relative to it's parent (if any)
    * @obsolete ex.Actor.x will be removed in v0.24.0, use ex.Actor.pos.x
    */
    x: number;
    /**
     * Gets the y position of the actor relative to it's parent (if any)
     * @obsolete ex.Actor.y will be removed in v0.24.0, use ex.Actor.pos.y
     */
    /**
    * Sets the y position of the actor relative to it's parent (if any)
    * @obsolete ex.Actor.y will be removed in v0.24.0, use ex.Actor.pos.y
    */
    y: number;
    /**
     * Gets the position vector of the actor in pixels
     */
    /**
    * Sets the position vector of the actor in pixels
    */
    pos: Vector;
    /**
     * Gets the position vector of the actor from the last frame
     */
    /**
    * Sets the position vector of the actor in the last frame
    */
    oldPos: Vector;
    /**
     * Gets the velocity vector of the actor in pixels/sec
     */
    /**
    * Sets the velocity vector of the actor in pixels/sec
    */
    vel: Vector;
    /**
     * Gets the velocity vector of the actor from the last frame
     */
    /**
    * Sets the velocity vector of the actor from the last frame
    */
    oldVel: Vector;
    /**
     * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
     * useful to simulate a gravitational effect.
     */
    /**
    * Sets the acceleration vector of teh actor in pixels/second/second
    */
    acc: Vector;
    /**
     * Sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
     */
    /**
    * Gets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
    */
    oldAcc: Vector;
    /**
     * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
     */
    /**
    * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
    */
    rotation: number;
    /**
     * Gets the rotational velocity of the actor in radians/second
     */
    /**
    * Sets the rotational velocity of the actor in radians/sec
    */
    rx: number;
    /**
     * Gets the current torque applied to the actor. Torque can be thought of as rotational force
     * @obsolete ex.Actor.torque will be removed in v0.24.0, use ex.Actor.body.torque
     */
    /**
    * Sets the current torque applied to the actor. Torque can be thought of as rotational force
    * @obsolete ex.Actor.torque will be removed in v0.24.0, use ex.Actor.body.torque
    */
    torque: number;
    /**
     * Get the current mass of the actor, mass can be thought of as the resistance to acceleration.
     * @obsolete ex.Actor.mass will be removed in v0.24.0, use ex.Actor.body.collider.mass
     */
    /**
    * Sets the mass of the actor, mass can be thought of as the resistance to acceleration.
    * @obsolete ex.Actor.mass will be removed in v0.24.0, use ex.Actor.body.collider.mass
    */
    mass: number;
    /**
     * Gets the current moment of inertia, moi can be thought of as the resistance to rotation.
     * @obsolete ex.Actor.moi will be removed in v0.24.0, use ex.Actor.body.collider.inertia
     */
    /**
    * Sets the current moment of inertia, moi can be thought of as the resistance to rotation.
    * @obsolete ex.Actor.moi will be removed in v0.24.0, use ex.Actor.body.collider.inertia
    */
    moi: number;
    /**
     * Gets the coefficient of friction on this actor, this can be thought of as how sticky or slippery an object is.
     * @obsolete ex.Actor.friction will be removed in v0.24.0, use ex.Actor.body.collider.friction
     */
    /**
    * Sets the coefficient of friction of this actor, this can ve thought of as how stick or slippery an object is.
    */
    friction: number;
    /**
     * Gets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
     * as bounciness.
     * @obsolete ex.Actor.restitution will be removed in v0.24.0, use ex.Actor.body.collider.restitution
     */
    /**
    * Sets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
    * as bounciness.
    * @obsolete ex.Actor.restitution will be removed in v0.24.0, use ex.Actor.body.collider.restitution
    */
    restitution: number;
    /**
     * The anchor to apply all actor related transformations like rotation,
     * translation, and scaling. By default the anchor is in the center of
     * the actor. By default it is set to the center of the actor (.5, .5)
     *
     * An anchor of (.5, .5) will ensure that drawings are centered.
     *
     * Use `anchor.setTo` to set the anchor to a different point using
     * values between 0 and 1. For example, anchoring to the top-left would be
     * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
     */
    anchor: Vector;
    private _height;
    private _width;
    /**
     * Gets the scale vector of the actor
     * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
     */
    /**
    * Sets the scale vector of the actor for
    * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
    */
    scale: Vector;
    /**
     * Gets the old scale of the actor last frame
     * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
     */
    /**
    * Sets the the old scale of the acotr last frame
    * @obsolete ex.Actor.scale will be removed in v0.24.0, set width and height directly in constructor
    */
    oldScale: Vector;
    /**
     * Gets the x scalar velocity of the actor in scale/second
     * @obsolete ex.Actor.sx will be removed in v0.24.0, set width and height directly in constructor
     */
    /**
    * Sets the x scalar velocity of the actor in scale/second
    * @obsolete ex.Actor.sx will be removed in v0.24.0, set width and height directly in constructor
    */
    sx: number;
    /**
     * Gets the y scalar velocity of the actor in scale/second
     * @obsolete ex.Actor.sy will be removed in v0.24.0, set width and height directly in constructor
     */
    /**
    * Sets the y scale velocity of the actor in scale/second
    * @obsolete ex.Actor.sy will be removed in v0.24.0, set width and height directly in constructor
    */
    sy: number;
    /**
     * Indicates whether the actor is physically in the viewport
     */
    isOffScreen: boolean;
    /**
     * The visibility of an actor
     */
    visible: boolean;
    /**
     * The opacity of an actor. Passing in a color in the [[constructor]] will use the
     * color's opacity.
     */
    opacity: number;
    previousOpacity: number;
    /**
     * Direct access to the actor's [[ActionQueue]]. Useful if you are building custom actions.
     */
    actionQueue: ActionQueue;
    /**
     * [[ActionContext|Action context]] of the actor. Useful for scripting actor behavior.
     */
    actions: ActionContext;
    /**
     * Convenience reference to the global logger
     */
    logger: Logger;
    /**
     * The scene that the actor is in
     */
    scene: Scene;
    /**
     * The parent of this actor
     */
    parent: Actor;
    /**
     * The children of this actor
     */
    children: Actor[];
    /**
     * Gets or sets the current collision type of this actor. By
     * default it is ([[CollisionType.PreventCollision]]).
     * @obsolete ex.Actor.collisionType will be removed in v0.24.0, use ex.Actor.body.collider.type
     */
    /**
    * Gets or sets the current collision type of this actor. By
    * default it is ([[CollisionType.PreventCollision]]).
    *  @obsolete ex.Actor.collisionType will be removed in v0.24.0, use ex.Actor.body.collider.type
    */
    collisionType: CollisionType;
    /**
     * @obsolete Legacy collision groups will be removed in v0.24.0, use [[Actor.body.collider.collisionGroup]]
     */
    collisionGroups: string[];
    private _collisionHandlers;
    private _isInitialized;
    frames: {
        [key: string]: Drawable;
    };
    private _effectsDirty;
    /**
     * Access to the current drawing for the actor, this can be
     * an [[Animation]], [[Sprite]], or [[Polygon]].
     * Set drawings with [[setDrawing]].
     */
    currentDrawing: Drawable;
    /**
     * Modify the current actor update pipeline.
     */
    traits: Trait[];
    /**
     * Sets the color of the actor. A rectangle of this color will be
     * drawn if no [[IDrawable]] is specified as the actors drawing.
     *
     * The default is `null` which prevents a rectangle from being drawn.
     */
    color: Color;
    private _color;
    /**
     * Whether or not to enable the [[CapturePointer]] trait that propagates
     * pointer events to this actor
     */
    enableCapturePointer: boolean;
    /**
     * Configuration for [[CapturePointer]] trait
     */
    capturePointer: Traits.CapturePointerConfig;
    private _zIndex;
    private _isKilled;
    private _opacityFx;
    /**
     * @param x       The starting x coordinate of the actor
     * @param y       The starting y coordinate of the actor
     * @param width   The starting width of the actor
     * @param height  The starting height of the actor
     * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
     * initial [[opacity]].
     */
    constructor(xOrConfig?: number | ActorArgs, y?: number, width?: number, height?: number, color?: Color);
    /**
     * `onInitialize` is called before the first update of the actor. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    onInitialize(_engine: Engine): void;
    /**
     * Gets whether the actor is Initialized
     */
    readonly isInitialized: boolean;
    /**
     * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * @internal
     */
    _initialize(engine: Engine): void;
    private _initDefaults;
    private _capturePointerEvents;
    private _captureMoveEvents;
    private _captureDragEvents;
    private _checkForPointerOptIn;
    on(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
    on(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
    /**
     * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
     *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
     *  the the pair separates and collides again.
     * Use cases for the **collisionstart** event may be detecting when an actor has touched a surface
     * (like landing) or if a item has been touched and needs to be picked up.
     */
    on(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
    /**
     * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
     * This event will not fire again until another collision and separation.
     *
     * Use cases for the **collisionend** event might be to detect when an actor has left a surface
     * (like jumping) or has left an area.
     */
    on(eventName: Events.collisionend, handler: (event: CollisionEndEvent) => void): void;
    /**
     * The **precollision** event is fired **every frame** where a collision pair is found and two
     * bodies are intersecting.
     *
     * This event is useful for building in custom collision resolution logic in Passive-Passive or
     * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
     * richochet of the ball depending on which side of the paddle you hit.
     */
    on(eventName: Events.precollision, handler: (event: PreCollisionEvent) => void): void;
    /**
     * The **postcollision** event is fired for **every frame** where collision resolution was performed.
     * Collision resolution is when two bodies influence each other and cause a response like bouncing
     * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
     * type collision pairs.
     *
     * Post collision would be useful if you need to know that collision resolution is happening or need to
     * tweak the default resolution.
     */
    on(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
    on(eventName: Events.kill, handler: (event: KillEvent) => void): void;
    on(eventName: Events.prekill, handler: (event: PreKillEvent) => void): void;
    on(eventName: Events.postkill, handler: (event: PostKillEvent) => void): void;
    on(eventName: Events.initialize, handler: (event: InitializeEvent) => void): void;
    on(eventName: Events.preupdate, handler: (event: PreUpdateEvent) => void): void;
    on(eventName: Events.postupdate, handler: (event: PostUpdateEvent) => void): void;
    on(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
    on(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
    on(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
    on(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
    on(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
    on(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
    on(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
    on(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
    on(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
    on(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
    on(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
    on(eventName: Events.pointerdragstart, handler: (event: PointerDragEvent) => void): void;
    on(eventName: Events.pointerdragend, handler: (event: PointerDragEvent) => void): void;
    on(eventName: Events.pointerdragenter, handler: (event: PointerDragEvent) => void): void;
    on(eventName: Events.pointerdragleave, handler: (event: PointerDragEvent) => void): void;
    on(eventName: Events.pointerdragmove, handler: (event: PointerDragEvent) => void): void;
    on(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
    on(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
    on(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
    once(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
    once(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
    /**
     * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
     *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
     *  the the pair separates and collides again.
     * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
     * (like landing) or if a item has been touched and needs to be picked up.
     */
    once(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
    /**
     * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
     * This event will not fire again until another collision and separation.
     *
     * Use cases for the **collisionend** event might be to detect when an actor has left a surface
     * (like jumping) or has left an area.
     */
    once(eventName: Events.collisionend, handler: (event: CollisionEndEvent) => void): void;
    /**
     * The **precollision** event is fired **every frame** where a collision pair is found and two
     * bodies are intersecting.
     *
     * This event is useful for building in custom collision resolution logic in Passive-Passive or
     * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
     * richochet of the ball depending on which side of the paddle you hit.
     */
    once(eventName: Events.precollision, handler: (event: PreCollisionEvent) => void): void;
    /**
     * The **postcollision** event is fired for **every frame** where collision resolution was performed.
     * Collision resolution is when two bodies influence each other and cause a response like bouncing
     * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
     * type collision pairs.
     *
     * Post collision would be useful if you need to know that collision resolution is happening or need to
     * tweak the default resolution.
     */
    once(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
    once(eventName: Events.kill, handler: (event: KillEvent) => void): void;
    once(eventName: Events.postkill, handler: (event: PostKillEvent) => void): void;
    once(eventName: Events.prekill, handler: (event: PreKillEvent) => void): void;
    once(eventName: Events.initialize, handler: (event: InitializeEvent) => void): void;
    once(eventName: Events.preupdate, handler: (event: PreUpdateEvent) => void): void;
    once(eventName: Events.postupdate, handler: (event: PostUpdateEvent) => void): void;
    once(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
    once(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
    once(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
    once(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
    once(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
    once(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
    once(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
    once(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
    once(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
    once(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
    once(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
    once(eventName: Events.pointerdragstart, handler: (event: PointerDragEvent) => void): void;
    once(eventName: Events.pointerdragend, handler: (event: PointerDragEvent) => void): void;
    once(eventName: Events.pointerdragenter, handler: (event: PointerDragEvent) => void): void;
    once(eventName: Events.pointerdragleave, handler: (event: PointerDragEvent) => void): void;
    once(eventName: Events.pointerdragmove, handler: (event: PointerDragEvent) => void): void;
    once(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
    once(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
    once(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
    off(eventName: Events.exittrigger, handler?: (event: ExitTriggerEvent) => void): void;
    off(eventName: Events.entertrigger, handler?: (event: EnterTriggerEvent) => void): void;
    /**
     * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
     *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
     *  the the pair separates and collides again.
     * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
     * (like landing) or if a item has been touched and needs to be picked up.
     */
    off(eventName: Events.collisionstart, handler?: (event: CollisionStartEvent) => void): void;
    /**
     * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
     * This event will not fire again until another collision and separation.
     *
     * Use cases for the **collisionend** event might be to detect when an actor has left a surface
     * (like jumping) or has left an area.
     */
    off(eventName: Events.collisionend, handler?: (event: CollisionEndEvent) => void): void;
    /**
     * The **precollision** event is fired **every frame** where a collision pair is found and two
     * bodies are intersecting.
     *
     * This event is useful for building in custom collision resolution logic in Passive-Passive or
     * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
     * richochet of the ball depending on which side of the paddle you hit.
     */
    off(eventName: Events.precollision, handler?: (event: PreCollisionEvent) => void): void;
    /**
     * The **postcollision** event is fired for **every frame** where collision resolution was performed.
     * Collision resolution is when two bodies influence each other and cause a response like bouncing
     * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
     * type collision pairs.
     *
     * Post collision would be useful if you need to know that collision resolution is happening or need to
     * tweak the default resolution.
     */
    off(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
    off(eventName: Events.pointerup, handler?: (event: PointerEvent) => void): void;
    off(eventName: Events.pointerdown, handler?: (event: PointerEvent) => void): void;
    off(eventName: Events.pointerenter, handler?: (event: PointerEvent) => void): void;
    off(eventName: Events.pointerleave, handler?: (event: PointerEvent) => void): void;
    off(eventName: Events.pointermove, handler?: (event: PointerEvent) => void): void;
    off(eventName: Events.pointercancel, handler?: (event: PointerEvent) => void): void;
    off(eventName: Events.pointerwheel, handler?: (event: WheelEvent) => void): void;
    off(eventName: Events.pointerdragstart, handler?: (event: PointerDragEvent) => void): void;
    off(eventName: Events.pointerdragend, handler?: (event: PointerDragEvent) => void): void;
    off(eventName: Events.pointerdragenter, handler?: (event: PointerDragEvent) => void): void;
    off(eventName: Events.pointerdragleave, handler?: (event: PointerDragEvent) => void): void;
    off(eventName: Events.pointerdragmove, handler?: (event: PointerDragEvent) => void): void;
    off(eventName: Events.prekill, handler?: (event: PreKillEvent) => void): void;
    off(eventName: Events.postkill, handler?: (event: PostKillEvent) => void): void;
    off(eventName: Events.initialize, handler?: (event: Events.InitializeEvent) => void): void;
    off(eventName: Events.postupdate, handler?: (event: Events.PostUpdateEvent) => void): void;
    off(eventName: Events.preupdate, handler?: (event: Events.PreUpdateEvent) => void): void;
    off(eventName: Events.postdraw, handler?: (event: Events.PostDrawEvent) => void): void;
    off(eventName: Events.predraw, handler?: (event: Events.PreDrawEvent) => void): void;
    off(eventName: Events.enterviewport, handler?: (event: EnterViewPortEvent) => void): void;
    off(eventName: Events.exitviewport, handler?: (event: ExitViewPortEvent) => void): void;
    off(eventName: string, handler?: (event: GameEvent<Actor>) => void): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _prekill handler for [[onPreKill]] lifecycle event
     * @internal
     */
    _prekill(_scene: Scene): void;
    /**
     * Safe to override onPreKill lifecycle event handler. Synonymous with `.on('prekill', (evt) =>{...})`
     *
     * `onPreKill` is called directly before an actor is killed and removed from its current [[Scene]].
     */
    onPreKill(_scene: Scene): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _prekill handler for [[onPostKill]] lifecycle event
     * @internal
     */
    _postkill(_scene: Scene): void;
    /**
     * Safe to override onPostKill lifecycle event handler. Synonymous with `.on('postkill', (evt) => {...})`
     *
     * `onPostKill` is called directly after an actor is killed and remove from its current [[Scene]].
     */
    onPostKill(_scene: Scene): void;
    /**
     * If the current actor is a member of the scene, this will remove
     * it from the scene graph. It will no longer be drawn or updated.
     */
    kill(): void;
    /**
     * If the current actor is killed, it will now not be killed.
     */
    unkill(): void;
    /**
     * Indicates wether the actor has been killed.
     */
    isKilled(): boolean;
    /**
     * Adds a child actor to this actor. All movement of the child actor will be
     * relative to the parent actor. Meaning if the parent moves the child will
     * move with it.
     * @param actor The child actor to add
     */
    add(actor: Actor): void;
    /**
     * Removes a child actor from this actor.
     * @param actor The child actor to remove
     */
    remove(actor: Actor): void;
    /**
     * Sets the current drawing of the actor to the drawing corresponding to
     * the key.
     * @param key The key of the drawing
     */
    setDrawing(key: string): void;
    /**
     * Sets the current drawing of the actor to the drawing corresponding to
     * an `enum` key (e.g. `Animations.Left`)
     * @param key The `enum` key of the drawing
     */
    setDrawing(key: number): void;
    /**
     * Adds a whole texture as the "default" drawing. Set a drawing using [[setDrawing]].
     */
    addDrawing(texture: Texture): void;
    /**
     * Adds a whole sprite as the "default" drawing. Set a drawing using [[setDrawing]].
     */
    addDrawing(sprite: Sprite): void;
    /**
     * Adds a drawing to the list of available drawings for an actor. Set a drawing using [[setDrawing]].
     * @param key     The key to associate with a drawing for this actor
     * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]].
     */
    addDrawing(key: any, drawing: Drawable): void;
    z: number;
    /**
     * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     */
    getZIndex(): number;
    /**
     * Sets the z-index of an actor and updates it in the drawing list for the scene.
     * The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     * @param newIndex new z-index to assign
     */
    setZIndex(newIndex: number): void;
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
    addCollisionGroup(name: string): void;
    /**
     * Removes an actor from a collision group.
     * @param name The name of the collision group
     * @obsolete Use [[Actor.body.collider.collisionGroup]], legacy collisionGroups will be removed in v0.24.0
     */
    removeCollisionGroup(name: string): void;
    /**
     * Get the center point of an actor
     */
    getCenter(): Vector;
    /**
     * Get the center point of an actor
     */
    readonly center: Vector;
    width: number;
    /**
     * Gets the calculated width of an actor, factoring in scale
     */
    getWidth(): number;
    /**
     * Sets the width of an actor, factoring in the current scale
     */
    setWidth(width: number): void;
    height: number;
    /**
     * Gets the calculated height of an actor, factoring in scale
     */
    getHeight(): number;
    /**
     * Sets the height of an actor, factoring in the current scale
     */
    setHeight(height: number): void;
    /**
     * Gets the left edge of the actor
     */
    getLeft(): number;
    /**
     * Gets the right edge of the actor
     */
    getRight(): number;
    /**
     * Gets the top edge of the actor
     */
    getTop(): number;
    /**
     * Gets the bottom edge of the actor
     */
    getBottom(): number;
    /**
     * Gets this actor's rotation taking into account any parent relationships
     *
     * @returns Rotation angle in radians
     */
    getWorldRotation(): number;
    /**
     * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
     *
     * @returns Position in world coordinates
     */
    getWorldPos(): Vector;
    /**
     * Gets the global scale of the Actor
     */
    getGlobalScale(): Vector;
    /**
     * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
     */
    getBounds(rotated?: boolean): BoundingBox;
    /**
     * Returns the actor's [[BoundingBox]] relative to the actor's position.
     */
    getRelativeBounds(rotated?: boolean): BoundingBox;
    /**
     * Returns the actors unrotated geometry in world coordinates
     */
    getGeometry(): Vector[];
    /**
     * Return the actor's unrotated geometry relative to the actor's position
     */
    getRelativeGeometry(): Vector[];
    /**
     * Tests whether the x/y specified are contained in the actor
     * @param x  X coordinate to test (in world coordinates)
     * @param y  Y coordinate to test (in world coordinates)
     * @param recurse checks whether the x/y are contained in any child actors (if they exist).
     */
    contains(x: number, y: number, recurse?: boolean): boolean;
    /**
     * Returns the side of the collision based on the intersection
     * @param intersect The displacement vector returned by a collision
     * @obsolete Actor.getSideFromIntersect will be removed in v0.24.0, use [[BoundingBox.sideFromIntersection]]
     */
    getSideFromIntersect(intersect: Vector): Side;
    /**
     * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
     * @param actor The other actor to test
     * @obsolete Actor.collidesWithSide will be removed in v0.24.0, use [[Actor.bounds.intersectWithSide]]
     */
    collidesWithSide(actor: Actor): Side;
    /**
     * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
     * `null` when there is no collision;
     * @param actor The other actor to test
     * @obsolete Actor.collides will be removed in v0.24.0, use [[Actor.bounds.interesect]] to get boudings intersection,
     * or [[Actor.body.collider.collide]] to collide with another collider
     */
    collides(actor: Actor): Vector;
    /**
     * Register a handler to fire when this actor collides with another in a specified group
     * @param group The group name to listen for
     * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
     */
    onCollidesWith(group: string, func: (actor: Actor) => void): void;
    getCollisionHandlers(): {
        [key: string]: {
            (actor: Actor): void;
        }[];
    };
    /**
     * Removes all collision handlers for this group on this actor
     * @param group Group to remove all handlers for on this actor.
     */
    removeCollidesWith(group: string): void;
    /**
     * Returns true if the two actor.body.collider.shape's surfaces are less than or equal to the distance specified from each other
     * @param actor     Actor to test
     * @param distance  Distance in pixels to test
     */
    within(actor: Actor, distance: number): boolean;
    private _getCalculatedAnchor;
    protected _reapplyEffects(drawing: Drawable): void;
    /**
     * Called by the Engine, updates the state of the actor
     * @param engine The reference to the current game engine
     * @param delta  The time elapsed since the last update in milliseconds
     */
    update(engine: Engine, delta: number): void;
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an actor is updated.
     */
    onPreUpdate(_engine: Engine, _delta: number): void;
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an actor is updated.
     */
    onPostUpdate(_engine: Engine, _delta: number): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    _preupdate(engine: Engine, delta: number): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    _postupdate(engine: Engine, delta: number): void;
    /**
     * Called by the Engine, draws the actor to the screen
     * @param ctx   The rendering context
     * @param delta The time since the last draw in milliseconds
     */
    draw(ctx: CanvasRenderingContext2D, delta: number): void;
    /**
     * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('predraw', (evt) =>{...})`
     *
     * `onPreDraw` is called directly before an actor is drawn, but after local transforms are made.
     */
    onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number): void;
    /**
     * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('postdraw', (evt) =>{...})`
     *
     * `onPostDraw` is called directly after an actor is drawn, and before local transforms are removed.
     */
    onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _predraw handler for [[onPreDraw]] lifecycle event
     * @internal
     */
    _predraw(ctx: CanvasRenderingContext2D, delta: number): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _postdraw handler for [[onPostDraw]] lifecycle event
     * @internal
     */
    _postdraw(ctx: CanvasRenderingContext2D, delta: number): void;
    /**
     * Called by the Engine, draws the actors debugging to the screen
     * @param ctx The rendering context
     */
    debugDraw(ctx: CanvasRenderingContext2D): void;
    /**
     * Returns the full array of ancestors
     */
    getAncestors(): Actor[];
}
declare const Actor_base: typeof ActorImpl;
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
export declare class Actor extends Actor_base {
    constructor();
    constructor(config?: ActorArgs);
    constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
}
export {};
