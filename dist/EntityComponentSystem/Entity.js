var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Component, TagComponent } from './Component';
import { Observable } from '../Util/Observable';
import { Class } from '../Class';
import { InitializeEvent, PreUpdateEvent, PostUpdateEvent } from '../Events';
/**
 * AddedComponent message
 */
var AddedComponent = /** @class */ (function () {
    function AddedComponent(data) {
        this.data = data;
        this.type = 'Component Added';
    }
    return AddedComponent;
}());
export { AddedComponent };
/**
 * Type guard to know if message is f an Added Component
 */
export function isAddedComponent(x) {
    return !!x && x.type === 'Component Added';
}
/**
 * RemovedComponent message
 */
var RemovedComponent = /** @class */ (function () {
    function RemovedComponent(data) {
        this.data = data;
        this.type = 'Component Removed';
    }
    return RemovedComponent;
}());
export { RemovedComponent };
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
var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    function Entity() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * The unique identifier for the entity
         */
        _this.id = Entity._ID++;
        /**
         * Whether this entity is active, if set to false it will be reclaimed
         */
        _this.active = true;
        _this._tagsMemo = [];
        _this._typesMemo = [];
        /**
         * Bucket to hold on to deferred removals
         */
        _this._componentsToRemove = [];
        /**
         * Proxy handler for component changes, responsible for notifying observers
         */
        _this._handleChanges = {
            defineProperty: function (obj, prop, descriptor) {
                obj[prop] = descriptor.value;
                _this._rebuildMemos();
                _this.changes.notifyAll(new AddedComponent({
                    component: descriptor.value,
                    entity: _this
                }));
                return true;
            },
            deleteProperty: function (obj, prop) {
                if (prop in obj) {
                    _this.changes.notifyAll(new RemovedComponent({
                        component: obj[prop],
                        entity: _this
                    }));
                    delete obj[prop];
                    _this._rebuildMemos();
                    return true;
                }
                return false;
            }
        };
        /**
         * Dictionary that holds entity components
         */
        _this.components = new Proxy({}, _this._handleChanges);
        /**
         * Observable that keeps track of component add or remove changes on the entity
         */
        _this.changes = new Observable();
        _this._isInitialized = false;
        return _this;
    }
    /**
     * Kill the entity, means it will no longer be updated. Kills are deferred to the end of the update.
     */
    Entity.prototype.kill = function () {
        this.active = false;
    };
    Entity.prototype.isKilled = function () {
        return !this.active;
    };
    Object.defineProperty(Entity.prototype, "tags", {
        /**
         * Specifically get the tags on the entity from [[TagComponent]]
         */
        get: function () {
            return this._tagsMemo;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Check if a tag exists on the entity
     * @param tag name to check for
     */
    Entity.prototype.hasTag = function (tag) {
        return this.tags.includes(tag);
    };
    Object.defineProperty(Entity.prototype, "types", {
        /**
         * The types of the components on the Entity
         */
        get: function () {
            return this._typesMemo;
        },
        enumerable: false,
        configurable: true
    });
    Entity.prototype._rebuildMemos = function () {
        this._tagsMemo = Object.values(this.components)
            .filter(function (c) { return c instanceof TagComponent; })
            .map(function (c) { return c.type; });
        this._typesMemo = Object.keys(this.components);
    };
    /**
     * Creates a deep copy of the entity and a copy of all its components
     */
    Entity.prototype.clone = function () {
        var newEntity = new Entity();
        for (var _i = 0, _a = this.types; _i < _a.length; _i++) {
            var c = _a[_i];
            newEntity.addComponent(this.components[c].clone());
        }
        return newEntity;
    };
    /**
     * Adds a component to the entity, or adds a copy of all the components from another entity as a "prefab"
     * @param componentOrEntity Component or Entity to add copy of components from
     * @param force Optionally overwrite any existing components of the same type
     */
    Entity.prototype.addComponent = function (componentOrEntity, force) {
        if (force === void 0) { force = false; }
        // If you use an entity as a "prefab" or template
        if (componentOrEntity instanceof Entity) {
            for (var c in componentOrEntity.components) {
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
                for (var _i = 0, _a = componentOrEntity.dependencies; _i < _a.length; _i++) {
                    var ctor = _a[_i];
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
    };
    /**
     * Removes a component from the entity, by default removals are deferred to the end of entity processing to avoid consistency issues
     *
     * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
     * @param componentOrType
     * @param force
     */
    Entity.prototype.removeComponent = function (componentOrType, force) {
        if (force === void 0) { force = false; }
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
    };
    Entity.prototype._removeComponentByType = function (type) {
        if (this.components[type]) {
            this.components[type].owner = null;
            if (this.components[type].onRemove) {
                this.components[type].onRemove(this);
            }
            delete this.components[type];
        }
    };
    /**
     * @hidden
     * @internal
     */
    Entity.prototype.processComponentRemoval = function () {
        for (var _i = 0, _a = this._componentsToRemove; _i < _a.length; _i++) {
            var componentOrType = _a[_i];
            var type = typeof componentOrType === 'string' ? componentOrType : componentOrType.type;
            this._removeComponentByType(type);
        }
        this._componentsToRemove.length = 0;
    };
    /**
     * Check if a component type exists
     * @param type
     */
    Entity.prototype.has = function (type) {
        return !!this.components[type];
    };
    Object.defineProperty(Entity.prototype, "isInitialized", {
        /**
         * Gets whether the actor is Initialized
         */
        get: function () {
            return this._isInitialized;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initializes this entity, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * @internal
     */
    Entity.prototype._initialize = function (engine) {
        if (!this.isInitialized) {
            this.onInitialize(engine);
            _super.prototype.emit.call(this, 'initialize', new InitializeEvent(engine, this));
            this._isInitialized = true;
        }
    };
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    Entity.prototype._preupdate = function (engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    };
    /**
     * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    Entity.prototype._postupdate = function (engine, delta) {
        this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
        this.onPostUpdate(engine, delta);
    };
    /**
     * `onInitialize` is called before the first update of the entity. This method is meant to be
     * overridden.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    Entity.prototype.onInitialize = function (_engine) {
        // Override me
    };
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an entity is updated.
     */
    Entity.prototype.onPreUpdate = function (_engine, _delta) {
        // Override me
    };
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an entity is updated.
     */
    Entity.prototype.onPostUpdate = function (_engine, _delta) {
        // Override me
    };
    Entity._ID = 0;
    return Entity;
}(Class));
export { Entity };
//# sourceMappingURL=Entity.js.map