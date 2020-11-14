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
export class Scene extends Class {
    constructor(_engine) {
        super();
        /**
         * The actors in the current scene
         */
        this.actors = [];
        /**
         * The ECS world for the scene
         */
        this.world = new World(this);
        /**
         * Physics bodies in the current scene
         */
        this._bodies = [];
        /**
         * The triggers in the current scene
         */
        this.triggers = [];
        /**
         * The [[TileMap]]s in the scene, if any
         */
        this.tileMaps = [];
        this._isInitialized = false;
        this._broadphase = new DynamicTreeCollisionBroadphase();
        this._killQueue = [];
        this._triggerKillQueue = [];
        this._timers = [];
        this._cancelQueue = [];
        this._logger = Logger.getInstance();
        this.camera = new Camera();
        if (_engine) {
            this.engine = _engine;
            this.camera.x = this.engine.halfDrawWidth;
            this.camera.y = this.engine.halfDrawHeight;
        }
    }
    /**
     * The [[ScreenElement]]s in a scene, if any; these are drawn last
     * @deprecated
     */
    get screenElements() {
        return this.actors.filter((a) => a instanceof ScreenElement);
    }
    on(eventName, handler) {
        super.on(eventName, handler);
    }
    once(eventName, handler) {
        super.once(eventName, handler);
    }
    off(eventName, handler) {
        super.off(eventName, handler);
    }
    /**
     * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     */
    onInitialize(_engine) {
        // will be overridden
    }
    /**
     * This is called when the scene is made active and started. It is meant to be overridden,
     * this is where you should setup any DOM UI or event handlers needed for the scene.
     */
    onActivate(_oldScene, _newScene) {
        // will be overridden
    }
    /**
     * This is called when the scene is made transitioned away from and stopped. It is meant to be overridden,
     * this is where you should cleanup any DOM UI or event handlers needed for the scene.
     */
    onDeactivate(_oldScene, _newScene) {
        // will be overridden
    }
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before a scene is updated.
     */
    onPreUpdate(_engine, _delta) {
        // will be overridden
    }
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     */
    onPostUpdate(_engine, _delta) {
        // will be overridden
    }
    /**
     * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreDraw` is called directly before a scene is drawn.
     */
    onPreDraw(_ctx, _delta) {
        // will be overridden
    }
    /**
     * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostDraw` is called directly after a scene is drawn.
     */
    onPostDraw(_ctx, _delta) {
        // will be overridden
    }
    /**
     * Initializes actors in the scene
     */
    _initializeChildren() {
        for (const child of this.actors) {
            child._initialize(this.engine);
        }
    }
    /**
     * Gets whether or not the [[Scene]] has been initialized
     */
    get isInitialized() {
        return this._isInitialized;
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Initializes the scene before the first update, meant to be called by engine not by users of
     * Excalibur
     * @internal
     */
    _initialize(engine) {
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
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Activates the scene with the base behavior, then calls the overridable `onActivate` implementation.
     * @internal
     */
    _activate(oldScene, newScene) {
        this._logger.debug('Scene.onActivate', this);
        this.onActivate(oldScene, newScene);
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Deactivates the scene with the base behavior, then calls the overridable `onDeactivate` implementation.
     * @internal
     */
    _deactivate(oldScene, newScene) {
        this._logger.debug('Scene.onDeactivate', this);
        this.onDeactivate(oldScene, newScene);
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    _preupdate(_engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(_engine, delta, this));
        this.onPreUpdate(_engine, delta);
    }
    /**
     *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    _postupdate(_engine, delta) {
        this.emit('postupdate', new PostUpdateEvent(_engine, delta, this));
        this.onPostUpdate(_engine, delta);
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _predraw handler for [[onPreDraw]] lifecycle event
     *
     * @internal
     */
    _predraw(_ctx, _delta) {
        this.emit('predraw', new PreDrawEvent(_ctx, _delta, this));
        this.onPreDraw(_ctx, _delta);
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _postdraw handler for [[onPostDraw]] lifecycle event
     *
     * @internal
     */
    _postdraw(_ctx, _delta) {
        this.emit('postdraw', new PostDrawEvent(_ctx, _delta, this));
        this.onPostDraw(_ctx, _delta);
    }
    /**
     * Updates all the actors and timers in the scene. Called by the [[Engine]].
     * @param engine  Reference to the current Engine
     * @param delta   The number of milliseconds since the last update
     */
    update(engine, delta) {
        this._preupdate(engine, delta);
        this.world.update(SystemType.Update, delta);
        if (this.camera) {
            this.camera.update(engine, delta);
        }
        let i, len;
        // Remove timers in the cancel queue before updating them
        for (i = 0, len = this._cancelQueue.length; i < len; i++) {
            this.removeTimer(this._cancelQueue[i]);
        }
        this._cancelQueue.length = 0;
        // Cycle through timers updating timers
        for (const timer of this._timers) {
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
            const beforeBroadphase = Date.now();
            this._broadphase.update(this._bodies, delta);
            let pairs = this._broadphase.broadphase(this._bodies, delta, engine.stats.currFrame);
            const afterBroadphase = Date.now();
            const beforeNarrowphase = Date.now();
            let iter = Physics.collisionPasses;
            const collisionDelta = delta / iter;
            while (iter > 0) {
                // Run the narrowphase
                pairs = this._broadphase.narrowphase(pairs, engine.stats.currFrame);
                // Run collision resolution strategy
                pairs = this._broadphase.resolve(pairs, collisionDelta, Physics.collisionResolutionStrategy);
                this._broadphase.runCollisionStartEnd(pairs);
                iter--;
            }
            const afterNarrowphase = Date.now();
            engine.stats.currFrame.physics.broadphase = afterBroadphase - beforeBroadphase;
            engine.stats.currFrame.physics.narrowphase = afterNarrowphase - beforeNarrowphase;
        }
        engine.stats.currFrame.actors.killed = this._killQueue.length + this._triggerKillQueue.length;
        this._processKillQueue(this._killQueue, this.actors);
        this._processKillQueue(this._triggerKillQueue, this.triggers);
        this._postupdate(engine, delta);
    }
    _processKillQueue(killQueue, collection) {
        // Remove actors from scene graph after being killed
        let actorIndex;
        for (const killed of killQueue) {
            //don't remove actors that were readded during the same frame they were killed
            if (killed.isKilled()) {
                actorIndex = collection.indexOf(killed);
                if (actorIndex > -1) {
                    collection.splice(actorIndex, 1);
                    this.world.remove(killed);
                    killed.children.forEach((c) => this.world.remove(c));
                }
            }
        }
        killQueue.length = 0;
    }
    /**
     * Draws all the actors in the Scene. Called by the [[Engine]].
     * @param ctx    The current rendering context
     * @param delta  The number of milliseconds since the last draw
     */
    draw(ctx, delta) {
        this._predraw(ctx, delta);
        this.world.update(SystemType.Draw, delta);
        this._postdraw(ctx, delta);
    }
    /**
     * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
     * @param ctx  The current rendering context
     */
    /* istanbul ignore next */
    debugDraw(ctx) {
        this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));
        this._broadphase.debugDraw(ctx, 20);
        this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
    }
    /**
     * Checks whether an actor is contained in this scene or not
     */
    contains(actor) {
        return this.actors.indexOf(actor) > -1;
    }
    add(entity) {
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
                entity.children.forEach((c) => this.world.add(c));
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
    }
    remove(entity) {
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
    }
    /**
     * Adds (any) actor to act as a piece of UI, meaning it is always positioned
     * in screen coordinates. UI actors do not participate in collisions.
     * @todo Should this be `ScreenElement` only?
     * @deprecated
     */
    addScreenElement(actor) {
        this.add(actor);
    }
    /**
     * Removes an actor as a piece of UI
     * @deprecated
     */
    removeScreenElement(actor) {
        this.remove(actor);
    }
    /**
     * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
     * @deprecated
     */
    addTileMap(tileMap) {
        this.tileMaps.push(tileMap);
        this.world.add(tileMap);
    }
    /**
     * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
     * @deprecated
     */
    removeTileMap(tileMap) {
        const index = this.tileMaps.indexOf(tileMap);
        if (index > -1) {
            this.tileMaps.splice(index, 1);
            this.world.remove(tileMap);
        }
    }
    /**
     * Adds a [[Timer]] to the scene
     * @param timer  The timer to add
     */
    addTimer(timer) {
        this._timers.push(timer);
        timer.scene = this;
        return timer;
    }
    /**
     * Removes a [[Timer]] from the scene.
     * @warning Can be dangerous, use [[cancelTimer]] instead
     * @param timer  The timer to remove
     */
    removeTimer(timer) {
        const i = this._timers.indexOf(timer);
        if (i !== -1) {
            this._timers.splice(i, 1);
        }
        return timer;
    }
    /**
     * Cancels a [[Timer]], removing it from the scene nicely
     * @param timer  The timer to cancel
     */
    cancelTimer(timer) {
        this._cancelQueue.push(timer);
        return timer;
    }
    /**
     * Tests whether a [[Timer]] is active in the scene
     */
    isTimerActive(timer) {
        return this._timers.indexOf(timer) > -1 && !timer.complete;
    }
    isCurrentScene() {
        if (this.engine) {
            return this.engine.currentScene === this;
        }
        return false;
    }
    _collectActorStats(engine) {
        for (const _ui of this.screenElements) {
            engine.stats.currFrame.actors.ui++;
        }
        for (const actor of this.actors) {
            engine.stats.currFrame.actors.alive++;
            for (const child of actor.children) {
                if (ActorUtils.isScreenElement(child)) {
                    engine.stats.currFrame.actors.ui++;
                }
                else {
                    engine.stats.currFrame.actors.alive++;
                }
            }
        }
    }
}
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
//# sourceMappingURL=Scene.js.map