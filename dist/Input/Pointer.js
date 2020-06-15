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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
var Pointer = /** @class */ (function (_super) {
    __extends(Pointer, _super);
    function Pointer() {
        var _this = _super.call(this) || this;
        _this.id = Pointer._MAX_ID++;
        _this._isDown = false;
        _this._wasDown = false;
        _this._actorsUnderPointer = { length: 0 };
        _this._actors = [];
        _this._actorsLastFrame = [];
        _this._actorsNoLongerUnderPointer = [];
        /**
         * The last position on the document this pointer was at. Can be `null` if pointer was never active.
         */
        _this.lastPagePos = null;
        /**
         * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
         */
        _this.lastScreenPos = null;
        /**
         * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
         */
        _this.lastWorldPos = null;
        /**
         * Returns the currently dragging target or null if it isn't exist
         */
        _this.dragTarget = null;
        _this.on('move', _this._onPointerMove);
        _this.on('down', _this._onPointerDown);
        _this.on('up', _this._onPointerUp);
        return _this;
    }
    Object.defineProperty(Pointer.prototype, "isDragging", {
        /**
         * Whether the Pointer is currently dragging.
         */
        get: function () {
            return this._isDown;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pointer.prototype, "isDragStart", {
        /**
         * Whether the Pointer just started dragging.
         */
        get: function () {
            return !this._wasDown && this._isDown;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pointer.prototype, "isDragEnd", {
        /**
         * Whether the Pointer just ended dragging.
         */
        get: function () {
            return this._wasDown && !this._isDown;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pointer.prototype, "hasActorsUnderPointer", {
        /**
         * Returns true if pointer has any actors under
         */
        get: function () {
            return !!this._actorsUnderPointer.length;
        },
        enumerable: false,
        configurable: true
    });
    Pointer.prototype.on = function (event, handler) {
        _super.prototype.on.call(this, event, handler);
    };
    Pointer.prototype.once = function (event, handler) {
        _super.prototype.once.call(this, event, handler);
    };
    Pointer.prototype.off = function (event, handler) {
        _super.prototype.off.call(this, event, handler);
    };
    /**
     * Update the state of current pointer, meant to be called a the end of frame
     */
    Pointer.prototype.update = function () {
        if (this._wasDown && !this._isDown) {
            this._wasDown = false;
        }
        else if (!this._wasDown && this._isDown) {
            this._wasDown = true;
        }
        this._actorsLastFrame = __spreadArrays(this._actors);
        this._actorsNoLongerUnderPointer = [];
    };
    /**
     * Adds an Actor to actorsUnderPointer object.
     * @param actor An Actor to be added;
     */
    Pointer.prototype.addActorUnderPointer = function (actor) {
        if (!this.isActorAliveUnderPointer(actor)) {
            this._actorsUnderPointer[actor.id] = actor;
            this._actorsUnderPointer.length += 1;
            this._actors.push(actor);
        }
        // Actors under the pointer are sorted by z, ties are broken by id
        this._actors.sort(function (a, b) {
            if (a.z === b.z) {
                return a.id - b.id;
            }
            return a.z - b.z;
        });
    };
    /**
     * Removes an Actor from actorsUnderPointer object.
     * @param actor An Actor to be removed;
     */
    Pointer.prototype.removeActorUnderPointer = function (actor) {
        if (this.isActorAliveUnderPointer(actor)) {
            delete this._actorsUnderPointer[actor.id];
            this._actorsUnderPointer.length -= 1;
            removeItemFromArray(actor, this._actors);
            this._actorsNoLongerUnderPointer.push(actor);
        }
    };
    /**
     * Returns all actors under this pointer this frame
     */
    Pointer.prototype.getActorsUnderPointer = function () {
        return this._actors;
    };
    /**
     * Returns all actors that are no longer under the pointer this frame
     */
    Pointer.prototype.getActorsUnderPointerLastFrame = function () {
        return this._actorsLastFrame;
    };
    /**
     * Returns all actors relevant for events to pointer this frame
     */
    Pointer.prototype.getActorsForEvents = function () {
        return this._actors.concat(this._actorsLastFrame).filter(function (actor, i, self) {
            return self.indexOf(actor) === i;
        });
    };
    /**
     * Checks if Pointer location has a specific Actor bounds contained underneath.
     * @param actor An Actor for check;
     */
    Pointer.prototype.checkActorUnderPointer = function (actor) {
        if (this.lastWorldPos) {
            return actor.contains(this.lastWorldPos.x, this.lastWorldPos.y, !Actors.isScreenElement(actor));
        }
        return false;
    };
    /**
     * Checks if an actor was under the pointer last frame
     * @param actor
     */
    Pointer.prototype.wasActorUnderPointer = function (actor) {
        return this._actorsLastFrame.indexOf(actor) > -1; // || !!this._actorsUnderPointerLastFrame.hasOwnProperty(actor.id.toString());
    };
    /**
     * Checks if Pointer has a specific Actor in ActorsUnderPointer list.
     * @param actor An Actor for check;
     */
    Pointer.prototype.isActorAliveUnderPointer = function (actor) {
        return !!(!actor.isKilled() && actor.scene && this._actorsUnderPointer.hasOwnProperty(actor.id.toString()));
    };
    Pointer.prototype._onPointerMove = function (ev) {
        this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
        this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
        this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
    };
    Pointer.prototype._onPointerDown = function (ev) {
        this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
        this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
        this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
        this._isDown = true;
    };
    Pointer.prototype._onPointerUp = function (_ev) {
        this._isDown = false;
        this.dragTarget = null;
    };
    Pointer._MAX_ID = 0;
    return Pointer;
}(Class));
export { Pointer };
//# sourceMappingURL=Pointer.js.map