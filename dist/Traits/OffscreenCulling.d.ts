import { CullingBox } from './../Util/CullingBox';
import { IActorTrait } from '../Interfaces/IActorTrait';
import { Actor } from '../Actor';
import { Engine } from '../Engine';
export declare class OffscreenCulling implements IActorTrait {
    cullingBox: CullingBox;
    update(actor: Actor, engine: Engine): void;
}
