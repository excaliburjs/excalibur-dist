import { ScreenElement } from '../ScreenElement';
import { Label } from '../Label';
import { Trigger } from '../Trigger';
export function isVanillaActor(actor) {
    return !(actor instanceof ScreenElement) && !(actor instanceof Trigger) && !(actor instanceof Label);
}
export function isScreenElement(actor) {
    return actor instanceof ScreenElement;
}
//# sourceMappingURL=Actors.js.map