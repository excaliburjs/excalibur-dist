import { Side } from '../Collision/Side';
import { PreCollisionEvent, PostCollisionEvent } from '../Events';
import { CollisionType } from '../Collision/CollisionType';
import { BoundingBox } from '../Collision/Index';
export class TileMapCollisionDetection {
    update(actor, engine) {
        const eventDispatcher = actor.eventDispatcher;
        if (actor.body.collider.type !== CollisionType.PreventCollision && engine.currentScene && engine.currentScene.tileMaps) {
            for (let j = 0; j < engine.currentScene.tileMaps.length; j++) {
                const map = engine.currentScene.tileMaps[j];
                let intersectMap;
                let side = Side.None;
                let max = 2;
                while ((intersectMap = map.collides(actor))) {
                    if (max-- < 0) {
                        break;
                    }
                    side = BoundingBox.getSideFromIntersection(intersectMap);
                    eventDispatcher.emit('precollision', new PreCollisionEvent(actor, null, side, intersectMap));
                    if (actor.body.collider.type === CollisionType.Active) {
                        actor.pos.y += intersectMap.y;
                        actor.pos.x += intersectMap.x;
                        eventDispatcher.emit('postcollision', new PostCollisionEvent(actor, null, side, intersectMap));
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=TileMapCollisionDetection.js.map