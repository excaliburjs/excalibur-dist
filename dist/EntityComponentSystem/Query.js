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
import { Entity } from './Entity';
import { buildTypeKey } from './Util';
import { Observable } from '../Util/Observable';
import { Util } from '..';
import { AddedEntity, RemovedEntity } from './System';
/**
 * Represents query for entities that match a list of types that is cached and observable
 *
 * Queries can be strongly typed by supplying a type union in the optional type parameter
 * ```typescript
 * const queryAB = new ex.Query<ComponentTypeA, ComponentTypeB>(['A', 'B']);
 * ```
 */
var Query = /** @class */ (function (_super) {
    __extends(Query, _super);
    function Query(types) {
        var _this = _super.call(this) || this;
        _this.types = types;
        _this.entities = [];
        return _this;
    }
    Object.defineProperty(Query.prototype, "key", {
        get: function () {
            return buildTypeKey(this.types);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an entity to the query, will only be added if the entity matches the query types
     * @param entity
     */
    Query.prototype.addEntity = function (entity) {
        if (!Util.contains(this.entities, entity) && this.matches(entity)) {
            this.entities.push(entity);
            this.notifyAll(new AddedEntity(entity));
        }
    };
    /**
     * If the entity is part of the query it will be removed regardless of types
     * @param entity
     */
    Query.prototype.removeEntity = function (entity) {
        if (Util.removeItemFromArray(entity, this.entities)) {
            this.notifyAll(new RemovedEntity(entity));
        }
    };
    /**
     * Removes all entities and observers from the query
     */
    Query.prototype.clear = function () {
        this.entities.length = 0;
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            this.unregister(observer);
        }
    };
    Query.prototype.matches = function (typesOrEntity) {
        var types = [];
        if (typesOrEntity instanceof Entity) {
            types = typesOrEntity.types;
        }
        else {
            types = typesOrEntity;
        }
        var matches = true;
        for (var _i = 0, _a = this.types; _i < _a.length; _i++) {
            var type = _a[_i];
            matches = matches && types.indexOf(type) > -1;
            if (!matches) {
                return false;
            }
        }
        return matches;
    };
    return Query;
}(Observable));
export { Query };
//# sourceMappingURL=Query.js.map