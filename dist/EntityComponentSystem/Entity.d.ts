import { Component } from './Component';
import { Observable, Message } from '../Util/Observable';
import { Class } from '../Class';
import { OnInitialize, OnPreUpdate, OnPostUpdate } from '../Interfaces/LifecycleEvents';
import { Engine } from '../Engine';
/**
 * Interface holding an entity component pair
 */
export interface EntityComponent {
    component: Component;
    entity: Entity;
}
/**
 * AddedComponent message
 */
export declare class AddedComponent implements Message<EntityComponent> {
    data: EntityComponent;
    readonly type: 'Component Added';
    constructor(data: EntityComponent);
}
/**
 * Type guard to know if message is f an Added Component
 */
export declare function isAddedComponent(x: Message<EntityComponent>): x is AddedComponent;
/**
 * RemovedComponent message
 */
export declare class RemovedComponent implements Message<EntityComponent> {
    data: EntityComponent;
    readonly type: 'Component Removed';
    constructor(data: EntityComponent);
}
/**
 * Type guard to know if message is for a Removed Component
 */
export declare function isRemovedComponent(x: Message<EntityComponent>): x is RemovedComponent;
export declare type ComponentMap = {
    [type: string]: Component;
};
export declare type MapTypeNameToComponent<TypeName extends string, ComponentType extends Component> = ComponentType extends Component<TypeName> ? ComponentType : never;
export declare type ComponentMapper<PossibleComponentTypes extends Component> = {
    [TypeName in PossibleComponentTypes['type']]: MapTypeNameToComponent<TypeName, PossibleComponentTypes>;
} & ComponentMap;
export declare type ExcludeType<TypeUnion, TypeNameOrType> = TypeNameOrType extends string ? Exclude<TypeUnion, Component<TypeNameOrType>> : Exclude<TypeUnion, TypeNameOrType>;
/**
 * An Entity is the base type of anything that can have behavior in Excalibur, they are part of the built in entity component system
 *
 * Entities can be strongly typed with the components they contain
 *
 * ```typescript
 * const entity = new Entity<ComponentA | ComponentB>();
 * entity.components.a; // Type ComponentA
 * entity.components.b; // Type ComponentB
 * ```
 */
export declare class Entity<KnownComponents extends Component = never> extends Class implements OnInitialize, OnPreUpdate, OnPostUpdate {
    private static _ID;
    /**
     * The unique identifier for the entity
     */
    id: number;
    /**
     * Whether this entity is active, if set to false it will be reclaimed
     */
    active: boolean;
    /**
     * Kill the entity, means it will no longer be updated. Kills are deferred to the end of the update.
     */
    kill(): void;
    isKilled(): boolean;
    /**
     * Specifically get the tags on the entity from [[TagComponent]]
     */
    get tags(): string[];
    /**
     * Check if a tag exists on the entity
     * @param tag name to check for
     */
    hasTag(tag: string): boolean;
    /**
     * The types of the components on the Entity
     */
    get types(): string[];
    private _tagsMemo;
    private _typesMemo;
    private _rebuildMemos;
    /**
     * Bucket to hold on to deferred removals
     */
    private _componentsToRemove;
    /**
     * Proxy handler for component changes, responsible for notifying observers
     */
    private _handleChanges;
    /**
     * Dictionary that holds entity components
     */
    components: ComponentMapper<KnownComponents>;
    /**
     * Observable that keeps track of component add or remove changes on the entity
     */
    changes: Observable<AddedComponent | RemovedComponent>;
    /**
     * Creates a deep copy of the entity and a copy of all its components
     */
    clone(): Entity;
    /**
     * Adds a component to the entity, or adds a copy of all the components from another entity as a "prefab"
     * @param componentOrEntity Component or Entity to add copy of components from
     * @param force Optionally overwrite any existing components of the same type
     */
    addComponent<T extends Component>(componentOrEntity: T | Entity<T>, force?: boolean): Entity<KnownComponents | T>;
    /**
     * Removes a component from the entity, by default removals are deferred to the end of entity processing to avoid consistency issues
     *
     * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
     * @param componentOrType
     * @param force
     */
    removeComponent<ComponentOrType extends string | Component>(componentOrType: ComponentOrType, force?: boolean): Entity<ExcludeType<KnownComponents, ComponentOrType>>;
    private _removeComponentByType;
    /**
     * @hidden
     * @internal
     */
    processComponentRemoval(): void;
    /**
     * Check if a component type exists
     * @param type
     */
    has(type: string): boolean;
    private _isInitialized;
    /**
     * Gets whether the actor is Initialized
     */
    get isInitialized(): boolean;
    /**
     * Initializes this entity, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * @internal
     */
    _initialize(engine: Engine): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    _preupdate(engine: Engine, delta: number): void;
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    _postupdate(engine: Engine, delta: number): void;
    /**
     * `onInitialize` is called before the first update of the entity. This method is meant to be
     * overridden.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    onInitialize(_engine: Engine): void;
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an entity is updated.
     */
    onPreUpdate(_engine: Engine, _delta: number): void;
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an entity is updated.
     */
    onPostUpdate(_engine: Engine, _delta: number): void;
}
