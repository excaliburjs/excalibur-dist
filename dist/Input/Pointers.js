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
const ScrollWheelNormalizationFactor = -1 / 40;
/**
 * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to
 * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
 */
export class Pointers extends Class {
    constructor(engine) {
        super();
        this._pointerDown = [];
        this._pointerUp = [];
        this._pointerMove = [];
        this._pointerCancel = [];
        this._wheel = [];
        this._pointers = [];
        this._activePointers = [];
        this._engine = engine;
        this._pointers.push(new Pointer());
        this._activePointers = [-1];
        this.primary = this._pointers[0];
    }
    on(eventName, handler) {
        super.on(eventName, handler);
    }
    /**
     * Initializes pointer event listeners
     */
    init(target) {
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
        const wheelOptions = {
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
    }
    /**
     * Synthesize a pointer event that looks like a real browser event to excalibur
     * @param eventName
     * @param pos
     */
    triggerEvent(eventName, pos, button = NativePointerButton.Left, pointerType = 'mouse', pointerId = 0) {
        let x = 0;
        let y = 0;
        let coords;
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
        const eventish = {
            pageX: x,
            pageY: y,
            pointerId: pointerId,
            pointerType: pointerType,
            button: button,
            preventDefault: () => {
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
        for (const actor of this._engine.currentScene.actors) {
            const capturePointer = actor.traits.filter((t) => t instanceof CapturePointer)[0];
            if (capturePointer) {
                capturePointer.update(actor, this._engine, 1);
            }
        }
        this.dispatchPointerEvents();
        this.update();
    }
    /**
     * Update all pointer events and pointers, meant to be called at the end of frame
     */
    update() {
        this._pointerUp.length = 0;
        this._pointerDown.length = 0;
        this._pointerMove.length = 0;
        this._pointerCancel.length = 0;
        this._wheel.length = 0;
        for (let i = 0; i < this._pointers.length; i++) {
            this._pointers[i].update();
        }
    }
    /**
     * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
     * @param index  The pointer index to retrieve
     */
    at(index) {
        if (index >= this._pointers.length) {
            // Ensure there is a pointer to retrieve
            for (let i = this._pointers.length - 1, max = index; i < max; i++) {
                this._pointers.push(new Pointer());
                this._activePointers.push(-1);
            }
        }
        return this._pointers[index];
    }
    /**
     * Get number of pointers being watched
     */
    count() {
        return this._pointers.length;
    }
    checkAndUpdateActorUnderPointer(actor) {
        for (const pointer of this._pointers) {
            if (pointer.checkActorUnderPointer(actor)) {
                pointer.addActorUnderPointer(actor);
            }
            else {
                pointer.removeActorUnderPointer(actor);
            }
        }
    }
    _dispatchWithBubble(events) {
        for (const evt of events) {
            for (const actor of evt.pointer.getActorsForEvents()) {
                evt.propagate(actor);
                if (!evt.bubbles) {
                    // if the event stops bubbling part way stop processing
                    break;
                }
            }
        }
    }
    _dispatchPointerLeaveEvents() {
        const lastMoveEventPerPointerPerActor = {};
        const pointerLeave = [];
        for (const evt of this._pointerMove) {
            for (const actor of evt.pointer.getActorsForEvents()) {
                // If the actor was under the pointer last frame, but not this this frame, pointer left
                if (!lastMoveEventPerPointerPerActor[evt.pointer.id + '+' + actor.id] &&
                    evt.pointer.wasActorUnderPointer(actor) &&
                    !evt.pointer.isActorAliveUnderPointer(actor)) {
                    lastMoveEventPerPointerPerActor[evt.pointer.id + '+' + actor.id] = evt;
                    const pe = createPointerEventByName('leave', new GlobalCoordinates(evt.worldPos, evt.pagePos, evt.screenPos), evt.pointer, evt.index, evt.pointerType, evt.button, evt.ev);
                    pe.propagate(actor);
                    pointerLeave.push(pe);
                }
            }
        }
        return pointerLeave;
    }
    _dispatchPointerEnterEvents() {
        const lastMoveEventPerPointer = {};
        const pointerEnter = [];
        for (const evt of this._pointerMove) {
            for (const actor of evt.pointer.getActorsForEvents()) {
                // If the actor was not under the pointer last frame, but it is this frame, pointer entered
                if (!lastMoveEventPerPointer[evt.pointer.id] &&
                    !evt.pointer.wasActorUnderPointer(actor) &&
                    evt.pointer.isActorAliveUnderPointer(actor)) {
                    lastMoveEventPerPointer[evt.pointer.id] = evt;
                    const pe = createPointerEventByName('enter', new GlobalCoordinates(evt.worldPos, evt.pagePos, evt.screenPos), evt.pointer, evt.index, evt.pointerType, evt.button, evt.ev);
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
    }
    dispatchPointerEvents() {
        this._dispatchWithBubble(this._pointerDown);
        this._dispatchWithBubble(this._pointerUp);
        this._dispatchWithBubble(this._pointerMove);
        this._dispatchPointerLeaveEvents();
        this._dispatchPointerEnterEvents();
        this._dispatchWithBubble(this._pointerCancel);
        // TODO some duplication here
        for (const evt of this._wheel) {
            for (const actor of this._pointers[evt.index].getActorsUnderPointer()) {
                this._propagateWheelPointerEvent(actor, evt);
                if (!evt.bubbles) {
                    // if the event stops bubbling part way stop processing
                    break;
                }
            }
        }
    }
    _propagateWheelPointerEvent(actor, wheelEvent) {
        actor.emit('pointerwheel', wheelEvent);
        // Recurse and propagate
        if (wheelEvent.bubbles && actor.parent) {
            this._propagateWheelPointerEvent(actor.parent, wheelEvent);
        }
    }
    _handleMouseEvent(eventName, eventArr) {
        return (e) => {
            e.preventDefault();
            const pointer = this.at(0);
            const coordinates = GlobalCoordinates.fromPagePosition(e.pageX, e.pageY, this._engine);
            const pe = createPointerEventByName(eventName, coordinates, pointer, 0, PointerType.Mouse, this._nativeButtonToPointerButton(e.button), e);
            eventArr.push(pe);
            pointer.eventDispatcher.emit(eventName, pe);
        };
    }
    _handleTouchEvent(eventName, eventArr) {
        return (e) => {
            e.preventDefault();
            for (let i = 0, len = e.changedTouches.length; i < len; i++) {
                const index = this._pointers.length > 1 ? this._getPointerIndex(e.changedTouches[i].identifier) : 0;
                if (index === -1) {
                    continue;
                }
                const pointer = this.at(index);
                const coordinates = GlobalCoordinates.fromPagePosition(e.changedTouches[i].pageX, e.changedTouches[i].pageY, this._engine);
                const pe = createPointerEventByName(eventName, coordinates, pointer, index, PointerType.Touch, PointerButton.Unknown, e);
                eventArr.push(pe);
                pointer.eventDispatcher.emit(eventName, pe);
                // only with multi-pointer
                if (this._pointers.length > 1) {
                    if (eventName === 'up') {
                        // remove pointer ID from pool when pointer is lifted
                        this._activePointers[index] = -1;
                    }
                    else if (eventName === 'down') {
                        // set pointer ID to given index
                        this._activePointers[index] = e.changedTouches[i].identifier;
                    }
                }
            }
        };
    }
    _handlePointerEvent(eventName, eventArr, coords) {
        return (e) => {
            e.preventDefault();
            // get the index for this pointer ID if multi-pointer is asked for
            const index = this._pointers.length > 1 ? this._getPointerIndex(e.pointerId) : 0;
            if (index === -1) {
                return;
            }
            const pointer = this.at(index);
            const coordinates = coords || GlobalCoordinates.fromPagePosition(e.pageX, e.pageY, this._engine);
            const pe = createPointerEventByName(eventName, coordinates, pointer, index, this._stringToPointerType(e.pointerType), this._nativeButtonToPointerButton(e.button), e);
            eventArr.push(pe);
            pointer.eventDispatcher.emit(eventName, pe);
            // only with multi-pointer
            if (this._pointers.length > 1) {
                if (eventName === 'up') {
                    // remove pointer ID from pool when pointer is lifted
                    this._activePointers[index] = -1;
                }
                else if (eventName === 'down') {
                    // set pointer ID to given index
                    this._activePointers[index] = e.pointerId;
                }
            }
        };
    }
    _handleWheelEvent(eventName, eventArr) {
        return (e) => {
            // Should we prevent page scroll because of this event
            if (this._engine.pageScrollPreventionMode === ScrollPreventionMode.All ||
                (this._engine.pageScrollPreventionMode === ScrollPreventionMode.Canvas && e.target === this._engine.canvas)) {
                e.preventDefault();
            }
            const x = e.pageX - Util.getPosition(this._engine.canvas).x;
            const y = e.pageY - Util.getPosition(this._engine.canvas).y;
            const transformedPoint = this._engine.screenToWorldCoordinates(new Vector(x, y));
            // deltaX, deltaY, and deltaZ are the standard modern properties
            // wheelDeltaX, wheelDeltaY, are legacy properties in webkit browsers and older IE
            // e.detail is only used in opera
            const deltaX = e.deltaX || e.wheelDeltaX * ScrollWheelNormalizationFactor || 0;
            const deltaY = e.deltaY || e.wheelDeltaY * ScrollWheelNormalizationFactor || e.wheelDelta * ScrollWheelNormalizationFactor || e.detail || 0;
            const deltaZ = e.deltaZ || 0;
            let deltaMode = WheelDeltaMode.Pixel;
            if (e.deltaMode) {
                if (e.deltaMode === 1) {
                    deltaMode = WheelDeltaMode.Line;
                }
                else if (e.deltaMode === 2) {
                    deltaMode = WheelDeltaMode.Page;
                }
            }
            const we = new WheelEvent(transformedPoint.x, transformedPoint.y, e.pageX, e.pageY, x, y, 0, deltaX, deltaY, deltaZ, deltaMode, e);
            eventArr.push(we);
            this.at(0).eventDispatcher.emit(eventName, we);
        };
    }
    /**
     * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
     * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
     */
    _getPointerIndex(pointerId) {
        let idx;
        if ((idx = this._activePointers.indexOf(pointerId)) > -1) {
            return idx;
        }
        for (let i = 0; i < this._activePointers.length; i++) {
            if (this._activePointers[i] === -1) {
                return i;
            }
        }
        // ignore pointer because game isn't watching
        return -1;
    }
    _nativeButtonToPointerButton(s) {
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
    }
    _stringToPointerType(s) {
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
    }
}
//# sourceMappingURL=Pointers.js.map