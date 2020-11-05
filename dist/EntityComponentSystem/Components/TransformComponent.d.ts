import { Vector } from '../../Algebra';
import { Component } from '../Component';
/**
 * Enum representing the coordinate plane for the position 2D vector in the [[TransformComponent]]
 */
export declare enum CoordPlane {
    /**
     * The world coordinate plane (default) represents world space, any entities drawn with world
     * space move when the camera moves.
     */
    World = "world",
    /**
     * The screen coordinate plane represents screen space, entities drawn in screen space are pinned
     * to screen coordinates ignoring the camera.
     */
    Screen = "screen"
}
export declare class TransformComponent extends Component<'transform'> {
    readonly type = "transform";
    /**
     * The [[coordinate plane|CoordPlane]] for this transform for the entity.
     */
    coordPlane: CoordPlane;
    /**
     * The current position of the entity in world space or in screen space depending on the the [[coordinate plan|CoordPlane]]
     */
    pos: Vector;
    /**
     * The z-index ordering of the entity, a higher values are drawn on top of lower values.
     * For example z=99 would be drawn on top of z=0.
     */
    z: number;
    /**
     * The rotation of the entity in radians. For example `Math.PI` radians is the same as 180 degrees.
     */
    rotation: number;
    /**
     * The scale of the entity.
     */
    scale: Vector;
}
