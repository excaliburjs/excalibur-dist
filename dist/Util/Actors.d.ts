import { Actor } from '../Actor';
/**
 * Type guard to detect if something is an actor
 * @deprecated
 * @param actor
 */
export declare function isVanillaActor(actor: Actor): boolean;
/**
 * Type guard to detect a screen element
 * TODO: Move to screen element
 */
export declare function isScreenElement(actor: Actor): boolean;
