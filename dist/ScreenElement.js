var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Vector } from './Algebra';
import { Actor } from './Actor';
import * as Traits from './Traits/Index';
import { CollisionType } from './Collision/CollisionType';
import { Shape } from './Collision/Shape';
/**
 * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
 * not participate in collisions. Drawn on top of all other actors.
 */
var ScreenElement = /** @class */ (function (_super) {
    __extends(ScreenElement, _super);
    /**
     * @param x       The starting x coordinate of the actor
     * @param y       The starting y coordinate of the actor
     * @param width   The starting width of the actor
     * @param height  The starting height of the actor
     */
    function ScreenElement(xOrConfig, y, width, height) {
        var _this = this;
        if (typeof xOrConfig !== 'object') {
            _this = _super.call(this, xOrConfig, y, width, height) || this;
        }
        else {
            _this = _super.call(this, xOrConfig) || this;
        }
        _this.traits = [];
        _this.traits.push(new Traits.CapturePointer());
        _this.anchor.setTo(0, 0);
        _this.body.collider.type = CollisionType.PreventCollision;
        _this.body.collider.shape = Shape.Box(_this.width, _this.height, _this.anchor);
        _this.enableCapturePointer = true;
        return _this;
    }
    ScreenElement.prototype._initialize = function (engine) {
        this._engine = engine;
        _super.prototype._initialize.call(this, engine);
    };
    ScreenElement.prototype.contains = function (x, y, useWorld) {
        if (useWorld === void 0) { useWorld = true; }
        if (useWorld) {
            return _super.prototype.contains.call(this, x, y);
        }
        var coords = this._engine.worldToScreenCoordinates(new Vector(x, y));
        return _super.prototype.contains.call(this, coords.x, coords.y);
    };
    return ScreenElement;
}(Actor));
export { ScreenElement };