import { System, SystemType } from '../EntityComponentSystem';
import { CoordPlane } from '../EntityComponentSystem/Components/TransformComponent';
/**
 * Draws anything with a transform and a "draw" method
 */
export class CanvasDrawingSystem extends System {
    constructor() {
        super(...arguments);
        this.types = ['transform', 'canvas'];
        this.systemType = SystemType.Draw;
        this.priority = -1;
    }
    initialize(scene) {
        this._ctx = scene.engine.ctx;
        this._engine = scene.engine;
        this._camera = scene.camera;
    }
    sort(a, b) {
        return a.components.transform.z - b.components.transform.z;
    }
    update(entities, delta) {
        this._clearScreen();
        let transform;
        let canvasdraw;
        const length = entities.length;
        for (let i = 0; i < length; i++) {
            if (entities[i].visible && !entities[i].isOffScreen) {
                transform = entities[i].components.transform;
                canvasdraw = entities[i].components.canvas;
                this._ctx.save();
                this._pushCameraTransform(transform);
                this._ctx.save();
                this._applyTransform(entities[i]);
                canvasdraw.draw(this._ctx, delta);
                this._ctx.restore();
                this._popCameraTransform(transform);
                this._ctx.restore();
            }
            if (this._engine.isDebug) {
                this._ctx.save();
                this._pushCameraTransform(transform);
                this._ctx.strokeStyle = 'yellow';
                entities[i].debugDraw(this._ctx);
                this._popCameraTransform(transform);
                this._ctx.restore();
            }
        }
        if (this._engine.isDebug) {
            this._ctx.save();
            this._camera.draw(this._ctx);
            this._camera.debugDraw(this._ctx);
            this._ctx.restore();
        }
    }
    _applyTransform(actor) {
        let parent = actor.parent;
        while (parent) {
            this._ctx.translate(parent.pos.x, parent.pos.y);
            this._ctx.rotate(parent.rotation);
            this._ctx.scale(parent.scale.x, parent.scale.y);
            parent = parent.parent;
        }
        this._ctx.translate(actor.pos.x, actor.pos.y);
        this._ctx.rotate(actor.rotation);
        this._ctx.scale(actor.scale.x, actor.scale.y);
    }
    _clearScreen() {
        this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
        this._ctx.fillStyle = this._engine.backgroundColor.toString();
        this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    }
    _pushCameraTransform(transform) {
        if (transform.coordPlane === CoordPlane.World) {
            // Apply camera transform to place entity in world space
            this._ctx.save();
            if (this._camera) {
                this._camera.draw(this._ctx);
            }
        }
    }
    _popCameraTransform(transform) {
        if (transform.coordPlane === CoordPlane.World) {
            // Restore back to screen space from world space if we were drawing an entity there
            this._ctx.restore();
        }
    }
}
//# sourceMappingURL=CanvasDrawingSystem.js.map