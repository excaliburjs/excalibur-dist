var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { EX_VERSION } from './';
import { Flags } from './Flags';
import { polyfill } from './Polyfill';
polyfill();
import { Screen, DisplayMode } from './Screen';
import { Actor } from './Actor';
import { Loader } from './Loader';
import { Detector } from './Util/Detector';
import { VisibleEvent, HiddenEvent, GameStartEvent, GameStopEvent, PreUpdateEvent, PostUpdateEvent, PreFrameEvent, PostFrameEvent, DeactivateEvent, ActivateEvent, PreDrawEvent, PostDrawEvent, InitializeEvent } from './Events';
import { Logger, LogLevel } from './Util/Log';
import { Color } from './Drawing/Color';
import { Scene } from './Scene';
import { Debug } from './Debug';
import { Class } from './Class';
import * as Input from './Input/Index';
import { BrowserEvents } from './Util/Browser';
import { obsolete } from './Util/Decorators';
/**
 * Enum representing the different mousewheel event bubble prevention
 */
export var ScrollPreventionMode;
(function (ScrollPreventionMode) {
    /**
     * Do not prevent any page scrolling
     */
    ScrollPreventionMode[ScrollPreventionMode["None"] = 0] = "None";
    /**
     * Prevent page scroll if mouse is over the game canvas
     */
    ScrollPreventionMode[ScrollPreventionMode["Canvas"] = 1] = "Canvas";
    /**
     * Prevent all page scrolling via mouse wheel
     */
    ScrollPreventionMode[ScrollPreventionMode["All"] = 2] = "All";
})(ScrollPreventionMode || (ScrollPreventionMode = {}));
/**
 * The Excalibur Engine
 *
 * The [[Engine]] is the main driver for a game. It is responsible for
 * starting/stopping the game, maintaining state, transmitting events,
 * loading resources, and managing the scene.
 */
export class Engine extends Class {
    /**
     * Creates a new game using the given [[EngineOptions]]. By default, if no options are provided,
     * the game will be rendered full screen (taking up all available browser window space).
     * You can customize the game rendering through [[EngineOptions]].
     *
     * Example:
     *
     * ```js
     * var game = new ex.Engine({
     *   width: 0, // the width of the canvas
     *   height: 0, // the height of the canvas
     *   enableCanvasTransparency: true, // the transparencySection of the canvas
     *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
     *   displayMode: ex.DisplayMode.FullScreen, // the display mode
     *   pointerScope: ex.Input.PointerScope.Document, // the scope of capturing pointer (mouse/touch) events
     *   backgroundColor: ex.Color.fromHex('#2185d0') // background color of the engine
     * });
     *
     * // call game.start, which is a Promise
     * game.start().then(function () {
     *   // ready, set, go!
     * });
     * ```
     */
    constructor(options) {
        var _a, _b, _c;
        super();
        this._hasStarted = false;
        /**
         * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
         */
        this.postProcessors = [];
        /**
         * Contains all the scenes currently registered with Excalibur
         */
        this.scenes = {};
        this._animations = [];
        this._suppressPlayButton = false;
        /**
         * Indicates whether audio should be paused when the game is no longer visible.
         */
        this.pauseAudioWhenHidden = true;
        /**
         * Indicates whether the engine should draw with debug information
         */
        this._isDebug = false;
        this.debugColor = new Color(255, 255, 255);
        /**
         * Sets the Transparency for the engine.
         */
        this.enableCanvasTransparency = true;
        /**
         * The action to take when a fatal exception is thrown
         */
        this.onFatalException = (e) => {
            Logger.getInstance().fatal(e);
        };
        this._timescale = 1.0;
        this._isLoading = false;
        this._isInitialized = false;
        options = Object.assign(Object.assign({}, Engine._DEFAULT_ENGINE_OPTIONS), options);
        Flags.freeze();
        // Initialize browser events facade
        this.browser = new BrowserEvents(window, document);
        // Check compatibility
        const detector = new Detector();
        if (!options.suppressMinimumBrowserFeatureDetection && !(this._compatible = detector.test())) {
            const message = document.createElement('div');
            message.innerText = 'Sorry, your browser does not support all the features needed for Excalibur';
            document.body.appendChild(message);
            detector.failedTests.forEach(function (test) {
                const testMessage = document.createElement('div');
                testMessage.innerText = 'Browser feature missing ' + test;
                document.body.appendChild(testMessage);
            });
            if (options.canvasElementId) {
                const canvas = document.getElementById(options.canvasElementId);
                if (canvas) {
                    canvas.parentElement.removeChild(canvas);
                }
            }
            return;
        }
        else {
            this._compatible = true;
        }
        // Use native console API for color fun
        // eslint-disable-next-line no-console
        if (console.log && !options.suppressConsoleBootMessage) {
            // eslint-disable-next-line no-console
            console.log(`%cPowered by Excalibur.js (v${EX_VERSION})`, 'background: #176BAA; color: white; border-radius: 5px; padding: 15px; font-size: 1.5em; line-height: 80px;');
            // eslint-disable-next-line no-console
            console.log('\n\
      /| ________________\n\
O|===|* >________________>\n\
      \\|');
            // eslint-disable-next-line no-console
            console.log('Visit', 'http://excaliburjs.com', 'for more information');
        }
        // Suppress play button
        if (options.suppressPlayButton) {
            this._suppressPlayButton = true;
        }
        this._logger = Logger.getInstance();
        // If debug is enabled, let's log browser features to the console.
        if (this._logger.defaultLevel === LogLevel.Debug) {
            detector.logBrowserFeatures();
        }
        this._logger.debug('Building engine...');
        this.canvasElementId = options.canvasElementId;
        if (options.canvasElementId) {
            this._logger.debug('Using Canvas element specified: ' + options.canvasElementId);
            this.canvas = document.getElementById(options.canvasElementId);
        }
        else if (options.canvasElement) {
            this._logger.debug('Using Canvas element specified:', options.canvasElement);
            this.canvas = options.canvasElement;
        }
        else {
            this._logger.debug('Using generated canvas element');
            this.canvas = document.createElement('canvas');
        }
        let displayMode = (_a = options.displayMode) !== null && _a !== void 0 ? _a : DisplayMode.Fixed;
        if ((options.width && options.height) || options.viewport) {
            if (options.displayMode === undefined) {
                displayMode = DisplayMode.Fixed;
            }
            this._logger.debug('Engine viewport is size ' + options.width + ' x ' + options.height);
        }
        else if (!options.displayMode) {
            this._logger.debug('Engine viewport is fullscreen');
            displayMode = DisplayMode.FullScreen;
        }
        // eslint-disable-next-line
        this.ctx = this.canvas.getContext('2d', { alpha: this.enableCanvasTransparency });
        this.screen = new Screen({
            canvas: this.canvas,
            context: this.ctx,
            antialiasing: (_b = options.antialiasing) !== null && _b !== void 0 ? _b : true,
            browser: this.browser,
            viewport: (_c = options.viewport) !== null && _c !== void 0 ? _c : { width: options.width, height: options.height },
            resolution: options.resolution,
            displayMode,
            position: options.position,
            pixelRatio: options.suppressHiDPIScaling ? 1 : null
        });
        this.screen.applyResolutionAndViewport();
        if (options.backgroundColor) {
            this.backgroundColor = options.backgroundColor.clone();
        }
        this.enableCanvasTransparency = options.enableCanvasTransparency;
        this._loader = new Loader();
        this.debug = new Debug(this);
        this._initialize(options);
        this.rootScene = this.currentScene = new Scene(this);
        this.addScene('root', this.rootScene);
        this.goToScene('root');
    }
    /**
     * The width of the game canvas in pixels (physical width component of the
     * resolution of the canvas element)
     */
    get canvasWidth() {
        return this.screen.canvasWidth;
    }
    /**
     * Returns half width of the game canvas in pixels (half physical width component)
     */
    get halfCanvasWidth() {
        return this.screen.halfCanvasWidth;
    }
    /**
     * The height of the game canvas in pixels, (physical height component of
     * the resolution of the canvas element)
     */
    get canvasHeight() {
        return this.screen.canvasHeight;
    }
    /**
     * Returns half height of the game canvas in pixels (half physical height component)
     */
    get halfCanvasHeight() {
        return this.screen.halfCanvasHeight;
    }
    /**
     * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawWidth() {
        return this.screen.drawWidth;
    }
    /**
     * Returns half the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawWidth() {
        return this.screen.halfDrawWidth;
    }
    /**
     * Returns the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawHeight() {
        return this.screen.drawHeight;
    }
    /**
     * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawHeight() {
        return this.screen.halfDrawHeight;
    }
    /**
     * Returns whether excalibur detects the current screen to be HiDPI
     */
    get isHiDpi() {
        return this.screen.isHiDpi;
    }
    /**
     * Access [[stats]] that holds frame statistics.
     */
    get stats() {
        return this.debug.stats;
    }
    /**
     * Indicates whether the engine is set to fullscreen or not
     */
    get isFullscreen() {
        return this.screen.isFullScreen;
    }
    /**
     * Indicates the current [[DisplayMode]] of the engine.
     */
    get displayMode() {
        return this.screen.displayMode;
    }
    /**
     * Returns the calculated pixel ration for use in rendering
     */
    get pixelRatio() {
        return this.screen.pixelRatio;
    }
    get isDebug() {
        return this._isDebug;
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
     * Returns a BoundingBox of the top left corner of the screen
     * and the bottom right corner of the screen.
     */
    getWorldBounds() {
        return this.screen.getWorldBounds();
    }
    /**
     * Gets the current engine timescale factor (default is 1.0 which is 1:1 time)
     */
    get timescale() {
        return this._timescale;
    }
    /**
     * Sets the current engine timescale factor. Useful for creating slow-motion effects or fast-forward effects
     * when using time-based movement.
     */
    set timescale(value) {
        if (value <= 0) {
            Logger.getInstance().error('Cannot set engine.timescale to a value of 0 or less than 0.');
            return;
        }
        this._timescale = value;
    }
    /**
     * Plays a sprite animation on the screen at the specified `x` and `y`
     * (in game coordinates, not screen pixels). These animations play
     * independent of actors, and will be cleaned up internally as soon
     * as they are complete. Note animations that loop will never be
     * cleaned up.
     *
     * @param animation  Animation to play
     * @param x          x game coordinate to play the animation
     * @param y          y game coordinate to play the animation
     * @deprecated
     */
    playAnimation(animation, x, y) {
        this._animations.push(new AnimationNode(animation, x, y));
    }
    /**
     * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
     * will be drawn and updated.
     */
    addTileMap(tileMap) {
        this.currentScene.addTileMap(tileMap);
    }
    /**
     * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
     */
    removeTileMap(tileMap) {
        this.currentScene.removeTileMap(tileMap);
    }
    /**
     * Adds a [[Timer]] to the [[currentScene]].
     * @param timer  The timer to add to the [[currentScene]].
     */
    addTimer(timer) {
        return this.currentScene.addTimer(timer);
    }
    /**
     * Removes a [[Timer]] from the [[currentScene]].
     * @param timer  The timer to remove to the [[currentScene]].
     */
    removeTimer(timer) {
        return this.currentScene.removeTimer(timer);
    }
    /**
     * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     *
     * @param key  The name of the scene, must be unique
     * @param scene The scene to add to the engine
     */
    addScene(key, scene) {
        if (this.scenes[key]) {
            this._logger.warn('Scene', key, 'already exists overwriting');
        }
        this.scenes[key] = scene;
    }
    /**
     * @internal
     */
    removeScene(entity) {
        if (entity instanceof Scene) {
            // remove scene
            for (const key in this.scenes) {
                if (this.scenes.hasOwnProperty(key)) {
                    if (this.scenes[key] === entity) {
                        delete this.scenes[key];
                    }
                }
            }
        }
        if (typeof entity === 'string') {
            // remove scene
            delete this.scenes[entity];
        }
    }
    add(entity) {
        if (arguments.length === 2) {
            this.addScene(arguments[0], arguments[1]);
        }
        this.currentScene.add(entity);
    }
    remove(entity) {
        if (entity instanceof Actor) {
            this.currentScene.remove(entity);
        }
        if (entity instanceof Scene) {
            this.removeScene(entity);
        }
        if (typeof entity === 'string') {
            this.removeScene(entity);
        }
    }
    /**
     * Changes the currently updating and drawing scene to a different,
     * named scene. Calls the [[Scene]] lifecycle events.
     * @param key  The key of the scene to transition to.
     */
    goToScene(key) {
        if (this.scenes[key]) {
            const oldScene = this.currentScene;
            const newScene = this.scenes[key];
            this._logger.debug('Going to scene:', key);
            // only deactivate when initialized
            if (this.currentScene.isInitialized) {
                this.currentScene._deactivate.call(this.currentScene, [oldScene, newScene]);
                this.currentScene.eventDispatcher.emit('deactivate', new DeactivateEvent(newScene, this.currentScene));
            }
            // set current scene to new one
            this.currentScene = newScene;
            this.screen.setCurrentCamera(newScene.camera);
            // initialize the current scene if has not been already
            this.currentScene._initialize(this);
            this.currentScene._activate.call(this.currentScene, [oldScene, newScene]);
            this.currentScene.eventDispatcher.emit('activate', new ActivateEvent(oldScene, this.currentScene));
        }
        else {
            this._logger.error('Scene', key, 'does not exist!');
        }
    }
    /**
     * Transforms the current x, y from screen coordinates to world coordinates
     * @param point  Screen coordinate to convert
     */
    screenToWorldCoordinates(point) {
        return this.screen.screenToWorldCoordinates(point);
    }
    /**
     * Transforms a world coordinate, to a screen coordinate
     * @param point  World coordinate to convert
     */
    worldToScreenCoordinates(point) {
        return this.screen.worldToScreenCoordinates(point);
    }
    /**
     * Initializes the internal canvas, rendering context, display mode, and native event listeners
     */
    _initialize(options) {
        this.pageScrollPreventionMode = options.scrollPreventionMode;
        // initialize inputs
        this.input = {
            keyboard: new Input.Keyboard(),
            pointers: new Input.Pointers(this),
            gamepads: new Input.Gamepads()
        };
        this.input.keyboard.init();
        this.input.pointers.init(options && options.pointerScope === Input.PointerScope.Document ? document : this.canvas);
        this.input.gamepads.init();
        // Issue #385 make use of the visibility api
        // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
        let hidden, visibilityChange;
        if (typeof document.hidden !== 'undefined') {
            // Opera 12.10 and Firefox 18 and later support
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        }
        else if ('msHidden' in document) {
            hidden = 'msHidden';
            visibilityChange = 'msvisibilitychange';
        }
        else if ('webkitHidden' in document) {
            hidden = 'webkitHidden';
            visibilityChange = 'webkitvisibilitychange';
        }
        this.browser.document.on(visibilityChange, () => {
            if (document[hidden]) {
                this.eventDispatcher.emit('hidden', new HiddenEvent(this));
                this._logger.debug('Window hidden');
            }
            else {
                this.eventDispatcher.emit('visible', new VisibleEvent(this));
                this._logger.debug('Window visible');
            }
        });
        if (!this.canvasElementId && !options.canvasElement) {
            document.body.appendChild(this.canvas);
        }
    }
    onInitialize(_engine) {
        // Override me
    }
    /**
     * If supported by the browser, this will set the antialiasing flag on the
     * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
     * image resources.
     * @param isSmooth  Set smoothing to true or false
     */
    setAntialiasing(isSmooth) {
        this.screen.antialiasing = isSmooth;
    }
    /**
     * Return the current smoothing status of the canvas
     */
    getAntialiasing() {
        return this.screen.antialiasing;
    }
    /**
     * Gets whether the actor is Initialized
     */
    get isInitialized() {
        return this._isInitialized;
    }
    _overrideInitialize(engine) {
        if (!this.isInitialized) {
            this.onInitialize(engine);
            super.emit('initialize', new InitializeEvent(engine, this));
            this._isInitialized = true;
        }
    }
    /**
     * Updates the entire state of the game
     * @param delta  Number of milliseconds elapsed since the last update.
     */
    _update(delta) {
        if (this._isLoading) {
            // suspend updates until loading is finished
            this._loader.update(this, delta);
            // Update input listeners
            this.input.keyboard.update();
            this.input.pointers.update();
            this.input.gamepads.update();
            return;
        }
        this._overrideInitialize(this);
        // Publish preupdate events
        this._preupdate(delta);
        // process engine level events
        this.currentScene.update(this, delta);
        // update animations
        // TODO remove
        this._animations = this._animations.filter(function (a) {
            return !a.animation.isDone();
        });
        // Update input listeners
        this.input.keyboard.update();
        this.input.pointers.update();
        this.input.gamepads.update();
        // Publish update event
        this._postupdate(delta);
    }
    /**
     * @internal
     */
    _preupdate(delta) {
        this.emit('preupdate', new PreUpdateEvent(this, delta, this));
        this.onPreUpdate(this, delta);
    }
    onPreUpdate(_engine, _delta) {
        // Override me
    }
    /**
     * @internal
     */
    _postupdate(delta) {
        this.emit('postupdate', new PostUpdateEvent(this, delta, this));
        this.onPostUpdate(this, delta);
    }
    onPostUpdate(_engine, _delta) {
        // Override me
    }
    /**
     * Draws the entire game
     * @param delta  Number of milliseconds elapsed since the last draw.
     */
    _draw(delta) {
        const ctx = this.ctx;
        this._predraw(ctx, delta);
        if (this._isLoading) {
            this._loader.draw(ctx, delta);
            // Drawing nothing else while loading
            return;
        }
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        ctx.fillStyle = this.backgroundColor.toString();
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.currentScene.draw(this.ctx, delta);
        // todo needs to be a better way of doing this
        let a = 0;
        const len = this._animations.length;
        for (a; a < len; a++) {
            this._animations[a].animation.draw(ctx, this._animations[a].x, this._animations[a].y);
        }
        // Draw debug information
        if (this.isDebug) {
            this.ctx.font = 'Consolas';
            this.ctx.fillStyle = this.debugColor.toString();
            const keys = this.input.keyboard.getKeys();
            for (let j = 0; j < keys.length; j++) {
                this.ctx.fillText(keys[j].toString() + ' : ' + (Input.Keys[keys[j]] ? Input.Keys[keys[j]] : 'Not Mapped'), 100, 10 * j + 10);
            }
            this.ctx.fillText('FPS:' + this.stats.currFrame.fps.toFixed(2).toString(), 10, 10);
        }
        // Post processing
        for (let i = 0; i < this.postProcessors.length; i++) {
            this.postProcessors[i].process(this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight), this.ctx);
        }
        this._postdraw(ctx, delta);
    }
    /**
     * @internal
     */
    _predraw(_ctx, delta) {
        this.emit('predraw', new PreDrawEvent(_ctx, delta, this));
        this.onPreDraw(_ctx, delta);
    }
    onPreDraw(_ctx, _delta) {
        // Override me
    }
    /**
     * @internal
     */
    _postdraw(_ctx, delta) {
        this.emit('postdraw', new PostDrawEvent(_ctx, delta, this));
        this.onPostDraw(_ctx, delta);
    }
    onPostDraw(_ctx, _delta) {
        // Override me
    }
    /**
     * Enable or disable Excalibur debugging functionality.
     * @param toggle a value that debug drawing will be changed to
     */
    showDebug(toggle) {
        this._isDebug = toggle;
    }
    /**
     * Toggle Excalibur debugging functionality.
     */
    toggleDebug() {
        this._isDebug = !this._isDebug;
        return this._isDebug;
    }
    /**
     * Starts the internal game loop for Excalibur after loading
     * any provided assets.
     * @param loader  Optional [[Loader]] to use to load resources. The default loader is [[Loader]], override to provide your own
     * custom loader.
     */
    start(loader) {
        if (!this._compatible) {
            return Promise.reject('Excalibur is incompatible with your browser');
        }
        // Changing resolution invalidates context state, so we need to capture it before applying
        this.screen.pushResolutionAndViewport();
        this.screen.resolution = this.screen.viewport;
        this.screen.applyResolutionAndViewport();
        let loadingComplete;
        if (loader) {
            this._loader = loader;
            this._loader.suppressPlayButton = this._suppressPlayButton || this._loader.suppressPlayButton;
            this._loader.wireEngine(this);
            loadingComplete = this.load(this._loader);
        }
        else {
            loadingComplete = Promise.resolve();
        }
        loadingComplete.then(() => {
            this.screen.popResolutionAndViewport();
            this.screen.applyResolutionAndViewport();
            this.emit('start', new GameStartEvent(this));
        });
        if (!this._hasStarted) {
            this._hasStarted = true;
            this._logger.debug('Starting game...');
            this.browser.resume();
            Engine.createMainLoop(this, window.requestAnimationFrame, Date.now)();
            this._logger.debug('Game started');
        }
        else {
            // Game already started;
        }
        return loadingComplete;
    }
    static createMainLoop(game, raf, nowFn) {
        let lastTime = nowFn();
        return function mainloop() {
            if (!game._hasStarted) {
                return;
            }
            try {
                game._requestId = raf(mainloop);
                game.emit('preframe', new PreFrameEvent(game, game.stats.prevFrame));
                // Get the time to calculate time-elapsed
                const now = nowFn();
                let elapsed = Math.floor(now - lastTime) || 1;
                // Resolves issue #138 if the game has been paused, or blurred for
                // more than a 200 milliseconds, reset elapsed time to 1. This improves reliability
                // and provides more expected behavior when the engine comes back
                // into focus
                if (elapsed > 200) {
                    elapsed = 1;
                }
                const delta = elapsed * game.timescale;
                // reset frame stats (reuse existing instances)
                const frameId = game.stats.prevFrame.id + 1;
                game.stats.currFrame.reset();
                game.stats.currFrame.id = frameId;
                game.stats.currFrame.delta = delta;
                game.stats.currFrame.fps = 1.0 / (delta / 1000);
                const beforeUpdate = nowFn();
                game._update(delta);
                const afterUpdate = nowFn();
                game._draw(delta);
                const afterDraw = nowFn();
                game.stats.currFrame.duration.update = afterUpdate - beforeUpdate;
                game.stats.currFrame.duration.draw = afterDraw - afterUpdate;
                lastTime = now;
                game.emit('postframe', new PostFrameEvent(game, game.stats.currFrame));
                game.stats.prevFrame.reset(game.stats.currFrame);
            }
            catch (e) {
                window.cancelAnimationFrame(game._requestId);
                game.stop();
                game.onFatalException(e);
            }
        };
    }
    /**
     * Stops Excalibur's main loop, useful for pausing the game.
     */
    stop() {
        if (this._hasStarted) {
            this.emit('stop', new GameStopEvent(this));
            this.browser.pause();
            this._hasStarted = false;
            this._logger.debug('Game stopped');
        }
    }
    /**
     * Returns the Engine's Running status, Useful for checking whether engine is running or paused.
     */
    isPaused() {
        return !this._hasStarted;
    }
    /**
     * Takes a screen shot of the current viewport and returns it as an
     * HTML Image Element.
     */
    screenshot() {
        const result = new Image();
        const raw = this.canvas.toDataURL('image/png');
        result.src = raw;
        return result;
    }
    /**
     * Another option available to you to load resources into the game.
     * Immediately after calling this the game will pause and the loading screen
     * will appear.
     * @param loader  Some [[Loadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
     */
    load(loader) {
        const complete = new Promise((resolve) => {
            this._isLoading = true;
            loader.load().then(() => {
                if (this._suppressPlayButton) {
                    setTimeout(() => {
                        this._isLoading = false;
                        resolve();
                        // Delay is to give the logo a chance to show, otherwise don't delay
                    }, 500);
                }
                else {
                    this._isLoading = false;
                    resolve();
                }
            });
        });
        return complete;
    }
}
/**
 * Default [[EngineOptions]]
 */
Engine._DEFAULT_ENGINE_OPTIONS = {
    width: 0,
    height: 0,
    enableCanvasTransparency: true,
    canvasElementId: '',
    canvasElement: undefined,
    pointerScope: Input.PointerScope.Document,
    suppressConsoleBootMessage: null,
    suppressMinimumBrowserFeatureDetection: null,
    suppressHiDPIScaling: null,
    suppressPlayButton: null,
    scrollPreventionMode: ScrollPreventionMode.Canvas,
    backgroundColor: Color.fromHex('#2185d0') // Excalibur blue
};
__decorate([
    obsolete({ message: 'Will be removed in excalibur v0.26.0' })
], Engine.prototype, "playAnimation", null);
/**
 * @internal
 * @deprecated
 */
let AnimationNode = class AnimationNode {
    constructor(animation, x, y) {
        this.animation = animation;
        this.x = x;
        this.y = y;
    }
};
AnimationNode = __decorate([
    obsolete({ message: 'Will be removed in excalibur v0.26.0' })
], AnimationNode);
//# sourceMappingURL=Engine.js.map