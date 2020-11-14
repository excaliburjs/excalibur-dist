import { Entity } from './Entity';
import { buildTypeKey } from './Util';
import { Observable } from '../Util/Observable';
import { Util } from '..';
import { AddedEntity, RemovedEntity } from './System';
/**
 * Represents query for entities that match a list of types that is cached and observable
 *
 * Queries can be strongly typed by supplying a type union in the optional type parameter
 * ```typescript
 * const queryAB = new ex.Query<ComponentTypeA, ComponentTypeB>(['A', 'B']);
 * ```
 */
export class Query extends Observable {
    constructor(types) {
        super();
        this.types = types;
        this._entities = [];
    }
    get key() {
        if (this._key) {
            return this._key;
        }
        return (this._key = buildTypeKey(this.types));
    }
    /**
     * Returns a list of entities that match the query
     *
     * @param sort Optional sorting function to sort entities returned from the query
     */
    getEntities(sort) {
        if (sort) {
            this._entities.sort(sort);
        }
        return this._entities;
    }
    /**
     * Add an entity to the query, will only be added if the entity matches the query types
     * @param entity
     */
    addEntity(entity) {
        if (!Util.contains(this._entities, entity) && this.matches(entity)) {
            this._entities.push(entity);
            this.notifyAll(new AddedEntity(entity));
        }
    }
    /**
     * If the entity is part of the query it will be removed regardless of types
     * @param entity
     */
    removeEntity(entity) {
        if (Util.removeItemFromArray(entity, this._entities)) {
            this.notifyAll(new RemovedEntity(entity));
        }
    }
    /**
     * Removes all entities and observers from the query
     */
    clear() {
        this._entities.length = 0;
        for (const observer of this.observers) {
            this.unregister(observer);
        }
    }
    matches(typesOrEntity) {
        let types = [];
        if (typesOrEntity instanceof Entity) {
            types = typesOrEntity.types;
        }
        else {
            types = typesOrEntity;
        }
        let matches = true;
        for (const type of this.types) {
            matches = matches && types.indexOf(type) > -1;
            if (!matches) {
                return false;
            }
        }
        return matches;
    }
}
//# sourceMappingURL=Query.js.map