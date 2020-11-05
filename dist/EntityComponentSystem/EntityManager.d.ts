import { Entity, RemovedComponent, AddedComponent } from './Entity';
import { Observer } from '../Util/Observable';
import { World } from './World';
export declare class EntityManager implements Observer<RemovedComponent | AddedComponent> {
    private _world;
    entities: Entity[];
    _entityIndex: {
        [entityId: string]: Entity;
    };
    constructor(_world: World<any>);
    /**
     * EntityManager observes changes on entities
     * @param message
     */
    notify(message: RemovedComponent | AddedComponent): void;
    /**
     * Adds an entity to be tracked by the EntityManager
     * @param entity
     */
    addEntity(entity: Entity): void;
    removeEntity(entity: Entity): void;
    removeEntity(id: number): void;
    processComponentRemovals(): void;
    getById(id: number): Entity;
    clear(): void;
}
