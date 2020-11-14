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
export class TransformComponent extends Component {
    constructor() {
        super(...arguments);
        this.type = 'transform';
        /**
         * The [[coordinate plane|CoordPlane]] for this transform for the entity.
         */
        this.coordPlane = CoordPlane.World;
        /**
         * The current position of the entity in world space or in screen space depending on the the [[coordinate plan|CoordPlane]]
         */
        this.pos = Vector.Zero;
        /**
         * The z-index ordering of the entity, a higher values are drawn on top of lower values.
         * For example z=99 would be drawn on top of z=0.
         */
        this.z = 0;
        /**
         * The rotation of the entity in radians. For example `Math.PI` radians is the same as 180 degrees.
         */
        this.rotation = 0;
        /**
         * The scale of the entity.
         */
        this.scale = Vector.One;
    }
}
//# sourceMappingURL=TransformComponent.js.map