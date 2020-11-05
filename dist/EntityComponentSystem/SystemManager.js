import { Util } from '..';
/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
var SystemManager = /** @class */ (function () {
    function SystemManager(_world) {
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
    SystemManager.prototype.addSystem = function (system) {
        // validate system has types
        if (!system.types || system.types.length === 0) {
            throw new Error("Attempted to add a System without any types");
        }
        var query = this._world.queryManager.createQuery(system.types);
        this.systems.push(system);
        this.systems.sort(function (a, b) { return a.priority - b.priority; });
        query.register(system);
        if (system.initialize) {
            system.initialize(this._world.context);
        }
    };
    /**
     * Removes a system from the manager, it will no longer be updated
     * @param system
     */
    SystemManager.prototype.removeSystem = function (system) {
        Util.removeItemFromArray(system, this.systems);
        var query = this._world.queryManager.getQuery(system.types);
        if (query) {
            query.unregister(system);
            this._world.queryManager.maybeRemoveQuery(query);
        }
    };
    /**
     * Updates all systems
     * @param type whether this is an update or draw system
     * @param engine engine reference
     * @param delta time in milliseconds
     */
    SystemManager.prototype.updateSystems = function (type, engine, delta) {
        var systems = this.systems.filter(function (s) { return s.systemType === type; });
        for (var _i = 0, systems_1 = systems; _i < systems_1.length; _i++) {
            var s = systems_1[_i];
            if (s.preupdate) {
                s.preupdate(engine, delta);
            }
        }
        for (var _a = 0, systems_2 = systems; _a < systems_2.length; _a++) {
            var s = systems_2[_a];
            var entities = this._world.queryManager.getQuery(s.types).getEntities(s.sort);
            s.update(entities, delta);
        }
        for (var _b = 0, systems_3 = systems; _b < systems_3.length; _b++) {
            var s = systems_3[_b];
            if (s.postupdate) {
                s.postupdate(engine, delta);
            }
        }
    };
    SystemManager.prototype.clear = function () {
        for (var _i = 0, _a = this.systems; _i < _a.length; _i++) {
            var system = _a[_i];
            this.removeSystem(system);
        }
    };
    return SystemManager;
}());
export { SystemManager };
//# sourceMappingURL=SystemManager.js.map