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
function hasClone(x) {
    return !!(x === null || x === void 0 ? void 0 : x.clone);
}
/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity posesses
 *
 * Implementations of Component must have a zero-arg constructor
 */
var Component = /** @class */ (function () {
    function Component() {
    }
    Component.prototype.clone = function () {
        var newComponent = new this.constructor();
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                var val = this[prop];
                if (hasClone(val) && prop !== 'owner' && prop !== 'clone') {
                    newComponent[prop] = val.clone();
                }
                else {
                    newComponent[prop] = val;
                }
            }
        }
        return newComponent;
    };
    return Component;
}());
export { Component };
/**
 * Tag components are a way of tagging a component with label and a simple value
 */
var TagComponent = /** @class */ (function (_super) {
    __extends(TagComponent, _super);
    function TagComponent(type, value) {
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.value = value;
        return _this;
    }
    return TagComponent;
}(Component));
export { TagComponent };
//# sourceMappingURL=Component.js.map