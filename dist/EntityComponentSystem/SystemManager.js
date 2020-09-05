import { Util } from '..';
/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
var SystemManager = /** @class */ (function () {
    function SystemManager(_scene) {
        this._scene = _scene;
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
        var query = this._scene.queryManager.createQuery(system.types);
        this.systems.push(system);
        // TODO polyfil stable .sort(), this mechanism relies on a stable sort
        this.systems.sort(function (a, b) { return a.priority - b.priority; });
        query.register(system);
    };
    /**
     * Removes a system from the manager, it will no longer be updated
     * @param system
     */
    SystemManager.prototype.removeSystem = function (system) {
        Util.removeItemFromArray(system, this.systems);
        var query = this._scene.queryManager.getQuery(system.types);
        if (query) {
            query.unregister(system);
            this._scene.queryManager.maybeRemoveQuery(query);
        }
    };
    /**
     * Updates all systems
     * @param engine
     * @param delta
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
            var entities = this._scene.queryManager.getQuery(s.types).entities;
            s.update(entities, delta);
        }
        for (var _b = 0, systems_3 = systems; _b < systems_3.length; _b++) {
            var s = systems_3[_b];
            if (s.postupdate) {
                s.postupdate(engine, delta);
            }
        }
    };
    return SystemManager;
}());
export { SystemManager };
//# sourceMappingURL=SystemManager.js.map