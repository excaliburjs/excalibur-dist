import { EventDispatcher } from './EventDispatcher';
/**
 * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
 * and extending abilities for vanilla Javascript projects
 */
export class Class {
    constructor() {
        this.eventDispatcher = new EventDispatcher(this);
    }
    /**
     * Alias for `addEventListener`. You can listen for a variety of
     * events off of the engine; see the events section below for a complete list.
     * @param eventName  Name of the event to listen for
     * @param handler    Event handler for the thrown event
     */
    on(eventName, handler) {
        this.eventDispatcher.on(eventName, handler);
    }
    /**
     * Alias for `removeEventListener`. If only the eventName is specified
     * it will remove all handlers registered for that specific event. If the eventName
     * and the handler instance are specified only that handler will be removed.
     *
     * @param eventName  Name of the event to listen for
     * @param handler    Event handler for the thrown event
     */
    off(eventName, handler) {
        this.eventDispatcher.off(eventName, handler);
    }
    /**
     * Emits a new event
     * @param eventName   Name of the event to emit
     * @param eventObject Data associated with this event
     */
    emit(eventName, eventObject) {
        this.eventDispatcher.emit(eventName, eventObject);
    }
    /**
     * Once listens to an event one time, then unsubscribes from that event
     *
     * @param eventName The name of the event to subscribe to once
     * @param handler   The handler of the event that will be auto unsubscribed
     */
    once(eventName, handler) {
        this.eventDispatcher.once(eventName, handler);
    }
}
//# sourceMappingURL=Class.js.map