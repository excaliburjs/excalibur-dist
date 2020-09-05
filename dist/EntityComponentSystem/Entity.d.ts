import { Component } from './Component';
import { Observable, Message } from '../Util/Observable';
import { Class } from '../Class';
import { OnInitialize, OnPreUpdate, OnPostUpdate } from '../Interfaces/LifecycleEvents';
import { Engine } from '../Engine';
export interface EntityComponent {
    component: Component;
    entity: Entity;
}
export declare class AddedComponent implements Message<EntityComponent> {
    data: EntityComponent;
    readonly type: 'Component Added';
    constructor(data: EntityComponent);
}
export declare function isAddedComponent(x: Message<EntityComponent>): x is AddedComponent;
export declare class RemovedComponent implements Message<EntityComponent> {
    data: EntityComponent;
    readonly type: 'Component Removed';
    constructor(data: EntityComponent);
}
export declare function isRemovedComponent(x: Message<EntityComponent>): x is RemovedComponent;
export declare type ComponentMap = {
    [type: string]: Component;
};
export declare type MapTypeNameToComponent<TypeName extends string, ComponentType extends Component> = ComponentType extends Component<TypeName> ? ComponentType : never;
export declare type ComponentMapper<PossibleComponentTypes extends Component> = {
    [TypeName in PossibleComponentTypes['type']]: MapTypeNameToComponent<TypeName, PossibleComponentTypes>;
} & ComponentMap;
export declare type ExcludeType<TypeUnion, TypeNameOrType> = TypeNameOrType extends string ? Exclude<TypeUnion, Component<TypeNameOrType>> : Exclude<TypeUnion, TypeNameOrType>;
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
    kill(): void;
    isKilled(): boolean;
    private _componentsToRemove;
    /**
     * The types of the components on the Entity
     */
    get types(): string[];
    private _typesMemo;
    private _dirty;
    private _handleChanges;
    components: ComponentMapper<KnownComponents>;
    changes: Observable<AddedComponent | RemovedComponent>;
    /**
     * Creates a deep copy of the entity and a copy of all its components
     */
    clone(): Entity;
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
    processRemoval(): void;
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
