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
import { Component } from '../EntityComponentSystem';
var CanvasDrawComponent = /** @class */ (function (_super) {
    __extends(CanvasDrawComponent, _super);
    function CanvasDrawComponent(draw) {
        var _a;
        var _this = _super.call(this) || this;
        _this.draw = draw;
        _this.type = 'canvas';
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        _this.draw = (_a = _this.draw) !== null && _a !== void 0 ? _a : (function () { });
        return _this;
    }
    return CanvasDrawComponent;
}(Component));
export { CanvasDrawComponent };
//# sourceMappingURL=CanvasDrawComponent.js.map