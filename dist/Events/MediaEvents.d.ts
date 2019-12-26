import { GameEvent } from '../Events';
import { Sound } from '../Resources/Sound/Sound';
import { Actor } from '../Actor';
import { AudioInstance } from '../Resources/Sound/AudioInstance';
export declare class MediaEvent extends GameEvent<Sound> {
    target: Sound;
    protected _name: string;
    /**
     * Media event cannot bubble
     */
    set bubbles(_value: boolean);
    /**
     * Media event cannot bubble
     */
    get bubbles(): boolean;
    /**
     * Media event cannot bubble, so they have no path
     */
    protected get _path(): Actor[];
    /**
     * Media event cannot bubble, so they have no path
     */
    protected set _path(_val: Actor[]);
    constructor(target: Sound, _name?: string);
    /**
     * Prevents event from bubbling
     */
    stopPropagation(): void;
    /**
     * Action, that calls when event happens
     */
    action(): void;
    /**
     * Propagate event further through event path
     */
    propagate(): void;
    layPath(_actor: Actor): void;
}
export declare class NativeSoundEvent extends MediaEvent {
    track?: AudioInstance;
    constructor(target: Sound, track?: AudioInstance);
}
