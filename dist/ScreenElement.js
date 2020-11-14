import { Vector } from './Algebra';
import { Actor } from './Actor';
import * as Traits from './Traits/Index';
import { CollisionType } from './Collision/CollisionType';
import { Shape } from './Collision/Shape';
import { CoordPlane } from './EntityComponentSystem/Components/TransformComponent';
/**
 * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
 * not participate in collisions. Drawn on top of all other actors.
 */
export class ScreenElement extends Actor {
    /**
     * @param xOrConfig  The starting x coordinate of the actor or the actor option bag
     * @param y       The starting y coordinate of the actor
     * @param width   The starting width of the actor
     * @param height  The starting height of the actor
     */
    constructor(xOrConfig, y, width, height) {
        if (typeof xOrConfig !== 'object') {
            super(xOrConfig, y, width, height);
        }
        else {
            super(xOrConfig);
        }
        this.components.transform.coordPlane = CoordPlane.Screen;
        this.traits = [];
        this.traits.push(new Traits.CapturePointer());
        this.anchor.setTo(0, 0);
        this.body.collider.type = CollisionType.PreventCollision;
        this.body.collider.shape = Shape.Box(this.width, this.height, this.anchor);
        this.enableCapturePointer = true;
    }
    _initialize(engine) {
        this._engine = engine;
        super._initialize(engine);
    }
    contains(x, y, useWorld = true) {
        if (useWorld) {
            return super.contains(x, y);
        }
        const coords = this._engine.worldToScreenCoordinates(new Vector(x, y));
        return super.contains(coords.x, coords.y);
    }
}
//# sourceMappingURL=ScreenElement.js.map