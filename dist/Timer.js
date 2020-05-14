/**
 * The Excalibur timer hooks into the internal timer and fires callbacks,
 * after a certain interval, optionally repeating.
 */
var Timer = /** @class */ (function () {
    function Timer(fcn, interval, repeats, numberOfRepeats) {
        this.id = 0;
        this.interval = 10;
        this.repeats = false;
        this.maxNumberOfRepeats = -1;
        this._elapsedTime = 0;
        this._totalTimeAlive = 0;
        this._paused = false;
        this._numberOfTicks = 0;
        this.complete = false;
        this.scene = null;
        if (typeof fcn !== 'function') {
            var options = fcn;
            fcn = options.fcn;
            interval = options.interval;
            repeats = options.repeats;
            numberOfRepeats = options.numberOfRepeats;
        }
        if (!!numberOfRepeats && numberOfRepeats >= 0) {
            this.maxNumberOfRepeats = numberOfRepeats;
            if (!repeats) {
                throw new Error('repeats must be set to true if numberOfRepeats is set');
            }
        }
        this.id = Timer.id++;
        this.interval = interval || this.interval;
        this.repeats = repeats || this.repeats;
        this._callbacks = [];
        if (fcn) {
            this.on(fcn);
        }
    }
    /**
     * Adds a new callback to be fired after the interval is complete
     * @param fcn The callback to be added to the callback list, to be fired after the interval is complete.
     */
    Timer.prototype.on = function (fcn) {
        this._callbacks.push(fcn);
    };
    /**
     * Removes a callback from the callback list to be fired after the interval is complete.
     * @param fcn The callback to be removed from the callback list, to be fired after the interval is complete.
     */
    Timer.prototype.off = function (fcn) {
        var index = this._callbacks.indexOf(fcn);
        this._callbacks.splice(index, 1);
    };
    /**
     * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
     * @param delta  Number of elapsed milliseconds since the last update.
     */
    Timer.prototype.update = function (delta) {
        var _this = this;
        if (!this._paused) {
            this._totalTimeAlive += delta;
            this._elapsedTime += delta;
            if (this.maxNumberOfRepeats > -1 && this._numberOfTicks >= this.maxNumberOfRepeats) {
                this.complete = true;
            }
            if (!this.complete && this._elapsedTime >= this.interval) {
                this._callbacks.forEach(function (c) {
                    c.call(_this);
                });
                this._numberOfTicks++;
                if (this.repeats) {
                    this._elapsedTime = 0;
                }
                else {
                    this.complete = true;
                }
            }
        }
    };
    /**
     * Resets the timer so that it can be reused, and optionally reconfigure the timers interval.
     * @param newInterval If specified, sets a new non-negative interval in milliseconds to refire the callback
     * @param newNumberOfRepeats If specified, sets a new non-negative upper limit to the number of time this timer executes
     */
    Timer.prototype.reset = function (newInterval, newNumberOfRepeats) {
        if (!!newInterval && newInterval >= 0) {
            this.interval = newInterval;
        }
        if (!!this.maxNumberOfRepeats && this.maxNumberOfRepeats >= 0) {
            this.maxNumberOfRepeats = newNumberOfRepeats;
            if (!this.repeats) {
                throw new Error('repeats must be set to true if numberOfRepeats is set');
            }
        }
        this.complete = false;
        this._elapsedTime = 0;
        this._numberOfTicks = 0;
    };
    Object.defineProperty(Timer.prototype, "timesRepeated", {
        get: function () {
            return this._numberOfTicks;
        },
        enumerable: false,
        configurable: true
    });
    Timer.prototype.getTimeRunning = function () {
        return this._totalTimeAlive;
    };
    /**
     * Pauses the timer so that no more time will be incremented towards the next call
     */
    Timer.prototype.pause = function () {
        this._paused = true;
    };
    /**
     * Unpauses the timer. Time will now increment towards the next call
     */
    Timer.prototype.unpause = function () {
        this._paused = false;
    };
    /**
     * Cancels the timer, preventing any further executions.
     */
    Timer.prototype.cancel = function () {
        if (this.scene) {
            this.scene.cancelTimer(this);
        }
    };
    Timer.id = 0;
    return Timer;
}());
export { Timer };
//# sourceMappingURL=Timer.js.map