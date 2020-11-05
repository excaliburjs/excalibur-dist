import { Entity } from './Entity';
import { EntityManager } from './EntityManager';
import { QueryManager } from './QueryManager';
import { System } from './System';
import { SystemManager } from './SystemManager';
/**
 * The World is a self-contained entity component system for a particular context.
 */
var World = /** @class */ (function () {
    /**
     * The context type is passed to the system updates
     * @param context
     */
    function World(context) {
        this.context = context;
        this.queryManager = new QueryManager(this);
        this.entityManager = new EntityManager(this);
        this.systemManager = new SystemManager(this);
    }
    /**
     * Update systems by type and time elapsed in milliseconds
     */
    World.prototype.update = function (type, delta) {
        this.systemManager.updateSystems(type, this.context, delta);
        this.entityManager.processComponentRemovals();
    };
    World.prototype.add = function (entityOrSystem) {
        if (entityOrSystem instanceof Entity) {
            this.entityManager.addEntity(entityOrSystem);
        }
        if (entityOrSystem instanceof System) {
            this.systemManager.addSystem(entityOrSystem);
        }
    };
    World.prototype.remove = function (entityOrSystem) {
        if (entityOrSystem instanceof Entity) {
            this.entityManager.removeEntity(entityOrSystem);
        }
        if (entityOrSystem instanceof System) {
            this.systemManager.removeSystem(entityOrSystem);
        }
    };
    World.prototype.clearEntities = function () {
        this.entityManager.clear();
    };
    World.prototype.clearSystems = function () {
        this.systemManager.clear();
    };
    return World;
}());
export { World };
//# sourceMappingURL=World.js.map