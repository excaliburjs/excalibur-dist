import { CollisionGroup } from './CollisionGroup';
/**
 * Static class for managing collision groups in excalibur, there is a maximum of 32 collision groups possible in excalibur
 */
var CollisionGroupManager = /** @class */ (function () {
    function CollisionGroupManager() {
    }
    /**
     * Create a new named collision group up to a max of 32.
     * @param name Name for the collision group
     * @param mask Optionally provide your own 32-bit mask, if none is provide the manager will generate one
     */
    CollisionGroupManager.create = function (name, mask) {
        if (this._currentGroup > this._MAX_GROUPS) {
            throw new Error("Cannot have more than " + this._MAX_GROUPS + " collision groups");
        }
        if (this._groups.get(name)) {
            throw new Error("Collision group " + name + " already exists");
        }
        var group = new CollisionGroup(name, this._currentBit, mask !== undefined ? mask : ~this._currentBit);
        this._currentBit = (this._currentBit << 1) | 0;
        this._currentGroup++;
        this._groups.set(name, group);
        return group;
    };
    Object.defineProperty(CollisionGroupManager, "groups", {
        /**
         * Get all collision groups currently tracked by excalibur
         */
        get: function () {
            return Array.from(this._groups.values());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get a collision group by it's name
     * @param name
     */
    CollisionGroupManager.groupByName = function (name) {
        return this._groups.get(name);
    };
    /**
     * Resets the managers internal group management state
     */
    CollisionGroupManager.reset = function () {
        this._groups = new Map();
        this._currentBit = this._STARTING_BIT;
        this._currentGroup = 1;
    };
    // using bitmasking the maximum number of groups is 32, because that is the heighest 32bit integer that JS can present.
    CollisionGroupManager._STARTING_BIT = 1 | 0;
    CollisionGroupManager._MAX_GROUPS = 32;
    CollisionGroupManager._currentGroup = 1;
    CollisionGroupManager._currentBit = CollisionGroupManager._STARTING_BIT;
    CollisionGroupManager._groups = new Map();
    return CollisionGroupManager;
}());
export { CollisionGroupManager };
