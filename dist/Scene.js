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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ScreenElement } from './ScreenElement';
import { Physics } from './Physics';
import { InitializeEvent, PreUpdateEvent, PostUpdateEvent, PreDrawEvent, PostDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent } from './Events';
import { Logger } from './Util/Log';
import { Timer } from './Timer';
import { DynamicTreeCollisionBroadphase } from './Collision/DynamicTreeCollisionBroadphase';
import { TileMap } from './TileMap';
import { Camera } from './Camera';
import { Actor } from './Actor';
import { Class } from './Class';
import * as Util from './Util/Util';
import * as ActorUtils from './Util/Actors';
import { Trigger } from './Trigger';
import { SystemType } from './EntityComponentSystem/System';
import { CanvasDrawingSystem } from './Drawing/CanvasDrawingSystem';
import { obsolete } from './Util/Decorators';
import { World } from './EntityComponentSystem/World';
/**
 * [[Actor|Actors]] are composed together into groupings called Scenes in
 * Excalibur. The metaphor models the same idea behind real world
 * actors in a scene. Only actors in scenes will be updated and drawn.
 *
 * Typical usages of a scene include: levels, menus, loading screens, etc.
 */
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    function Scene(_engine) {
        var _this = _super.call(this) || this;
        /**
         * The actors in the current scene
         */
        _this.actors = [];
        /**
         * The ECS world for the scene
         */
        _this.world = new World(_this);
        /**
         * Physics bodies in the current scene
         */
        _this._bodies = [];
        /**
         * The triggers in the current scene
         */
        _this.triggers = [];
        /**
         * The [[TileMap]]s in the scene, if any
         */
        _this.tileMaps = [];
        _this._isInitialized = false;
        _this._broadphase = new DynamicTreeCollisionBroadphase();
        _this._killQueue = [];
        _this._triggerKillQueue = [];
        _this._timers = [];
        _this._cancelQueue = [];
        _this._logger = Logger.getInstance();
        _this.camera = new Camera();
        if (_engine) {
            _this.engine = _engine;
            _this.camera.x = _this.engine.halfDrawWidth;
            _this.camera.y = _this.engine.halfDrawHeight;
        }
        return _this;
    }
    Object.defineProperty(Scene.prototype, "screenElements", {
        /**
         * The [[ScreenElement]]s in a scene, if any; these are drawn last
         * @deprecated
         */
        get: function () {
            return this.actors.filter(function (a) { return a instanceof ScreenElement; });
        },
        enumerable: false,
        configurable: true
    });
    Scene.prototype.on = function (eventName, handler) {
        _super.prototype.on.call(this, eventName, handler);
    };
    Scene.prototype.once = function (eventName, handler) {
        _super.prototype.once.call(this, eventName, handler);
    };
    Scene.prototype.off = function (eventName, handler) {
        _super.prototype.off.call(this, eventName, handler);
    };
    /**
     * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     */
    Scene.prototype.onInitialize = function (_engine) {
        // will be overridden
    };
    /**
     * This is called when the scene is made active and started. It is meant to be overridden,
     * this is where you should setup any DOM UI or event handlers needed for the scene.
     */
    Scene.prototype.onActivate = function (_oldScene, _newScene) {
        // will be overridden
    };
    /**
     * This is called when the scene is made transitioned away from and stopped. It is meant to be overridden,
     * this is where you should cleanup any DOM UI or event handlers needed for the scene.
     */
    Scene.prototype.onDeactivate = function (_oldScene, _newScene) {
        // will be overridden
    };
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before a scene is updated.
     */
    Scene.prototype.onPreUpdate = function (_engine, _delta) {
        // will be overridden
    };
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     */
    Scene.prototype.onPostUpdate = function (_engine, _delta) {
        // will be overridden
    };
    /**
     * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreDraw` is called directly before a scene is drawn.
     */
    Scene.prototype.onPreDraw = function (_ctx, _delta) {
        // will be overridden
    };
    /**
     * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostDraw` is called directly after a scene is drawn.
     */
    Scene.prototype.onPostDraw = function (_ctx, _delta) {
        // will be overridden
    };
    /**
     * Initializes actors in the scene
     */
    Scene.prototype._initializeChildren = function () {
        for (var _i = 0, _a = this.actors; _i < _a.length; _i++) {
            var child = _a[_i];
            child._initialize(this.engine);
        }
    };
    Object.defineProperty(Scene.prototype, "isInitialized", {
        /**
         * Gets whether or not the [[Scene]] has been initialized
         */
        get: function () {
            return this._isInitialized;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Initializes the scene before the first update, meant to be called by engine not by users of
     * Excalibur
     * @internal
     */
    Scene.prototype._initialize = function (engine) {
        if (!this.isInitialized) {
            this.engine = engine;
            if (this.camera) {
                this.camera.x = engine.halfDrawWidth;
                this.camera.y = engine.halfDrawHeight;
            }
            // Initialize systems
            this.world.add(new CanvasDrawingSystem());
            // This order is important! we want to be sure any custom init that add actors
            // fire before the actor init
            this.onInitialize.call(this, engine);
            this._initializeChildren();
            this._logger.debug('Scene.onInitialize', this, engine);
            this.eventDispatcher.emit('initialize', new InitializeEvent(engine, this));
            this._isInitialized = true;
        }
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Activates the scene with the base behavior, then calls the overridable `onActivate` implementation.
     * @internal
     */
    Scene.prototype._activate = function (oldScene, newScene) {
        this._logger.debug('Scene.onActivate', this);
        this.onActivate(oldScene, newScene);
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Deactivates the scene with the base behavior, then calls the overridable `onDeactivate` implementation.
     * @internal
     */
    Scene.prototype._deactivate = function (oldScene, newScene) {
        this._logger.debug('Scene.onDeactivate', this);
        this.onDeactivate(oldScene, newScene);
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    Scene.prototype._preupdate = function (_engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(_engine, delta, this));
        this.onPreUpdate(_engine, delta);
    };
    /**
     *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    Scene.prototype._postupdate = function (_engine, delta) {
        this.emit('postupdate', new PostUpdateEvent(_engine, delta, this));
        this.onPostUpdate(_engine, delta);
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _predraw handler for [[onPreDraw]] lifecycle event
     *
     * @internal
     */
    Scene.prototype._predraw = function (_ctx, _delta) {
        this.emit('predraw', new PreDrawEvent(_ctx, _delta, this));
        this.onPreDraw(_ctx, _delta);
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _postdraw handler for [[onPostDraw]] lifecycle event
     *
     * @internal
     */
    Scene.prototype._postdraw = function (_ctx, _delta) {
        this.emit('postdraw', new PostDrawEvent(_ctx, _delta, this));
        this.onPostDraw(_ctx, _delta);
    };
    /**
     * Updates all the actors and timers in the scene. Called by the [[Engine]].
     * @param engine  Reference to the current Engine
     * @param delta   The number of milliseconds since the last update
     */
    Scene.prototype.update = function (engine, delta) {
        this._preupdate(engine, delta);
        this.world.update(SystemType.Update, delta);
        if (this.camera) {
            this.camera.update(engine, delta);
        }
        var i, len;
        // Remove timers in the cancel queue before updating them
        for (i = 0, len = this._cancelQueue.length; i < len; i++) {
            this.removeTimer(this._cancelQueue[i]);
        }
        this._cancelQueue.length = 0;
        // Cycle through timers updating timers
        for (var _i = 0, _a = this._timers; _i < _a.length; _i++) {
            var timer = _a[_i];
            timer.update(delta);
        }
        // Cycle through actors updating tile maps
        for (i = 0, len = this.tileMaps.length; i < len; i++) {
            this.tileMaps[i].update(engine, delta);
        }
        // Cycle through actors updating actors
        for (i = 0, len = this.actors.length; i < len; i++) {
            this.actors[i].update(engine, delta);
            this._bodies[i] = this.actors[i].body;
        }
        // Cycle through triggers updating
        for (i = 0, len = this.triggers.length; i < len; i++) {
            this.triggers[i].update(engine, delta);
        }
        this._collectActorStats(engine);
        engine.input.pointers.dispatchPointerEvents();
        // Run the broadphase and narrowphase
        if (this._broadphase && Physics.enabled) {
            var beforeBroadphase = Date.now();
            this._broadphase.update(this._bodies, delta);
            var pairs = this._broadphase.broadphase(this._bodies, delta, engine.stats.currFrame);
            var afterBroadphase = Date.now();
            var beforeNarrowphase = Date.now();
            var iter = Physics.collisionPasses;
            var collisionDelta = delta / iter;
            while (iter > 0) {
                // Run the narrowphase
                pairs = this._broadphase.narrowphase(pairs, engine.stats.currFrame);
                // Run collision resolution strategy
                pairs = this._broadphase.resolve(pairs, collisionDelta, Physics.collisionResolutionStrategy);
                this._broadphase.runCollisionStartEnd(pairs);
                iter--;
            }
            var afterNarrowphase = Date.now();
            engine.stats.currFrame.physics.broadphase = afterBroadphase - beforeBroadphase;
            engine.stats.currFrame.physics.narrowphase = afterNarrowphase - beforeNarrowphase;
        }
        engine.stats.currFrame.actors.killed = this._killQueue.length + this._triggerKillQueue.length;
        this._processKillQueue(this._killQueue, this.actors);
        this._processKillQueue(this._triggerKillQueue, this.triggers);
        this._postupdate(engine, delta);
    };
    Scene.prototype._processKillQueue = function (killQueue, collection) {
        var _this = this;
        // Remove actors from scene graph after being killed
        var actorIndex;
        for (var _i = 0, killQueue_1 = killQueue; _i < killQueue_1.length; _i++) {
            var killed = killQueue_1[_i];
            //don't remove actors that were readded during the same frame they were killed
            if (killed.isKilled()) {
                actorIndex = collection.indexOf(killed);
                if (actorIndex > -1) {
                    collection.splice(actorIndex, 1);
                    this.world.remove(killed);
                    killed.children.forEach(function (c) { return _this.world.remove(c); });
                }
            }
        }
        killQueue.length = 0;
    };
    /**
     * Draws all the actors in the Scene. Called by the [[Engine]].
     * @param ctx    The current rendering context
     * @param delta  The number of milliseconds since the last draw
     */
    Scene.prototype.draw = function (ctx, delta) {
        this._predraw(ctx, delta);
        this.world.update(SystemType.Draw, delta);
        this._postdraw(ctx, delta);
    };
    /**
     * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
     * @param ctx  The current rendering context
     */
    /* istanbul ignore next */
    Scene.prototype.debugDraw = function (ctx) {
        this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));
        this._broadphase.debugDraw(ctx, 20);
        this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
    };
    /**
     * Checks whether an actor is contained in this scene or not
     */
    Scene.prototype.contains = function (actor) {
        return this.actors.indexOf(actor) > -1;
    };
    Scene.prototype.add = function (entity) {
        var _this = this;
        if (entity instanceof Actor) {
            entity.unkill();
        }
        if (entity instanceof Actor) {
            if (!Util.contains(this.actors, entity)) {
                this._broadphase.track(entity.body);
                entity.scene = this;
                if (entity instanceof Trigger) {
                    this.triggers.push(entity);
                }
                else {
                    this.actors.push(entity);
                }
                this.world.add(entity);
                entity.children.forEach(function (c) { return _this.world.add(c); });
            }
            return;
        }
        if (entity instanceof Timer) {
            if (!Util.contains(this._timers, entity)) {
                this.addTimer(entity);
            }
            return;
        }
        if (entity instanceof TileMap) {
            if (!Util.contains(this.tileMaps, entity)) {
                this.addTileMap(entity);
            }
        }
    };
    Scene.prototype.remove = function (entity) {
        if (entity instanceof Actor) {
            if (!Util.contains(this.actors, entity)) {
                return;
            }
            this._broadphase.untrack(entity.body);
            if (entity instanceof Trigger) {
                this._triggerKillQueue.push(entity);
            }
            else {
                if (!entity.isKilled()) {
                    entity.kill();
                }
                this._killQueue.push(entity);
            }
            entity.parent = null;
        }
        if (entity instanceof Timer) {
            this.removeTimer(entity);
        }
        if (entity instanceof TileMap) {
            this.removeTileMap(entity);
        }
    };
    /**
     * Adds (any) actor to act as a piece of UI, meaning it is always positioned
     * in screen coordinates. UI actors do not participate in collisions.
     * @todo Should this be `ScreenElement` only?
     * @deprecated
     */
    Scene.prototype.addScreenElement = function (actor) {
        this.add(actor);
    };
    /**
     * Removes an actor as a piece of UI
     * @deprecated
     */
    Scene.prototype.removeScreenElement = function (actor) {
        this.remove(actor);
    };
    /**
     * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
     * @deprecated
     */
    Scene.prototype.addTileMap = function (tileMap) {
        this.tileMaps.push(tileMap);
        this.world.add(tileMap);
    };
    /**
     * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
     * @deprecated
     */
    Scene.prototype.removeTileMap = function (tileMap) {
        var index = this.tileMaps.indexOf(tileMap);
        if (index > -1) {
            this.tileMaps.splice(index, 1);
            this.world.remove(tileMap);
        }
    };
    /**
     * Adds a [[Timer]] to the scene
     * @param timer  The timer to add
     */
    Scene.prototype.addTimer = function (timer) {
        this._timers.push(timer);
        timer.scene = this;
        return timer;
    };
    /**
     * Removes a [[Timer]] from the scene.
     * @warning Can be dangerous, use [[cancelTimer]] instead
     * @param timer  The timer to remove
     */
    Scene.prototype.removeTimer = function (timer) {
        var i = this._timers.indexOf(timer);
        if (i !== -1) {
            this._timers.splice(i, 1);
        }
        return timer;
    };
    /**
     * Cancels a [[Timer]], removing it from the scene nicely
     * @param timer  The timer to cancel
     */
    Scene.prototype.cancelTimer = function (timer) {
        this._cancelQueue.push(timer);
        return timer;
    };
    /**
     * Tests whether a [[Timer]] is active in the scene
     */
    Scene.prototype.isTimerActive = function (timer) {
        return this._timers.indexOf(timer) > -1 && !timer.complete;
    };
    Scene.prototype.isCurrentScene = function () {
        if (this.engine) {
            return this.engine.currentScene === this;
        }
        return false;
    };
    Scene.prototype._collectActorStats = function (engine) {
        for (var _i = 0, _a = this.screenElements; _i < _a.length; _i++) {
            var _ui = _a[_i];
            engine.stats.currFrame.actors.ui++;
        }
        for (var _b = 0, _c = this.actors; _b < _c.length; _b++) {
            var actor = _c[_b];
            engine.stats.currFrame.actors.alive++;
            for (var _d = 0, _e = actor.children; _d < _e.length; _d++) {
                var child = _e[_d];
                if (ActorUtils.isScreenElement(child)) {
                    engine.stats.currFrame.actors.ui++;
                }
                else {
                    engine.stats.currFrame.actors.alive++;
                }
            }
        }
    };
    __decorate([
        obsolete({
            message: 'Will be removed in excalibur v0.26.0',
            alternateMethod: 'ScreenElements now are normal actors with a Transform Coordinate Plane of Screen'
        })
    ], Scene.prototype, "screenElements", null);
    __decorate([
        obsolete({ message: 'Will be removed in excalibur v0.26.0', alternateMethod: 'Use Scene.add' })
    ], Scene.prototype, "addScreenElement", null);
    __decorate([
        obsolete({ message: 'Will be removed in excalibur v0.26.0', alternateMethod: 'Use Scene.remove' })
    ], Scene.prototype, "removeScreenElement", null);
    __decorate([
        obsolete({ message: 'Will be removed in excalibur v0.26.0', alternateMethod: 'Use Scene.add' })
    ], Scene.prototype, "addTileMap", null);
    __decorate([
        obsolete({ message: 'Will be removed in excalibur v0.26.0', alternateMethod: 'Use Scene.remove' })
    ], Scene.prototype, "removeTileMap", null);
    return Scene;
}(Class));
export { Scene };
//# sourceMappingURL=Scene.js.map