import { Util } from '..';
/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
export class SystemManager {
    constructor(_world) {
        this._world = _world;
        /**
         * List of systems, to add a new system call [[SystemManager.addSystem]]
         */
        this.systems = [];
    }
    /**
     * Adds a system to the manager, it will now be updated every frame
     * @param system
     */
    addSystem(system) {
        // validate system has types
        if (!system.types || system.types.length === 0) {
            throw new Error(`Attempted to add a System without any types`);
        }
        const query = this._world.queryManager.createQuery(system.types);
        this.systems.push(system);
        this.systems.sort((a, b) => a.priority - b.priority);
        query.register(system);
        if (system.initialize) {
            system.initialize(this._world.context);
        }
    }
    /**
     * Removes a system from the manager, it will no longer be updated
     * @param system
     */
    removeSystem(system) {
        Util.removeItemFromArray(system, this.systems);
        const query = this._world.queryManager.getQuery(system.types);
        if (query) {
            query.unregister(system);
            this._world.queryManager.maybeRemoveQuery(query);
        }
    }
    /**
     * Updates all systems
     * @param type whether this is an update or draw system
     * @param engine engine reference
     * @param delta time in milliseconds
     */
    updateSystems(type, engine, delta) {
        const systems = this.systems.filter((s) => s.systemType === type);
        for (const s of systems) {
            if (s.preupdate) {
                s.preupdate(engine, delta);
            }
        }
        for (const s of systems) {
            const entities = this._world.queryManager.getQuery(s.types).getEntities(s.sort);
            s.update(entities, delta);
        }
        for (const s of systems) {
            if (s.postupdate) {
                s.postupdate(engine, delta);
            }
        }
    }
    clear() {
        for (const system of this.systems) {
            this.removeSystem(system);
        }
    }
}
//# sourceMappingURL=SystemManager.js.map