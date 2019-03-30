import { Actionable } from './Actions/Actionable';
import { Trait } from './Interfaces/Trait';
import { Drawable } from './Interfaces/Drawable';
import { CanInitialize, CanActivate, CanDeactivate, CanUpdate, CanDraw, CanBeKilled } from './Interfaces/LifecycleEvents';
import { CollisionArea } from './Collision/CollisionArea';
import { Eventable } from './Interfaces/Evented';
import { PointerEvents } from './Interfaces/PointerEvents';
import { CameraStrategy } from './Camera';
import { Loadable } from './Interfaces/Loadable';
import { Action } from './Actions/Action';
import { ActorArgs, ActorDefaults } from './Actor';
import { CapturePointerConfig } from './Traits/CapturePointer';
import { Collidable, CircleAreaOptions, CollisionBroadphase, EdgeAreaOptions, EnginePhysics, PolygonAreaOptions } from './Collision/Index';
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
 * @deprecated Use ActorsUnderPointer, IActorsUnderPointer will be deprecated in v0.23.0
 * @obsolete Use ActorsUnderPointer, IActorsUnderPointer will be deprecated in v0.23.0
 */
export declare type IActorsUnderPointer = ActorsUnderPointer;
/**
 * @deprecated Use AbsolutePosition, IAbsolutePosition will be deprecated in v0.23.0
 * @obsolete Use AbsolutePosition, IAbsolutePosition will be deprecated in v0.23.0
 */
export declare type IAbsolutePosition = AbsolutePosition;
/**
 * @deprecated Use Action, IAction will be deprecated in v0.23.0
 * @obsolete Use Action, IAction will be deprecated in v0.23.0
 */
export declare type IAction = Action;
/**
 * @deprecated Use Actionable, IActionable will be deprecated in v0.23.0
 * @obsolete Use Actionable, IActionable will be deprecated in v0.23.0
 */
export declare type IActionable = Actionable;
/**
 * @deprecated Use ActorArgs, IActorArgs will be deprecated in v0.23.0
 * @obsolete Use ActorArgs, IActorArgs will be deprecated in v0.23.0
 */
export declare type IActorArgs = ActorArgs;
/**
 * @deprecated Use ActorDefaults, IActorDefaults will be deprecated in v0.23.0
 * @obsolete Use ActorDefaults, IActorDefaults will be deprecated in v0.23.0
 */
export declare type IActorDefaults = ActorDefaults;
/**
 * @deprecated Use Trait, IActorTrait will be removed v0.23.0
 * @obsolete Use Trait, IActorTrait will be removed v0.23.0
 */
export declare type IActorTrait = Trait;
/**
 * @deprecated Use AnimationArgs, IAnimationArgs will be removed v0.23.0
 * @obsolete Use AnimationArgs, IAnimationArgs will be removed v0.23.0
 */
export declare type IAnimationArgs = AnimationArgs;
/**
 * @deprecated Use Appender, IAppender will be removed v0.23.0
 * @obsolete Use Appender, IAppender will be removed v0.23.0
 */
export declare type IAppender = Appender;
/**
 * @deprecated Use Audio, IAudio will be removed v0.23.0
 * @obsolete Use Audio, IAudio will be removed v0.23.0
 */
export declare type IAudio = Audio;
/**
 * @deprecated Use AudioImplementation, IAudioImplementation will be removed v0.23.0
 * @obsolete Use AudioImplementation, IAudioImplementation will be removed v0.23.0
 */
export declare type IAudioImplementation = AudioImplementation;
/**
 * @deprecated Use BorderRadius, IBorderRadius will be removed v0.23.0
 * @obsolete Use BorderRadius, IBorderRadius will be removed v0.23.0
 */
export declare type IBorderRadius = BorderRadius;
/**
 * @deprecated Use CanInitialize, ICanInitialize will be removed v0.23.0
 * @obsolete Use CanInitialize, ICanInitialize will be removed v0.23.0
 */
export declare type ICanInitialize = CanInitialize;
/**
 * @deprecated Use CanActivate, ICanActivate will be removed v0.23.0
 * @obsolete Use CanActivate, ICanActivate will be removed v0.23.0
 */
export declare type ICanActivate = CanActivate;
/**
 * @deprecated Use CanDeactivate, ICanDeactivate will be removed v0.23.0
 * @obsolete Use CanDeactivate, ICanDeactivate will be removed v0.23.0
 */
export declare type ICanDeactivate = CanDeactivate;
/**
 * @deprecated Use CanUpdate, ICanUpdate will be removed in v0.23.0
 * @obsolete Use CanUpdate, ICanUpdate will be removed in v0.23.0
 */
export declare type ICanUpdate = CanUpdate;
/**
 * @deprecated Use CanDraw, ICanDraw will be removed in v0.23.0
 * @obsolete Use CanDraw, ICanDraw will be removed in v0.23.0
 */
export declare type ICanDraw = CanDraw;
/**
 * @deprecated Use CanBeKilled, ICanBeKilled will be removed in v0.23.0
 * @obsolete Use CanBeKilled, ICanBeKilled will be removed in v0.23.0
 */
export declare type ICanBeKilled = CanBeKilled;
/**
 * @deprecated Use CameraStrategy, ICameraStrategy will be removed in v0.23.0
 * @obsolete Use CameraStrategy, ICameraStrategy will be removed in v0.23.0
 */
export declare type ICameraStrategy<T> = CameraStrategy<T>;
/**
 * @deprecated Use CellArgs, ICellArgs will be removed in v0.23.0
 * @obsolete Use CellArgs, ICellArgs will be removed in v0.23.0
 */
export declare type ICellArgs = CellArgs;
/**
 * @deprecated Use Collidable, ICollidable will be removed in v0.23.0
 * @obsolete Use Collidable, ICollidable will be removed in v0.23.0
 */
export declare type ICollidable = Collidable;
/**
 * @deprecated Use CollisionArea, ICollisionArea will be removed in v0.23.0
 * @obsolete Use CollisionArea, ICollisionArea will be removed in v0.23.0
 */
export declare type ICollisionArea = CollisionArea;
/**
 * @deprecated Use DetectedFeatures, IDetectedFeatures will be removed in v0.23.0
 * @obsolete Use DetectedFeatures, IDetectedFeatures will be removed in v0.23.0
 */
export declare type IDetectedFeatures = DetectedFeatures;
/**
 * @deprecated Use ExResponseTypesLookup, IExResponseTypesLookup will be removed in v0.23.0
 * @obsolete Use ExResponseTypesLookup, IExResponseTypesLookup will be removed in v0.23.0
 */
export declare type IExResponseTypesLookup = ExResponseTypesLookup;
/**
 * @deprecated Use Physics, IPhysics will be removed in v0.23.0
 * @obsolete Use Physics, IPhysics will be removed in v0.23.0
 */
export declare type IPhysics = Physics;
/**
 * @deprecated Use DebugFlags, IDebugFlags will be removed in v0.23.0
 * @obsolete Use DebugFlags, IDebugFlags will be removed in v0.23.0
 */
export declare type IDebugFlags = DebugFlags;
/**
 * @deprecated Use CollisionBroadphase, ICollisionBroadphase will be removed in v0.23.0
 * @obsolete Use CollisionBroadphase, ICollisionBroadphase will be removed in v0.23.0
 */
export declare type ICollisionBroadphase = CollisionBroadphase;
/**
 * @deprecated Use CollidersHash, IColliderHash will be removed in v0.23.0
 * @obsolete Use CollidersHash, IColliderHash will be removed in v0.23.0
 */
export declare type IColliderHash = CollidersHash;
/**
 * @deprecated Use CircleAreaOptions, ICircleAreaOptions will be removed in v0.23.0
 * @obsolete Use CircleAreaOptions, ICircleAreaOptions will be removed in v0.23.0
 */
export declare type ICircleAreaOptions = CircleAreaOptions;
/**
 * @deprecated Use EdgeAreaOptions, IEdgeAreaOptions will be removed in v0.23.0
 * @obsolete Use EdgeAreaOptions, IEdgeAreaOptions will be removed in v0.23.0
 */
export declare type IEdgeAreaOptions = EdgeAreaOptions;
/**
 * @deprecated Use PolygonAreaOptions, IPolygonAreaOptions will be removed in v0.23.0
 * @obsolete Use PolygonAreaOptions, IPolygonAreaOptions will be removed in v0.23.0
 */
export declare type IPolygonAreaOptions = PolygonAreaOptions;
/**
 * @deprecated Use EngineOptions, IEngineOptions will be removed in v0.23.0
 * @obsolete Use EngineOptions, IEngineOptions will be removed in v0.23.0
 */
export declare type IEngineOptions = EngineOptions;
/**
 * @deprecated Use EnginePhysics, IEnginePhysics will be removed in v0.23.0
 * @obsolete Use EnginePhysics, IEnginePhysics will be removed in v0.23.0
 */
export declare type IEnginePhysics = EnginePhysics;
/**
 * @deprecated Use EngineInput, IEngineInput will be removed in v0.23.0
 * @obsolete Use EngineInput, IEngineInput will be removed in v0.23.0
 */
export declare type IEngineInput = EngineInput;
/**
 * @deprecated Use FrameStatistics, IFrameStats will be removed in v0.23.0
 * @obsolete Use FrameStatistics, IFrameStats will be removed in v0.23.0
 */
export declare type IFrameStats = FrameStatistics;
/**
 * @deprecated Use FrameDurationStats, IFrameDurationStats will be removed in v0.23.0
 * @obsolete Use FrameDurationStats, IFrameDurationStats will be removed in v0.23.0
 */
export declare type IFrameDurationStats = FrameDurationStats;
/**
 * @deprecated Use FrameActorStats, IFrameActorStates will be removed in v0.23.0
 * @obsolete Use FrameActorStats, IFrameActorStates will be removed in v0.23.0
 */
export declare type IFrameActorStates = FrameActorStats;
/**
 * @deprecated Use PhysicsStatistics, IPhysicsStats will be removed in v0.23.0
 * @obsolete Use PhysicsStatistics, IPhysicsStats will be removed in v0.23.0
 */
export declare type IPhysicsStats = PhysicsStatistics;
/**
 * @deprecated Use Drawable, IDrawable will be removed v0.23.0
 * @obsolete Use Drawable, IDrawable will be removed v0.23.0
 */
export declare type IDrawable = Drawable;
/**
 * @deprecated Use Eventable, IEvented will be removed in v0.23.0
 * @obsolete Use Eventable, IEvented will be removed in v0.23.0
 */
export declare type IEvented = Eventable;
/**
 * @deprecated Use NavigatorGamepads, INavigatorGamepads will be removed in v0.23.0
 * @obsolete Use NavigatorGamepads, INavigatorGamepads will be removed in v0.23.0
 */
export declare type INavigatorGamepads = NavigatorGamepads;
/**
 * @deprecated Use NavigatorGamepad, INavigatorGamepad will be removed in v0.23.0
 * @obsolete Use NavigatorGamepad, INavigatorGamepad will be removed in v0.23.0
 */
export declare type INavigatorGamepad = NavigatorGamepad;
/**
 * @deprecated Use GamepadConfiguration, IGamepadConfiguration will be removed in v0.23.0
 * @obsolete Use GamepadConfiguration, IGamepadConfiguration will be removed in v0.23.0
 */
export declare type IGamepadConfiguration = GamepadConfiguration;
/**
 * @deprecated Use ObsoleteOptions, IObsoleteOptions will be removed in v0.23.0
 * @obsolete Use ObsoleteOptions, IObsoleteOptions will be removed in v0.23.0
 */
export declare type IObsoleteOptions = ObsoleteOptions;
/**
 * @deprecated Use PointerEvents, IPointerEvents will be removed in v0.23.0
 * @obsolete Use PointerEvents, IPointerEvents will be removed in v0.23.0
 */
export declare type IPointerEvents = PointerEvents;
/**
 * @deprecated Use Loadable, ILoadable will be removed in v0.23.0
 * @obsolete Use Loadable, ILoadable will be removed in v0.23.0
 */
export declare type ILoadable = Loadable;
/**
 * @deprecated Use CanLoad, ILoader will be removed in v0.23.0
 * @obsolete Use CanLoad, ILoader will be removed in v0.23.0
 */
export declare type ILoader = CanLoad;
/**
 * @deprecated Use CapturePointerConfig, ICapturePointerConfig will be removed in v0.23.0
 * @obsolete Use CapturePointerConfig, ICapturePointerConfig will be removed in v0.23.0
 */
export declare type ICapturePointerConfig = CapturePointerConfig;
/**
 * @deprecated Use PromiseLike, IPromise will be removed in v0.23.0
 * @obsolete Use PromiseLike, IPromise will be removed in v0.23.0
 */
export declare type IPromise<T> = PromiseLike<T>;
/**
 * @deprecated Use SpriteEffect, ISpriteEffect will be removed in v0.23.0
 * @obsolete Use SpriteEffect, ISpriteEffect will be removed in v0.23.0
 */
export declare type ISpriteEffect = SpriteEffect;
/**
 * @deprecated Use SpriteArgs, ISpriteArgs will be removed in v0.23.0
 * @obsolete Use SpriteArgs, ISpriteArgs will be removed in v0.23.0
 */
export declare type ISpriteArgs = SpriteArgs;
/**
 * @deprecated Use SpriteFontArgs, ISpriteFontInitArgs will be removed in v0.23.0
 * @obsolete Use SpriteFontArgs, ISpriteFontInitArgs will be removed in v0.23.0
 */
export declare type ISpriteFontInitArgs = SpriteFontArgs;
/**
 * @deprecated Use SpriteFontOptions, ISpriteFrontOptions will be removed in v0.23.0
 * @obsolete Use SpriteFontOptions, ISpriteFrontOptions will be removed in v0.23.0
 */
export declare type ISpriteFrontOptions = SpriteFontOptions;
/**
 * @deprecated Use TileMapArgs, ITileMapArgs will be removed in v0.23.0
 * @obsolete Use TileMapArgs, ITileMapArgs will be removed in v0.23.0
 */
export declare type ITileMapArgs = TileMapArgs;
/**
 * @deprecated Use TouchEvent, ITouchEvent will be removed in v0.23.0
 * @obsolete Use TouchEvent, ITouchEvent will be removed in v0.23.0
 */
export declare type ITouchEvent = TouchEvent;
/**
 * @deprecated Use Touch, ITouch will be removed in v0.23.0
 * @obsolete Use Touch, ITouch will be removed in v0.23.0
 */
export declare type ITouch = Touch;
/**
 * @deprecated Use TriggerOptions, ITriggerOptions will be removed in v0.23.0
 * @obsolete Use TriggerOptions, ITriggerOptions will be removed in v0.23.0
 */
export declare type ITriggerOptions = TriggerOptions;
/**
 * @deprecated Use ParticleArgs, IParticleArgs will be removed in v0.23.0
 * @obsolete Use ParticleArgs, IParticleArgs will be removed in v0.23.0
 */
export declare type IParticleArgs = ParticleArgs;
/**
 * @deprecated Use ParticleEmitterArgs, IParticleEmitterArgs will be removed in v0.23.0
 * @obsolete Use ParticleEmitterArgs, IParticleEmitterArgs will be removed in v0.23.0
 */
export declare type IParticleEmitterArgs = ParticleEmitterArgs;
/**
 * @deprecated Use PerlinOptions, IPerlinGeneratorOptions will be removed in v0.23.0
 * @obsolete Use PerlinOptions, IPerlinGeneratorOptions will be removed in v0.23.0
 */
export declare type IPerlinGeneratorOptions = PerlinOptions;
/**
 * @deprecated Use PostProcessor, IPostProcessor will be removed in v0.23.0
 * @obsolete Use PostProcessor, IPostProcessor will be removed in v0.23.0
 */
export declare type IPostProcessor = PostProcessor;
/**
 * @deprecated Use LabelArgs, ILabelArgs will be removed in v0.23.0
 * @obsolete Use LabelArgs, ILabelArgs will be removed in v0.23.0
 */
export declare type ILabelArgs = LabelArgs;
