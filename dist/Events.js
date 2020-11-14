export var EventTypes;
(function (EventTypes) {
    EventTypes["Kill"] = "kill";
    EventTypes["PreKill"] = "prekill";
    EventTypes["PostKill"] = "postkill";
    EventTypes["PreDraw"] = "predraw";
    EventTypes["PostDraw"] = "postdraw";
    EventTypes["PreDebugDraw"] = "predebugdraw";
    EventTypes["PostDebugDraw"] = "postdebugdraw";
    EventTypes["PreUpdate"] = "preupdate";
    EventTypes["PostUpdate"] = "postupdate";
    EventTypes["PreFrame"] = "preframe";
    EventTypes["PostFrame"] = "postframe";
    EventTypes["PreCollision"] = "precollision";
    EventTypes["CollisionStart"] = "collisionstart";
    EventTypes["CollisionEnd"] = "collisionend";
    EventTypes["PostCollision"] = "postcollision";
    EventTypes["Initialize"] = "initialize";
    EventTypes["Activate"] = "activate";
    EventTypes["Deactivate"] = "deactivate";
    EventTypes["ExitViewport"] = "exitviewport";
    EventTypes["EnterViewport"] = "enterviewport";
    EventTypes["ExitTrigger"] = "exit";
    EventTypes["EnterTrigger"] = "enter";
    EventTypes["Connect"] = "connect";
    EventTypes["Disconnect"] = "disconnect";
    EventTypes["Button"] = "button";
    EventTypes["Axis"] = "axis";
    EventTypes["Subscribe"] = "subscribe";
    EventTypes["Unsubscribe"] = "unsubscribe";
    EventTypes["Visible"] = "visible";
    EventTypes["Hidden"] = "hidden";
    EventTypes["Start"] = "start";
    EventTypes["Stop"] = "stop";
    EventTypes["PointerUp"] = "pointerup";
    EventTypes["PointerDown"] = "pointerdown";
    EventTypes["PointerMove"] = "pointermove";
    EventTypes["PointerEnter"] = "pointerenter";
    EventTypes["PointerLeave"] = "pointerleave";
    EventTypes["PointerCancel"] = "pointercancel";
    EventTypes["PointerWheel"] = "pointerwheel";
    EventTypes["Up"] = "up";
    EventTypes["Down"] = "down";
    EventTypes["Move"] = "move";
    EventTypes["Enter"] = "enter";
    EventTypes["Leave"] = "leave";
    EventTypes["Cancel"] = "cancel";
    EventTypes["Wheel"] = "wheel";
    EventTypes["Press"] = "press";
    EventTypes["Release"] = "release";
    EventTypes["Hold"] = "hold";
    EventTypes["PointerDragStart"] = "pointerdragstart";
    EventTypes["PointerDragEnd"] = "pointerdragend";
    EventTypes["PointerDragEnter"] = "pointerdragenter";
    EventTypes["PointerDragLeave"] = "pointerdragleave";
    EventTypes["PointerDragMove"] = "pointerdragmove";
})(EventTypes || (EventTypes = {}));
/**
 * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
 * some events are unique to a type, others are not.
 *
 */
export class GameEvent {
    constructor() {
        this._bubbles = true;
    }
    /**
     * If set to false, prevents event from propagating to other actors. If true it will be propagated
     * to all actors that apply.
     */
    get bubbles() {
        return this._bubbles;
    }
    set bubbles(value) {
        this._bubbles = value;
    }
    /**
     * Prevents event from bubbling
     */
    stopPropagation() {
        this.bubbles = false;
    }
}
/**
 * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed.
 */
export class KillEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'prekill' event is emitted directly before an actor is killed.
 */
export class PreKillEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'postkill' event is emitted directly after the actor is killed.
 */
export class PostKillEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'start' event is emitted on engine when has started and is ready for interaction.
 */
export class GameStartEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
 */
export class GameStopEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
export class PreDrawEvent extends GameEvent {
    constructor(ctx, delta, target) {
        super();
        this.ctx = ctx;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
export class PostDrawEvent extends GameEvent {
    constructor(ctx, delta, target) {
        super();
        this.ctx = ctx;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
 */
export class PreDebugDrawEvent extends GameEvent {
    constructor(ctx, target) {
        super();
        this.ctx = ctx;
        this.target = target;
    }
}
/**
 * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
 */
export class PostDebugDrawEvent extends GameEvent {
    constructor(ctx, target) {
        super();
        this.ctx = ctx;
        this.target = target;
    }
}
/**
 * The 'preupdate' event is emitted on actors, scenes, camera, and engine before the update starts.
 */
export class PreUpdateEvent extends GameEvent {
    constructor(engine, delta, target) {
        super();
        this.engine = engine;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'postupdate' event is emitted on actors, scenes, camera, and engine after the update ends.
 */
export class PostUpdateEvent extends GameEvent {
    constructor(engine, delta, target) {
        super();
        this.engine = engine;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'preframe' event is emitted on the engine, before the frame begins.
 */
export class PreFrameEvent extends GameEvent {
    constructor(engine, prevStats) {
        super();
        this.engine = engine;
        this.prevStats = prevStats;
        this.target = engine;
    }
}
/**
 * The 'postframe' event is emitted on the engine, after a frame ends.
 */
export class PostFrameEvent extends GameEvent {
    constructor(engine, stats) {
        super();
        this.engine = engine;
        this.stats = stats;
        this.target = engine;
    }
}
/**
 * Event received when a gamepad is connected to Excalibur. [[Gamepads]] receives this event.
 */
export class GamepadConnectEvent extends GameEvent {
    constructor(index, gamepad) {
        super();
        this.index = index;
        this.gamepad = gamepad;
        this.target = gamepad;
    }
}
/**
 * Event received when a gamepad is disconnected from Excalibur. [[Gamepads]] receives this event.
 */
export class GamepadDisconnectEvent extends GameEvent {
    constructor(index, gamepad) {
        super();
        this.index = index;
        this.gamepad = gamepad;
        this.target = gamepad;
    }
}
/**
 * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
 */
export class GamepadButtonEvent extends GameEvent {
    /**
     * @param button  The Gamepad button
     * @param value   A numeric value between 0 and 1
     */
    constructor(button, value, target) {
        super();
        this.button = button;
        this.value = value;
        this.target = target;
    }
}
/**
 * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
 */
export class GamepadAxisEvent extends GameEvent {
    /**
     * @param axis  The Gamepad axis
     * @param value A numeric value between -1 and 1
     */
    constructor(axis, value, target) {
        super();
        this.axis = axis;
        this.value = value;
        this.target = target;
    }
}
/**
 * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by
 * [[EventDispatcher|event dispatchers]].
 */
export class SubscribeEvent extends GameEvent {
    constructor(topic, handler) {
        super();
        this.topic = topic;
        this.handler = handler;
    }
}
/**
 * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by
 * [[EventDispatcher|event dispatchers]].
 */
export class UnsubscribeEvent extends GameEvent {
    constructor(topic, handler) {
        super();
        this.topic = topic;
        this.handler = handler;
    }
}
/**
 * Event received by the [[Engine]] when the browser window is visible on a screen.
 */
export class VisibleEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * Event received by the [[Engine]] when the browser window is hidden from all screens.
 */
export class HiddenEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * Event thrown on an [[Actor|actor]] when a collision will occur this frame if it resolves
 */
export class PreCollisionEvent extends GameEvent {
    /**
     * @param actor         The actor the event was thrown on
     * @param other         The actor that will collided with the current actor
     * @param side          The side that will be collided with the current actor
     * @param intersection  Intersection vector
     */
    constructor(actor, other, side, intersection) {
        super();
        this.other = other;
        this.side = side;
        this.intersection = intersection;
        this.target = actor;
    }
    get actor() {
        return this.target;
    }
    set actor(actor) {
        this.target = actor;
    }
}
/**
 * Event thrown on an [[Actor|actor]] when a collision has been resolved (body reacted) this frame
 */
export class PostCollisionEvent extends GameEvent {
    /**
     * @param actor         The actor the event was thrown on
     * @param other         The actor that did collide with the current actor
     * @param side          The side that did collide with the current actor
     * @param intersection  Intersection vector
     */
    constructor(actor, other, side, intersection) {
        super();
        this.other = other;
        this.side = side;
        this.intersection = intersection;
        this.target = actor;
    }
    get actor() {
        return this.target;
    }
    set actor(actor) {
        this.target = actor;
    }
}
/**
 * Event thrown the first time an [[Actor|actor]] collides with another, after an actor is in contact normal collision events are fired.
 */
export class CollisionStartEvent extends GameEvent {
    /**
     *
     * @param actor
     * @param other
     * @param pair
     */
    constructor(actor, other, pair) {
        super();
        this.other = other;
        this.pair = pair;
        this.target = actor;
    }
    get actor() {
        return this.target;
    }
    set actor(actor) {
        this.target = actor;
    }
}
/**
 * Event thrown when the [[Actor|actor]] is no longer colliding with another
 */
export class CollisionEndEvent extends GameEvent {
    /**
     *
     */
    constructor(actor, other) {
        super();
        this.other = other;
        this.target = actor;
    }
    get actor() {
        return this.target;
    }
    set actor(actor) {
        this.target = actor;
    }
}
/**
 * Event thrown on an [[Actor]] and a [[Scene]] only once before the first update call
 */
export class InitializeEvent extends GameEvent {
    /**
     * @param engine  The reference to the current engine
     */
    constructor(engine, target) {
        super();
        this.engine = engine;
        this.target = target;
    }
}
/**
 * Event thrown on a [[Scene]] on activation
 */
export class ActivateEvent extends GameEvent {
    /**
     * @param oldScene  The reference to the old scene
     */
    constructor(oldScene, target) {
        super();
        this.oldScene = oldScene;
        this.target = target;
    }
}
/**
 * Event thrown on a [[Scene]] on deactivation
 */
export class DeactivateEvent extends GameEvent {
    /**
     * @param newScene  The reference to the new scene
     */
    constructor(newScene, target) {
        super();
        this.newScene = newScene;
        this.target = target;
    }
}
/**
 * Event thrown on an [[Actor]] when it completely leaves the screen.
 */
export class ExitViewPortEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * Event thrown on an [[Actor]] when it completely leaves the screen.
 */
export class EnterViewPortEvent extends GameEvent {
    constructor(target) {
        super();
        this.target = target;
    }
}
export class EnterTriggerEvent extends GameEvent {
    constructor(target, actor) {
        super();
        this.target = target;
        this.actor = actor;
    }
}
export class ExitTriggerEvent extends GameEvent {
    constructor(target, actor) {
        super();
        this.target = target;
        this.actor = actor;
    }
}
//# sourceMappingURL=Events.js.map