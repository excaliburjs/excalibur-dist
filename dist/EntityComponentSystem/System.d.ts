import { Entity } from './Entity';
import { Engine } from '../Engine';
import { Message, Observer } from '../Util/Observable';
import { Component } from './Component';
export declare enum SystemType {
    Update = "update",
    Draw = "draw"
}
/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 */
export declare abstract class System<T extends Component = Component> implements Observer<AddedEntity | RemovedEntity> {
    /**
     * The types of entities that this system operates on
     */
    abstract readonly types: string[];
    abstract readonly systemType: SystemType;
    /**
     * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
     * For a system to execute before all other a lower priority value (-1 for example) must be set.
     * For a system to exectue after all other a higher priority value (10 for example) must be set.
     */
    priority: number;
    /**
     * Update all entities that match this system's types
     * @param entities Entities to update that match this system's typse
     * @param delta Time in milliseconds
     */
    abstract update(entities: Entity<T>[], delta: number): void;
    /**
     * Optionally run a preupdate before the system processes matching entities
     * @param engine
     * @param delta Time in milliseconds since the last frame
     */
    preupdate?: (engine: Engine, delta: number) => void;
    /**
     * Optionally run a postupdate after the system processes matching entities
     * @param engine
     * @param delta Time in milliseconds since the last frame
     */
    postupdate?: (engine: Engine, delta: number) => void;
    /**
     * Optionally run a debug draw step to visualize the internals of the system
     */
    debugDraw?: (ctx: CanvasRenderingContext2D, delta: number) => void;
    /**
     * Systems observe when entities match their types or no longer match their types, override
     * @param _entityAddedOrRemoved
     */
    notify(_entityAddedOrRemoved: AddedEntity | RemovedEntity): void;
}
/**
 * An [[Entity]] with [[Component]] types that matches a [[System]] types exists in the current scene.
 */
export declare class AddedEntity implements Message<Entity> {
    data: Entity;
    readonly type: 'Entity Added';
    constructor(data: Entity);
}
export declare function isAddedSystemEntity(x: Message<Entity>): x is AddedEntity;
/**
 * An [[Entity]] with [[Component]] types that no longer matches a [[System]] types exists in the current scene.
 */
export declare class RemovedEntity implements Message<Entity> {
    data: Entity;
    readonly type: 'Entity Removed';
    constructor(data: Entity);
}
export declare function isRemoveSystemEntity(x: Message<Entity>): x is RemovedEntity;
