import { GameEvent, SubscribeEvent, UnsubscribeEvent } from './Events';
export class EventDispatcher {
    /**
     * @param target  The object that will be the recipient of events from this event dispatcher
     */
    constructor(target) {
        this._handlers = {};
        this._wiredEventDispatchers = [];
        this._target = target;
    }
    /**
     * Clears any existing handlers or wired event dispatchers on this event dispatcher
     */
    clear() {
        this._handlers = {};
        this._wiredEventDispatchers = [];
    }
    /**
     * Emits an event for target
     * @param eventName  The name of the event to publish
     * @param event      Optionally pass an event data object to the handler
     */
    emit(eventName, event) {
        if (!eventName) {
            // key not mapped
            return;
        }
        eventName = eventName.toLowerCase();
        const target = this._target;
        if (!event) {
            event = new GameEvent();
        }
        event.target = target;
        let i, len;
        if (this._handlers[eventName]) {
            i = 0;
            len = this._handlers[eventName].length;
            for (i; i < len; i++) {
                this._handlers[eventName][i].call(target, event);
            }
        }
        i = 0;
        len = this._wiredEventDispatchers.length;
        for (i; i < len; i++) {
            this._wiredEventDispatchers[i].emit(eventName, event);
        }
    }
    /**
     * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
     * @param eventName  The name of the event to subscribe to
     * @param handler    The handler callback to fire on this event
     */
    on(eventName, handler) {
        eventName = eventName.toLowerCase();
        if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(handler);
        // meta event handlers
        if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
            this.emit('subscribe', new SubscribeEvent(eventName, handler));
        }
    }
    /**
     * Unsubscribe an event handler(s) from an event. If a specific handler
     * is specified for an event, only that handler will be unsubscribed.
     * Otherwise all handlers will be unsubscribed for that event.
     *
     * @param eventName  The name of the event to unsubscribe
     * @param handler    Optionally the specific handler to unsubscribe
     *
     */
    off(eventName, handler) {
        eventName = eventName.toLowerCase();
        const eventHandlers = this._handlers[eventName];
        if (eventHandlers) {
            // if no explicit handler is give with the event name clear all handlers
            if (!handler) {
                this._handlers[eventName].length = 0;
            }
            else {
                const index = eventHandlers.indexOf(handler);
                this._handlers[eventName].splice(index, 1);
            }
        }
        // meta event handlers
        if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
            this.emit('unsubscribe', new UnsubscribeEvent(eventName, handler));
        }
    }
    /**
     * Once listens to an event one time, then unsubscribes from that event
     *
     * @param eventName The name of the event to subscribe to once
     * @param handler   The handler of the event that will be auto unsubscribed
     */
    once(eventName, handler) {
        const metaHandler = (event) => {
            const ev = event || new GameEvent();
            ev.target = ev.target || this._target;
            this.off(eventName, handler);
            handler.call(ev.target, ev);
        };
        this.on(eventName, metaHandler);
    }
    /**
     * Wires this event dispatcher to also receive events from another
     */
    wire(eventDispatcher) {
        eventDispatcher._wiredEventDispatchers.push(this);
    }
    /**
     * Unwires this event dispatcher from another
     */
    unwire(eventDispatcher) {
        const index = eventDispatcher._wiredEventDispatchers.indexOf(this);
        if (index > -1) {
            eventDispatcher._wiredEventDispatchers.splice(index, 1);
        }
    }
}
//# sourceMappingURL=EventDispatcher.js.map