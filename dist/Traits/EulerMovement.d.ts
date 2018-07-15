import { IActorTrait } from '../Interfaces/IActorTrait';
import { Actor } from '../Actor';
import { Engine } from '../Engine';
export declare class EulerMovement implements IActorTrait {
    update(actor: Actor, _engine: Engine, delta: number): void;
}
