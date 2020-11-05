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
import { Vector } from '../../Algebra';
import { Component } from '../Component';
/**
 * Enum representing the coordinate plane for the position 2D vector in the [[TransformComponent]]
 */
export var CoordPlane;
(function (CoordPlane) {
    /**
     * The world coordinate plane (default) represents world space, any entities drawn with world
     * space move when the camera moves.
     */
    CoordPlane["World"] = "world";
    /**
     * The screen coordinate plane represents screen space, entities drawn in screen space are pinned
     * to screen coordinates ignoring the camera.
     */
    CoordPlane["Screen"] = "screen";
})(CoordPlane || (CoordPlane = {}));
var TransformComponent = /** @class */ (function (_super) {
    __extends(TransformComponent, _super);
    function TransformComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'transform';
        /**
         * The [[coordinate plane|CoordPlane]] for this transform for the entity.
         */
        _this.coordPlane = CoordPlane.World;
        /**
         * The current position of the entity in world space or in screen space depending on the the [[coordinate plan|CoordPlane]]
         */
        _this.pos = Vector.Zero;
        /**
         * The z-index ordering of the entity, a higher values are drawn on top of lower values.
         * For example z=99 would be drawn on top of z=0.
         */
        _this.z = 0;
        /**
         * The rotation of the entity in radians. For example `Math.PI` radians is the same as 180 degrees.
         */
        _this.rotation = 0;
        /**
         * The scale of the entity.
         */
        _this.scale = Vector.One;
        return _this;
    }
    return TransformComponent;
}(Component));
export { TransformComponent };
//# sourceMappingURL=TransformComponent.js.map