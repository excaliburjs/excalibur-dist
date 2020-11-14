import { Component } from '../EntityComponentSystem';
export class CanvasDrawComponent extends Component {
    constructor(draw) {
        var _a;
        super();
        this.draw = draw;
        this.type = 'canvas';
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.draw = (_a = this.draw) !== null && _a !== void 0 ? _a : (() => { });
    }
}
//# sourceMappingURL=CanvasDrawComponent.js.map