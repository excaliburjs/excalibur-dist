import { GameEvent } from '../Events';
export class MediaEvent extends GameEvent {
    constructor(target, _name = 'MediaEvent') {
        super();
        this.target = target;
        this._name = _name;
    }
    /**
     * Media event cannot bubble
     */
    set bubbles(_value) {
        // stubbed
    }
    /**
     * Media event cannot bubble
     */
    get bubbles() {
        return false;
    }
    /**
     * Media event cannot bubble, so they have no path
     */
    get _path() {
        return null;
    }
    /**
     * Media event cannot bubble, so they have no path
     */
    set _path(_val) {
        // stubbed
    }
    /**
     * Prevents event from bubbling
     */
    stopPropagation() {
        /**
         * Stub
         */
    }
    /**
     * Action, that calls when event happens
     */
    action() {
        /**
         * Stub
         */
    }
    /**
     * Propagate event further through event path
     */
    propagate() {
        /**
         * Stub
         */
    }
    layPath(_actor) {
        /**
         * Stub
         */
    }
}
export class NativeSoundEvent extends MediaEvent {
    constructor(target, track) {
        super(target, 'NativeSoundEvent');
        this.track = track;
    }
}
export class NativeSoundProcessedEvent extends MediaEvent {
    constructor(target, _processedData) {
        super(target, 'NativeSoundProcessedEvent');
        this._processedData = _processedData;
        this.data = this._processedData;
    }
}
//# sourceMappingURL=MediaEvents.js.map