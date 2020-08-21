var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var PointerEvent = /** @class */ (function (_super) {
    __extends(PointerEvent, _super);
    /**
     * @param coordinates         The [[GlobalCoordinates]] of the event
     * @param pointer             The [[Pointer]] of the event
     * @param index               The index of the pointer (zero-based)
     * @param pointerType         The type of pointer
     * @param button              The button pressed (if [[PointerType.Mouse]])
     * @param ev                  The raw DOM event being handled
     * @param pos                 (Will be added to signature in 0.14.0 release) The position of the event (in world coordinates)
     */
    function PointerEvent(coordinates, pointer, index, pointerType, button, ev) {
        var _this = _super.call(this) || this;
        _this.coordinates = coordinates;
        _this.pointer = pointer;
        _this.index = index;
        _this.pointerType = pointerType;
        _this.button = button;
        _this.ev = ev;
        return _this;
    }
    Object.defineProperty(PointerEvent.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointerEvent.prototype, "worldPos", {
        /** The world coordinates of the event. */
        get: function () {
            return this.coordinates.worldPos.clone();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointerEvent.prototype, "pagePos", {
        /** The page coordinates of the event. */
        get: function () {
            return this.coordinates.pagePos.clone();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointerEvent.prototype, "screenPos", {
        /** The screen coordinates of the event. */
        get: function () {
            return this.coordinates.screenPos.clone();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointerEvent.prototype, "pos", {
        get: function () {
            return this.coordinates.worldPos.clone();
        },
        enumerable: false,
        configurable: true
    });
    PointerEvent.prototype.propagate = function (actor) {
        this.doAction(actor);
        if (this.bubbles && actor.parent) {
            this.propagate(actor.parent);
        }
    };
    /**
     * Action, that calls when event happens
     */
    PointerEvent.prototype.doAction = function (actor) {
        if (actor) {
            this._onActionStart(actor);
            actor.emit(this._name, this);
            this._onActionEnd(actor);
        }
    };
    PointerEvent.prototype._onActionStart = function (_actor) {
        // to be rewritten
    };
    PointerEvent.prototype._onActionEnd = function (_actor) {
        // to be rewritten
    };
    return PointerEvent;
}(GameEvent));
export { PointerEvent };
var PointerEventFactory = /** @class */ (function () {
    function PointerEventFactory(_pointerEventType) {
        this._pointerEventType = _pointerEventType;
    }
    /**
     * Create specific PointerEvent
     */
    PointerEventFactory.prototype.create = function (coordinates, pointer, index, pointerType, button, ev) {
        return new this._pointerEventType(coordinates, pointer, index, pointerType, button, ev);
    };
    return PointerEventFactory;
}());
export { PointerEventFactory };
var PointerDragEvent = /** @class */ (function (_super) {
    __extends(PointerDragEvent, _super);
    function PointerDragEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PointerDragEvent;
}(PointerEvent));
export { PointerDragEvent };
var PointerUpEvent = /** @class */ (function (_super) {
    __extends(PointerUpEvent, _super);
    function PointerUpEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._name = 'pointerup';
        return _this;
    }
    PointerUpEvent.prototype._onActionEnd = function (actor) {
        var pointer = this.pointer;
        if (pointer.isDragEnd && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragend', this);
        }
    };
    return PointerUpEvent;
}(PointerEvent));
export { PointerUpEvent };
var PointerDownEvent = /** @class */ (function (_super) {
    __extends(PointerDownEvent, _super);
    function PointerDownEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._name = 'pointerdown';
        return _this;
    }
    PointerDownEvent.prototype._onActionEnd = function (actor) {
        if (this.pointer.isDragStart && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragstart', this);
        }
    };
    return PointerDownEvent;
}(PointerEvent));
export { PointerDownEvent };
var PointerMoveEvent = /** @class */ (function (_super) {
    __extends(PointerMoveEvent, _super);
    function PointerMoveEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._name = 'pointermove';
        return _this;
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
    PointerMoveEvent.prototype.propagate = function (actor) {
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
    };
    PointerMoveEvent.prototype._onActionStart = function (actor) {
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
    };
    return PointerMoveEvent;
}(PointerEvent));
export { PointerMoveEvent };
var PointerEnterEvent = /** @class */ (function (_super) {
    __extends(PointerEnterEvent, _super);
    function PointerEnterEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._name = 'pointerenter';
        return _this;
    }
    PointerEnterEvent.prototype._onActionStart = function (actor) {
        if (!actor.capturePointer.captureMoveEvents) {
            return;
        }
    };
    PointerEnterEvent.prototype._onActionEnd = function (actor) {
        var pointer = this.pointer;
        if (pointer.isDragging && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragenter', this);
        }
    };
    return PointerEnterEvent;
}(PointerEvent));
export { PointerEnterEvent };
var PointerLeaveEvent = /** @class */ (function (_super) {
    __extends(PointerLeaveEvent, _super);
    function PointerLeaveEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._name = 'pointerleave';
        return _this;
    }
    PointerLeaveEvent.prototype._onActionStart = function (actor) {
        if (!actor.capturePointer.captureMoveEvents) {
            return;
        }
    };
    PointerLeaveEvent.prototype._onActionEnd = function (actor) {
        var pointer = this.pointer;
        if (pointer.isDragging && actor.capturePointer.captureDragEvents) {
            actor.eventDispatcher.emit('pointerdragleave', this);
        }
    };
    return PointerLeaveEvent;
}(PointerEvent));
export { PointerLeaveEvent };
var PointerCancelEvent = /** @class */ (function (_super) {
    __extends(PointerCancelEvent, _super);
    function PointerCancelEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._name = 'pointercancel';
        return _this;
    }
    return PointerCancelEvent;
}(PointerEvent));
export { PointerCancelEvent };
/**
 * Wheel Events
 *
 * Represents a mouse wheel event. See [[Pointers]] for more information on
 * handling point input.
 */
var WheelEvent = /** @class */ (function (_super) {
    __extends(WheelEvent, _super);
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
    function WheelEvent(x, y, pageX, pageY, screenX, screenY, index, deltaX, deltaY, deltaZ, deltaMode, ev) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.y = y;
        _this.pageX = pageX;
        _this.pageY = pageY;
        _this.screenX = screenX;
        _this.screenY = screenY;
        _this.index = index;
        _this.deltaX = deltaX;
        _this.deltaY = deltaY;
        _this.deltaZ = deltaZ;
        _this.deltaMode = deltaMode;
        _this.ev = ev;
        return _this;
    }
    return WheelEvent;
}(GameEvent));
export { WheelEvent };
export function createPointerEventByName(eventName, coordinates, pointer, index, pointerType, button, ev) {
    var factory;
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