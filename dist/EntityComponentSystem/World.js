import { Entity } from './Entity';
import { EntityManager } from './EntityManager';
import { QueryManager } from './QueryManager';
import { System } from './System';
import { SystemManager } from './SystemManager';
/**
 * The World is a self-contained entity component system for a particular context.
 */
export class World {
    /**
     * The context type is passed to the system updates
     * @param context
     */
    constructor(context) {
        this.context = context;
        this.queryManager = new QueryManager(this);
        this.entityManager = new EntityManager(this);
        this.systemManager = new SystemManager(this);
    }
    /**
     * Update systems by type and time elapsed in milliseconds
     */
    update(type, delta) {
        this.systemManager.updateSystems(type, this.context, delta);
        this.entityManager.processComponentRemovals();
    }
    add(entityOrSystem) {
        if (entityOrSystem instanceof Entity) {
            this.entityManager.addEntity(entityOrSystem);
        }
        if (entityOrSystem instanceof System) {
            this.systemManager.addSystem(entityOrSystem);
        }
    }
    remove(entityOrSystem) {
        if (entityOrSystem instanceof Entity) {
            this.entityManager.removeEntity(entityOrSystem);
        }
        if (entityOrSystem instanceof System) {
            this.systemManager.removeSystem(entityOrSystem);
        }
    }
    clearEntities() {
        this.entityManager.clear();
    }
    clearSystems() {
        this.systemManager.clear();
    }
}
//# sourceMappingURL=World.js.map