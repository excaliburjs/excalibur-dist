import { Actionable } from './Actions/Actionable';
import { Trait } from './Interfaces/Trait';
import { Drawable } from './Interfaces/Drawable';
import { CanInitialize, CanActivate, CanDeactivate, CanUpdate, CanDraw, CanBeKilled } from './Interfaces/LifecycleEvents';
import { CollisionShape } from './Collision/CollisionShape';
import { Eventable } from './Interfaces/Evented';
import { PointerEvents } from './Interfaces/PointerEvents';
import { CameraStrategy } from './Camera';
import { Loadable } from './Interfaces/Loadable';
import { Action } from './Actions/Action';
import { ActorArgs, ActorDefaults } from './Actor';
import { CapturePointerConfig } from './Traits/CapturePointer';
import { CircleOptions, CollisionBroadphase, EdgeOptions, EnginePhysics, ConvexPolygonOptions } from './Collision/Index';
import { Physics } from './Physics';
import { DebugFlags } from './DebugFlags';
import { CollidersHash, FrameStatistics, FrameDurationStats, PhysicsStatistics, FrameActorStats } from './Debug';
import { AnimationArgs } from './Drawing/Animation';
import { SpriteEffect } from './Drawing/SpriteEffects';
import { SpriteArgs } from './Drawing/Sprite';
import { SpriteFontArgs, SpriteFontOptions } from './Drawing/SpriteSheet';
import { CanLoad, Audio, ExResponseTypesLookup, AudioImplementation } from './Interfaces/Index';
import { PostProcessor } from './PostProcessing/Index';
import { AbsolutePosition, EngineOptions } from './Engine';
import { EngineInput, NavigatorGamepad, NavigatorGamepads, GamepadConfiguration, ActorsUnderPointer } from './Input/Index';
import { LabelArgs } from './Label';
import { PerlinOptions } from './Math/PerlinNoise';
import { ParticleArgs, ParticleEmitterArgs } from './Particles';
import { TileMapArgs, CellArgs } from './TileMap';
import { TriggerOptions } from './Trigger';
import { ObsoleteOptions } from './Util/Decorators';
import { DetectedFeatures } from './Util/Detector';
import { BorderRadius } from './Util/DrawUtil';
import { Appender } from './Util/Log';
/**
 * @obsolete Use ActorsUnderPointer, IActorsUnderPointer will be removed in v0.24.0
 */
export declare type IActorsUnderPointer = ActorsUnderPointer;
/**
 * @obsolete Use AbsolutePosition, IAbsolutePosition will be removed in v0.24.0
 */
export declare type IAbsolutePosition = AbsolutePosition;
/**
 * @obsolete Use Action, IAction will be removed in v0.24.0
 */
export declare type IAction = Action;
/**
 * @obsolete Use Actionable, IActionable will be removed in v0.24.0
 */
export declare type IActionable = Actionable;
/**
 * @obsolete Use ActorArgs, IActorArgs will be removed in v0.24.0
 */
export declare type IActorArgs = ActorArgs;
/**
 * @obsolete Use ActorDefaults, IActorDefaults will be removed in v0.24.0
 */
export declare type IActorDefaults = ActorDefaults;
/**
 * @obsolete Use Trait, IActorTrait will be removed v0.24.0
 */
export declare type IActorTrait = Trait;
/**
 * @obsolete Use AnimationArgs, IAnimationArgs will be removed v0.24.0
 */
export declare type IAnimationArgs = AnimationArgs;
/**
 * @obsolete Use Appender, IAppender will be removed v0.24.0
 */
export declare type IAppender = Appender;
/**
 * @obsolete Use Audio, IAudio will be removed v0.24.0
 */
export declare type IAudio = Audio;
/**
 * @obsolete Use AudioImplementation, IAudioImplementation will be removed v0.24.0
 */
export declare type IAudioImplementation = AudioImplementation;
/**
 * @obsolete Use BorderRadius, IBorderRadius will be removed v0.24.0
 */
export declare type IBorderRadius = BorderRadius;
/**
 * @obsolete Use CanInitialize, ICanInitialize will be removed v0.24.0
 */
export declare type ICanInitialize = CanInitialize;
/**
 * @obsolete Use CanActivate, ICanActivate will be removed v0.24.0
 */
export declare type ICanActivate = CanActivate;
/**
 * @obsolete Use CanDeactivate, ICanDeactivate will be removed v0.24.0
 */
export declare type ICanDeactivate = CanDeactivate;
/**
 * @obsolete Use CanUpdate, ICanUpdate will be removed in v0.24.0
 */
export declare type ICanUpdate = CanUpdate;
/**
 * @obsolete Use CanDraw, ICanDraw will be removed in v0.24.0
 */
export declare type ICanDraw = CanDraw;
/**
 * @obsolete Use CanBeKilled, ICanBeKilled will be removed in v0.24.0
 */
export declare type ICanBeKilled = CanBeKilled;
/**
 * @obsolete Use CameraStrategy, ICameraStrategy will be removed in v0.24.0
 */
export declare type ICameraStrategy<T> = CameraStrategy<T>;
/**
 * @obsolete Use CellArgs, ICellArgs will be removed in v0.24.0
 */
export declare type ICellArgs = CellArgs;
/**
 * @obsolete Use CollisionShape, ICollisionArea will be removed in v0.24.0
 */
export declare type ICollisionArea = CollisionShape;
/**
 * @obsolete Use DetectedFeatures, IDetectedFeatures will be removed in v0.24.0
 */
export declare type IDetectedFeatures = DetectedFeatures;
/**
 * @obsolete Use ExResponseTypesLookup, IExResponseTypesLookup will be removed in v0.24.0
 */
export declare type IExResponseTypesLookup = ExResponseTypesLookup;
/**
 * @obsolete Use Physics, IPhysics will be removed in v0.24.0
 */
export declare type IPhysics = Physics;
/**
 * @obsolete Use DebugFlags, IDebugFlags will be removed in v0.24.0
 */
export declare type IDebugFlags = DebugFlags;
/**
 * @obsolete Use CollisionBroadphase, ICollisionBroadphase will be removed in v0.24.0
 */
export declare type ICollisionBroadphase = CollisionBroadphase;
/**
 * @obsolete Use CollidersHash, IColliderHash will be removed in v0.24.0
 */
export declare type IColliderHash = CollidersHash;
/**
 * @obsolete Use CircleOptions, ICircleAreaOptions will be removed in v0.24.0
 */
export declare type ICircleAreaOptions = CircleOptions;
/**
 * @obsolete Use EdgeOptions, IEdgeAreaOptions will be removed in v0.24.0
 */
export declare type IEdgeAreaOptions = EdgeOptions;
/**
 * @obsolete Use ConvexPolygonOptions, IPolygonAreaOptions will be removed in v0.24.0
 */
export declare type IPolygonAreaOptions = ConvexPolygonOptions;
/**
 * @obsolete Use EngineOptions, IEngineOptions will be removed in v0.24.0
 */
export declare type IEngineOptions = EngineOptions;
/**
 * @obsolete Use EnginePhysics, IEnginePhysics will be removed in v0.24.0
 */
export declare type IEnginePhysics = EnginePhysics;
/**
 * @obsolete Use EngineInput, IEngineInput will be removed in v0.24.0
 */
export declare type IEngineInput = EngineInput;
/**
 * @obsolete Use FrameStatistics, IFrameStats will be removed in v0.24.0
 */
export declare type IFrameStats = FrameStatistics;
/**
 * @obsolete Use FrameDurationStats, IFrameDurationStats will be removed in v0.24.0
 */
export declare type IFrameDurationStats = FrameDurationStats;
/**
 * @obsolete Use FrameActorStats, IFrameActorStates will be removed in v0.24.0
 */
export declare type IFrameActorStates = FrameActorStats;
/**
 * @obsolete Use PhysicsStatistics, IPhysicsStats will be removed in v0.24.0
 */
export declare type IPhysicsStats = PhysicsStatistics;
/**
 * @obsolete Use Drawable, IDrawable will be removed v0.24.0
 */
export declare type IDrawable = Drawable;
/**
 * @obsolete Use Eventable, IEvented will be removed in v0.24.0
 */
export declare type IEvented = Eventable;
/**
 * @obsolete Use NavigatorGamepads, INavigatorGamepads will be removed in v0.24.0
 */
export declare type INavigatorGamepads = NavigatorGamepads;
/**
 * @obsolete Use NavigatorGamepad, INavigatorGamepad will be removed in v0.24.0
 */
export declare type INavigatorGamepad = NavigatorGamepad;
/**
 * @obsolete Use GamepadConfiguration, IGamepadConfiguration will be removed in v0.24.0
 */
export declare type IGamepadConfiguration = GamepadConfiguration;
/**
 * @obsolete Use ObsoleteOptions, IObsoleteOptions will be removed in v0.24.0
 */
export declare type IObsoleteOptions = ObsoleteOptions;
/**
 * @obsolete Use PointerEvents, IPointerEvents will be removed in v0.24.0
 */
export declare type IPointerEvents = PointerEvents;
/**
 * @obsolete Use Loadable, ILoadable will be removed in v0.24.0
 */
export declare type ILoadable = Loadable;
/**
 * @obsolete Use CanLoad, ILoader will be removed in v0.24.0
 */
export declare type ILoader = CanLoad;
/**
 * @obsolete Use CapturePointerConfig, ICapturePointerConfig will be removed in v0.24.0
 */
export declare type ICapturePointerConfig = CapturePointerConfig;
/**
 * @obsolete Use PromiseLike, IPromise will be removed in v0.24.0
 */
export declare type IPromise<T> = PromiseLike<T>;
/**
 * @obsolete Use SpriteEffect, ISpriteEffect will be removed in v0.24.0
 */
export declare type ISpriteEffect = SpriteEffect;
/**
 * @obsolete Use SpriteArgs, ISpriteArgs will be removed in v0.24.0
 */
export declare type ISpriteArgs = SpriteArgs;
/**
 * @obsolete Use SpriteFontArgs, ISpriteFontInitArgs will be removed in v0.24.0
 */
export declare type ISpriteFontInitArgs = SpriteFontArgs;
/**
 * @obsolete Use SpriteFontOptions, ISpriteFrontOptions will be removed in v0.24.0
 */
export declare type ISpriteFrontOptions = SpriteFontOptions;
/**
 * @obsolete Use TileMapArgs, ITileMapArgs will be removed in v0.24.0
 */
export declare type ITileMapArgs = TileMapArgs;
/**
 * @obsolete Use TouchEvent, ITouchEvent will be removed in v0.24.0
 */
export declare type ITouchEvent = TouchEvent;
/**
 * @obsolete Use Touch, ITouch will be removed in v0.24.0
 */
export declare type ITouch = Touch;
/**
 * @obsolete Use TriggerOptions, ITriggerOptions will be removed in v0.24.0
 */
export declare type ITriggerOptions = TriggerOptions;
/**
 * @obsolete Use ParticleArgs, IParticleArgs will be removed in v0.24.0
 */
export declare type IParticleArgs = ParticleArgs;
/**
 * @obsolete Use ParticleEmitterArgs, IParticleEmitterArgs will be removed in v0.24.0
 */
export declare type IParticleEmitterArgs = ParticleEmitterArgs;
/**
 * @obsolete Use PerlinOptions, IPerlinGeneratorOptions will be removed in v0.24.0
 */
export declare type IPerlinGeneratorOptions = PerlinOptions;
/**
 * @obsolete Use PostProcessor, IPostProcessor will be removed in v0.24.0
 */
export declare type IPostProcessor = PostProcessor;
/**
 * @obsolete Use LabelArgs, ILabelArgs will be removed in v0.24.0
 */
export declare type ILabelArgs = LabelArgs;
