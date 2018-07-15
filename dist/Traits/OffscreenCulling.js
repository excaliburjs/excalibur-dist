import { CullingBox } from './../Util/CullingBox';
import { Vector } from '../Algebra';
import { ExitViewPortEvent, EnterViewPortEvent } from '../Events';
var OffscreenCulling = /** @class */ (function () {
    function OffscreenCulling() {
        this.cullingBox = new CullingBox();
    }
    OffscreenCulling.prototype.update = function (actor, engine) {
        var eventDispatcher = actor.eventDispatcher;
        var anchor = actor.anchor;
        var globalScale = actor.getGlobalScale();
        var width = (globalScale.x * actor.getWidth()) / actor.scale.x;
        var height = (globalScale.y * actor.getHeight()) / actor.scale.y;
        var cameraPos = engine.currentScene.camera.pos;
        var worldPos = actor.getWorldPos();
        var actorScreenCoords = engine.worldToScreenCoordinates(new Vector(worldPos.x - anchor.x * width, worldPos.y - anchor.y * height));
        var cameraScreenCoords = engine.worldToScreenCoordinates(cameraPos);
        var zoom = 1.0;
        if (actor.scene && actor.scene.camera) {
            zoom = Math.abs(actor.scene.camera.getZoom());
        }
        var isSpriteOffScreen = true;
        if (actor.currentDrawing != null) {
            isSpriteOffScreen = this.cullingBox.isSpriteOffScreen(actor, engine);
        }
        if (!actor.isOffScreen) {
            if ((actorScreenCoords.x + width * zoom < 0 ||
                actorScreenCoords.y + height * zoom < 0 ||
                actorScreenCoords.x > engine.halfDrawWidth + cameraScreenCoords.x ||
                actorScreenCoords.y > engine.halfDrawHeight + cameraScreenCoords.y) &&
                isSpriteOffScreen) {
                eventDispatcher.emit('exitviewport', new ExitViewPortEvent(actor));
                actor.isOffScreen = true;
            }
        }
        else {
            if ((actorScreenCoords.x + width * zoom > 0 &&
                actorScreenCoords.y + height * zoom > 0 &&
                actorScreenCoords.x < engine.halfDrawWidth + cameraScreenCoords.x &&
                actorScreenCoords.y < engine.halfDrawHeight + cameraScreenCoords.y) ||
                !isSpriteOffScreen) {
                eventDispatcher.emit('enterviewport', new EnterViewPortEvent(actor));
                actor.isOffScreen = false;
            }
        }
    };
    return OffscreenCulling;
}());
export { OffscreenCulling };
//# sourceMappingURL=OffscreenCulling.js.map