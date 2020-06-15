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
import { Class } from '../Class';
import { ScrollPreventionMode } from '../Engine';
import { Pointer, PointerType } from './Pointer';
import { WheelEvent, NativePointerButton, PointerButton, WheelDeltaMode, createPointerEventByName } from './PointerEvents';
import * as Util from '../Util/Util';
import { GlobalCoordinates, Vector } from '../Algebra';
import { CapturePointer } from '../Traits/CapturePointer';
/**
 * A constant used to normalize wheel events across different browsers
 *
 * This normalization factor is pulled from https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
 */
var ScrollWheelNormalizationFactor = -1 / 40;
/**
 * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to
 * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
 *
 * [[include:Pointers.md]]
 */
var Pointers = /** @class */ (function (_super) {
    __extends(Pointers, _super);
    function Pointers(engine) {
        var _this = _super.call(this) || this;
        _this._pointerDown = [];
        _this._pointerUp = [];
        _this._pointerMove = [];
        _this._pointerCancel = [];
        _this._wheel = [];
        _this._pointers = [];
        _this._activePointers = [];
        _this._engine = engine;
        _this._pointers.push(new Pointer());
        _this._activePointers = [-1];
        _this.primary = _this._pointers[0];
        return _this;
    }
    Pointers.prototype.on = function (eventName, handler) {
        _super.prototype.on.call(this, eventName, handler);
    };
    /**
     * Initializes pointer event listeners
     */
    Pointers.prototype.init = function (target) {
        target = target || this._engine.canvas;
        // Touch Events
        target.addEventListener('touchstart', this._handleTouchEvent('down', this._pointerDown));
        target.addEventListener('touchend', this._handleTouchEvent('up', this._pointerUp));
        target.addEventListener('touchmove', this._handleTouchEvent('move', this._pointerMove));
        target.addEventListener('touchcancel', this._handleTouchEvent('cancel', this._pointerCancel));
        // W3C Pointer Events
        // Current: IE11, IE10
        if (window.PointerEvent) {
            // IE11
            this._engine.canvas.style.touchAction = 'none';
            target.addEventListener('pointerdown', this._handlePointerEvent('down', this._pointerDown));
            target.addEventListener('pointerup', this._handlePointerEvent('up', this._pointerUp));
            target.addEventListener('pointermove', this._handlePointerEvent('move', this._pointerMove));
            target.addEventListener('pointercancel', this._handlePointerEvent('cancel', this._pointerCancel));
        }
        else if (window.MSPointerEvent) {
            // IE10
            this._engine.canvas.style.msTouchAction = 'none';
            target.addEventListener('MSPointerDown', this._handlePointerEvent('down', this._pointerDown));
            target.addEventListener('MSPointerUp', this._handlePointerEvent('up', this._pointerUp));
            target.addEventListener('MSPointerMove', this._handlePointerEvent('move', this._pointerMove));
            target.addEventListener('MSPointerCancel', this._handlePointerEvent('cancel', this._pointerCancel));
        }
        else {
            // Mouse Events
            target.addEventListener('mousedown', this._handleMouseEvent('down', this._pointerDown));
            target.addEventListener('mouseup', this._handleMouseEvent('up', this._pointerUp));
            target.addEventListener('mousemove', this._handleMouseEvent('move', this._pointerMove));
        }
        // MDN MouseWheelEvent
        var wheelOptions = {
            passive: !(this._engine.pageScrollPreventionMode === ScrollPreventionMode.All ||
                this._engine.pageScrollPreventionMode === ScrollPreventionMode.Canvas)
        };
        if ('onwheel' in document.createElement('div')) {
            // Modern Browsers
            target.addEventListener('wheel', this._handleWheelEvent('wheel', this._wheel), wheelOptions);
        }
        else if (document.onmousewheel !== undefined) {
            // Webkit and IE
            target.addEventListener('mousewheel', this._handleWheelEvent('wheel', this._wheel), wheelOptions);
        }
        else {
            // Remaining browser and older Firefox
            target.addEventListener('MozMousePixelScroll', this._handleWheelEvent('wheel', this._wheel), wheelOptions);
        }
    };
    /**
     * Synthesize a pointer event that looks like a real browser event to excalibur
     * @param eventName
     * @param pos
     */
    Pointers.prototype.triggerEvent = function (eventName, pos, button, pointerType, pointerId) {
        if (button === void 0) { button = NativePointerButton.Left; }
        if (pointerType === void 0) { pointerType = 'mouse'; }
        if (pointerId === void 0) { pointerId = 0; }
        var x = 0;
        var y = 0;
        var coords;
        if (pos instanceof GlobalCoordinates) {
            x = pos.pagePos.x;
            y = pos.pagePos.y;
            coords = pos;
        }
        else {
            x = pos.x;
            y = pos.y;
            coords = new GlobalCoordinates(pos.clone(), pos.clone(), pos.clone());
        }
        var eventish = {
            pageX: x,
            pageY: y,
            pointerId: pointerId,
            pointerType: pointerType,
            button: button,
            preventDefault: function () {
                /* do nothing */
            }
        };
        switch (eventName) {
            case 'move':
                this._handlePointerEvent(eventName, this._pointerMove, coords)(eventish);
                break;
            case 'down':
                this._handlePointerEvent(eventName, this._pointerDown, coords)(eventish);
                break;
            case 'up':
                this._handlePointerEvent(eventName, this._pointerUp, coords)(eventish);
                break;
            case 'cancel':
                this._handlePointerEvent(eventName, this._pointerCancel, coords)(eventish);
                break;
        }
        for (var _i = 0, _a = this._engine.currentScene.actors; _i < _a.length; _i++) {
            var actor = _a[_i];
            var capturePointer = actor.traits.filter(function (t) { return t instanceof CapturePointer; })[0];
            if (capturePointer) {
                capturePointer.update(actor, this._engine, 1);
            }
        }
        this.dispatchPointerEvents();
        this.update();
    };
    /**
     * Update all pointer events and pointers, meant to be called at the end of frame
     */
    Pointers.prototype.update = function () {
        this._pointerUp.length = 0;
        this._pointerDown.length = 0;
        this._pointerMove.length = 0;
        this._pointerCancel.length = 0;
        this._wheel.length = 0;
        for (var i = 0; i < this._pointers.length; i++) {
            this._pointers[i].update();
        }
    };
    /**
     * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
     * @param index  The pointer index to retrieve
     */
    Pointers.prototype.at = function (index) {
        if (index >= this._pointers.length) {
            // Ensure there is a pointer to retrieve
            for (var i = this._pointers.length - 1, max = index; i < max; i++) {
                this._pointers.push(new Pointer());
                this._activePointers.push(-1);
            }
        }
        return this._pointers[index];
    };
    /**
     * Get number of pointers being watched
     */
    Pointers.prototype.count = function () {
        return this._pointers.length;
    };
    Pointers.prototype.checkAndUpdateActorUnderPointer = function (actor) {
        for (var _i = 0, _a = this._pointers; _i < _a.length; _i++) {
            var pointer = _a[_i];
            if (pointer.checkActorUnderPointer(actor)) {
                pointer.addActorUnderPointer(actor);
            }
            else {
                pointer.removeActorUnderPointer(actor);
            }
        }
    };
    Pointers.prototype._dispatchWithBubble = function (events) {
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var evt = events_1[_i];
            for (var _a = 0, _b = evt.pointer.getActorsForEvents(); _a < _b.length; _a++) {
                var actor = _b[_a];
                evt.propagate(actor);
                if (!evt.bubbles) {
                    // if the event stops bubbling part way stop processing
                    break;
                }
            }
        }
    };
    Pointers.prototype._dispatchPointerLeaveEvents = function () {
        var lastMoveEventPerPointerPerActor = {};
        var pointerLeave = [];
        for (var _i = 0, _a = this._pointerMove; _i < _a.length; _i++) {
            var evt = _a[_i];
            for (var _b = 0, _c = evt.pointer.getActorsForEvents(); _b < _c.length; _b++) {
                var actor = _c[_b];
                // If the actor was under the pointer last frame, but not this this frame, pointer left
                if (!lastMoveEventPerPointerPerActor[evt.pointer.id + '+' + actor.id] &&
                    evt.pointer.wasActorUnderPointer(actor) &&
                    !evt.pointer.isActorAliveUnderPointer(actor)) {
                    lastMoveEventPerPointerPerActor[evt.pointer.id + '+' + actor.id] = evt;
                    var pe = createPointerEventByName('leave', new GlobalCoordinates(evt.worldPos, evt.pagePos, evt.screenPos), evt.pointer, evt.index, evt.pointerType, evt.button, evt.ev);
                    pe.propagate(actor);
                    pointerLeave.push(pe);
                }
            }
        }
        return pointerLeave;
    };
    Pointers.prototype._dispatchPointerEnterEvents = function () {
        var lastMoveEventPerPointer = {};
        var pointerEnter = [];
        for (var _i = 0, _a = this._pointerMove; _i < _a.length; _i++) {
            var evt = _a[_i];
            for (var _b = 0, _c = evt.pointer.getActorsForEvents(); _b < _c.length; _b++) {
                var actor = _c[_b];
                // If the actor was not under the pointer last frame, but it is this frame, pointer entered
                if (!lastMoveEventPerPointer[evt.pointer.id] &&
                    !evt.pointer.wasActorUnderPointer(actor) &&
                    evt.pointer.isActorAliveUnderPointer(actor)) {
                    lastMoveEventPerPointer[evt.pointer.id] = evt;
                    var pe = createPointerEventByName('enter', new GlobalCoordinates(evt.worldPos, evt.pagePos, evt.screenPos), evt.pointer, evt.index, evt.pointerType, evt.button, evt.ev);
                    pe.propagate(actor);
                    pointerEnter.push(pe);
                    // if pointer is dragging set the drag target
                    if (evt.pointer.isDragging) {
                        evt.pointer.dragTarget = actor;
                    }
                }
            }
        }
        return pointerEnter;
    };
    Pointers.prototype.dispatchPointerEvents = function () {
        this._dispatchWithBubble(this._pointerDown);
        this._dispatchWithBubble(this._pointerUp);
        this._dispatchWithBubble(this._pointerMove);
        this._dispatchPointerLeaveEvents();
        this._dispatchPointerEnterEvents();
        this._dispatchWithBubble(this._pointerCancel);
        // TODO some duplication here
        for (var _i = 0, _a = this._wheel; _i < _a.length; _i++) {
            var evt = _a[_i];
            for (var _b = 0, _c = this._pointers[evt.index].getActorsUnderPointer(); _b < _c.length; _b++) {
                var actor = _c[_b];
                this._propagateWheelPointerEvent(actor, evt);
                if (!evt.bubbles) {
                    // if the event stops bubbling part way stop processing
                    break;
                }
            }
        }
    };
    Pointers.prototype._propagateWheelPointerEvent = function (actor, wheelEvent) {
        actor.emit('pointerwheel', wheelEvent);
        // Recurse and propagate
        if (wheelEvent.bubbles && actor.parent) {
            this._propagateWheelPointerEvent(actor.parent, wheelEvent);
        }
    };
    Pointers.prototype._handleMouseEvent = function (eventName, eventArr) {
        var _this = this;
        return function (e) {
            e.preventDefault();
            var pointer = _this.at(0);
            var coordinates = GlobalCoordinates.fromPagePosition(e.pageX, e.pageY, _this._engine);
            var pe = createPointerEventByName(eventName, coordinates, pointer, 0, PointerType.Mouse, _this._nativeButtonToPointerButton(e.button), e);
            eventArr.push(pe);
            pointer.eventDispatcher.emit(eventName, pe);
        };
    };
    Pointers.prototype._handleTouchEvent = function (eventName, eventArr) {
        var _this = this;
        return function (e) {
            e.preventDefault();
            for (var i = 0, len = e.changedTouches.length; i < len; i++) {
                var index = _this._pointers.length > 1 ? _this._getPointerIndex(e.changedTouches[i].identifier) : 0;
                if (index === -1) {
                    continue;
                }
                var pointer = _this.at(index);
                var coordinates = GlobalCoordinates.fromPagePosition(e.changedTouches[i].pageX, e.changedTouches[i].pageY, _this._engine);
                var pe = createPointerEventByName(eventName, coordinates, pointer, index, PointerType.Touch, PointerButton.Unknown, e);
                eventArr.push(pe);
                pointer.eventDispatcher.emit(eventName, pe);
                // only with multi-pointer
                if (_this._pointers.length > 1) {
                    if (eventName === 'up') {
                        // remove pointer ID from pool when pointer is lifted
                        _this._activePointers[index] = -1;
                    }
                    else if (eventName === 'down') {
                        // set pointer ID to given index
                        _this._activePointers[index] = e.changedTouches[i].identifier;
                    }
                }
            }
        };
    };
    Pointers.prototype._handlePointerEvent = function (eventName, eventArr, coords) {
        var _this = this;
        return function (e) {
            e.preventDefault();
            // get the index for this pointer ID if multi-pointer is asked for
            var index = _this._pointers.length > 1 ? _this._getPointerIndex(e.pointerId) : 0;
            if (index === -1) {
                return;
            }
            var pointer = _this.at(index);
            var coordinates = coords || GlobalCoordinates.fromPagePosition(e.pageX, e.pageY, _this._engine);
            var pe = createPointerEventByName(eventName, coordinates, pointer, index, _this._stringToPointerType(e.pointerType), _this._nativeButtonToPointerButton(e.button), e);
            eventArr.push(pe);
            pointer.eventDispatcher.emit(eventName, pe);
            // only with multi-pointer
            if (_this._pointers.length > 1) {
                if (eventName === 'up') {
                    // remove pointer ID from pool when pointer is lifted
                    _this._activePointers[index] = -1;
                }
                else if (eventName === 'down') {
                    // set pointer ID to given index
                    _this._activePointers[index] = e.pointerId;
                }
            }
        };
    };
    Pointers.prototype._handleWheelEvent = function (eventName, eventArr) {
        var _this = this;
        return function (e) {
            // Should we prevent page scroll because of this event
            if (_this._engine.pageScrollPreventionMode === ScrollPreventionMode.All ||
                (_this._engine.pageScrollPreventionMode === ScrollPreventionMode.Canvas && e.target === _this._engine.canvas)) {
                e.preventDefault();
            }
            var x = e.pageX - Util.getPosition(_this._engine.canvas).x;
            var y = e.pageY - Util.getPosition(_this._engine.canvas).y;
            var transformedPoint = _this._engine.screenToWorldCoordinates(new Vector(x, y));
            // deltaX, deltaY, and deltaZ are the standard modern properties
            // wheelDeltaX, wheelDeltaY, are legacy properties in webkit browsers and older IE
            // e.detail is only used in opera
            var deltaX = e.deltaX || e.wheelDeltaX * ScrollWheelNormalizationFactor || 0;
            var deltaY = e.deltaY || e.wheelDeltaY * ScrollWheelNormalizationFactor || e.wheelDelta * ScrollWheelNormalizationFactor || e.detail || 0;
            var deltaZ = e.deltaZ || 0;
            var deltaMode = WheelDeltaMode.Pixel;
            if (e.deltaMode) {
                if (e.deltaMode === 1) {
                    deltaMode = WheelDeltaMode.Line;
                }
                else if (e.deltaMode === 2) {
                    deltaMode = WheelDeltaMode.Page;
                }
            }
            var we = new WheelEvent(transformedPoint.x, transformedPoint.y, e.pageX, e.pageY, x, y, 0, deltaX, deltaY, deltaZ, deltaMode, e);
            eventArr.push(we);
            _this.at(0).eventDispatcher.emit(eventName, we);
        };
    };
    /**
     * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
     * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
     */
    Pointers.prototype._getPointerIndex = function (pointerId) {
        var idx;
        if ((idx = this._activePointers.indexOf(pointerId)) > -1) {
            return idx;
        }
        for (var i = 0; i < this._activePointers.length; i++) {
            if (this._activePointers[i] === -1) {
                return i;
            }
        }
        // ignore pointer because game isn't watching
        return -1;
    };
    Pointers.prototype._nativeButtonToPointerButton = function (s) {
        switch (s) {
            case NativePointerButton.NoButton:
                return PointerButton.NoButton;
            case NativePointerButton.Left:
                return PointerButton.Left;
            case NativePointerButton.Middle:
                return PointerButton.Middle;
            case NativePointerButton.Right:
                return PointerButton.Right;
            case NativePointerButton.Unknown:
                return PointerButton.Unknown;
            default:
                return Util.fail(s);
        }
    };
    Pointers.prototype._stringToPointerType = function (s) {
        switch (s) {
            case 'touch':
                return PointerType.Touch;
            case 'mouse':
                return PointerType.Mouse;
            case 'pen':
                return PointerType.Pen;
            default:
                return PointerType.Unknown;
        }
    };
    return Pointers;
}(Class));
export { Pointers };
//# sourceMappingURL=Pointers.js.map