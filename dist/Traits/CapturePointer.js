/**
 * Revises pointer events path accordingly to the actor
 */
export class CapturePointer {
    update(actor, engine) {
        if (!actor.enableCapturePointer) {
            return;
        }
        if (actor.isKilled()) {
            return;
        }
        engine.input.pointers.checkAndUpdateActorUnderPointer(actor);
    }
}
//# sourceMappingURL=CapturePointer.js.map