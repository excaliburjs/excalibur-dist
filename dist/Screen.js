var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var Resolution = /** @class */ (function () {
    function Resolution() {
    }
    Object.defineProperty(Resolution, "SVGA", {
        get: function () {
            return { width: 800, height: 600 };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Resolution, "Standard", {
        get: function () {
            return { width: 1920, height: 1080 };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Resolution, "Atari2600", {
        get: function () {
            return { width: 160, height: 192 };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Resolution, "GameBoy", {
        get: function () {
            return { width: 160, height: 144 };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Resolution, "GameBoyAdvance", {
        get: function () {
            return { width: 240, height: 160 };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Resolution, "NintendoDS", {
        get: function () {
            return { width: 256, height: 192 };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Resolution, "NES", {
        get: function () {
            return { width: 256, height: 224 };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Resolution, "SNES", {
        get: function () {
            return { width: 256, height: 244 };
        },
        enumerable: false,
        configurable: true
    });
    return Resolution;
}());
export { Resolution };
/**
 * The Screen handles all aspects of interacting with the screen for Excalibur.
 *
 * [[include:Screen.md]]
 */
var Screen = /** @class */ (function () {
    function Screen(options) {
        var _this = this;
        var _a, _b, _c;
        this._antialiasing = true;
        this._resolutionStack = [];
        this._viewportStack = [];
        this._pixelRatio = null;
        this._isFullScreen = false;
        this._isDisposed = false;
        this._logger = Logger.getInstance();
        this._pixelRatioChangeHandler = function () {
            _this._logger.debug('Pixel Ratio Change', window.devicePixelRatio);
            _this.applyResolutionAndViewport();
        };
        this._windowResizeHandler = function () {
            var parent = (_this.displayMode === DisplayMode.Container ? (_this.canvas.parentElement || document.body) : window);
            _this._logger.debug('View port resized');
            _this._setHeightByDisplayMode(parent);
            _this._logger.info('parent.clientHeight ' + parent.clientHeight);
            _this.applyResolutionAndViewport();
        };
        this.viewport = options.viewport;
        this.resolution = (_a = options.resolution) !== null && _a !== void 0 ? _a : __assign({}, this.viewport);
        this._displayMode = (_b = options.displayMode) !== null && _b !== void 0 ? _b : DisplayMode.Fixed;
        this._canvas = options.canvas;
        this._ctx = options.context;
        this._antialiasing = (_c = options.antialiasing) !== null && _c !== void 0 ? _c : this._antialiasing;
        this._browser = options.browser;
        this._position = options.position;
        this._pixelRatio = options.pixelRatio;
        this._applyDisplayMode();
        this._mediaQueryList = this._browser.window.nativeComponent.matchMedia("(resolution: " + window.devicePixelRatio + "dppx)");
        this._mediaQueryList.addEventListener('change', this._pixelRatioChangeHandler);
    }
    Screen.prototype.dispose = function () {
        if (!this._isDisposed) {
            // Clean up handlers
            this._isDisposed = true;
            this._browser.window.off('resize', this._windowResizeHandler);
            this._mediaQueryList.removeEventListener('change', this._pixelRatioChangeHandler);
        }
    };
    Object.defineProperty(Screen.prototype, "pixelRatio", {
        get: function () {
            if (this._pixelRatio) {
                return this._pixelRatio;
            }
            if (window.devicePixelRatio < 1) {
                return 1;
            }
            var devicePixelRatio = window.devicePixelRatio || 1;
            return devicePixelRatio;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "isHiDpi", {
        get: function () {
            return this.pixelRatio !== 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "displayMode", {
        get: function () {
            return this._displayMode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "resolution", {
        get: function () {
            return this._resolution;
        },
        set: function (resolution) {
            this._resolution = resolution;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "viewport", {
        get: function () {
            if (this._viewport) {
                return this._viewport;
            }
            return this._resolution;
        },
        set: function (viewport) {
            this._viewport = viewport;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "scaledWidth", {
        get: function () {
            return this._resolution.width * this.pixelRatio;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "scaledHeight", {
        get: function () {
            return this._resolution.height * this.pixelRatio;
        },
        enumerable: false,
        configurable: true
    });
    Screen.prototype.setCurrentCamera = function (camera) {
        this._camera = camera;
    };
    Screen.prototype.pushResolutionAndViewport = function () {
        this._resolutionStack.push(this.resolution);
        this._viewportStack.push(this.viewport);
        this.resolution = __assign({}, this.resolution);
        this.viewport = __assign({}, this.viewport);
    };
    Screen.prototype.popResolutionAndViewport = function () {
        this.resolution = this._resolutionStack.pop();
        this.viewport = this._viewportStack.pop();
    };
    Screen.prototype.applyResolutionAndViewport = function () {
        this._canvas.width = this.scaledWidth;
        this._canvas.height = this.scaledHeight;
        this._canvas.style.imageRendering = this._antialiasing ? 'auto' : 'pixelated';
        this._canvas.style.width = this.viewport.width + 'px';
        this._canvas.style.height = this.viewport.height + 'px';
        // After messing with the canvas width/height the graphics context is invalidated and needs to have some properties reset
        this._ctx.resetTransform();
        this._ctx.scale(this.pixelRatio, this.pixelRatio);
        this._ctx.imageSmoothingEnabled = this._antialiasing;
    };
    Object.defineProperty(Screen.prototype, "antialiasing", {
        get: function () {
            return this._antialiasing;
        },
        set: function (isSmooth) {
            this._antialiasing = isSmooth;
            this._ctx.imageSmoothingEnabled = this._antialiasing;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "isFullScreen", {
        /**
         * Returns true if excalibur is fullscreened using the browser fullscreen api
         */
        get: function () {
            return this._isFullScreen;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Requests to go fullscreen using the browser fullscreen api
     */
    Screen.prototype.goFullScreen = function () {
        var _this = this;
        return this._canvas.requestFullscreen().then(function () {
            _this._isFullScreen = true;
        });
    };
    /**
     * Requests to exit fullscreen using the browser fullscreen api
     */
    Screen.prototype.exitFullScreen = function () {
        var _this = this;
        return document.exitFullscreen().then(function () {
            _this._isFullScreen = false;
        });
    };
    /**
     * Transforms the current x, y from screen coordinates to world coordinates
     * @param point  Screen coordinate to convert
     */
    Screen.prototype.screenToWorldCoordinates = function (point) {
        var _a, _b, _c, _d;
        var newX = point.x;
        var newY = point.y;
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
    };
    /**
     * Transforms a world coordinate, to a screen coordinate
     * @param point  World coordinate to convert
     */
    Screen.prototype.worldToScreenCoordinates = function (point) {
        var _a, _b, _c, _d;
        var screenX = point.x;
        var screenY = point.y;
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
    };
    /**
     * Returns a BoundingBox of the top left corner of the screen
     * and the bottom right corner of the screen.
     */
    Screen.prototype.getWorldBounds = function () {
        var left = this.screenToWorldCoordinates(Vector.Zero).x;
        var top = this.screenToWorldCoordinates(Vector.Zero).y;
        var right = left + this.drawWidth;
        var bottom = top + this.drawHeight;
        return new BoundingBox(left, top, right, bottom);
    };
    Object.defineProperty(Screen.prototype, "canvasWidth", {
        /**
         * The width of the game canvas in pixels (physical width component of the
         * resolution of the canvas element)
         */
        get: function () {
            return this.canvas.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "halfCanvasWidth", {
        /**
         * Returns half width of the game canvas in pixels (half physical width component)
         */
        get: function () {
            return this.canvas.width / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "canvasHeight", {
        /**
         * The height of the game canvas in pixels, (physical height component of
         * the resolution of the canvas element)
         */
        get: function () {
            return this.canvas.height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "halfCanvasHeight", {
        /**
         * Returns half height of the game canvas in pixels (half physical height component)
         */
        get: function () {
            return this.canvas.height / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "drawWidth", {
        /**
         * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
         */
        get: function () {
            if (this._camera) {
                return this.scaledWidth / this._camera.z / this.pixelRatio;
            }
            return this.scaledWidth / this.pixelRatio;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "halfDrawWidth", {
        /**
         * Returns half the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
         */
        get: function () {
            return this.drawWidth / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "drawHeight", {
        /**
         * Returns the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
         */
        get: function () {
            if (this._camera) {
                return this.scaledHeight / this._camera.z / this.pixelRatio;
            }
            return this.scaledHeight / this.pixelRatio;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "halfDrawHeight", {
        /**
         * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
         */
        get: function () {
            return this.drawHeight / 2;
        },
        enumerable: false,
        configurable: true
    });
    Screen.prototype._applyDisplayMode = function () {
        if (this.displayMode === DisplayMode.FullScreen || this.displayMode === DisplayMode.Container) {
            var parent_1 = (this.displayMode === DisplayMode.Container ? (this.canvas.parentElement || document.body) : window);
            this._setHeightByDisplayMode(parent_1);
            this._browser.window.on('resize', this._windowResizeHandler);
        }
        else if (this.displayMode === DisplayMode.Position) {
            this._initializeDisplayModePosition(this._position);
        }
    };
    /**
     * Sets the internal canvas height based on the selected display mode.
     */
    Screen.prototype._setHeightByDisplayMode = function (parent) {
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
    };
    Screen.prototype._initializeDisplayModePosition = function (position) {
        if (!position) {
            throw new Error('DisplayMode of Position was selected but no position option was given');
        }
        else {
            this.canvas.style.display = 'block';
            this.canvas.style.position = 'absolute';
            if (typeof position === 'string') {
                var specifiedPosition = position.split(' ');
                switch (specifiedPosition[0]) {
                    case 'top':
                        this.canvas.style.top = '0px';
                        break;
                    case 'bottom':
                        this.canvas.style.bottom = '0px';
                        break;
                    case 'middle':
                        this.canvas.style.top = '50%';
                        var offsetY = -this.halfDrawHeight;
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
                            var offsetX = -this.halfDrawWidth;
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
    };
    return Screen;
}());
export { Screen };
//# sourceMappingURL=Screen.js.map