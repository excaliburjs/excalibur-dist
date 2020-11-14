import { Component, TagComponent } from './Component';
import { Observable } from '../Util/Observable';
import { Class } from '../Class';
import { InitializeEvent, PreUpdateEvent, PostUpdateEvent } from '../Events';
/**
 * AddedComponent message
 */
export class AddedComponent {
    constructor(data) {
        this.data = data;
        this.type = 'Component Added';
    }
}
/**
 * Type guard to know if message is f an Added Component
 */
export function isAddedComponent(x) {
    return !!x && x.type === 'Component Added';
}
/**
 * RemovedComponent message
 */
export class RemovedComponent {
    constructor(data) {
        this.data = data;
        this.type = 'Component Removed';
    }
}
/**
 * Type guard to know if message is for a Removed Component
 */
export function isRemovedComponent(x) {
    return !!x && x.type === 'Component Removed';
}
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
export class Entity extends Class {
    constructor() {
        super(...arguments);
        /**
         * The unique identifier for the entity
         */
        this.id = Entity._ID++;
        /**
         * Whether this entity is active, if set to false it will be reclaimed
         */
        this.active = true;
        this._tagsMemo = [];
        this._typesMemo = [];
        /**
         * Bucket to hold on to deferred removals
         */
        this._componentsToRemove = [];
        /**
         * Proxy handler for component changes, responsible for notifying observers
         */
        this._handleChanges = {
            defineProperty: (obj, prop, descriptor) => {
                obj[prop] = descriptor.value;
                this._rebuildMemos();
                this.changes.notifyAll(new AddedComponent({
                    component: descriptor.value,
                    entity: this
                }));
                return true;
            },
            deleteProperty: (obj, prop) => {
                if (prop in obj) {
                    this.changes.notifyAll(new RemovedComponent({
                        component: obj[prop],
                        entity: this
                    }));
                    delete obj[prop];
                    this._rebuildMemos();
                    return true;
                }
                return false;
            }
        };
        /**
         * Dictionary that holds entity components
         */
        this.components = new Proxy({}, this._handleChanges);
        /**
         * Observable that keeps track of component add or remove changes on the entity
         */
        this.changes = new Observable();
        this._isInitialized = false;
    }
    /**
     * Kill the entity, means it will no longer be updated. Kills are deferred to the end of the update.
     */
    kill() {
        this.active = false;
    }
    isKilled() {
        return !this.active;
    }
    /**
     * Specifically get the tags on the entity from [[TagComponent]]
     */
    get tags() {
        return this._tagsMemo;
    }
    /**
     * Check if a tag exists on the entity
     * @param tag name to check for
     */
    hasTag(tag) {
        return this.tags.includes(tag);
    }
    /**
     * The types of the components on the Entity
     */
    get types() {
        return this._typesMemo;
    }
    _rebuildMemos() {
        this._tagsMemo = Object.values(this.components)
            .filter((c) => c instanceof TagComponent)
            .map((c) => c.type);
        this._typesMemo = Object.keys(this.components);
    }
    /**
     * Creates a deep copy of the entity and a copy of all its components
     */
    clone() {
        const newEntity = new Entity();
        for (const c of this.types) {
            newEntity.addComponent(this.components[c].clone());
        }
        return newEntity;
    }
    /**
     * Adds a component to the entity, or adds a copy of all the components from another entity as a "prefab"
     * @param componentOrEntity Component or Entity to add copy of components from
     * @param force Optionally overwrite any existing components of the same type
     */
    addComponent(componentOrEntity, force = false) {
        // If you use an entity as a "prefab" or template
        if (componentOrEntity instanceof Entity) {
            for (const c in componentOrEntity.components) {
                this.addComponent(componentOrEntity.components[c].clone(), force);
            }
            // Normal component case
        }
        else {
            // if component already exists, skip if not forced
            if (this.components[componentOrEntity.type] && !force) {
                return this;
            }
            // Remove existing component type if exists when forced
            if (this.components[componentOrEntity.type] && force) {
                this.removeComponent(componentOrEntity);
            }
            // todo circular dependencies will be a problem
            if (componentOrEntity.dependencies && componentOrEntity.dependencies.length) {
                for (const ctor of componentOrEntity.dependencies) {
                    this.addComponent(new ctor());
                }
            }
            componentOrEntity.owner = this;
            this.components[componentOrEntity.type] = componentOrEntity;
            if (componentOrEntity.onAdd) {
                componentOrEntity.onAdd(this);
            }
        }
        return this;
    }
    /**
     * Removes a component from the entity, by default removals are deferred to the end of entity processing to avoid consistency issues
     *
     * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
     * @param componentOrType
     * @param force
     */
    removeComponent(componentOrType, force = false) {
        if (force) {
            if (typeof componentOrType === 'string') {
                this._removeComponentByType(componentOrType);
            }
            else if (componentOrType instanceof Component) {
                this._removeComponentByType(componentOrType.type);
            }
        }
        else {
            this._componentsToRemove.push(componentOrType);
        }
        return this;
    }
    _removeComponentByType(type) {
        if (this.components[type]) {
            this.components[type].owner = null;
            if (this.components[type].onRemove) {
                this.components[type].onRemove(this);
            }
            delete this.components[type];
        }
    }
    /**
     * @hidden
     * @internal
     */
    processComponentRemoval() {
        for (const componentOrType of this._componentsToRemove) {
            const type = typeof componentOrType === 'string' ? componentOrType : componentOrType.type;
            this._removeComponentByType(type);
        }
        this._componentsToRemove.length = 0;
    }
    /**
     * Check if a component type exists
     * @param type
     */
    has(type) {
        return !!this.components[type];
    }
    /**
     * Gets whether the actor is Initialized
     */
    get isInitialized() {
        return this._isInitialized;
    }
    /**
     * Initializes this entity, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * @internal
     */
    _initialize(engine) {
        if (!this.isInitialized) {
            this.onInitialize(engine);
            super.emit('initialize', new InitializeEvent(engine, this));
            this._isInitialized = true;
        }
    }
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    _preupdate(engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    }
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    _postupdate(engine, delta) {
        this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
        this.onPostUpdate(engine, delta);
    }
    /**
     * `onInitialize` is called before the first update of the entity. This method is meant to be
     * overridden.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    onInitialize(_engine) {
        // Override me
    }
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an entity is updated.
     */
    onPreUpdate(_engine, _delta) {
        // Override me
    }
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an entity is updated.
     */
    onPostUpdate(_engine, _delta) {
        // Override me
    }
}
Entity._ID = 0;
//# sourceMappingURL=Entity.js.map