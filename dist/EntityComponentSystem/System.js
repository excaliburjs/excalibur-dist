export var SystemType;
(function (SystemType) {
    SystemType["Update"] = "update";
    SystemType["Draw"] = "draw";
})(SystemType || (SystemType = {}));
/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 */
var System = /** @class */ (function () {
    function System() {
        /**
         * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
         * For a system to execute before all other a lower priority value (-1 for example) must be set.
         * For a system to exectue after all other a higher priority value (10 for example) must be set.
         */
        this.priority = 0;
    }
    /**
     * Systems observe when entities match their types or no longer match their types, override
     * @param _entityAddedOrRemoved
     */
    System.prototype.notify = function (_entityAddedOrRemoved) {
        // Override me
    };
    return System;
}());
export { System };
/**
 * An [[Entity]] with [[Component]] types that matches a [[System]] types exists in the current scene.
 */
var AddedEntity = /** @class */ (function () {
    function AddedEntity(data) {
        this.data = data;
        this.type = 'Entity Added';
    }
    return AddedEntity;
}());
export { AddedEntity };
export function isAddedSystemEntity(x) {
    return !!x && x.type === 'Entity Added';
}
/**
 * An [[Entity]] with [[Component]] types that no longer matches a [[System]] types exists in the current scene.
 */
var RemovedEntity = /** @class */ (function () {
    function RemovedEntity(data) {
        this.data = data;
        this.type = 'Entity Removed';
    }
    return RemovedEntity;
}());
export { RemovedEntity };
export function isRemoveSystemEntity(x) {
    return !!x && x.type === 'Entity Removed';
}
//# sourceMappingURL=System.js.map