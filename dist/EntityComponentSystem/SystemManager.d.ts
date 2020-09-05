import { System, SystemType } from './System';
import { Engine } from '../Engine';
import { Component } from '..';
import { Scene } from '../Scene';
/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
export declare class SystemManager {
    private _scene;
    systems: System<any>[];
    _keyToSystem: {
        [key: string]: System;
    };
    constructor(_scene: Scene);
    /**
     * Adds a system to the manager, it will now be updated every frame
     * @param system
     */
    addSystem<T extends Component = Component>(system: System<T>): void;
    /**
     * Removes a system from the manager, it will no longer be updated
     * @param system
     */
    removeSystem(system: System): void;
    /**
     * Updates all systems
     * @param engine
     * @param delta
     */
    updateSystems(type: SystemType, engine: Engine, delta: number): void;
}
