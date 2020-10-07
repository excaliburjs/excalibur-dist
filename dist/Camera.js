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
import { EasingFunctions } from './Util/EasingFunctions';
import { Promise, PromiseState } from './Promises';
import { Vector } from './Algebra';
import { removeItemFromArray } from './Util/Util';
import { PreUpdateEvent, PostUpdateEvent, InitializeEvent } from './Events';
import { Class } from './Class';
import { BoundingBox } from './Collision/BoundingBox';
import { Logger } from './Util/Log';
/**
 * Container to house convenience strategy methods
 * @internal
 */
var StrategyContainer = /** @class */ (function () {
    function StrategyContainer(camera) {
        this.camera = camera;
    }
    /**
     * Creates and adds the [[LockCameraToActorStrategy]] on the current camera.
     * @param actor The actor to lock the camera to
     */
    StrategyContainer.prototype.lockToActor = function (actor) {
        this.camera.addStrategy(new LockCameraToActorStrategy(actor));
    };
    /**
     * Creates and adds the [[LockCameraToActorAxisStrategy]] on the current camera
     * @param actor The actor to lock the camera to
     * @param axis The axis to follow the actor on
     */
    StrategyContainer.prototype.lockToActorAxis = function (actor, axis) {
        this.camera.addStrategy(new LockCameraToActorAxisStrategy(actor, axis));
    };
    /**
     * Creates and adds the [[ElasticToActorStrategy]] on the current camera
     * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
     * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
     * correct and bounce around the target
     *
     * @param actor Target actor to elastically follow
     * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
     * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
     */
    StrategyContainer.prototype.elasticToActor = function (actor, cameraElasticity, cameraFriction) {
        this.camera.addStrategy(new ElasticToActorStrategy(actor, cameraElasticity, cameraFriction));
    };
    /**
     * Creates and adds the [[RadiusAroundActorStrategy]] on the current camera
     * @param actor Target actor to follow when it is "radius" pixels away
     * @param radius Number of pixels away before the camera will follow
     */
    StrategyContainer.prototype.radiusAroundActor = function (actor, radius) {
        this.camera.addStrategy(new RadiusAroundActorStrategy(actor, radius));
    };
    /**
     * Creates and adds the [[LimitCameraBoundsStrategy]] on the current camera
     * @param box The bounding box to limit the camera to.
     */
    StrategyContainer.prototype.limitCameraBounds = function (box) {
        this.camera.addStrategy(new LimitCameraBoundsStrategy(box));
    };
    return StrategyContainer;
}());
export { StrategyContainer };
/**
 * Camera axis enum
 */
export var Axis;
(function (Axis) {
    Axis[Axis["X"] = 0] = "X";
    Axis[Axis["Y"] = 1] = "Y";
})(Axis || (Axis = {}));
/**
 * Lock a camera to the exact x/y position of an actor.
 */
var LockCameraToActorStrategy = /** @class */ (function () {
    function LockCameraToActorStrategy(target) {
        this.target = target;
        this.action = function (target, _cam, _eng, _delta) {
            var center = target.center;
            return center;
        };
    }
    return LockCameraToActorStrategy;
}());
export { LockCameraToActorStrategy };
/**
 * Lock a camera to a specific axis around an actor.
 */
var LockCameraToActorAxisStrategy = /** @class */ (function () {
    function LockCameraToActorAxisStrategy(target, axis) {
        var _this = this;
        this.target = target;
        this.axis = axis;
        this.action = function (target, cam, _eng, _delta) {
            var center = target.center;
            var currentFocus = cam.getFocus();
            if (_this.axis === Axis.X) {
                return new Vector(center.x, currentFocus.y);
            }
            else {
                return new Vector(currentFocus.x, center.y);
            }
        };
    }
    return LockCameraToActorAxisStrategy;
}());
export { LockCameraToActorAxisStrategy };
/**
 * Using [Hook's law](https://en.wikipedia.org/wiki/Hooke's_law), elastically move the camera towards the target actor.
 */
var ElasticToActorStrategy = /** @class */ (function () {
    /**
     * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
     * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
     * correct and bounce around the target
     *
     * @param target Target actor to elastically follow
     * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
     * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
     */
    function ElasticToActorStrategy(target, cameraElasticity, cameraFriction) {
        var _this = this;
        this.target = target;
        this.cameraElasticity = cameraElasticity;
        this.cameraFriction = cameraFriction;
        this.action = function (target, cam, _eng, _delta) {
            var position = target.center;
            var focus = cam.getFocus();
            var cameraVel = cam.vel.clone();
            // Calculate the stretch vector, using the spring equation
            // F = kX
            // https://en.wikipedia.org/wiki/Hooke's_law
            // Apply to the current camera velocity
            var stretch = position.sub(focus).scale(_this.cameraElasticity); // stretch is X
            cameraVel = cameraVel.add(stretch);
            // Calculate the friction (-1 to apply a force in the opposition of motion)
            // Apply to the current camera velocity
            var friction = cameraVel.scale(-1).scale(_this.cameraFriction);
            cameraVel = cameraVel.add(friction);
            // Update position by velocity deltas
            focus = focus.add(cameraVel);
            return focus;
        };
    }
    return ElasticToActorStrategy;
}());
export { ElasticToActorStrategy };
var RadiusAroundActorStrategy = /** @class */ (function () {
    /**
     *
     * @param target Target actor to follow when it is "radius" pixels away
     * @param radius Number of pixels away before the camera will follow
     */
    function RadiusAroundActorStrategy(target, radius) {
        var _this = this;
        this.target = target;
        this.radius = radius;
        this.action = function (target, cam, _eng, _delta) {
            var position = target.center;
            var focus = cam.getFocus();
            var direction = position.sub(focus);
            var distance = direction.size;
            if (distance >= _this.radius) {
                var offset = distance - _this.radius;
                return focus.add(direction.normalize().scale(offset));
            }
            return focus;
        };
    }
    return RadiusAroundActorStrategy;
}());
export { RadiusAroundActorStrategy };
/**
 * Prevent a camera from going beyond the given camera dimensions.
 */
var LimitCameraBoundsStrategy = /** @class */ (function () {
    function LimitCameraBoundsStrategy(target) {
        var _this = this;
        this.target = target;
        /**
         * Useful for limiting the camera to a [[TileMap]]'s dimensions, or a specific area inside the map.
         *
         * Note that this strategy does not perform any movement by itself.
         * It only sets the camera position to within the given bounds when the camera has gone beyond them.
         * Thus, it is a good idea to combine it with other camera strategies and set this strategy as the last one.
         *
         * Make sure that the camera bounds are at least as large as the viewport size.
         *
         * @param target The bounding box to limit the camera to
         */
        this.boundSizeChecked = false; // Check and warn only once
        this.action = function (target, cam, _eng, _delta) {
            var focus = cam.getFocus();
            if (!_this.boundSizeChecked) {
                if (target.bottom - target.top < _eng.drawHeight || target.right - target.left < _eng.drawWidth) {
                    Logger.getInstance().warn('Camera bounds should not be smaller than the engine viewport');
                }
                _this.boundSizeChecked = true;
            }
            if (focus.x < target.left + _eng.halfDrawWidth) {
                focus.x = target.left + _eng.halfDrawWidth;
            }
            else if (focus.x > target.right - _eng.halfDrawWidth) {
                focus.x = target.right - _eng.halfDrawWidth;
            }
            if (focus.y < target.top + _eng.halfDrawHeight) {
                focus.y = target.top + _eng.halfDrawHeight;
            }
            else if (focus.y > target.bottom - _eng.halfDrawHeight) {
                focus.y = target.bottom - _eng.halfDrawHeight;
            }
            return focus;
        };
    }
    return LimitCameraBoundsStrategy;
}());
export { LimitCameraBoundsStrategy };
/**
 * Cameras
 *
 * [[Camera]] is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 */
var Camera = /** @class */ (function (_super) {
    __extends(Camera, _super);
    function Camera() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._cameraStrategies = [];
        _this.strategy = new StrategyContainer(_this);
        /**
         * Get or set current zoom of the camera, defaults to 1
         */
        _this.z = 1;
        /**
         * Get or set rate of change in zoom, defaults to 0
         */
        _this.dz = 0;
        /**
         * Get or set zoom acceleration
         */
        _this.az = 0;
        /**
         * Current rotation of the camera
         */
        _this.rotation = 0;
        /**
         * Current angular velocity
         */
        _this.rx = 0;
        /**
         * Get or set the camera's position
         */
        _this.pos = Vector.Zero;
        /**
         * Get or set the camera's velocity
         */
        _this.vel = Vector.Zero;
        /**
         * GEt or set the camera's acceleration
         */
        _this.acc = Vector.Zero;
        _this._cameraMoving = false;
        _this._currentLerpTime = 0;
        _this._lerpDuration = 1000; // 1 second
        _this._lerpStart = null;
        _this._lerpEnd = null;
        //camera effects
        _this._isShaking = false;
        _this._shakeMagnitudeX = 0;
        _this._shakeMagnitudeY = 0;
        _this._shakeDuration = 0;
        _this._elapsedShakeTime = 0;
        _this._xShake = 0;
        _this._yShake = 0;
        _this._isZooming = false;
        _this._zoomStart = 1;
        _this._zoomEnd = 1;
        _this._currentZoomTime = 0;
        _this._zoomDuration = 0;
        _this._zoomEasing = EasingFunctions.EaseInOutCubic;
        _this._easing = EasingFunctions.EaseInOutCubic;
        _this._isInitialized = false;
        return _this;
    }
    Object.defineProperty(Camera.prototype, "angularVelocity", {
        /**
         * Get or set the camera's angular velocity
         */
        get: function () {
            return this.rx;
        },
        set: function (value) {
            this.rx = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "x", {
        /**
         * Get the camera's x position
         */
        get: function () {
            return this.pos.x;
        },
        /**
         * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
         */
        set: function (value) {
            if (!this._follow && !this._cameraMoving) {
                this.pos.x = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "y", {
        /**
         * Get the camera's y position
         */
        get: function () {
            return this.pos.y;
        },
        /**
         * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
         */
        set: function (value) {
            if (!this._follow && !this._cameraMoving) {
                this.pos.y = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "dx", {
        /**
         * Get or set the camera's x velocity
         */
        get: function () {
            return this.vel.x;
        },
        set: function (value) {
            this.vel.x = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "dy", {
        /**
         * Get or set the camera's y velocity
         */
        get: function () {
            return this.vel.y;
        },
        set: function (value) {
            this.vel.y = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "ax", {
        /**
         * Get or set the camera's x acceleration
         */
        get: function () {
            return this.acc.x;
        },
        set: function (value) {
            this.acc.x = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "ay", {
        /**
         * Get or set the camera's y acceleration
         */
        get: function () {
            return this.acc.y;
        },
        set: function (value) {
            this.acc.y = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the focal point of the camera, a new point giving the x and y position of the camera
     */
    Camera.prototype.getFocus = function () {
        return this.pos;
    };
    /**
     * This moves the camera focal point to the specified position using specified easing function. Cannot move when following an Actor.
     *
     * @param pos The target position to move to
     * @param duration The duration in milliseconds the move should last
     * @param [easingFn] An optional easing function ([[ex.EasingFunctions.EaseInOutCubic]] by default)
     * @returns A [[Promise]] that resolves when movement is finished, including if it's interrupted.
     *          The [[Promise]] value is the [[Vector]] of the target position. It will be rejected if a move cannot be made.
     */
    Camera.prototype.move = function (pos, duration, easingFn) {
        if (easingFn === void 0) { easingFn = EasingFunctions.EaseInOutCubic; }
        if (typeof easingFn !== 'function') {
            throw 'Please specify an EasingFunction';
        }
        // cannot move when following an actor
        if (this._follow) {
            return new Promise().reject(pos);
        }
        // resolve existing promise, if any
        if (this._lerpPromise && this._lerpPromise.state() === PromiseState.Pending) {
            this._lerpPromise.resolve(pos);
        }
        this._lerpPromise = new Promise();
        this._lerpStart = this.getFocus().clone();
        this._lerpDuration = duration;
        this._lerpEnd = pos;
        this._currentLerpTime = 0;
        this._cameraMoving = true;
        this._easing = easingFn;
        return this._lerpPromise;
    };
    /**
     * Sets the camera to shake at the specified magnitudes for the specified duration
     * @param magnitudeX  The x magnitude of the shake
     * @param magnitudeY  The y magnitude of the shake
     * @param duration    The duration of the shake in milliseconds
     */
    Camera.prototype.shake = function (magnitudeX, magnitudeY, duration) {
        this._isShaking = true;
        this._shakeMagnitudeX = magnitudeX;
        this._shakeMagnitudeY = magnitudeY;
        this._shakeDuration = duration;
    };
    /**
     * Zooms the camera in or out by the specified scale over the specified duration.
     * If no duration is specified, it take effect immediately.
     * @param scale    The scale of the zoom
     * @param duration The duration of the zoom in milliseconds
     */
    Camera.prototype.zoom = function (scale, duration, easingFn) {
        if (duration === void 0) { duration = 0; }
        if (easingFn === void 0) { easingFn = EasingFunctions.EaseInOutCubic; }
        this._zoomPromise = new Promise();
        if (duration) {
            this._isZooming = true;
            this._zoomEasing = easingFn;
            this._currentZoomTime = 0;
            this._zoomDuration = duration;
            this._zoomStart = this.z;
            this._zoomEnd = scale;
        }
        else {
            this._isZooming = false;
            this.z = scale;
            this._zoomPromise.resolve(true);
        }
        return this._zoomPromise;
    };
    /**
     * Gets the current zoom scale
     */
    Camera.prototype.getZoom = function () {
        return this.z;
    };
    Object.defineProperty(Camera.prototype, "viewport", {
        /**
         * Gets the bounding box of the viewport of this camera in world coordinates
         */
        get: function () {
            if (this._engine) {
                var halfWidth = this._engine.halfDrawWidth;
                var halfHeight = this._engine.halfDrawHeight;
                return new BoundingBox(this.x - halfWidth, this.y - halfHeight, this.x + halfWidth, this.y + halfHeight);
            }
            return new BoundingBox(0, 0, 0, 0);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Adds a new camera strategy to this camera
     * @param cameraStrategy Instance of an [[CameraStrategy]]
     */
    Camera.prototype.addStrategy = function (cameraStrategy) {
        this._cameraStrategies.push(cameraStrategy);
    };
    /**
     * Removes a camera strategy by reference
     * @param cameraStrategy Instance of an [[CameraStrategy]]
     */
    Camera.prototype.removeStrategy = function (cameraStrategy) {
        removeItemFromArray(cameraStrategy, this._cameraStrategies);
    };
    /**
     * Clears all camera strategies from the camera
     */
    Camera.prototype.clearAllStrategies = function () {
        this._cameraStrategies.length = 0;
    };
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    Camera.prototype._preupdate = function (engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    };
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before a scene is updated.
     */
    Camera.prototype.onPreUpdate = function (_engine, _delta) {
        // Overridable
    };
    /**
     *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    Camera.prototype._postupdate = function (engine, delta) {
        this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
        this.onPostUpdate(engine, delta);
    };
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     */
    Camera.prototype.onPostUpdate = function (_engine, _delta) {
        // Overridable
    };
    Object.defineProperty(Camera.prototype, "isInitialized", {
        get: function () {
            return this._isInitialized;
        },
        enumerable: false,
        configurable: true
    });
    Camera.prototype._initialize = function (_engine) {
        if (!this.isInitialized) {
            this.onInitialize(_engine);
            _super.prototype.emit.call(this, 'initialize', new InitializeEvent(_engine, this));
            this._isInitialized = true;
            this._engine = _engine;
        }
    };
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     */
    Camera.prototype.onInitialize = function (_engine) {
        // Overridable
    };
    Camera.prototype.on = function (eventName, handler) {
        _super.prototype.on.call(this, eventName, handler);
    };
    Camera.prototype.off = function (eventName, handler) {
        _super.prototype.off.call(this, eventName, handler);
    };
    Camera.prototype.once = function (eventName, handler) {
        _super.prototype.once.call(this, eventName, handler);
    };
    Camera.prototype.update = function (_engine, delta) {
        this._initialize(_engine);
        this._preupdate(_engine, delta);
        // Update placements based on linear algebra
        this.pos = this.pos.add(this.vel.scale(delta / 1000));
        this.z += (this.dz * delta) / 1000;
        this.vel = this.vel.add(this.acc.scale(delta / 1000));
        this.dz += (this.az * delta) / 1000;
        this.rotation += (this.angularVelocity * delta) / 1000;
        if (this._isZooming) {
            if (this._currentZoomTime < this._zoomDuration) {
                var zoomEasing = this._zoomEasing;
                var newZoom = zoomEasing(this._currentZoomTime, this._zoomStart, this._zoomEnd, this._zoomDuration);
                this.z = newZoom;
                this._currentZoomTime += delta;
            }
            else {
                this._isZooming = false;
                this.z = this._zoomEnd;
                this._currentZoomTime = 0;
                this._zoomPromise.resolve(true);
            }
        }
        if (this._cameraMoving) {
            if (this._currentLerpTime < this._lerpDuration) {
                var moveEasing = EasingFunctions.CreateVectorEasingFunction(this._easing);
                var lerpPoint = moveEasing(this._currentLerpTime, this._lerpStart, this._lerpEnd, this._lerpDuration);
                this.pos = lerpPoint;
                this._currentLerpTime += delta;
            }
            else {
                this.pos = this._lerpEnd;
                var end = this._lerpEnd.clone();
                this._lerpStart = null;
                this._lerpEnd = null;
                this._currentLerpTime = 0;
                this._cameraMoving = false;
                // Order matters here, resolve should be last so any chain promises have a clean slate
                this._lerpPromise.resolve(end);
            }
        }
        if (this._isDoneShaking()) {
            this._isShaking = false;
            this._elapsedShakeTime = 0;
            this._shakeMagnitudeX = 0;
            this._shakeMagnitudeY = 0;
            this._shakeDuration = 0;
            this._xShake = 0;
            this._yShake = 0;
        }
        else {
            this._elapsedShakeTime += delta;
            this._xShake = ((Math.random() * this._shakeMagnitudeX) | 0) + 1;
            this._yShake = ((Math.random() * this._shakeMagnitudeY) | 0) + 1;
        }
        for (var _i = 0, _a = this._cameraStrategies; _i < _a.length; _i++) {
            var s = _a[_i];
            this.pos = s.action.call(s, s.target, this, _engine, delta);
        }
        this._postupdate(_engine, delta);
    };
    /**
     * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
     * @param ctx    Canvas context to apply transformations
     */
    Camera.prototype.draw = function (ctx) {
        var focus = this.getFocus();
        var canvasWidth = ctx.canvas.width;
        var canvasHeight = ctx.canvas.height;
        var pixelRatio = this._engine ? this._engine.pixelRatio : window.devicePixelRatio;
        var zoom = this.getZoom();
        var newCanvasWidth = canvasWidth / zoom / pixelRatio;
        var newCanvasHeight = canvasHeight / zoom / pixelRatio;
        ctx.scale(zoom, zoom);
        ctx.translate(-focus.x + newCanvasWidth / 2 + this._xShake, -focus.y + newCanvasHeight / 2 + this._yShake);
    };
    Camera.prototype.debugDraw = function (ctx) {
        var focus = this.getFocus();
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(focus.x, focus.y, 15, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(focus.x, focus.y, 5, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.viewport.left, this.viewport.top, this.viewport.width, this.viewport.height);
        ctx.closePath();
    };
    Camera.prototype._isDoneShaking = function () {
        return !this._isShaking || this._elapsedShakeTime >= this._shakeDuration;
    };
    return Camera;
}(Class));
export { Camera };
//# sourceMappingURL=Camera.js.map