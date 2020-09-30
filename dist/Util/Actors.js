import { ScreenElement } from '../ScreenElement';
import { Label } from '../Label';
import { Trigger } from '../Trigger';
/**
 * Type guard to detect if something is an actor
 * @deprecated
 * @param actor
 */
export function isVanillaActor(actor) {
    return !(actor instanceof ScreenElement) && !(actor instanceof Trigger) && !(actor instanceof Label);
}
/**
 * Type guard to detect a screen element
 * TODO: Move to screen element
 */
export function isScreenElement(actor) {
    return actor instanceof ScreenElement;
}
//# sourceMappingURL=Actors.js.map