var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { System, SystemType } from '../EntityComponentSystem';
import { CoordPlane } from '../EntityComponentSystem/Components/TransformComponent';
/**
 * Draws anything with a transform and a "draw" method
 */
var CanvasDrawingSystem = /** @class */ (function (_super) {
    __extends(CanvasDrawingSystem, _super);
    function CanvasDrawingSystem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.types = ['transform', 'canvas'];
        _this.systemType = SystemType.Draw;
        _this.priority = -1;
        return _this;
    }
    CanvasDrawingSystem.prototype.initialize = function (scene) {
        this._ctx = scene.engine.ctx;
        this._engine = scene.engine;
        this._camera = scene.camera;
    };
    CanvasDrawingSystem.prototype.sort = function (a, b) {
        return a.components.transform.z - b.components.transform.z;
    };
    CanvasDrawingSystem.prototype.update = function (entities, delta) {
        this._clearScreen();
        var transform;
        var canvasdraw;
        var length = entities.length;
        for (var i = 0; i < length; i++) {
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
    };
    CanvasDrawingSystem.prototype._applyTransform = function (actor) {
        var parent = actor.parent;
        while (parent) {
            this._ctx.translate(parent.pos.x, parent.pos.y);
            this._ctx.rotate(parent.rotation);
            this._ctx.scale(parent.scale.x, parent.scale.y);
            parent = parent.parent;
        }
        this._ctx.translate(actor.pos.x, actor.pos.y);
        this._ctx.rotate(actor.rotation);
        this._ctx.scale(actor.scale.x, actor.scale.y);
    };
    CanvasDrawingSystem.prototype._clearScreen = function () {
        this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
        this._ctx.fillStyle = this._engine.backgroundColor.toString();
        this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
    };
    CanvasDrawingSystem.prototype._pushCameraTransform = function (transform) {
        if (transform.coordPlane === CoordPlane.World) {
            // Apply camera transform to place entity in world space
            this._ctx.save();
            if (this._camera) {
                this._camera.draw(this._ctx);
            }
        }
    };
    CanvasDrawingSystem.prototype._popCameraTransform = function (transform) {
        if (transform.coordPlane === CoordPlane.World) {
            // Restore back to screen space from world space if we were drawing an entity there
            this._ctx.restore();
        }
    };
    return CanvasDrawingSystem;
}(System));
export { CanvasDrawingSystem };
//# sourceMappingURL=CanvasDrawingSystem.js.map