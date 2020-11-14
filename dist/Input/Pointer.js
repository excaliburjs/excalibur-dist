import { Vector } from '../Algebra';
import { Class } from '../Class';
import * as Actors from '../Util/Actors';
import { removeItemFromArray } from '../Util/Util';
/**
 * The type of pointer for a [[PointerEvent]].
 */
export var PointerType;
(function (PointerType) {
    PointerType["Touch"] = "Touch";
    PointerType["Mouse"] = "Mouse";
    PointerType["Pen"] = "Pen";
    PointerType["Unknown"] = "Unknown";
})(PointerType || (PointerType = {}));
/**
 * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
 */
export var PointerScope;
(function (PointerScope) {
    /**
     * Handle events on the `canvas` element only. Events originating outside the
     * `canvas` will not be handled.
     */
    PointerScope["Canvas"] = "Canvas";
    /**
     * Handles events on the entire document. All events will be handled by Excalibur.
     */
    PointerScope["Document"] = "Document";
})(PointerScope || (PointerScope = {}));
/**
 * Captures and dispatches PointerEvents
 */
export class Pointer extends Class {
    constructor() {
        super();
        this.id = Pointer._MAX_ID++;
        this._isDown = false;
        this._wasDown = false;
        this._actorsUnderPointer = { length: 0 };
        this._actors = [];
        this._actorsLastFrame = [];
        this._actorsNoLongerUnderPointer = [];
        /**
         * The last position on the document this pointer was at. Can be `null` if pointer was never active.
         */
        this.lastPagePos = null;
        /**
         * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
         */
        this.lastScreenPos = null;
        /**
         * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
         */
        this.lastWorldPos = null;
        /**
         * Returns the currently dragging target or null if it isn't exist
         */
        this.dragTarget = null;
        this.on('move', this._onPointerMove);
        this.on('down', this._onPointerDown);
        this.on('up', this._onPointerUp);
    }
    /**
     * Whether the Pointer is currently dragging.
     */
    get isDragging() {
        return this._isDown;
    }
    /**
     * Whether the Pointer just started dragging.
     */
    get isDragStart() {
        return !this._wasDown && this._isDown;
    }
    /**
     * Whether the Pointer just ended dragging.
     */
    get isDragEnd() {
        return this._wasDown && !this._isDown;
    }
    /**
     * Returns true if pointer has any actors under
     */
    get hasActorsUnderPointer() {
        return !!this._actorsUnderPointer.length;
    }
    on(event, handler) {
        super.on(event, handler);
    }
    once(event, handler) {
        super.once(event, handler);
    }
    off(event, handler) {
        super.off(event, handler);
    }
    /**
     * Update the state of current pointer, meant to be called a the end of frame
     */
    update() {
        if (this._wasDown && !this._isDown) {
            this._wasDown = false;
        }
        else if (!this._wasDown && this._isDown) {
            this._wasDown = true;
        }
        this._actorsLastFrame = [...this._actors];
        this._actorsNoLongerUnderPointer = [];
    }
    /**
     * Adds an Actor to actorsUnderPointer object.
     * @param actor An Actor to be added;
     */
    addActorUnderPointer(actor) {
        if (!this.isActorAliveUnderPointer(actor)) {
            this._actorsUnderPointer[actor.id] = actor;
            this._actorsUnderPointer.length += 1;
            this._actors.push(actor);
        }
        // Actors under the pointer are sorted by z, ties are broken by id
        this._actors.sort((a, b) => {
            if (a.z === b.z) {
                return a.id - b.id;
            }
            return a.z - b.z;
        });
    }
    /**
     * Removes an Actor from actorsUnderPointer object.
     * @param actor An Actor to be removed;
     */
    removeActorUnderPointer(actor) {
        if (this.isActorAliveUnderPointer(actor)) {
            delete this._actorsUnderPointer[actor.id];
            this._actorsUnderPointer.length -= 1;
            removeItemFromArray(actor, this._actors);
            this._actorsNoLongerUnderPointer.push(actor);
        }
    }
    /**
     * Returns all actors under this pointer this frame
     */
    getActorsUnderPointer() {
        return this._actors;
    }
    /**
     * Returns all actors that are no longer under the pointer this frame
     */
    getActorsUnderPointerLastFrame() {
        return this._actorsLastFrame;
    }
    /**
     * Returns all actors relevant for events to pointer this frame
     */
    getActorsForEvents() {
        return this._actors.concat(this._actorsLastFrame).filter((actor, i, self) => {
            return self.indexOf(actor) === i;
        });
    }
    /**
     * Checks if Pointer location has a specific Actor bounds contained underneath.
     * @param actor An Actor for check;
     */
    checkActorUnderPointer(actor) {
        if (this.lastWorldPos) {
            return actor.contains(this.lastWorldPos.x, this.lastWorldPos.y, !Actors.isScreenElement(actor));
        }
        return false;
    }
    /**
     * Checks if an actor was under the pointer last frame
     * @param actor
     */
    wasActorUnderPointer(actor) {
        return this._actorsLastFrame.indexOf(actor) > -1; // || !!this._actorsUnderPointerLastFrame.hasOwnProperty(actor.id.toString());
    }
    /**
     * Checks if Pointer has a specific Actor in ActorsUnderPointer list.
     * @param actor An Actor for check;
     */
    isActorAliveUnderPointer(actor) {
        return !!(!actor.isKilled() && actor.scene && this._actorsUnderPointer.hasOwnProperty(actor.id.toString()));
    }
    _onPointerMove(ev) {
        this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
        this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
        this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
    }
    _onPointerDown(ev) {
        this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
        this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
        this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
        this._isDown = true;
    }
    _onPointerUp(_ev) {
        this._isDown = false;
        this.dragTarget = null;
    }
}
Pointer._MAX_ID = 0;
//# sourceMappingURL=Pointer.js.map