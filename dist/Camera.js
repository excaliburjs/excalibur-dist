import { EasingFunctions } from './Util/EasingFunctions';
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
export class StrategyContainer {
    constructor(camera) {
        this.camera = camera;
    }
    /**
     * Creates and adds the [[LockCameraToActorStrategy]] on the current camera.
     * @param actor The actor to lock the camera to
     */
    lockToActor(actor) {
        this.camera.addStrategy(new LockCameraToActorStrategy(actor));
    }
    /**
     * Creates and adds the [[LockCameraToActorAxisStrategy]] on the current camera
     * @param actor The actor to lock the camera to
     * @param axis The axis to follow the actor on
     */
    lockToActorAxis(actor, axis) {
        this.camera.addStrategy(new LockCameraToActorAxisStrategy(actor, axis));
    }
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
    elasticToActor(actor, cameraElasticity, cameraFriction) {
        this.camera.addStrategy(new ElasticToActorStrategy(actor, cameraElasticity, cameraFriction));
    }
    /**
     * Creates and adds the [[RadiusAroundActorStrategy]] on the current camera
     * @param actor Target actor to follow when it is "radius" pixels away
     * @param radius Number of pixels away before the camera will follow
     */
    radiusAroundActor(actor, radius) {
        this.camera.addStrategy(new RadiusAroundActorStrategy(actor, radius));
    }
    /**
     * Creates and adds the [[LimitCameraBoundsStrategy]] on the current camera
     * @param box The bounding box to limit the camera to.
     */
    limitCameraBounds(box) {
        this.camera.addStrategy(new LimitCameraBoundsStrategy(box));
    }
}
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
export class LockCameraToActorStrategy {
    constructor(target) {
        this.target = target;
        this.action = (target, _cam, _eng, _delta) => {
            const center = target.center;
            return center;
        };
    }
}
/**
 * Lock a camera to a specific axis around an actor.
 */
export class LockCameraToActorAxisStrategy {
    constructor(target, axis) {
        this.target = target;
        this.axis = axis;
        this.action = (target, cam, _eng, _delta) => {
            const center = target.center;
            const currentFocus = cam.getFocus();
            if (this.axis === Axis.X) {
                return new Vector(center.x, currentFocus.y);
            }
            else {
                return new Vector(currentFocus.x, center.y);
            }
        };
    }
}
/**
 * Using [Hook's law](https://en.wikipedia.org/wiki/Hooke's_law), elastically move the camera towards the target actor.
 */
export class ElasticToActorStrategy {
    /**
     * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
     * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
     * correct and bounce around the target
     *
     * @param target Target actor to elastically follow
     * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
     * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
     */
    constructor(target, cameraElasticity, cameraFriction) {
        this.target = target;
        this.cameraElasticity = cameraElasticity;
        this.cameraFriction = cameraFriction;
        this.action = (target, cam, _eng, _delta) => {
            const position = target.center;
            let focus = cam.getFocus();
            let cameraVel = cam.vel.clone();
            // Calculate the stretch vector, using the spring equation
            // F = kX
            // https://en.wikipedia.org/wiki/Hooke's_law
            // Apply to the current camera velocity
            const stretch = position.sub(focus).scale(this.cameraElasticity); // stretch is X
            cameraVel = cameraVel.add(stretch);
            // Calculate the friction (-1 to apply a force in the opposition of motion)
            // Apply to the current camera velocity
            const friction = cameraVel.scale(-1).scale(this.cameraFriction);
            cameraVel = cameraVel.add(friction);
            // Update position by velocity deltas
            focus = focus.add(cameraVel);
            return focus;
        };
    }
}
export class RadiusAroundActorStrategy {
    /**
     *
     * @param target Target actor to follow when it is "radius" pixels away
     * @param radius Number of pixels away before the camera will follow
     */
    constructor(target, radius) {
        this.target = target;
        this.radius = radius;
        this.action = (target, cam, _eng, _delta) => {
            const position = target.center;
            const focus = cam.getFocus();
            const direction = position.sub(focus);
            const distance = direction.size;
            if (distance >= this.radius) {
                const offset = distance - this.radius;
                return focus.add(direction.normalize().scale(offset));
            }
            return focus;
        };
    }
}
/**
 * Prevent a camera from going beyond the given camera dimensions.
 */
export class LimitCameraBoundsStrategy {
    constructor(target) {
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
        this.action = (target, cam, _eng, _delta) => {
            const focus = cam.getFocus();
            if (!this.boundSizeChecked) {
                if (target.bottom - target.top < _eng.drawHeight || target.right - target.left < _eng.drawWidth) {
                    Logger.getInstance().warn('Camera bounds should not be smaller than the engine viewport');
                }
                this.boundSizeChecked = true;
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
}
/**
 * Cameras
 *
 * [[Camera]] is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 */
export class Camera extends Class {
    constructor() {
        super(...arguments);
        this._cameraStrategies = [];
        this.strategy = new StrategyContainer(this);
        /**
         * Get or set current zoom of the camera, defaults to 1
         */
        this.z = 1;
        /**
         * Get or set rate of change in zoom, defaults to 0
         */
        this.dz = 0;
        /**
         * Get or set zoom acceleration
         */
        this.az = 0;
        /**
         * Current rotation of the camera
         */
        this.rotation = 0;
        /**
         * Current angular velocity
         */
        this.rx = 0;
        /**
         * Get or set the camera's position
         */
        this.pos = Vector.Zero;
        /**
         * Get or set the camera's velocity
         */
        this.vel = Vector.Zero;
        /**
         * GEt or set the camera's acceleration
         */
        this.acc = Vector.Zero;
        this._cameraMoving = false;
        this._currentLerpTime = 0;
        this._lerpDuration = 1000; // 1 second
        this._lerpStart = null;
        this._lerpEnd = null;
        //camera effects
        this._isShaking = false;
        this._shakeMagnitudeX = 0;
        this._shakeMagnitudeY = 0;
        this._shakeDuration = 0;
        this._elapsedShakeTime = 0;
        this._xShake = 0;
        this._yShake = 0;
        this._isZooming = false;
        this._zoomStart = 1;
        this._zoomEnd = 1;
        this._currentZoomTime = 0;
        this._zoomDuration = 0;
        this._zoomEasing = EasingFunctions.EaseInOutCubic;
        this._easing = EasingFunctions.EaseInOutCubic;
        this._isInitialized = false;
    }
    /**
     * Get or set the camera's angular velocity
     */
    get angularVelocity() {
        return this.rx;
    }
    set angularVelocity(value) {
        this.rx = value;
    }
    /**
     * Get the camera's x position
     */
    get x() {
        return this.pos.x;
    }
    /**
     * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
     */
    set x(value) {
        if (!this._follow && !this._cameraMoving) {
            this.pos.x = value;
        }
    }
    /**
     * Get the camera's y position
     */
    get y() {
        return this.pos.y;
    }
    /**
     * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
     */
    set y(value) {
        if (!this._follow && !this._cameraMoving) {
            this.pos.y = value;
        }
    }
    /**
     * Get or set the camera's x velocity
     */
    get dx() {
        return this.vel.x;
    }
    set dx(value) {
        this.vel.x = value;
    }
    /**
     * Get or set the camera's y velocity
     */
    get dy() {
        return this.vel.y;
    }
    set dy(value) {
        this.vel.y = value;
    }
    /**
     * Get or set the camera's x acceleration
     */
    get ax() {
        return this.acc.x;
    }
    set ax(value) {
        this.acc.x = value;
    }
    /**
     * Get or set the camera's y acceleration
     */
    get ay() {
        return this.acc.y;
    }
    set ay(value) {
        this.acc.y = value;
    }
    /**
     * Returns the focal point of the camera, a new point giving the x and y position of the camera
     */
    getFocus() {
        return this.pos;
    }
    /**
     * This moves the camera focal point to the specified position using specified easing function. Cannot move when following an Actor.
     *
     * @param pos The target position to move to
     * @param duration The duration in milliseconds the move should last
     * @param [easingFn] An optional easing function ([[ex.EasingFunctions.EaseInOutCubic]] by default)
     * @returns A [[Promise]] that resolves when movement is finished, including if it's interrupted.
     *          The [[Promise]] value is the [[Vector]] of the target position. It will be rejected if a move cannot be made.
     */
    move(pos, duration, easingFn = EasingFunctions.EaseInOutCubic) {
        if (typeof easingFn !== 'function') {
            throw 'Please specify an EasingFunction';
        }
        // cannot move when following an actor
        if (this._follow) {
            return Promise.reject(pos);
        }
        // resolve existing promise, if any
        if (this._lerpPromise && this._lerpResolve) {
            this._lerpResolve(pos);
        }
        this._lerpPromise = new Promise((resolve) => {
            this._lerpResolve = resolve;
        });
        this._lerpStart = this.getFocus().clone();
        this._lerpDuration = duration;
        this._lerpEnd = pos;
        this._currentLerpTime = 0;
        this._cameraMoving = true;
        this._easing = easingFn;
        return this._lerpPromise;
    }
    /**
     * Sets the camera to shake at the specified magnitudes for the specified duration
     * @param magnitudeX  The x magnitude of the shake
     * @param magnitudeY  The y magnitude of the shake
     * @param duration    The duration of the shake in milliseconds
     */
    shake(magnitudeX, magnitudeY, duration) {
        this._isShaking = true;
        this._shakeMagnitudeX = magnitudeX;
        this._shakeMagnitudeY = magnitudeY;
        this._shakeDuration = duration;
    }
    /**
     * Zooms the camera in or out by the specified scale over the specified duration.
     * If no duration is specified, it take effect immediately.
     * @param scale    The scale of the zoom
     * @param duration The duration of the zoom in milliseconds
     */
    zoom(scale, duration = 0, easingFn = EasingFunctions.EaseInOutCubic) {
        this._zoomPromise = new Promise((resolve) => {
            this._zoomResolve = resolve;
        });
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
            return Promise.resolve(true);
        }
        return this._zoomPromise;
    }
    /**
     * Gets the current zoom scale
     */
    getZoom() {
        return this.z;
    }
    /**
     * Gets the bounding box of the viewport of this camera in world coordinates
     */
    get viewport() {
        if (this._engine) {
            const halfWidth = this._engine.halfDrawWidth;
            const halfHeight = this._engine.halfDrawHeight;
            return new BoundingBox(this.x - halfWidth, this.y - halfHeight, this.x + halfWidth, this.y + halfHeight);
        }
        return new BoundingBox(0, 0, 0, 0);
    }
    /**
     * Adds a new camera strategy to this camera
     * @param cameraStrategy Instance of an [[CameraStrategy]]
     */
    addStrategy(cameraStrategy) {
        this._cameraStrategies.push(cameraStrategy);
    }
    /**
     * Removes a camera strategy by reference
     * @param cameraStrategy Instance of an [[CameraStrategy]]
     */
    removeStrategy(cameraStrategy) {
        removeItemFromArray(cameraStrategy, this._cameraStrategies);
    }
    /**
     * Clears all camera strategies from the camera
     */
    clearAllStrategies() {
        this._cameraStrategies.length = 0;
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    _preupdate(engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    }
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before a scene is updated.
     */
    onPreUpdate(_engine, _delta) {
        // Overridable
    }
    /**
     *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    _postupdate(engine, delta) {
        this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
        this.onPostUpdate(engine, delta);
    }
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     */
    onPostUpdate(_engine, _delta) {
        // Overridable
    }
    get isInitialized() {
        return this._isInitialized;
    }
    _initialize(_engine) {
        if (!this.isInitialized) {
            this.onInitialize(_engine);
            super.emit('initialize', new InitializeEvent(_engine, this));
            this._isInitialized = true;
            this._engine = _engine;
        }
    }
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     */
    onInitialize(_engine) {
        // Overridable
    }
    on(eventName, handler) {
        super.on(eventName, handler);
    }
    off(eventName, handler) {
        super.off(eventName, handler);
    }
    once(eventName, handler) {
        super.once(eventName, handler);
    }
    update(_engine, delta) {
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
                const zoomEasing = this._zoomEasing;
                const newZoom = zoomEasing(this._currentZoomTime, this._zoomStart, this._zoomEnd, this._zoomDuration);
                this.z = newZoom;
                this._currentZoomTime += delta;
            }
            else {
                this._isZooming = false;
                this.z = this._zoomEnd;
                this._currentZoomTime = 0;
                this._zoomResolve(true);
            }
        }
        if (this._cameraMoving) {
            if (this._currentLerpTime < this._lerpDuration) {
                const moveEasing = EasingFunctions.CreateVectorEasingFunction(this._easing);
                const lerpPoint = moveEasing(this._currentLerpTime, this._lerpStart, this._lerpEnd, this._lerpDuration);
                this.pos = lerpPoint;
                this._currentLerpTime += delta;
            }
            else {
                this.pos = this._lerpEnd;
                const end = this._lerpEnd.clone();
                this._lerpStart = null;
                this._lerpEnd = null;
                this._currentLerpTime = 0;
                this._cameraMoving = false;
                // Order matters here, resolve should be last so any chain promises have a clean slate
                this._lerpResolve(end);
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
        for (const s of this._cameraStrategies) {
            this.pos = s.action.call(s, s.target, this, _engine, delta);
        }
        this._postupdate(_engine, delta);
    }
    /**
     * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
     * @param ctx    Canvas context to apply transformations
     */
    draw(ctx) {
        const focus = this.getFocus();
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const pixelRatio = this._engine ? this._engine.pixelRatio : window.devicePixelRatio;
        const zoom = this.getZoom();
        const newCanvasWidth = canvasWidth / zoom / pixelRatio;
        const newCanvasHeight = canvasHeight / zoom / pixelRatio;
        ctx.scale(zoom, zoom);
        ctx.translate(-focus.x + newCanvasWidth / 2 + this._xShake, -focus.y + newCanvasHeight / 2 + this._yShake);
    }
    /* istanbul ignore next */
    debugDraw(ctx) {
        const focus = this.getFocus();
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
    }
    _isDoneShaking() {
        return !this._isShaking || this._elapsedShakeTime >= this._shakeDuration;
    }
}
//# sourceMappingURL=Camera.js.map