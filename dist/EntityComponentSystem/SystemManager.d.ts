import { System, SystemType } from './System';
import { World } from './World';
/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
export declare class SystemManager<ContextType> {
    private _world;
    /**
     * List of systems, to add a new system call [[SystemManager.addSystem]]
     */
    systems: System<any, ContextType>[];
    _keyToSystem: {
        [key: string]: System<any, ContextType>;
    };
    constructor(_world: World<ContextType>);
    /**
     * Adds a system to the manager, it will now be updated every frame
     * @param system
     */
    addSystem(system: System<any, ContextType>): void;
    /**
     * Removes a system from the manager, it will no longer be updated
     * @param system
     */
    removeSystem(system: System<any, ContextType>): void;
    /**
     * Updates all systems
     * @param type whether this is an update or draw system
     * @param engine engine reference
     * @param delta time in milliseconds
     */
    updateSystems(type: SystemType, engine: ContextType, delta: number): void;
    clear(): void;
}
