import { Component } from '../EntityComponentSystem';
export declare class CanvasDrawComponent extends Component<'canvas'> {
    draw?: (ctx: CanvasRenderingContext2D, delta: number) => void;
    readonly type = "canvas";
    constructor(draw?: (ctx: CanvasRenderingContext2D, delta: number) => void);
}
