import { Entity, System, SystemType } from '../EntityComponentSystem';
import { CanvasDrawComponent } from './CanvasDrawComponent';
import { Scene } from '../Scene';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
/**
 * Draws anything with a transform and a "draw" method
 */
export declare class CanvasDrawingSystem extends System<TransformComponent | CanvasDrawComponent> {
    readonly types: readonly ["transform", "canvas"];
    systemType: SystemType;
    priority: number;
    private _ctx;
    private _camera;
    private _engine;
    initialize(scene: Scene): void;
    sort(a: Entity<TransformComponent | CanvasDrawComponent>, b: Entity<TransformComponent | CanvasDrawComponent>): number;
    update(entities: Entity<TransformComponent | CanvasDrawComponent>[], delta: number): void;
    private _applyTransform;
    private _clearScreen;
    private _pushCameraTransform;
    private _popCameraTransform;
}
