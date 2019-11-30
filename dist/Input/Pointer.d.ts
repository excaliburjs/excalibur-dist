import { Actor } from '../Actor';
import { Vector } from '../Algebra';
import { Class } from '../Class';
export interface ActorsUnderPointer {
    [ActorId: number]: Actor;
    length: number;
}
/**
 * The type of pointer for a [[PointerEvent]].
 */
export declare enum PointerType {
    Touch = "Touch",
    Mouse = "Mouse",
    Pen = "Pen",
    Unknown = "Unknown"
}
/**
 * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
 */
export declare enum PointerScope {
    /**
     * Handle events on the `canvas` element only. Events originating outside the
     * `canvas` will not be handled.
     */
    Canvas = "Canvas",
    /**
     * Handles events on the entire document. All events will be handled by Excalibur.
     */
    Document = "Document"
}
/**
 * Captures and dispatches PointerEvents
 */
export declare class Pointer extends Class {
    private static _MAX_ID;
    readonly id: number;
    private _isDown;
    private _wasDown;
    private _actorsUnderPointer;
    private _actors;
    private _actorsLastFrame;
    private _actorsNoLongerUnderPointer;
    /**
     * Whether the Pointer is currently dragging.
     */
    readonly isDragging: boolean;
    /**
     * Whether the Pointer just started dragging.
     */
    readonly isDragStart: boolean;
    /**
     * Whether the Pointer just ended dragging.
     */
    readonly isDragEnd: boolean;
    /**
     * Returns true if pointer has any actors under
     */
    readonly hasActorsUnderPointer: boolean;
    /**
     * The last position on the document this pointer was at. Can be `null` if pointer was never active.
     */
    lastPagePos: Vector;
    /**
     * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
     */
    lastScreenPos: Vector;
    /**
     * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
     */
    lastWorldPos: Vector;
    /**
     * Returns the currently dragging target or null if it isn't exist
     */
    dragTarget: Actor;
    constructor();
    /**
     * Update the state of current pointer, meant to be called a the end of frame
     */
    update(): void;
    /**
     * Adds an Actor to actorsUnderPointer object.
     * @param actor An Actor to be added;
     */
    addActorUnderPointer(actor: Actor): void;
    /**
     * Removes an Actor from actorsUnderPointer object.
     * @param actor An Actor to be removed;
     */
    removeActorUnderPointer(actor: Actor): void;
    /**
     * Returns all actors under this pointer this frame
     */
    getActorsUnderPointer(): Actor[];
    /**
     * Returns all actors that are no longer under the pointer this frame
     */
    getActorsUnderPointerLastFrame(): Actor[];
    /**
     * Returns all actors relevant for events to pointer this frame
     */
    getActorsForEvents(): Actor[];
    /**
     * Checks if Pointer has a specific Actor under.
     * @param actor An Actor for check;
     */
    checkActorUnderPointer(actor: Actor): boolean;
    /**
     * Checks if an actor was under the pointer last frame
     * @param actor
     */
    wasActorUnderPointer(actor: Actor): boolean;
    /**
     * Checks if Pointer has a specific Actor in ActorsUnderPointer list.
     * @param actor An Actor for check;
     */
    isActorUnderPointer(actor: Actor): boolean;
    private _onPointerMove;
    private _onPointerDown;
    private _onPointerUp;
}
