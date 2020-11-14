import { Entity, isAddedComponent, isRemovedComponent } from './Entity';
import { Util } from '..';
// Add/Remove entitys and components
export class EntityManager {
    constructor(_world) {
        this._world = _world;
        this.entities = [];
        this._entityIndex = {};
    }
    /**
     * EntityManager observes changes on entities
     * @param message
     */
    notify(message) {
        if (isAddedComponent(message)) {
            // we don't need the component, it's already on the entity
            this._world.queryManager.addEntity(message.data.entity);
        }
        if (isRemovedComponent(message)) {
            this._world.queryManager.removeComponent(message.data.entity, message.data.component);
        }
    }
    /**
     * Adds an entity to be tracked by the EntityManager
     * @param entity
     */
    addEntity(entity) {
        if (entity) {
            this._entityIndex[entity.id] = entity;
            this.entities.push(entity);
            this._world.queryManager.addEntity(entity);
            entity.changes.register(this);
        }
    }
    removeEntity(idOrEntity) {
        let id = 0;
        if (idOrEntity instanceof Entity) {
            id = idOrEntity.id;
        }
        else {
            id = idOrEntity;
        }
        const entity = this._entityIndex[id];
        delete this._entityIndex[id];
        if (entity) {
            Util.removeItemFromArray(entity, this.entities);
            this._world.queryManager.removeEntity(entity);
            entity.changes.unregister(this);
        }
    }
    processComponentRemovals() {
        for (const entity of this.entities) {
            entity.processComponentRemoval();
        }
    }
    getById(id) {
        return this._entityIndex[id];
    }
    clear() {
        for (const entity of this.entities) {
            this.removeEntity(entity);
        }
    }
}
//# sourceMappingURL=EntityManager.js.map