import { Vector } from './Algebra';
import { Logger } from './Util/Log';
import { BoundingBox } from './Collision/Index';
/**
 * Enum representing the different display modes available to Excalibur.
 */
export var DisplayMode;
(function (DisplayMode) {
    /**
     * Use the entire screen's css width/height for the game resolution dynamically. This is not the same as [[Screen.goFullScreen]]
     */
    DisplayMode["FullScreen"] = "FullScreen";
    /**
     * Use the parent DOM container's css width/height for the game resolution dynamically
     */
    DisplayMode["Container"] = "Container";
    /**
     * Default, use a specified resolution for the game
     */
    DisplayMode["Fixed"] = "Fixed";
    /**
     * Allow the game to be positioned with the [[EngineOptions.position]] option
     */
    DisplayMode["Position"] = "Position";
})(DisplayMode || (DisplayMode = {}));
/**
 * Convenience class for quick resolutions
 * Mostly sourced from https://emulation.gametechwiki.com/index.php/Resolution
 */
export class Resolution {
    /* istanbul ignore next */
    static get SVGA() {
        return { width: 800, height: 600 };
    }
    /* istanbul ignore next */
    static get Standard() {
        return { width: 1920, height: 1080 };
    }
    /* istanbul ignore next */
    static get Atari2600() {
        return { width: 160, height: 192 };
    }
    /* istanbul ignore next */
    static get GameBoy() {
        return { width: 160, height: 144 };
    }
    /* istanbul ignore next */
    static get GameBoyAdvance() {
        return { width: 240, height: 160 };
    }
    /* istanbul ignore next */
    static get NintendoDS() {
        return { width: 256, height: 192 };
    }
    /* istanbul ignore next */
    static get NES() {
        return { width: 256, height: 224 };
    }
    /* istanbul ignore next */
    static get SNES() {
        return { width: 256, height: 244 };
    }
}
/**
 * The Screen handles all aspects of interacting with the screen for Excalibur.
 */
export class Screen {
    constructor(options) {
        var _a, _b, _c;
        this._antialiasing = true;
        this._resolutionStack = [];
        this._viewportStack = [];
        this._pixelRatio = null;
        this._isFullScreen = false;
        this._isDisposed = false;
        this._logger = Logger.getInstance();
        this._pixelRatioChangeHandler = () => {
            this._logger.debug('Pixel Ratio Change', window.devicePixelRatio);
            this.applyResolutionAndViewport();
        };
        this._windowResizeHandler = () => {
            const parent = (this.displayMode === DisplayMode.Container ? (this.canvas.parentElement || document.body) : window);
            this._logger.debug('View port resized');
            this._setHeightByDisplayMode(parent);
            this._logger.info('parent.clientHeight ' + parent.clientHeight);
            this.applyResolutionAndViewport();
        };
        this.viewport = options.viewport;
        this.resolution = (_a = options.resolution) !== null && _a !== void 0 ? _a : Object.assign({}, this.viewport);
        this._displayMode = (_b = options.displayMode) !== null && _b !== void 0 ? _b : DisplayMode.Fixed;
        this._canvas = options.canvas;
        this._ctx = options.context;
        this._antialiasing = (_c = options.antialiasing) !== null && _c !== void 0 ? _c : this._antialiasing;
        this._browser = options.browser;
        this._position = options.position;
        this._pixelRatio = options.pixelRatio;
        this._applyDisplayMode();
        this._mediaQueryList = this._browser.window.nativeComponent.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        this._mediaQueryList.addEventListener('change', this._pixelRatioChangeHandler);
    }
    dispose() {
        if (!this._isDisposed) {
            // Clean up handlers
            this._isDisposed = true;
            this._browser.window.off('resize', this._windowResizeHandler);
            this._mediaQueryList.removeEventListener('change', this._pixelRatioChangeHandler);
        }
    }
    get pixelRatio() {
        if (this._pixelRatio) {
            return this._pixelRatio;
        }
        if (window.devicePixelRatio < 1) {
            return 1;
        }
        const devicePixelRatio = window.devicePixelRatio || 1;
        return devicePixelRatio;
    }
    get isHiDpi() {
        return this.pixelRatio !== 1;
    }
    get displayMode() {
        return this._displayMode;
    }
    get canvas() {
        return this._canvas;
    }
    get resolution() {
        return this._resolution;
    }
    set resolution(resolution) {
        this._resolution = resolution;
    }
    get viewport() {
        if (this._viewport) {
            return this._viewport;
        }
        return this._resolution;
    }
    set viewport(viewport) {
        this._viewport = viewport;
    }
    get scaledWidth() {
        return this._resolution.width * this.pixelRatio;
    }
    get scaledHeight() {
        return this._resolution.height * this.pixelRatio;
    }
    setCurrentCamera(camera) {
        this._camera = camera;
    }
    pushResolutionAndViewport() {
        this._resolutionStack.push(this.resolution);
        this._viewportStack.push(this.viewport);
        this.resolution = Object.assign({}, this.resolution);
        this.viewport = Object.assign({}, this.viewport);
    }
    popResolutionAndViewport() {
        this.resolution = this._resolutionStack.pop();
        this.viewport = this._viewportStack.pop();
    }
    applyResolutionAndViewport() {
        this._canvas.width = this.scaledWidth;
        this._canvas.height = this.scaledHeight;
        if (this._antialiasing) {
            this._canvas.style.imageRendering = 'auto';
        }
        else {
            this._canvas.style.imageRendering = 'pixelated';
            // Fall back to 'crisp-edges' if 'pixelated' is not supported
            // Currently for firefox https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
            if (this._canvas.style.imageRendering === '') {
                this._canvas.style.imageRendering = 'crisp-edges';
            }
        }
        this._canvas.style.width = this.viewport.width + 'px';
        this._canvas.style.height = this.viewport.height + 'px';
        // After messing with the canvas width/height the graphics context is invalidated and needs to have some properties reset
        this._ctx.resetTransform();
        this._ctx.scale(this.pixelRatio, this.pixelRatio);
        this._ctx.imageSmoothingEnabled = this._antialiasing;
    }
    get antialiasing() {
        return this._antialiasing;
    }
    set antialiasing(isSmooth) {
        this._antialiasing = isSmooth;
        this._ctx.imageSmoothingEnabled = this._antialiasing;
    }
    /**
     * Returns true if excalibur is fullscreened using the browser fullscreen api
     */
    get isFullScreen() {
        return this._isFullScreen;
    }
    /**
     * Requests to go fullscreen using the browser fullscreen api
     */
    goFullScreen() {
        return this._canvas.requestFullscreen().then(() => {
            this._isFullScreen = true;
        });
    }
    /**
     * Requests to exit fullscreen using the browser fullscreen api
     */
    exitFullScreen() {
        return document.exitFullscreen().then(() => {
            this._isFullScreen = false;
        });
    }
    /**
     * Transforms the current x, y from screen coordinates to world coordinates
     * @param point  Screen coordinate to convert
     */
    screenToWorldCoordinates(point) {
        var _a, _b, _c, _d;
        let newX = point.x;
        let newY = point.y;
        // transform back to world space
        newX = (newX / this.viewport.width) * this.drawWidth;
        newY = (newY / this.viewport.height) * this.drawHeight;
        // transform based on zoom
        newX = newX - this.halfDrawWidth;
        newY = newY - this.halfDrawHeight;
        // shift by focus
        newX += (_b = (_a = this._camera) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0;
        newY += (_d = (_c = this._camera) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0;
        return new Vector(Math.floor(newX), Math.floor(newY));
    }
    /**
     * Transforms a world coordinate, to a screen coordinate
     * @param point  World coordinate to convert
     */
    worldToScreenCoordinates(point) {
        var _a, _b, _c, _d;
        let screenX = point.x;
        let screenY = point.y;
        // shift by focus
        screenX -= (_b = (_a = this._camera) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0;
        screenY -= (_d = (_c = this._camera) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0;
        // transform back on zoom
        screenX = screenX + this.halfDrawWidth;
        screenY = screenY + this.halfDrawHeight;
        // transform back to screen space
        screenX = (screenX * this.viewport.width) / this.drawWidth;
        screenY = (screenY * this.viewport.height) / this.drawHeight;
        return new Vector(Math.floor(screenX), Math.floor(screenY));
    }
    /**
     * Returns a BoundingBox of the top left corner of the screen
     * and the bottom right corner of the screen.
     */
    getWorldBounds() {
        const left = this.screenToWorldCoordinates(Vector.Zero).x;
        const top = this.screenToWorldCoordinates(Vector.Zero).y;
        const right = left + this.drawWidth;
        const bottom = top + this.drawHeight;
        return new BoundingBox(left, top, right, bottom);
    }
    /**
     * The width of the game canvas in pixels (physical width component of the
     * resolution of the canvas element)
     */
    get canvasWidth() {
        return this.canvas.width;
    }
    /**
     * Returns half width of the game canvas in pixels (half physical width component)
     */
    get halfCanvasWidth() {
        return this.canvas.width / 2;
    }
    /**
     * The height of the game canvas in pixels, (physical height component of
     * the resolution of the canvas element)
     */
    get canvasHeight() {
        return this.canvas.height;
    }
    /**
     * Returns half height of the game canvas in pixels (half physical height component)
     */
    get halfCanvasHeight() {
        return this.canvas.height / 2;
    }
    /**
     * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawWidth() {
        if (this._camera) {
            return this.scaledWidth / this._camera.z / this.pixelRatio;
        }
        return this.scaledWidth / this.pixelRatio;
    }
    /**
     * Returns half the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawWidth() {
        return this.drawWidth / 2;
    }
    /**
     * Returns the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawHeight() {
        if (this._camera) {
            return this.scaledHeight / this._camera.z / this.pixelRatio;
        }
        return this.scaledHeight / this.pixelRatio;
    }
    /**
     * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawHeight() {
        return this.drawHeight / 2;
    }
    _applyDisplayMode() {
        if (this.displayMode === DisplayMode.FullScreen || this.displayMode === DisplayMode.Container) {
            const parent = (this.displayMode === DisplayMode.Container ? (this.canvas.parentElement || document.body) : window);
            this._setHeightByDisplayMode(parent);
            this._browser.window.on('resize', this._windowResizeHandler);
        }
        else if (this.displayMode === DisplayMode.Position) {
            this._initializeDisplayModePosition(this._position);
        }
    }
    /**
     * Sets the internal canvas height based on the selected display mode.
     */
    _setHeightByDisplayMode(parent) {
        if (this.displayMode === DisplayMode.Container) {
            this.resolution = {
                width: parent.clientWidth,
                height: parent.clientHeight
            };
            this.viewport = this.resolution;
        }
        if (this.displayMode === DisplayMode.FullScreen) {
            document.body.style.margin = '0px';
            document.body.style.overflow = 'hidden';
            this.resolution = {
                width: parent.innerWidth,
                height: parent.innerHeight
            };
            this.viewport = this.resolution;
        }
    }
    _initializeDisplayModePosition(position) {
        if (!position) {
            throw new Error('DisplayMode of Position was selected but no position option was given');
        }
        else {
            this.canvas.style.display = 'block';
            this.canvas.style.position = 'absolute';
            if (typeof position === 'string') {
                const specifiedPosition = position.split(' ');
                switch (specifiedPosition[0]) {
                    case 'top':
                        this.canvas.style.top = '0px';
                        break;
                    case 'bottom':
                        this.canvas.style.bottom = '0px';
                        break;
                    case 'middle':
                        this.canvas.style.top = '50%';
                        const offsetY = -this.halfDrawHeight;
                        this.canvas.style.marginTop = offsetY.toString();
                        break;
                    default:
                        throw new Error('Invalid Position Given');
                }
                if (specifiedPosition[1]) {
                    switch (specifiedPosition[1]) {
                        case 'left':
                            this.canvas.style.left = '0px';
                            break;
                        case 'right':
                            this.canvas.style.right = '0px';
                            break;
                        case 'center':
                            this.canvas.style.left = '50%';
                            const offsetX = -this.halfDrawWidth;
                            this.canvas.style.marginLeft = offsetX.toString();
                            break;
                        default:
                            throw new Error('Invalid Position Given');
                    }
                }
            }
            else {
                if (position.top) {
                    typeof position.top === 'number'
                        ? (this.canvas.style.top = position.top.toString() + 'px')
                        : (this.canvas.style.top = position.top);
                }
                if (position.right) {
                    typeof position.right === 'number'
                        ? (this.canvas.style.right = position.right.toString() + 'px')
                        : (this.canvas.style.right = position.right);
                }
                if (position.bottom) {
                    typeof position.bottom === 'number'
                        ? (this.canvas.style.bottom = position.bottom.toString() + 'px')
                        : (this.canvas.style.bottom = position.bottom);
                }
                if (position.left) {
                    typeof position.left === 'number'
                        ? (this.canvas.style.left = position.left.toString() + 'px')
                        : (this.canvas.style.left = position.left);
                }
            }
        }
    }
}
//# sourceMappingURL=Screen.js.map