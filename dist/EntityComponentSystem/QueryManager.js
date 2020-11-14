import { buildTypeKey } from './Util';
import { Query } from './Query';
/**
 * The query manager is responsible for updating all queries when entities/components change
 */
export class QueryManager {
    constructor(_world) {
        this._world = _world;
        this._queries = {};
    }
    /**
     * Adds a query to the manager and populates with any entities that match
     * @param query
     */
    _addQuery(query) {
        this._queries[buildTypeKey(query.types)] = query;
        for (const entity of this._world.entityManager.entities) {
            query.addEntity(entity);
        }
    }
    /**
     * Removes the query if there are no observers left
     * @param query
     */
    maybeRemoveQuery(query) {
        if (query.observers.length === 0) {
            query.clear();
            delete this._queries[buildTypeKey(query.types)];
        }
    }
    /**
     * Adds the entity to any matching query in the query manage
     * @param entity
     */
    addEntity(entity) {
        for (const queryType in this._queries) {
            if (this._queries[queryType]) {
                this._queries[queryType].addEntity(entity);
            }
        }
    }
    /**
     * Removes an entity from queries if the removed component disqualifies it
     * @param entity
     * @param component
     */
    removeComponent(entity, component) {
        for (const queryType in this._queries) {
            if (this._queries[queryType].matches(entity.types.concat([component.type]))) {
                this._queries[queryType].removeEntity(entity);
            }
        }
    }
    /**
     * Removes an entity from all queries it is currently a part of
     * @param entity
     */
    removeEntity(entity) {
        for (const queryType in this._queries) {
            this._queries[queryType].removeEntity(entity);
        }
    }
    /**
     * Creates a populated query and returns, if the query already exists that will be returned instead of a new instance
     * @param types
     */
    createQuery(types) {
        const maybeExistingQuery = this.getQuery(types);
        if (maybeExistingQuery) {
            return maybeExistingQuery;
        }
        const query = new Query(types);
        this._addQuery(query);
        return query;
    }
    /**
     * Retrieves an existing query by types if it exists otherwise returns null
     * @param types
     */
    getQuery(types) {
        const key = buildTypeKey(types);
        if (this._queries[key]) {
            return this._queries[key];
        }
        return null;
    }
}
//# sourceMappingURL=QueryManager.js.map