import { GameEvent } from '../Events';
/**
 * Native browser button enumeration
 */
export var NativePointerButton;
(function (NativePointerButton) {
    NativePointerButton[NativePointerButton["NoButton"] = -1] = "NoButton";
    NativePointerButton[NativePointerButton["Left"] = 0] = "Left";
    NativePointerButton[NativePointerButton["Middle"] = 1] = "Middle";
    NativePointerButton[NativePointerButton["Right"] = 2] = "Right";
    NativePointerButton[NativePointerButton["Unknown"] = 3] = "Unknown";
})(NativePointerButton || (NativePointerButton = {}));
/**
 * The mouse button being pressed.
 */
export var PointerButton;
(function (PointerButton) {
    PointerButton["Left"] = "Left";
    PointerButton["Middle"] = "Middle";
    PointerButton["Right"] = "Right";
    PointerButton["Unknown"] = "Unknown";
    PointerButton["NoButton"] = "NoButton";
})(PointerButton || (PointerButton = {}));
export var WheelDeltaMode;
(function (WheelDeltaMode) {
    WheelDeltaMode["Pixel"] = "Pixel";
    WheelDeltaMode["Line"] = "Line";
    WheelDeltaMode["Page"] = "Page";
})(WheelDeltaMode || (WheelDeltaMode = {}));
/**
 * Pointer events
 *
 * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
 * handling pointer input.
 *
 * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
 */
export class PointerEvent extends GameEvent {
    /**
     * @param coordinates         The [[GlobalCoordinates]] of the event
     * @param pointer             The [[Pointer]] of the event
     * @param index               The index of the pointer (zero-based)
     * @param pointerType         The type of pointer
     * @param button              The button pressed (if [[PointerType.Mouse]])
     * @param ev                  The raw DOM event being handled
     */
    constructor(coordinates, pointer, index, pointerType, button, ev) {
        super();
        this.coordinates = coordinates;
        this.pointer = pointer;
        this.index = index;
        this.pointerType = pointerType;
        this.button = button;
        this.ev = ev;
    }
    get name() {
        return this._name;
    }
    /** The world coordinates of the event. */
    get worldPos() {
        return this.coordinates.worldPos.clone();
    }
    /** The page coordinates of the event. */
    get pagePos() {
        return this.coordinates.pagePos.clone();
    }
    /** The screen coordinates of the event. */
    get screenPos() {
        return this.coordinates.screenPos.clone();
    }
    get pos() {
        return this.coordinates.worldPos.clone();
    }
    propagate(actor) {
        this.doAction(actor);
        if (this.bubbles && actor.parent) {
            this.propagate(actor.parent);
        }
    }
    /**
     * Action, that calls when event happens
     */
    doAction(actor) {
        if (actor) {
            this._onActionStart(actor);
            actor.emit(this._name, this);
            this._onActionEnd(actor);
        }
    }
    _onActionStart(_actor) {
        // to be rewritten
    }
    _onActionEnd(_actor) {
        // to be rewritten
    }
}
export class PointerEventFactory {
    constructor(_pointerEventType) {
        this._pointerEventType = _pointerEventType;
    }
    /**
     * Create specific PointerEvent
     */
    create(coordinates, pointer, index, pointerType, button, ev) {
        return new this._pointerEventType(coordinates, pointer, index, pointerType, button, ev);
    }
}
export class PointerDragEvent extends PointerEvent {
}
export class PointerUpEvent extends PointerEvent {
    constructor() {
        super(...arguments);
        this._name = 'pointerup';
    }
    _onActionEnd(actor) {
        const pointer = this.pointer;
        if (pointer.isDragEnd && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragend', this);
        }
    }
}
export class PointerDownEvent extends PointerEvent {
    constructor() {
        super(...arguments);
        this._name = 'pointerdown';
    }
    _onActionEnd(actor) {
        if (this.pointer.isDragStart && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragstart', this);
        }
    }
}
export class PointerMoveEvent extends PointerEvent {
    constructor() {
        super(...arguments);
        this._name = 'pointermove';
        // private _onActorEnter(actor: Actor) {
        //   const pe = createPointerEventByName('enter', this.coordinates, this.pointer, this.index, this.pointerType, this.button, this.ev);
        //   pe.propagate(actor);
        //   this.pointer.addActorUnderPointer(actor);
        //   if (this.pointer.isDragging) {
        //     this.pointer.dragTarget = actor;
        //   }
        // }
        // private _onActorLeave(actor: Actor) {
        //   const pe = createPointerEventByName('leave', this.coordinates, this.pointer, this.index, this.pointerType, this.button, this.ev);
        //   pe.propagate(actor);
        //   this.pointer.removeActorUnderPointer(actor);
        // }
    }
    propagate(actor) {
        // If the actor was under the pointer last frame, but not this one it left
        // if (this.pointer.wasActorUnderPointer(actor) && !this.pointer.isActorUnderPointer(actor)) {
        //   this._onActorLeave(actor);
        //   return;
        // }
        if (this.pointer.isActorAliveUnderPointer(actor)) {
            this.doAction(actor);
            if (this.bubbles && actor.parent) {
                this.propagate(actor.parent);
            }
        }
    }
    _onActionStart(actor) {
        if (!actor.capturePointer.captureMoveEvents) {
            return;
        }
        // In the case this is new
        // if (this.pointer.checkActorUnderPointer(actor) && !this.pointer.wasActorUnderPointer(actor)) {
        //   this._onActorEnter(actor);
        // }
        if (this.pointer.isDragging && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragmove', this);
        }
    }
}
export class PointerEnterEvent extends PointerEvent {
    constructor() {
        super(...arguments);
        this._name = 'pointerenter';
    }
    _onActionStart(actor) {
        if (!actor.capturePointer.captureMoveEvents) {
            return;
        }
    }
    _onActionEnd(actor) {
        const pointer = this.pointer;
        if (pointer.isDragging && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragenter', this);
        }
    }
}
export class PointerLeaveEvent extends PointerEvent {
    constructor() {
        super(...arguments);
        this._name = 'pointerleave';
    }
    _onActionStart(actor) {
        if (!actor.capturePointer.captureMoveEvents) {
            return;
        }
    }
    _onActionEnd(actor) {
        const pointer = this.pointer;
        if (pointer.isDragging && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragleave', this);
        }
    }
}
export class PointerCancelEvent extends PointerEvent {
    constructor() {
        super(...arguments);
        this._name = 'pointercancel';
    }
}
/**
 * Wheel Events
 *
 * Represents a mouse wheel event. See [[Pointers]] for more information on
 * handling point input.
 */
export class WheelEvent extends GameEvent {
    /**
     * @param x            The `x` coordinate of the event (in world coordinates)
     * @param y            The `y` coordinate of the event (in world coordinates)
     * @param pageX        The `x` coordinate of the event (in document coordinates)
     * @param pageY        The `y` coordinate of the event (in document coordinates)
     * @param screenX      The `x` coordinate of the event (in screen coordinates)
     * @param screenY      The `y` coordinate of the event (in screen coordinates)
     * @param index        The index of the pointer (zero-based)
     * @param deltaX       The type of pointer
     * @param deltaY       The type of pointer
     * @param deltaZ       The type of pointer
     * @param deltaMode    The type of movement [[WheelDeltaMode]]
     * @param ev           The raw DOM event being handled
     */
    constructor(x, y, pageX, pageY, screenX, screenY, index, deltaX, deltaY, deltaZ, deltaMode, ev) {
        super();
        this.x = x;
        this.y = y;
        this.pageX = pageX;
        this.pageY = pageY;
        this.screenX = screenX;
        this.screenY = screenY;
        this.index = index;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.deltaZ = deltaZ;
        this.deltaMode = deltaMode;
        this.ev = ev;
    }
}
/**
 *
 */
export function createPointerEventByName(eventName, coordinates, pointer, index, pointerType, button, ev) {
    let factory;
    switch (eventName) {
        case 'up':
            factory = new PointerEventFactory(PointerUpEvent);
            break;
        case 'down':
            factory = new PointerEventFactory(PointerDownEvent);
            break;
        case 'move':
            factory = new PointerEventFactory(PointerMoveEvent);
            break;
        case 'cancel':
            factory = new PointerEventFactory(PointerCancelEvent);
            break;
        case 'enter':
            factory = new PointerEventFactory(PointerEnterEvent);
            break;
        case 'leave':
            factory = new PointerEventFactory(PointerLeaveEvent);
            break;
    }
    return factory.create(coordinates, pointer, index, pointerType, button, ev);
}
//# sourceMappingURL=PointerEvents.js.map