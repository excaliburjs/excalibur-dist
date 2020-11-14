/**
 * Enum that determines whether to run the system in the update or draw phase
 */
export var SystemType;
(function (SystemType) {
    SystemType["Update"] = "update";
    SystemType["Draw"] = "draw";
})(SystemType || (SystemType = {}));
/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 *
 * Excalibur Systems currently require at least 1 Component type to operated
 *
 * Multiple types are declared as a type union
 * For example:
 *
 * ```typescript
 * class MySystem extends System<ComponentA | ComponentB> {
 *   public readonly types = ['a', 'b'] as const;
 *   public readonly systemType = SystemType.Update;
 *   public update(entities: Entity<ComponentA | ComponentB>) {
 *      ...
 *   }
 * }
 * ```
 */
export class System {
    constructor() {
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
    notify(_entityAddedOrRemoved) {
        // Override me
    }
}
/**
 * An [[Entity]] with [[Component]] types that matches a [[System]] types exists in the current scene.
 */
export class AddedEntity {
    constructor(data) {
        this.data = data;
        this.type = 'Entity Added';
    }
}
/**
 * Type guard to check for AddedEntity messages
 * @param x
 */
export function isAddedSystemEntity(x) {
    return !!x && x.type === 'Entity Added';
}
/**
 * An [[Entity]] with [[Component]] types that no longer matches a [[System]] types exists in the current scene.
 */
export class RemovedEntity {
    constructor(data) {
        this.data = data;
        this.type = 'Entity Removed';
    }
}
/**
 * type guard to check for the RemovedEntity message
 */
export function isRemoveSystemEntity(x) {
    return !!x && x.type === 'Entity Removed';
}
//# sourceMappingURL=System.js.map