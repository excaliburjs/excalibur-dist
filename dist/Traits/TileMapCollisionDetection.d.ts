import { IActorTrait } from '../Interfaces/IActorTrait';
import { Actor } from '../Actor';
import { Engine } from '../Engine';
export declare class TileMapCollisionDetection implements IActorTrait {
    update(actor: Actor, engine: Engine): void;
}
