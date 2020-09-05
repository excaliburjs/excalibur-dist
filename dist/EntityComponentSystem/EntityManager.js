import { Entity, isAddedComponent, isRemovedComponent } from './Entity';
import { Util } from '..';
// Add/Remove entitys and components
var EntityManager = /** @class */ (function () {
    function EntityManager(_scene) {
        this._scene = _scene;
        this.entities = [];
        this._entityIndex = {};
    }
    /**
     * EntityManager observes changes on entities
     * @param message
     */
    EntityManager.prototype.notify = function (message) {
        if (isAddedComponent(message)) {
            // we don't need the component, it's already on the entity
            this._scene.queryManager.addEntity(message.data.entity);
        }
        if (isRemovedComponent(message)) {
            this._scene.queryManager.removeComponent(message.data.entity, message.data.component);
        }
    };
    /**
     * Adds an entity to be tracked by the EntityManager
     * @param entity
     */
    EntityManager.prototype.addEntity = function (entity) {
        if (entity) {
            this._entityIndex[entity.id] = entity;
            this.entities.push(entity);
            this._scene.queryManager.addEntity(entity);
            entity.changes.register(this);
        }
    };
    EntityManager.prototype.removeEntity = function (idOrEntity) {
        var id = 0;
        if (idOrEntity instanceof Entity) {
            id = idOrEntity.id;
        }
        else {
            id = idOrEntity;
        }
        var entity = this._entityIndex[id];
        delete this._entityIndex[id];
        if (entity) {
            Util.removeItemFromArray(entity, this.entities);
            this._scene.queryManager.removeEntity(entity);
            entity.changes.unregister(this);
        }
    };
    EntityManager.prototype.processRemovals = function () {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            entity.processRemoval();
        }
    };
    EntityManager.prototype.getById = function (id) {
        return this._entityIndex[id];
    };
    return EntityManager;
}());
export { EntityManager };
//# sourceMappingURL=EntityManager.js.map