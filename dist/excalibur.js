/*! excalibur - v0.8.0 - 2016-12-18
* https://github.com/excaliburjs/Excalibur
* Copyright (c) 2016 Excalibur.js <https://github.com/excaliburjs/Excalibur/graphs/contributors>; Licensed BSD-2-Clause*/
var EX_VERSION = "0.8.0";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* istanbul ignore next */
if (typeof window === 'undefined') {
    window = { audioContext: function () { return; } };
}
/* istanbul ignore next */
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) { window.setInterval(callback, 1000 / 60); };
}
/* istanbul ignore next */
if (typeof window !== 'undefined' && !window.cancelAnimationFrame) {
    window.cancelAnimationFrame =
        window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            function (callback) { return; };
}
/* istanbul ignore next */
if (typeof window !== 'undefined' && !window.AudioContext) {
    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext ||
        window.msAudioContext ||
        window.oAudioContext;
}
// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
/* istanbul ignore next */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }
        // 1. Let O be the result of calling ToObject passing the |this| value as the argument. 
        var O = Object(this);
        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;
        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }
        // 6. Let k be 0
        k = 0;
        // 7. Repeat, while k < len
        while (k < len) {
            var kValue;
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {
                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[k];
                // ii. Call the Call internal method of callback with T as the this value and
                // argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}
// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
/* istanbul ignore next */
if (!Array.prototype.some) {
    Array.prototype.some = function (fun /*, thisArg */) {
        'use strict';
        if (this === void 0 || this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }
        return false;
    };
}
// Polyfill from  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill
/* istanbul ignore next */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { return; }, fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
                ? this
                : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}
/// <reference path="Engine.ts" />
var ex;
(function (ex) {
    /**
     * Debug statistics and flags for Excalibur. If polling these values, it would be
     * best to do so on the `postupdate` event for [[Engine]], after all values have been
     * updated during a frame.
     */
    var Debug = (function () {
        function Debug(_engine) {
            this._engine = _engine;
            /**
             * Performance statistics
             */
            this.stats = {
                /**
                 * Current frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
                 * Best accessed on [Events.postframe] event. See [[IFrameStats]]
                 */
                currFrame: new FrameStats(),
                /**
                 * Previous frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
                 * Best accessed on [Events.preframe] event. Best inspected on engine event `preframe`. See [[IFrameStats]]
                 */
                prevFrame: new FrameStats()
            };
        }
        return Debug;
    }());
    ex.Debug = Debug;
    /**
     * Implementation of a frame's stats. Meant to have values copied via [[FrameStats.reset]], avoid
     * creating instances of this every frame.
     */
    var FrameStats = (function () {
        function FrameStats() {
            this._id = 0;
            this._delta = 0;
            this._fps = 0;
            this._actorStats = {
                alive: 0,
                killed: 0,
                ui: 0,
                get remaining() {
                    return this.alive - this.killed;
                },
                get total() {
                    return this.remaining + this.ui;
                }
            };
            this._durationStats = {
                update: 0,
                draw: 0,
                get total() {
                    return this.update + this.draw;
                }
            };
            this._physicsStats = new PhysicsStats();
        }
        /**
         * Zero out values or clone other IFrameStat stats. Allows instance reuse.
         *
         * @param [otherStats] Optional stats to clone
         */
        FrameStats.prototype.reset = function (otherStats) {
            if (otherStats) {
                this.id = otherStats.id;
                this.delta = otherStats.delta;
                this.fps = otherStats.fps;
                this.actors.alive = otherStats.actors.alive;
                this.actors.killed = otherStats.actors.killed;
                this.actors.ui = otherStats.actors.ui;
                this.duration.update = otherStats.duration.update;
                this.duration.draw = otherStats.duration.draw;
                this._physicsStats.reset(otherStats.physics);
            }
            else {
                this.id = this.delta = this.fps = 0;
                this.actors.alive = this.actors.killed = this.actors.ui = 0;
                this.duration.update = this.duration.draw = 0;
                this._physicsStats.reset();
            }
        };
        /**
         * Provides a clone of this instance.
         */
        FrameStats.prototype.clone = function () {
            var fs = new FrameStats();
            fs.reset(this);
            return fs;
        };
        Object.defineProperty(FrameStats.prototype, "id", {
            /**
             * Gets the frame's id
             */
            get: function () {
                return this._id;
            },
            /**
             * Sets the frame's id
             */
            set: function (value) {
                this._id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameStats.prototype, "delta", {
            /**
             * Gets the frame's delta (time since last frame)
             */
            get: function () {
                return this._delta;
            },
            /**
             * Sets the frame's delta (time since last frame). Internal use only.
             * @internal
             */
            set: function (value) {
                this._delta = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameStats.prototype, "fps", {
            /**
             * Gets the frame's frames-per-second (FPS)
             */
            get: function () {
                return this._fps;
            },
            /**
             * Sets the frame's frames-per-second (FPS). Internal use only.
             * @internal
             */
            set: function (value) {
                this._fps = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameStats.prototype, "actors", {
            /**
             * Gets the frame's actor statistics
             */
            get: function () {
                return this._actorStats;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameStats.prototype, "duration", {
            /**
             * Gets the frame's duration statistics
             */
            get: function () {
                return this._durationStats;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameStats.prototype, "physics", {
            /**
             * Gets the frame's physics statistics
             */
            get: function () {
                return this._physicsStats;
            },
            enumerable: true,
            configurable: true
        });
        return FrameStats;
    }());
    ex.FrameStats = FrameStats;
    var PhysicsStats = (function () {
        function PhysicsStats() {
            this._pairs = 0;
            this._collisions = 0;
            this._fastBodies = 0;
            this._fastBodyCollisions = 0;
            this._broadphase = 0;
            this._narrowphase = 0;
        }
        /**
         * Zero out values or clone other IPhysicsStats stats. Allows instance reuse.
         *
         * @param [otherStats] Optional stats to clone
         */
        PhysicsStats.prototype.reset = function (otherStats) {
            if (otherStats) {
                this.pairs = otherStats.pairs;
                this.collisions = otherStats.collisions;
                this.fastBodies = otherStats.fastBodies;
                this.fastBodyCollisions = otherStats.fastBodyCollisions;
                this.broadphase = otherStats.broadphase;
                this.narrowphase = otherStats.narrowphase;
            }
            else {
                this.pairs = this.collisions = this.fastBodies = 0;
                this.fastBodyCollisions = this.broadphase = this.narrowphase = 0;
            }
        };
        /**
         * Provides a clone of this instance.
         */
        PhysicsStats.prototype.clone = function () {
            var ps = new PhysicsStats();
            ps.reset(this);
            return ps;
        };
        Object.defineProperty(PhysicsStats.prototype, "pairs", {
            get: function () {
                return this._pairs;
            },
            set: function (value) {
                this._pairs = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PhysicsStats.prototype, "collisions", {
            get: function () {
                return this._collisions;
            },
            set: function (value) {
                this._collisions = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PhysicsStats.prototype, "fastBodies", {
            get: function () {
                return this._fastBodies;
            },
            set: function (value) {
                this._fastBodies = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PhysicsStats.prototype, "fastBodyCollisions", {
            get: function () {
                return this._fastBodyCollisions;
            },
            set: function (value) {
                this._fastBodyCollisions = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PhysicsStats.prototype, "broadphase", {
            get: function () {
                return this._broadphase;
            },
            set: function (value) {
                this._broadphase = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PhysicsStats.prototype, "narrowphase", {
            get: function () {
                return this._narrowphase;
            },
            set: function (value) {
                this._narrowphase = value;
            },
            enumerable: true,
            configurable: true
        });
        return PhysicsStats;
    }());
    ex.PhysicsStats = PhysicsStats;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * These effects can be applied to any bitmap image but are mainly used
     * for [[Sprite]] effects or [[Animation]] effects.
     *
     * [[include:SpriteEffects.md]]
     */
    var Effects;
    (function (Effects) {
        /**
         * Applies the "Grayscale" effect to a sprite, removing color information.
         */
        var Grayscale = (function () {
            function Grayscale() {
            }
            Grayscale.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var avg = (pixel[firstPixel + 0] + pixel[firstPixel + 1] + pixel[firstPixel + 2]) / 3;
                pixel[firstPixel + 0] = avg;
                pixel[firstPixel + 1] = avg;
                pixel[firstPixel + 2] = avg;
            };
            return Grayscale;
        }());
        Effects.Grayscale = Grayscale;
        /**
         * Applies the "Invert" effect to a sprite, inverting the pixel colors.
         */
        var Invert = (function () {
            function Invert() {
            }
            Invert.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                pixel[firstPixel + 0] = 255 - pixel[firstPixel + 0];
                pixel[firstPixel + 1] = 255 - pixel[firstPixel + 1];
                pixel[firstPixel + 2] = 255 - pixel[firstPixel + 2];
            };
            return Invert;
        }());
        Effects.Invert = Invert;
        /**
         * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
         */
        var Opacity = (function () {
            /**
             * @param opacity  The new opacity of the sprite from 0-1.0
             */
            function Opacity(opacity) {
                this.opacity = opacity;
            }
            Opacity.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                if (pixel[firstPixel + 3] !== 0) {
                    pixel[firstPixel + 3] = Math.round(this.opacity * pixel[firstPixel + 3]);
                }
            };
            return Opacity;
        }());
        Effects.Opacity = Opacity;
        /**
         * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an
         * average of the original color and the provided color
         */
        var Colorize = (function () {
            /**
             * @param color  The color to apply to the sprite
             */
            function Colorize(color) {
                this.color = color;
            }
            Colorize.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                if (pixel[firstPixel + 3] !== 0) {
                    pixel[firstPixel + 0] = (pixel[firstPixel + 0] + this.color.r) / 2;
                    pixel[firstPixel + 1] = (pixel[firstPixel + 1] + this.color.g) / 2;
                    pixel[firstPixel + 2] = (pixel[firstPixel + 2] + this.color.b) / 2;
                }
            };
            return Colorize;
        }());
        Effects.Colorize = Colorize;
        /**
         * Applies the "Lighten" effect to a sprite, changes the lightness of the color according to HSL
         */
        var Lighten = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Lighten(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Lighten.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).lighten(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Lighten;
        }());
        Effects.Lighten = Lighten;
        /**
         * Applies the "Darken" effect to a sprite, changes the darkness of the color according to HSL
         */
        var Darken = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Darken(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Darken.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).darken(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Darken;
        }());
        Effects.Darken = Darken;
        /**
         * Applies the "Saturate" effect to a sprite, saturates the color according to HSL
         */
        var Saturate = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Saturate(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Saturate.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).saturate(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Saturate;
        }());
        Effects.Saturate = Saturate;
        /**
         * Applies the "Desaturate" effect to a sprite, desaturates the color according to HSL
         */
        var Desaturate = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Desaturate(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Desaturate.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).desaturate(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Desaturate;
        }());
        Effects.Desaturate = Desaturate;
        /**
         * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
         * a given color
         */
        var Fill = (function () {
            /**
             * @param color  The color to apply to the sprite
             */
            function Fill(color) {
                this.color = color;
            }
            Fill.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                if (pixel[firstPixel + 3] !== 0) {
                    pixel[firstPixel + 0] = this.color.r;
                    pixel[firstPixel + 1] = this.color.g;
                    pixel[firstPixel + 2] = this.color.b;
                }
            };
            return Fill;
        }());
        Effects.Fill = Fill;
    })(Effects = ex.Effects || (ex.Effects = {}));
})(ex || (ex = {}));
/// <reference path="../Drawing/SpriteEffects.ts" />
var ex;
(function (ex) {
    /**
     * A 2D vector on a plane.
     */
    var Vector = (function () {
        /**
         * @param x  X component of the Vector
         * @param y  Y component of the Vector
         */
        function Vector(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * Returns a vector of unit length in the direction of the specified angle in Radians.
         * @param angle The angle to generate the vector
         */
        Vector.fromAngle = function (angle) {
            return new Vector(Math.cos(angle), Math.sin(angle));
        };
        /**
         * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
         */
        Vector.isValid = function (vec) {
            if (vec === null || vec === undefined) {
                return false;
            }
            if (isNaN(vec.x) || isNaN(vec.y)) {
                return false;
            }
            if (vec.x === Infinity ||
                vec.y === Infinity ||
                vec.x === -Infinity ||
                vec.y === Infinity) {
                return false;
            }
            return true;
        };
        /**
         * Sets the x and y components at once
         */
        Vector.prototype.setTo = function (x, y) {
            this.x = x;
            this.y = y;
        };
        /**
         * Compares this point against another and tests for equality
         * @param point  The other point to compare to
         */
        Vector.prototype.equals = function (vector, tolerance) {
            if (tolerance === void 0) { tolerance = .001; }
            return Math.abs(this.x - vector.x) <= tolerance && Math.abs(this.y - vector.y) <= tolerance;
        };
        /**
         * The distance to another vector. If no other Vector is specified, this will return the [[magnitude]].
         * @param v  The other vector. Leave blank to use origin vector.
         */
        Vector.prototype.distance = function (v) {
            if (!v) {
                v = Vector.Zero;
            }
            return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
        };
        /**
         * The magnitude (size) of the Vector
         */
        Vector.prototype.magnitude = function () {
            return this.distance();
        };
        /**
         * Normalizes a vector to have a magnitude of 1.
         */
        Vector.prototype.normalize = function () {
            var d = this.distance();
            if (d > 0) {
                return new Vector(this.x / d, this.y / d);
            }
            else {
                return new Vector(0, 1);
            }
        };
        /**
         * Returns the average (midpoint) between the current point and the specified
         */
        Vector.prototype.average = function (vec) {
            return this.add(vec).scale(.5);
        };
        /**
         * Scales a vector's by a factor of size
         * @param size  The factor to scale the magnitude by
         */
        Vector.prototype.scale = function (size) {
            return new Vector(this.x * size, this.y * size);
        };
        /**
         * Adds one vector to another
         * @param v The vector to add
         */
        Vector.prototype.add = function (v) {
            return new Vector(this.x + v.x, this.y + v.y);
        };
        /**
         * Subtracts a vector from another, if you subract vector `B.sub(A)` the resulting vector points from A -> B
         * @param v The vector to subtract
         */
        Vector.prototype.sub = function (v) {
            return new Vector(this.x - v.x, this.y - v.y);
        };
        /**
         * Adds one vector to this one modifying the original
         * @param v The vector to add
         */
        Vector.prototype.addEqual = function (v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        };
        /**
         * Subtracts a vector from this one modifying the original
         * @parallel v The vector to subtract
         */
        Vector.prototype.subEqual = function (v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        };
        /**
         * Scales this vector by a factor of size and modifies the original
         */
        Vector.prototype.scaleEqual = function (size) {
            this.x *= size;
            this.y *= size;
            return this;
        };
        /**
         * Performs a dot product with another vector
         * @param v  The vector to dot
         */
        Vector.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y;
        };
        Vector.prototype.cross = function (v) {
            if (v instanceof Vector) {
                return this.x * v.y - this.y * v.x;
            }
            else if (typeof v === 'number') {
                return new Vector(v * this.y, -v * this.x);
            }
        };
        /**
         * Returns the perpendicular vector to this one
         */
        Vector.prototype.perpendicular = function () {
            return new Vector(this.y, -this.x);
        };
        /**
         * Returns the normal vector to this one, same as the perpendicular of length 1
         */
        Vector.prototype.normal = function () {
            return this.perpendicular().normalize();
        };
        /**
         * Negate the current vector
         */
        Vector.prototype.negate = function () {
            return this.scale(-1);
        };
        /**
         * Returns the angle of this vector.
         */
        Vector.prototype.toAngle = function () {
            return Math.atan2(this.y, this.x);
        };
        /**
         * Rotates the current vector around a point by a certain number of
         * degrees in radians
         */
        Vector.prototype.rotate = function (angle, anchor) {
            if (!anchor) {
                anchor = new ex.Vector(0, 0);
            }
            var sinAngle = Math.sin(angle);
            var cosAngle = Math.cos(angle);
            var x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
            var y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
            return new Vector(x, y);
        };
        /**
         * Creates new vector that has the same values as the previous.
         */
        Vector.prototype.clone = function () {
            return new Vector(this.x, this.y);
        };
        /**
         * Returns a string repesentation of the vector.
         */
        Vector.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ")";
        };
        /**
         * A (0, 0) vector
         */
        Vector.Zero = new Vector(0, 0);
        /**
         * A (1, 1) vector
         */
        Vector.One = new Vector(1, 1);
        /**
         * A (0.5, 0.5) vector
         */
        Vector.Half = new Vector(0.5, 0.5);
        /**
         * A unit vector pointing up (0, -1)
         */
        Vector.Up = new Vector(0, -1);
        /**
         * A unit vector pointing down (0, 1)
         */
        Vector.Down = new Vector(0, 1);
        /**
         * A unit vector pointing left (-1, 0)
         */
        Vector.Left = new Vector(-1, 0);
        /**
         * A unit vector pointing right (1, 0)
         */
        Vector.Right = new Vector(1, 0);
        return Vector;
    }());
    ex.Vector = Vector;
    /**
     * A 2D ray that can be cast into the scene to do collision detection
     */
    var Ray = (function () {
        /**
         * @param pos The starting position for the ray
         * @param dir The vector indicating the direction of the ray
         */
        function Ray(pos, dir) {
            this.pos = pos;
            this.dir = dir.normalize();
        }
        /**
         * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
         * This number indicates the mathematical intersection time.
         * @param line  The line to test
         */
        Ray.prototype.intersect = function (line) {
            var numerator = line.begin.sub(this.pos);
            // Test is line and ray are parallel and non intersecting
            if (this.dir.cross(line.getSlope()) === 0 && numerator.cross(this.dir) !== 0) {
                return -1;
            }
            // Lines are parallel
            var divisor = (this.dir.cross(line.getSlope()));
            if (divisor === 0) {
                return -1;
            }
            var t = numerator.cross(line.getSlope()) / divisor;
            if (t >= 0) {
                var u = (numerator.cross(this.dir) / divisor) / line.getLength();
                if (u >= 0 && u <= 1) {
                    return t;
                }
            }
            return -1;
        };
        /**
         * Returns the point of intersection given the intersection time
         */
        Ray.prototype.getPoint = function (time) {
            return this.pos.add(this.dir.scale(time));
        };
        return Ray;
    }());
    ex.Ray = Ray;
    /**
     * A 2D line segment
     */
    var Line = (function () {
        /**
         * @param begin  The starting point of the line segment
         * @param end  The ending point of the line segment
         */
        function Line(begin, end) {
            this.begin = begin;
            this.end = end;
        }
        Object.defineProperty(Line.prototype, "slope", {
            /**
             * Gets the raw slope (m) of the line. Will return (+/-)Infinity for vertical lines.
             */
            get: function () {
                return (this.end.y - this.begin.y) / (this.end.x - this.begin.x);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "intercept", {
            /**
             * Gets the Y-intercept (b) of the line. Will return (+/-)Infinity if there is no intercept.
             */
            get: function () {
                return this.begin.y - (this.slope * this.begin.x);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Returns the slope of the line in the form of a vector
         */
        Line.prototype.getSlope = function () {
            var begin = this.begin;
            var end = this.end;
            var distance = begin.distance(end);
            return end.sub(begin).scale(1 / distance);
        };
        /**
         * Returns the length of the line segment in pixels
         */
        Line.prototype.getLength = function () {
            var begin = this.begin;
            var end = this.end;
            var distance = begin.distance(end);
            return distance;
        };
        /**
         * Finds a point on the line given only an X or a Y value. Given an X value, the function returns
         * a new point with the calculated Y value and vice-versa.
         *
         * @param x The known X value of the target point
         * @param y The known Y value of the target point
         * @returns A new point with the other calculated axis value
         */
        Line.prototype.findPoint = function (x, y) {
            if (x === void 0) { x = null; }
            if (y === void 0) { y = null; }
            var m = this.slope;
            var b = this.intercept;
            if (x !== null) {
                return new ex.Vector(x, (m * x) + b);
            }
            else if (y !== null) {
                return new ex.Vector((y - b) / m, y);
            }
        };
        /**
         * @see http://stackoverflow.com/a/11908158/109458
         */
        Line.prototype.hasPoint = function () {
            var currPoint;
            var threshold = 0;
            if (typeof arguments[0] === 'number' &&
                typeof arguments[1] === 'number') {
                currPoint = new Vector(arguments[0], arguments[1]);
                threshold = arguments[2] || 0;
            }
            else if (arguments[0] instanceof Vector) {
                currPoint = arguments[0];
                threshold = arguments[1] || 0;
            }
            else {
                throw 'Could not determine the arguments for Vector.hasPoint';
            }
            var dxc = currPoint.x - this.begin.x;
            var dyc = currPoint.y - this.begin.y;
            var dx1 = this.end.x - this.begin.x;
            var dy1 = this.end.y - this.begin.y;
            var cross = dxc * dy1 - dyc * dx1;
            // check whether point lines on the line
            if (Math.abs(cross) > threshold) {
                return false;
            }
            // check whether point lies in-between start and end
            if (Math.abs(dx1) >= Math.abs(dy1)) {
                return dx1 > 0
                    ? this.begin.x <= currPoint.x && currPoint.x <= this.end.x
                    : this.end.x <= currPoint.x && currPoint.x <= this.begin.x;
            }
            else {
                return dy1 > 0
                    ? this.begin.y <= currPoint.y && currPoint.y <= this.end.y
                    : this.end.y <= currPoint.y && currPoint.y <= this.begin.y;
            }
        };
        return Line;
    }());
    ex.Line = Line;
    /**
     * A 1 dimensional projection on an axis, used to test overlaps
     */
    var Projection = (function () {
        function Projection(min, max) {
            this.min = min;
            this.max = max;
        }
        Projection.prototype.overlaps = function (projection) {
            return this.max > projection.min && projection.max > this.min;
        };
        Projection.prototype.getOverlap = function (projection) {
            if (this.overlaps(projection)) {
                if (this.max > projection.max) {
                    return projection.max - this.min;
                }
                else {
                    return this.max - projection.min;
                }
            }
            return 0;
        };
        return Projection;
    }());
    ex.Projection = Projection;
})(ex || (ex = {}));
/// <reference path="Collision/IPhysics.ts" />
var ex;
(function (ex) {
    /**
     * Possible collision resolution strategies
     *
     * The default is [[CollisionResolutionStrategy.Box]] which performs simple axis aligned arcade style physics.
     *
     * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.RigidBody]] which allows for complicated
     * simulated physical interactions.
     */
    (function (CollisionResolutionStrategy) {
        CollisionResolutionStrategy[CollisionResolutionStrategy["Box"] = 0] = "Box";
        CollisionResolutionStrategy[CollisionResolutionStrategy["RigidBody"] = 1] = "RigidBody";
    })(ex.CollisionResolutionStrategy || (ex.CollisionResolutionStrategy = {}));
    var CollisionResolutionStrategy = ex.CollisionResolutionStrategy;
    /**
     * Possible broadphase collision pair identification strategies
     *
     * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
     * potential collision pairs which is O(nlog(n)) faster. The other possible strategy is the [[BroadphaseStrategy.Naive]] strategy
     * which loops over every object for every object in the scene to identify collision pairs which is O(n^2) slower.
     */
    (function (BroadphaseStrategy) {
        BroadphaseStrategy[BroadphaseStrategy["Naive"] = 0] = "Naive";
        BroadphaseStrategy[BroadphaseStrategy["DynamicAABBTree"] = 1] = "DynamicAABBTree";
    })(ex.BroadphaseStrategy || (ex.BroadphaseStrategy = {}));
    var BroadphaseStrategy = ex.BroadphaseStrategy;
    /**
     * Possible numerical integrators for position and velocity
     */
    (function (Integrator) {
        Integrator[Integrator["Euler"] = 0] = "Euler";
    })(ex.Integrator || (ex.Integrator = {}));
    var Integrator = ex.Integrator;
    /**
     * The [[Physics]] object is the global configuration object for all Excalibur physics.
     *
     * [[include:Physics.md]]
     */
    /* istanbul ignore next */
    var Physics = (function () {
        function Physics() {
        }
        /**
         * Configures Excalibur to use box physics. Box physics which performs simple axis aligned arcade style physics.
         */
        Physics.useBoxPhysics = function () {
            ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.Box;
        };
        /**
         * Configures Excalibur to use rigid body physics. Rigid body physics allows for complicated
         * simulated physical interactions.
         */
        Physics.useRigidBodyPhysics = function () {
            ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
        };
        /**
         * Global acceleration that is applied to all vanilla actors (it wont effect [[Label|labels]], [[UIActor|ui actors]], or
         * [[Trigger|triggers]] in Excalibur that have an [[CollisionType.Active|active]] collision type).
         *
         *
         * This is a great way to globally simulate effects like gravity.
         */
        Physics.acc = new ex.Vector(0, 0);
        /**
         * Globally switches all Excalibur physics behavior on or off.
         */
        Physics.enabled = true;
        /**
         * Gets or sets the number of collision passes for Excalibur to perform on physics bodies.
         *
         * Reducing collision passes may cause things not to collide as expected in your game, but may increase performance.
         *
         * More passes can improve the visual quality of collisions when many objects are on the screen. This can reduce jitter, improve the
         * collision resolution of fast move objects, or the stability of large numbers of objects stacked together.
         *
         * Fewer passes will improve the performance of the game at the cost of collision quality, more passes will improve quality at the
         * cost of performance.
         *
         * The default is set to 5 passes which is a good start.
         */
        Physics.collisionPasses = 5;
        /**
         * Gets or sets the broadphase pair identification strategy.
         *
         * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
         * potential collision pairs which is O(nlog(n)) faster. The other possible strategy is the [[BroadphaseStrategy.Naive]] strategy
         * which loops over every object for every object in the scene to identify collision pairs which is O(n^2) slower.
         */
        Physics.broadphaseStrategy = BroadphaseStrategy.DynamicAABBTree;
        /**
         * Globally switches the debug information for the broadphase strategy
         */
        Physics.broadphaseDebug = false;
        /**
         * Show the normals as a result of collision on the screen.
         */
        Physics.showCollisionNormals = false;
        /**
         * Show the position, velocity, and acceleration as graphical vectors.
         */
        Physics.showMotionVectors = false;
        /**
         * Show the axis-aligned bounding boxes of the collision bodies on the screen.
         */
        Physics.showBounds = false;
        /**
         * Show the bounding collision area shapes
         */
        Physics.showArea = false;
        /**
         * Show points of collision interpreted by excalibur as a result of collision.
         */
        Physics.showContacts = false;
        /**
         * Show the surface normals of the collision areas.
         */
        Physics.showNormals = false;
        /**
         * Gets or sets the global collision resolution strategy (narrowphase).
         *
         * The default is [[CollisionResolutionStrategy.Box]] which performs simple axis aligned arcade style physics.
         *
         * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.RigidBody]] which allows for complicated
         * simulated physical interactions.
         */
        Physics.collisionResolutionStrategy = CollisionResolutionStrategy.Box;
        /**
         * The default mass to use if none is specified
         */
        Physics.defaultMass = 10;
        /**
         * Gets or sets the position and velocity positional integrator, currently only Euler is supported.
         */
        Physics.integrator = Integrator.Euler;
        /**
         * Number of steps to use in integration. A higher number improves the positional accuracy over time. This can be useful to increase
         * if you have fast moving objects in your simulation or you have a large number of objects and need to increase stability.
         */
        Physics.integrationSteps = 1;
        /**
         * Gets or sets whether rotation is allowed in a RigidBody collision resolution
         */
        Physics.allowRigidBodyRotation = true;
        /**
         * Small value to help collision passes settle themselves after the narrowphase.
         */
        Physics.collisionShift = .001;
        /**
         * Factor to add to the RigidBody BoundingBox, bounding box (dimensions += vel * dynamicTreeVelocityMultiplyer);
         */
        Physics.dynamicTreeVelocityMultiplyer = 2;
        /**
         * Pad RigidBody BoundingBox by a constant amount
         */
        Physics.boundsPadding = 5;
        /**
         * Surface epsilon is used to help deal with surface penatration
         */
        Physics.surfaceEpsilon = .1;
        /**
         * Enable fast moving body checking, this enables checking for collision pairs via raycast for fast moving objects to prevent
         * bodies from tunneling through one another.
         */
        Physics.checkForFastBodies = true;
        /**
         * Disable minimum fast moving body raycast, by default if ex.Physics.checkForFastBodies = true Excalibur will only check if the
         * body is moving at least half of its minimum diminension in an update. If ex.Physics.disableMinimumSpeedForFastBody is set to true,
         * Excalibur will always perform the fast body raycast regardless of speed.
         */
        Physics.disableMinimumSpeedForFastBody = false;
        return Physics;
    }());
    ex.Physics = Physics;
    ;
})(ex || (ex = {}));
/// <reference path="../Algebra.ts" />
/// <reference path="../Actor.ts" />
/// <reference path="../Physics.ts" />
/// <reference path="ICollisionArea.ts" />
var ex;
(function (ex) {
    /**
     * Collision contacts are used internally by Excalibur to resolve collision between actors. This
     * Pair prevents collisions from being evaluated more than one time
     */
    var CollisionContact = (function () {
        function CollisionContact(bodyA, bodyB, mtv, point, normal) {
            this.bodyA = bodyA;
            this.bodyB = bodyB;
            this.mtv = mtv;
            this.point = point;
            this.normal = normal;
        }
        CollisionContact.prototype.resolve = function (delta, strategy) {
            if (strategy === ex.CollisionResolutionStrategy.RigidBody) {
                this._resolveRigidBodyCollision(delta);
            }
            else if (strategy === ex.CollisionResolutionStrategy.Box) {
                this._resolveBoxCollision(delta);
            }
            else {
                throw new Error('Unknown collision resolution strategy');
            }
        };
        CollisionContact.prototype._applyBoxImpluse = function (bodyA, bodyB, mtv, side) {
            if ((bodyA.collisionType === ex.CollisionType.Active ||
                bodyA.collisionType === ex.CollisionType.Elastic) &&
                bodyB.collisionType !== ex.CollisionType.Passive) {
                // Resolve overlaps
                if (bodyA.collisionType === ex.CollisionType.Active &&
                    bodyB.collisionType === ex.CollisionType.Active) {
                    // split overlaps if both are Active
                    mtv = mtv.scale(.5);
                }
                // Apply mtv
                bodyA.pos.y += mtv.y;
                bodyA.pos.x += mtv.x;
                // Naive elastic bounce
                if (bodyA.collisionType === ex.CollisionType.Elastic) {
                    if (side === ex.Side.Left) {
                        bodyA.vel.x = Math.abs(bodyA.vel.x);
                    }
                    else if (side === ex.Side.Right) {
                        bodyA.vel.x = -Math.abs(bodyA.vel.x);
                    }
                    else if (side === ex.Side.Top) {
                        bodyA.vel.y = Math.abs(bodyA.vel.y);
                    }
                    else if (side === ex.Side.Bottom) {
                        bodyA.vel.y = -Math.abs(bodyA.vel.y);
                    }
                }
                else {
                    // non-zero intersection on the y axis
                    if (this.mtv.x !== 0) {
                        var velX = 0;
                        // both bodies are traveling in the same direction (negative or positive)
                        if (bodyA.vel.x < 0 && bodyB.vel.x < 0) {
                            velX = Math.min(bodyA.vel.x, bodyB.vel.x);
                        }
                        else if (bodyA.vel.x > 0 && bodyB.vel.x > 0) {
                            velX = Math.max(bodyA.vel.x, bodyB.vel.x);
                        }
                        else if (bodyB.collisionType === ex.CollisionType.Fixed) {
                            // bodies are traveling in opposite directions
                            if (bodyA.pos.sub(bodyB.pos).dot(bodyA.vel) > 0) {
                                velX = bodyA.vel.x;
                            }
                            else {
                                // bodyA is heading towards b
                                velX = bodyB.vel.x;
                            }
                        }
                        bodyA.vel.x = velX;
                    }
                    if (this.mtv.y !== 0) {
                        var velY = 0;
                        // both bodies are traveling in the same direction (negative or positive)
                        if (bodyA.vel.y < 0 && bodyB.vel.y < 0) {
                            velY = Math.min(bodyA.vel.y, bodyB.vel.y);
                        }
                        else if (bodyA.vel.y > 0 && bodyB.vel.y > 0) {
                            velY = Math.max(bodyA.vel.y, bodyB.vel.y);
                        }
                        else if (bodyB.collisionType === ex.CollisionType.Fixed) {
                            // bodies are traveling in opposite directions
                            if (bodyA.pos.sub(bodyB.pos).dot(bodyA.vel) > 0) {
                                velY = bodyA.vel.y;
                            }
                            else {
                                // bodyA is heading towards b
                                velY = bodyB.vel.y;
                            }
                        }
                        bodyA.vel.y = velY;
                    }
                }
            }
        };
        CollisionContact.prototype._resolveBoxCollision = function (delta) {
            var bodyA = this.bodyA.body.actor;
            var bodyB = this.bodyB.body.actor;
            var side = ex.Util.getSideFromVector(this.mtv);
            var mtv = this.mtv.negate();
            // Publish collision events on both participants
            bodyA.emit('collision', new ex.CollisionEvent(bodyA, bodyB, side, mtv));
            bodyB.emit('collision', new ex.CollisionEvent(bodyB, bodyA, ex.Util.getOppositeSide(side), mtv.negate()));
            this._applyBoxImpluse(bodyA, bodyB, mtv, side);
            this._applyBoxImpluse(bodyB, bodyA, mtv.negate(), ex.Util.getOppositeSide(side));
        };
        CollisionContact.prototype._resolveRigidBodyCollision = function (delta) {
            // perform collison on bounding areas
            var bodyA = this.bodyA.body;
            var bodyB = this.bodyB.body;
            var mtv = this.mtv; // normal pointing away from bodyA
            var point = this.point; // world space collision point
            var normal = this.normal; // normal pointing away from bodyA
            if (bodyA.actor === bodyB.actor) {
                return;
            }
            var invMassA = bodyA.actor.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyA.mass;
            var invMassB = bodyB.actor.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyB.mass;
            var invMoiA = bodyA.actor.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyA.moi;
            var invMoiB = bodyB.actor.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyB.moi;
            // average restitution more relistic
            var coefRestitution = Math.min(bodyA.restitution, bodyB.restitution);
            var coefFriction = Math.min(bodyA.friction, bodyB.friction);
            normal = normal.normalize();
            var tangent = normal.normal().normalize();
            var ra = this.point.sub(this.bodyA.getCenter()); // point relative to bodyA position
            var rb = this.point.sub(this.bodyB.getCenter()); /// point relative to bodyB
            // Relative velocity in linear terms
            // Angular to linear velocity formula -> omega = v/r
            var rv = bodyB.vel.add(rb.cross(-bodyB.rx)).sub(bodyA.vel.sub(ra.cross(bodyA.rx)));
            var rvNormal = rv.dot(normal);
            var rvTangent = rv.dot(tangent);
            var raTangent = ra.dot(tangent);
            var raNormal = ra.dot(normal);
            var rbTangent = rb.dot(tangent);
            var rbNormal = rb.dot(normal);
            // If objects are moving away ignore
            if (rvNormal > 0) {
                return;
            }
            // Publish collision events on both participants
            var side = ex.Util.getSideFromVector(this.mtv);
            bodyA.actor.emit('collision', new ex.CollisionEvent(this.bodyA.body.actor, this.bodyB.body.actor, side, this.mtv));
            bodyB.actor.emit('collision', new ex.CollisionEvent(this.bodyB.body.actor, this.bodyA.body.actor, ex.Util.getOppositeSide(side), this.mtv.negate()));
            // Collision impulse formula from Chris Hecker
            // https://en.wikipedia.org/wiki/Collision_response
            var impulse = -((1 + coefRestitution) * rvNormal) /
                ((invMassA + invMassB) + invMoiA * raTangent * raTangent + invMoiB * rbTangent * rbTangent);
            if (bodyA.actor.collisionType === ex.CollisionType.Fixed) {
                bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
                if (ex.Physics.allowRigidBodyRotation) {
                    bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
                }
                bodyB.addMtv(mtv);
            }
            else if (bodyB.actor.collisionType === ex.CollisionType.Fixed) {
                bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
                if (ex.Physics.allowRigidBodyRotation) {
                    bodyA.rx += impulse * invMoiA * -ra.cross(normal);
                }
                bodyA.addMtv(mtv.negate());
            }
            else {
                bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
                bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
                if (ex.Physics.allowRigidBodyRotation) {
                    bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
                    bodyA.rx += impulse * invMoiA * -ra.cross(normal);
                }
                // Split the mtv in half for the two bodies, potentially we could do something smarter here
                bodyB.addMtv(mtv.scale(.5));
                bodyA.addMtv(mtv.scale(-.5));
            }
            // Friction portion of impulse
            if (coefFriction && rvTangent) {
                // Columb model of friction, formula for impulse due to friction from  
                // https://en.wikipedia.org/wiki/Collision_response
                // tangent force exerted by body on another in contact
                var t = rv.sub(normal.scale(rv.dot(normal))).normalize();
                // impulse in the direction of tangent force
                var jt = rv.dot(t) / (invMassA + invMassB + raNormal * raNormal * invMoiA + rbNormal * rbNormal * invMoiB);
                var frictionImpulse = new ex.Vector(0, 0);
                if (Math.abs(jt) <= impulse * coefFriction) {
                    frictionImpulse = t.scale(jt).negate();
                }
                else {
                    frictionImpulse = t.scale(-impulse * coefFriction);
                }
                if (bodyA.actor.collisionType === ex.CollisionType.Fixed) {
                    // apply frictional impulse
                    bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
                    if (ex.Physics.allowRigidBodyRotation) {
                        bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                    }
                }
                else if (bodyB.actor.collisionType === ex.CollisionType.Fixed) {
                    // apply frictional impulse
                    bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                    if (ex.Physics.allowRigidBodyRotation) {
                        bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                    }
                }
                else {
                    // apply frictional impulse
                    bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
                    bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                    // apply frictional impulse
                    if (ex.Physics.allowRigidBodyRotation) {
                        bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                        bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                    }
                }
            }
        };
        return CollisionContact;
    }());
    ex.CollisionContact = CollisionContact;
})(ex || (ex = {}));
/// <reference path="CollisionContact.ts" />
/// <reference path="../DebugFlags.ts" />
var ex;
(function (ex) {
    ex.CollisionJumpTable = {
        CollideCircleCircle: function (circleA, circleB) {
            var radius = circleA.radius + circleB.radius;
            var circleAPos = circleA.body.pos.add(circleA.pos);
            var circleBPos = circleB.body.pos.add(circleB.pos);
            if (circleAPos.distance(circleBPos) > radius) {
                return null;
            }
            var axisOfCollision = circleBPos.sub(circleAPos).normalize();
            var mvt = axisOfCollision.scale(radius - circleBPos.distance(circleAPos));
            var pointOfCollision = circleA.getFurthestPoint(axisOfCollision);
            return new ex.CollisionContact(circleA, circleB, mvt, pointOfCollision, axisOfCollision);
        },
        CollideCirclePolygon: function (circle, polygon) {
            var axes = polygon.getAxes();
            var cc = circle.getCenter();
            var pc = polygon.getCenter();
            var minAxis = circle.testSeparatingAxisTheorem(polygon);
            if (!minAxis) {
                return null;
            }
            // make sure that the minAxis is pointing away from circle
            var samedir = minAxis.dot(polygon.getCenter().sub(circle.getCenter()));
            minAxis = samedir < 0 ? minAxis.negate() : minAxis;
            var verts = [];
            var point1 = polygon.getFurthestPoint(minAxis.negate());
            var point2 = circle.getFurthestPoint(minAxis); //.add(cc);
            if (circle.contains(point1)) {
                verts.push(point1);
            }
            if (polygon.contains(point2)) {
                verts.push(point2);
            }
            if (verts.length === 0) {
                verts.push(point2);
            }
            return new ex.CollisionContact(circle, polygon, minAxis, verts.length === 2 ? verts[0].average(verts[1]) : verts[0], minAxis.normalize());
        },
        CollideCircleEdge: function (circle, edge) {
            // center of the circle
            var cc = circle.getCenter();
            // vector in the direction of the edge
            var e = edge.end.sub(edge.begin);
            // amount of overlap with the circle's center along the edge direction
            var u = e.dot(edge.end.sub(cc));
            var v = e.dot(cc.sub(edge.begin));
            // Potential region A collision (circle is on the left side of the edge, before the beginning)
            if (v <= 0) {
                var da = edge.begin.sub(cc);
                var dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
                // save some sqrts
                if (dda > circle.radius * circle.radius) {
                    return null; // no collision
                }
                return new ex.CollisionContact(circle, edge, da.normalize().scale(circle.radius - Math.sqrt(dda)), edge.begin, da.normalize());
            }
            // Potential region B collision (circle is on the right side of the edge, after the end)
            if (u <= 0) {
                var db = edge.end.sub(cc);
                var ddb = db.dot(db);
                if (ddb > circle.radius * circle.radius) {
                    return null;
                }
                return new ex.CollisionContact(circle, edge, db.normalize().scale(circle.radius - Math.sqrt(ddb)), edge.end, db.normalize());
            }
            // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
            var den = e.dot(e);
            var pointOnEdge = (edge.begin.scale(u).add(edge.end.scale(v))).scale(1 / den);
            var d = cc.sub(pointOnEdge);
            var dd = d.dot(d);
            if (dd > circle.radius * circle.radius) {
                return null; // no collision
            }
            var n = e.perpendicular();
            // flip correct direction
            if (n.dot(cc.sub(edge.begin)) < 0) {
                n.x = -n.x;
                n.y = -n.y;
            }
            n = n.normalize();
            var mvt = n.scale(Math.abs(circle.radius - Math.sqrt(dd)));
            return new ex.CollisionContact(circle, edge, mvt.negate(), pointOnEdge, n.negate());
        },
        CollideEdgeEdge: function (edgeA, edgeB) {
            // Edge-edge collision doesn't make sense
            return null;
        },
        CollidePolygonEdge: function (polygon, edge) {
            var center = polygon.getCenter();
            var e = edge.end.sub(edge.begin);
            var edgeNormal = e.normal();
            var u = e.dot(edge.end.sub(center));
            var v = e.dot(center.sub(edge.begin));
            var den = e.dot(e);
            var pointOnEdge = (edge.begin.scale(u).add(edge.end.scale(v))).scale(1 / den);
            var d = center.sub(pointOnEdge);
            // build a temporary polygon from the edge to use SAT
            var linePoly = new ex.PolygonArea({
                points: [
                    edge.begin,
                    edge.end,
                    edge.end.sub(edgeNormal.scale(10)),
                    edge.begin.sub(edgeNormal.scale(10))]
            });
            var minAxis = polygon.testSeparatingAxisTheorem(linePoly);
            // no minAxis, no overlap, no collision
            if (!minAxis) {
                return null;
            }
            return new ex.CollisionContact(polygon, edge, minAxis, polygon.getFurthestPoint(edgeNormal.negate()), edgeNormal.negate());
        },
        CollidePolygonPolygon: function (polyA, polyB) {
            // get all axes from both polys
            var axes = polyA.getAxes().concat(polyB.getAxes());
            // get all points from both polys
            var points = polyA.getTransformedPoints().concat(polyB.getTransformedPoints());
            // do a SAT test to find a min axis if it exists
            var minAxis = polyA.testSeparatingAxisTheorem(polyB);
            // no overlap, no collision return null
            if (!minAxis) {
                return null;
            }
            // make sure that minAxis is pointing from A -> B
            var sameDir = minAxis.dot(polyB.getCenter().sub(polyA.getCenter()));
            minAxis = sameDir < 0 ? minAxis.negate() : minAxis;
            // find rough point of collision
            // todo this could be better
            var verts = [];
            var pointA = polyA.getFurthestPoint(minAxis);
            var pointB = polyB.getFurthestPoint(minAxis.negate());
            if (polyB.contains(pointA)) {
                verts.push(pointA);
            }
            if (polyA.contains(pointB)) {
                verts.push(pointB);
            }
            // no candidates, pick something
            if (verts.length === 0) {
                verts.push(pointB);
            }
            var contact = verts.length === 2 ? verts[0].add(verts[1]).scale(.5) : verts[0];
            return new ex.CollisionContact(polyA, polyB, minAxis, contact, minAxis.normalize());
        }
    };
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * This is a circle collision area for the excalibur rigid body physics simulation
     */
    var CircleArea = (function () {
        function CircleArea(options) {
            /**
             * This is the center position of the circle, relative to the body position
             */
            this.pos = ex.Vector.Zero.clone();
            this.pos = options.pos || ex.Vector.Zero.clone();
            this.radius = options.radius || 0;
            this.body = options.body || null;
        }
        /**
         * Get the center of the collision area in world coordinates
         */
        CircleArea.prototype.getCenter = function () {
            if (this.body) {
                return this.pos.add(this.body.pos);
            }
            return this.pos;
        };
        /**
         * Tests if a point is contained in this collision area
         */
        CircleArea.prototype.contains = function (point) {
            var distance = this.body.pos.distance(point);
            if (distance <= this.radius) {
                return true;
            }
            return false;
        };
        /**
         * Casts a ray at the CircleArea and returns the nearest point of collision
         * @param ray
         */
        CircleArea.prototype.rayCast = function (ray, max) {
            if (max === void 0) { max = Infinity; }
            //https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection
            var c = this.getCenter();
            var dir = ray.dir;
            var orig = ray.pos;
            var discriminant = Math.sqrt(Math.pow(dir.dot(orig.sub(c)), 2) -
                Math.pow(orig.sub(c).distance(), 2) +
                Math.pow(this.radius, 2));
            if (discriminant < 0) {
                // no intersection
                return null;
            }
            else {
                var toi = 0;
                if (discriminant === 0) {
                    toi = -dir.dot(orig.sub(c));
                    if (toi > 0 && toi < max) {
                        return ray.getPoint(toi);
                    }
                    return null;
                }
                else {
                    var toi1 = -dir.dot(orig.sub(c)) + discriminant;
                    var toi2 = -dir.dot(orig.sub(c)) - discriminant;
                    var mintoi = Math.min(toi1, toi2);
                    if (mintoi <= max) {
                        return ray.getPoint(mintoi);
                    }
                    return null;
                }
            }
        };
        /**
         * @inheritdoc
         */
        CircleArea.prototype.collide = function (area) {
            if (area instanceof CircleArea) {
                return ex.CollisionJumpTable.CollideCircleCircle(this, area);
            }
            else if (area instanceof ex.PolygonArea) {
                return ex.CollisionJumpTable.CollideCirclePolygon(this, area);
            }
            else if (area instanceof ex.EdgeArea) {
                return ex.CollisionJumpTable.CollideCircleEdge(this, area);
            }
            else {
                throw new Error("Circle could not collide with unknown ICollisionArea " + typeof area);
            }
        };
        /**
         * Find the point on the shape furthest in the direction specified
         */
        CircleArea.prototype.getFurthestPoint = function (direction) {
            return this.getCenter().add(direction.normalize().scale(this.radius));
        };
        /**
         * Get the axis aligned bounding box for the circle area
         */
        CircleArea.prototype.getBounds = function () {
            return new ex.BoundingBox(this.pos.x + this.body.pos.x - this.radius, this.pos.y + this.body.pos.y - this.radius, this.pos.x + this.body.pos.x + this.radius, this.pos.y + this.body.pos.y + this.radius);
        };
        /**
         * Get axis not implemented on circles, since there are infinite axis in a circle
         */
        CircleArea.prototype.getAxes = function () {
            return null;
        };
        /**
         * Returns the moment of inertia of a circle given it's mass
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        CircleArea.prototype.getMomentOfInertia = function () {
            var mass = this.body ? this.body.mass : ex.Physics.defaultMass;
            return (mass * this.radius * this.radius) / 2;
        };
        /**
         * Tests the separating axis theorem for circles against polygons
         */
        CircleArea.prototype.testSeparatingAxisTheorem = function (polygon) {
            var axes = polygon.getAxes();
            var pc = polygon.getCenter();
            // Special SAT with circles
            var closestPointOnPoly = polygon.getFurthestPoint(this.pos.sub(pc));
            axes.push(this.pos.sub(closestPointOnPoly).normalize());
            var minOverlap = Number.MAX_VALUE;
            var minAxis = null;
            var minIndex = -1;
            for (var i = 0; i < axes.length; i++) {
                var proj1 = polygon.project(axes[i]);
                var proj2 = this.project(axes[i]);
                var overlap = proj1.getOverlap(proj2);
                if (overlap <= 0) {
                    return null;
                }
                else {
                    if (overlap < minOverlap) {
                        minOverlap = overlap;
                        minAxis = axes[i];
                        minIndex = i;
                    }
                }
            }
            if (minIndex < 0) {
                return null;
            }
            return minAxis.normalize().scale(minOverlap);
        };
        /* istanbul ignore next */
        CircleArea.prototype.recalc = function () {
            // circles don't cache
        };
        /**
         * Project the circle along a specified axis
         */
        CircleArea.prototype.project = function (axis) {
            var scalars = [];
            var point = this.getCenter();
            var dotProduct = point.dot(axis);
            scalars.push(dotProduct);
            scalars.push(dotProduct + this.radius);
            scalars.push(dotProduct - this.radius);
            return new ex.Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        };
        /* istanbul ignore next */
        CircleArea.prototype.debugDraw = function (ctx, color) {
            if (color === void 0) { color = ex.Color.Green.clone(); }
            var pos = this.body ? this.body.pos.add(this.pos) : this.pos;
            var rotation = this.body ? this.body.rotation : 0;
            ctx.beginPath();
            ctx.strokeStyle = color.toString();
            ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(Math.cos(rotation) * this.radius + pos.x, Math.sin(rotation) * this.radius + pos.y);
            ctx.closePath();
            ctx.stroke();
        };
        return CircleArea;
    }());
    ex.CircleArea = CircleArea;
})(ex || (ex = {}));
var ex;
(function (ex) {
    var EdgeArea = (function () {
        function EdgeArea(options) {
            this.begin = options.begin || ex.Vector.Zero.clone();
            this.end = options.end || ex.Vector.Zero.clone();
            this.body = options.body || null;
            this.pos = this.getCenter();
        }
        /**
         * Get the center of the collision area in world coordinates
         */
        EdgeArea.prototype.getCenter = function () {
            var pos = this.begin.average(this.end).add(this._getBodyPos());
            return pos;
        };
        EdgeArea.prototype._getBodyPos = function () {
            var bodyPos = ex.Vector.Zero.clone();
            if (this.body.pos) {
                bodyPos = this.body.pos;
            }
            return bodyPos;
        };
        EdgeArea.prototype._getTransformedBegin = function () {
            var angle = this.body ? this.body.rotation : 0;
            return this.begin.rotate(angle).add(this._getBodyPos());
        };
        EdgeArea.prototype._getTransformedEnd = function () {
            var angle = this.body ? this.body.rotation : 0;
            return this.end.rotate(angle).add(this._getBodyPos());
        };
        /**
         * Returns the slope of the line in the form of a vector
         */
        EdgeArea.prototype.getSlope = function () {
            var begin = this._getTransformedBegin();
            var end = this._getTransformedEnd();
            var distance = begin.distance(end);
            return end.sub(begin).scale(1 / distance);
        };
        /**
         * Returns the length of the line segment in pixels
         */
        EdgeArea.prototype.getLength = function () {
            var begin = this._getTransformedBegin();
            var end = this._getTransformedEnd();
            var distance = begin.distance(end);
            return distance;
        };
        /**
         * Tests if a point is contained in this collision area
         */
        EdgeArea.prototype.contains = function (point) {
            return false;
        };
        /**
         * @inheritdoc
         */
        EdgeArea.prototype.rayCast = function (ray, max) {
            if (max === void 0) { max = Infinity; }
            var numerator = this._getTransformedBegin().sub(ray.pos);
            // Test is line and ray are parallel and non intersecting
            if (ray.dir.cross(this.getSlope()) === 0 && numerator.cross(ray.dir) !== 0) {
                return null;
            }
            // Lines are parallel
            var divisor = (ray.dir.cross(this.getSlope()));
            if (divisor === 0) {
                return null;
            }
            var t = numerator.cross(this.getSlope()) / divisor;
            if (t >= 0 && t <= max) {
                var u = (numerator.cross(ray.dir) / divisor) / this.getLength();
                if (u >= 0 && u <= 1) {
                    return ray.getPoint(t);
                }
            }
            return null;
        };
        /**
         * @inheritdoc
         */
        EdgeArea.prototype.collide = function (area) {
            if (area instanceof ex.CircleArea) {
                return ex.CollisionJumpTable.CollideCircleEdge(area, this);
            }
            else if (area instanceof ex.PolygonArea) {
                return ex.CollisionJumpTable.CollidePolygonEdge(area, this);
            }
            else if (area instanceof EdgeArea) {
                return ex.CollisionJumpTable.CollideEdgeEdge(this, area);
            }
            else {
                throw new Error("Edge could not collide with unknown ICollisionArea " + typeof area);
            }
        };
        /**
         * Find the point on the shape furthest in the direction specified
         */
        EdgeArea.prototype.getFurthestPoint = function (direction) {
            var transformedBegin = this._getTransformedBegin();
            var transformedEnd = this._getTransformedEnd();
            if (direction.dot(transformedBegin) > 0) {
                return transformedBegin;
            }
            else {
                return transformedEnd;
            }
        };
        /**
         * Get the axis aligned bounding box for the circle area
         */
        EdgeArea.prototype.getBounds = function () {
            var transformedBegin = this._getTransformedBegin();
            var transformedEnd = this._getTransformedEnd();
            return new ex.BoundingBox(Math.min(transformedBegin.x, transformedEnd.x), Math.min(transformedBegin.y, transformedEnd.y), Math.max(transformedBegin.x, transformedEnd.x), Math.max(transformedBegin.y, transformedEnd.y));
        };
        /**
         * Get the axis associated with the edge
         */
        EdgeArea.prototype.getAxes = function () {
            var e = this._getTransformedEnd().sub(this._getTransformedBegin());
            var edgeNormal = e.normal();
            var axes = [];
            axes.push(edgeNormal);
            axes.push(edgeNormal.negate());
            axes.push(edgeNormal.normal());
            axes.push(edgeNormal.normal().negate());
            return axes;
        };
        /**
         * Get the moment of inertia for an edge
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        EdgeArea.prototype.getMomentOfInertia = function () {
            var mass = this.body ? this.body.mass : ex.Physics.defaultMass;
            var length = this.end.sub(this.begin).distance() / 2;
            return mass * length * length;
        };
        /**
         * @inheritdoc
         */
        EdgeArea.prototype.recalc = function () {
            // edges don't have any cached data
        };
        /**
         * Project the edge along a specified axis
         */
        EdgeArea.prototype.project = function (axis) {
            var scalars = [];
            var points = [this._getTransformedBegin(), this._getTransformedEnd()];
            var len = points.length;
            for (var i = 0; i < len; i++) {
                scalars.push(points[i].dot(axis));
            }
            return new ex.Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        };
        /* istanbul ignore next */
        EdgeArea.prototype.debugDraw = function (ctx, color) {
            if (color === void 0) { color = ex.Color.Red.clone(); }
            ctx.strokeStyle = color.toString();
            ctx.beginPath();
            ctx.moveTo(this.begin.x, this.begin.y);
            ctx.lineTo(this.end.x, this.end.y);
            ctx.closePath();
            ctx.stroke();
        };
        return EdgeArea;
    }());
    ex.EdgeArea = EdgeArea;
})(ex || (ex = {}));
/// <reference path="CollisionJumpTable.ts" />
/// <reference path="CircleArea.ts" />
/// <reference path="EdgeArea.ts" />
var ex;
(function (ex) {
    /**
     * Polygon collision area for detecting collisions for actors, or independently
     */
    var PolygonArea = (function () {
        function PolygonArea(options) {
            this._transformedPoints = [];
            this._axes = [];
            this._sides = [];
            this.pos = options.pos || ex.Vector.Zero.clone();
            var winding = !!options.clockwiseWinding;
            this.points = (winding ? options.points.reverse() : options.points) || [];
            this.body = options.body || null;
            // calculate initial transformation
            this._calculateTransformation();
        }
        /**
         * Get the center of the collision area in world coordinates
         */
        PolygonArea.prototype.getCenter = function () {
            if (this.body) {
                return this.body.pos.add(this.pos);
            }
            return this.pos;
        };
        /**
         * Calculates the underlying transformation from the body relative space to world space
         */
        PolygonArea.prototype._calculateTransformation = function () {
            var pos = this.body ? this.body.pos.add(this.pos) : this.pos;
            var angle = this.body ? this.body.rotation : 0;
            var len = this.points.length;
            this._transformedPoints.length = 0; // clear out old transform
            for (var i = 0; i < len; i++) {
                this._transformedPoints[i] = this.points[i].rotate(angle).add(pos);
            }
        };
        /**
         * Gets the points that make up the polygon in world space, from actor relative space (if specified)
         */
        PolygonArea.prototype.getTransformedPoints = function () {
            if (!this._transformedPoints.length) {
                this._calculateTransformation();
            }
            ;
            return this._transformedPoints;
        };
        /**
         * Gets the sides of the polygon in world space
         */
        PolygonArea.prototype.getSides = function () {
            if (this._sides.length) {
                return this._sides;
            }
            var lines = [];
            var points = this.getTransformedPoints();
            var len = points.length;
            for (var i = 0; i < len; i++) {
                lines.push(new ex.Line(points[i], points[(i - 1 + len) % len]));
            }
            this._sides = lines;
            return this._sides;
        };
        PolygonArea.prototype.recalc = function () {
            this._sides.length = 0;
            this._axes.length = 0;
            this._transformedPoints.length = 0;
            this.getTransformedPoints();
            this.getAxes();
            this.getSides();
        };
        /**
         * Tests if a point is contained in this collision area in world space
         */
        PolygonArea.prototype.contains = function (point) {
            // Always cast to the right, as long as we cast in a consitent fixed direction we
            // will be fine
            var testRay = new ex.Ray(point, new ex.Vector(1, 0));
            var intersectCount = this.getSides().reduce(function (accum, side, i, arr) {
                if (testRay.intersect(side) >= 0) {
                    return accum + 1;
                }
                return accum;
            }, 0);
            if (intersectCount % 2 === 0) {
                return false;
            }
            return true;
        };
        /**
         * Returns a collision contact if the 2 collision areas collide, otherwise collide will
         * return null.
         * @param area
         */
        PolygonArea.prototype.collide = function (area) {
            if (area instanceof ex.CircleArea) {
                return ex.CollisionJumpTable.CollideCirclePolygon(area, this);
            }
            else if (area instanceof PolygonArea) {
                return ex.CollisionJumpTable.CollidePolygonPolygon(this, area);
            }
            else if (area instanceof ex.EdgeArea) {
                return ex.CollisionJumpTable.CollidePolygonEdge(this, area);
            }
            else {
                throw new Error("Polygon could not collide with unknown ICollisionArea " + typeof area);
            }
        };
        /**
         * Find the point on the shape furthest in the direction specified
         */
        PolygonArea.prototype.getFurthestPoint = function (direction) {
            var pts = this.getTransformedPoints();
            var furthestPoint = null;
            var maxDistance = -Number.MAX_VALUE;
            for (var i = 0; i < pts.length; i++) {
                var distance = direction.dot(pts[i]);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    furthestPoint = pts[i];
                }
            }
            return furthestPoint;
        };
        /**
         * Get the axis aligned bounding box for the polygon area
         */
        PolygonArea.prototype.getBounds = function () {
            // todo there is a faster way to do this
            var points = this.getTransformedPoints();
            var minX = points.reduce(function (prev, curr) {
                return Math.min(prev, curr.x);
            }, 999999999);
            var maxX = points.reduce(function (prev, curr) {
                return Math.max(prev, curr.x);
            }, -99999999);
            var minY = points.reduce(function (prev, curr) {
                return Math.min(prev, curr.y);
            }, 9999999999);
            var maxY = points.reduce(function (prev, curr) {
                return Math.max(prev, curr.y);
            }, -9999999999);
            return new ex.BoundingBox(minX, minY, maxX, maxY);
        };
        /**
         * Get the moment of inertia for an arbitrary polygon
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        PolygonArea.prototype.getMomentOfInertia = function () {
            var mass = this.body ? this.body.mass : ex.Physics.defaultMass;
            var numerator = 0;
            var denominator = 0;
            for (var i = 0; i < this.points.length; i++) {
                var iplusone = (i + 1) % this.points.length;
                var crossTerm = this.points[iplusone].cross(this.points[i]);
                numerator += crossTerm * (this.points[i].dot(this.points[i]) +
                    this.points[i].dot(this.points[iplusone]) +
                    this.points[iplusone].dot(this.points[iplusone]));
                denominator += crossTerm;
            }
            return (mass / 6) * (numerator / denominator);
        };
        /**
         * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
         */
        PolygonArea.prototype.rayCast = function (ray, max) {
            if (max === void 0) { max = Infinity; }
            // find the minimum contact time greater than 0
            // contact times less than 0 are behind the ray and we don't want those
            var sides = this.getSides();
            var len = sides.length;
            var minContactTime = Number.MAX_VALUE;
            var contactIndex = -1;
            for (var i = 0; i < len; i++) {
                var contactTime = ray.intersect(sides[i]);
                if (contactTime >= 0 && contactTime < minContactTime && contactTime <= max) {
                    minContactTime = contactTime;
                    contactIndex = i;
                }
            }
            // contact was found
            if (contactIndex >= 0) {
                return ray.getPoint(minContactTime);
            }
            // no contact found
            return null;
        };
        /**
         * Get the axis associated with the edge
         */
        PolygonArea.prototype.getAxes = function () {
            if (this._axes.length) {
                return this._axes;
            }
            var axes = [];
            var points = this.getTransformedPoints();
            var len = points.length;
            for (var i = 0; i < len; i++) {
                axes.push(points[i].sub(points[(i + 1) % len]).normal());
            }
            this._axes = axes;
            return this._axes;
        };
        /**
         * Perform Separating Axis test against another polygon, returns null if no overlap in polys
         * Reference http://www.dyn4j.org/2010/01/sat/
         */
        PolygonArea.prototype.testSeparatingAxisTheorem = function (other) {
            var poly1 = this;
            var poly2 = other;
            var axes = poly1.getAxes().concat(poly2.getAxes());
            var minOverlap = Number.MAX_VALUE;
            var minAxis = null;
            var minIndex = -1;
            for (var i = 0; i < axes.length; i++) {
                var proj1 = poly1.project(axes[i]);
                var proj2 = poly2.project(axes[i]);
                var overlap = proj1.getOverlap(proj2);
                if (overlap <= 0) {
                    return null;
                }
                else {
                    if (overlap < minOverlap) {
                        minOverlap = overlap;
                        minAxis = axes[i];
                        minIndex = i;
                    }
                }
            }
            // Sanity check
            if (minIndex === -1) {
                return null;
            }
            return minAxis.normalize().scale(minOverlap);
        };
        /**
         * Project the edges of the polygon along a specified axis
         */
        PolygonArea.prototype.project = function (axis) {
            var scalars = [];
            var points = this.getTransformedPoints();
            var len = points.length;
            var min = Number.MAX_VALUE;
            var max = -Number.MAX_VALUE;
            for (var i = 0; i < len; i++) {
                var scalar = points[i].dot(axis);
                min = Math.min(min, scalar);
                max = Math.max(max, scalar);
            }
            return new ex.Projection(min, max);
        };
        /* istanbul ignore next */
        PolygonArea.prototype.debugDraw = function (ctx, color) {
            if (color === void 0) { color = ex.Color.Red.clone(); }
            ctx.beginPath();
            ctx.strokeStyle = color.toString();
            // Iterate through the supplied points and construct a 'polygon'
            var firstPoint = this.getTransformedPoints()[0];
            ctx.moveTo(firstPoint.x, firstPoint.y);
            this.getTransformedPoints().forEach(function (point, i) {
                ctx.lineTo(point.x, point.y);
            });
            ctx.lineTo(firstPoint.x, firstPoint.y);
            ctx.closePath();
            ctx.stroke();
        };
        return PolygonArea;
    }());
    ex.PolygonArea = PolygonArea;
})(ex || (ex = {}));
/// <reference path="../Events.ts" />
/// <reference path="../Interfaces/IActorTrait.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        var EulerMovement = (function () {
            function EulerMovement() {
            }
            EulerMovement.prototype.update = function (actor, engine, delta) {
                // Update placements based on linear algebra
                var seconds = delta / 1000;
                var totalAcc = actor.acc.clone();
                // Only active vanilla actors are affected by global acceleration
                if (actor.collisionType === ex.CollisionType.Active &&
                    !(actor instanceof ex.UIActor) &&
                    !(actor instanceof ex.Trigger) &&
                    !(actor instanceof ex.Label)) {
                    totalAcc.addEqual(ex.Physics.acc);
                }
                actor.oldVel = actor.vel;
                actor.vel.addEqual(totalAcc.scale(seconds));
                actor.pos.addEqual(actor.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));
                actor.rx += actor.torque * (1.0 / actor.moi) * seconds;
                actor.rotation += actor.rx * seconds;
                actor.scale.x += actor.sx * delta / 1000;
                actor.scale.y += actor.sy * delta / 1000;
            };
            return EulerMovement;
        }());
        Traits.EulerMovement = EulerMovement;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var CullingBox = (function () {
        function CullingBox() {
            this._topLeft = new ex.Vector(0, 0);
            this._topRight = new ex.Vector(0, 0);
            this._bottomLeft = new ex.Vector(0, 0);
            this._bottomRight = new ex.Vector(0, 0);
        }
        CullingBox.prototype.isSpriteOffScreen = function (actor, engine) {
            var drawingWidth = actor.currentDrawing.width;
            var drawingHeight = actor.currentDrawing.height;
            var rotation = actor.rotation;
            var anchor = actor.getCenter();
            var worldPos = actor.getWorldPos();
            this._topLeft.x = worldPos.x - (drawingWidth / 2);
            this._topLeft.y = worldPos.y - (drawingHeight / 2);
            this._topLeft = this._topLeft.rotate(rotation, anchor);
            this._topRight.x = worldPos.x + (drawingWidth / 2);
            this._topRight.y = worldPos.y - (drawingHeight / 2);
            this._topRight = this._topRight.rotate(rotation, anchor);
            this._bottomLeft.x = worldPos.x - (drawingWidth / 2);
            this._bottomLeft.y = worldPos.y + (drawingHeight / 2);
            this._bottomLeft = this._bottomLeft.rotate(rotation, anchor);
            this._bottomRight.x = worldPos.x + (drawingWidth / 2);
            this._bottomRight.y = worldPos.y + (drawingHeight / 2);
            this._bottomRight = this._bottomRight.rotate(rotation, anchor);
            ///
            var topLeftScreen = engine.worldToScreenCoordinates(this._topLeft);
            var topRightScreen = engine.worldToScreenCoordinates(this._topRight);
            var bottomLeftScreen = engine.worldToScreenCoordinates(this._bottomLeft);
            var bottomRightScreen = engine.worldToScreenCoordinates(this._bottomRight);
            this._xCoords = [];
            this._yCoords = [];
            this._xCoords.push(topLeftScreen.x, topRightScreen.x, bottomLeftScreen.x, bottomRightScreen.x);
            this._yCoords.push(topLeftScreen.y, topRightScreen.y, bottomLeftScreen.y, bottomRightScreen.y);
            this._xMin = Math.min.apply(null, this._xCoords);
            this._yMin = Math.min.apply(null, this._yCoords);
            this._xMax = Math.max.apply(null, this._xCoords);
            this._yMax = Math.max.apply(null, this._yCoords);
            var minWorld = engine.screenToWorldCoordinates(new ex.Vector(this._xMin, this._yMin));
            var maxWorld = engine.screenToWorldCoordinates(new ex.Vector(this._xMax, this._yMax));
            this._xMinWorld = minWorld.x;
            this._yMinWorld = minWorld.y;
            this._xMaxWorld = maxWorld.x;
            this._yMaxWorld = maxWorld.y;
            var boundingPoints = [
                new ex.Vector(this._xMin, this._yMin),
                new ex.Vector(this._xMax, this._yMin),
                new ex.Vector(this._xMin, this._yMax),
                new ex.Vector(this._xMax, this._yMax)]; // bottomright
            // sprite can be wider than canvas screen (and still visible within canvas)
            // top or bottom of sprite must be within canvas
            if (boundingPoints[0].x < 0 && boundingPoints[1].x > engine.canvas.clientWidth &&
                (boundingPoints[0].y > 0 || boundingPoints[2].y < engine.canvas.clientHeight)) {
                return false;
            }
            // sprite can be taller than canvas screen (and still visible within canvas)
            // left or right of sprite must be within canvas
            if (boundingPoints[0].y < 0 && boundingPoints[2].y > engine.canvas.clientHeight &&
                (boundingPoints[1].x > 0 || boundingPoints[0].x < engine.canvas.clientWidth)) {
                return false;
            }
            // otherwise if any corner is visible, we're not offscreen
            for (var i = 0; i < boundingPoints.length; i++) {
                if (boundingPoints[i].x > 0 &&
                    boundingPoints[i].y > 0 &&
                    boundingPoints[i].x < engine.canvas.clientWidth &&
                    boundingPoints[i].y < engine.canvas.clientHeight) {
                    return false;
                }
            }
            return true;
        };
        CullingBox.prototype.debugDraw = function (ctx) {
            // bounding rectangle
            ctx.beginPath();
            ctx.strokeStyle = ex.Color.White.toString();
            ctx.rect(this._xMinWorld, this._yMinWorld, this._xMaxWorld - this._xMinWorld, this._yMaxWorld - this._yMinWorld);
            ctx.stroke();
            ctx.fillStyle = ex.Color.Red.toString();
            ctx.beginPath();
            ctx.arc(this._topLeft.x, this._topLeft.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = ex.Color.Green.toString();
            ctx.beginPath();
            ctx.arc(this._topRight.x, this._topRight.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = ex.Color.Blue.toString();
            ctx.beginPath();
            ctx.arc(this._bottomLeft.x, this._bottomLeft.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = ex.Color.Magenta.toString();
            ctx.beginPath();
            ctx.arc(this._bottomRight.x, this._bottomRight.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        };
        return CullingBox;
    }());
    ex.CullingBox = CullingBox;
})(ex || (ex = {}));
/// <reference path="../Interfaces/IActorTrait.ts" />
/// <reference path="../Util/CullingBox.ts" />
/// <reference path="../Actor.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        var OffscreenCulling = (function () {
            function OffscreenCulling() {
                this.cullingBox = new ex.CullingBox();
            }
            OffscreenCulling.prototype.update = function (actor, engine, delta) {
                var eventDispatcher = actor.eventDispatcher;
                var anchor = actor.anchor;
                var globalScale = actor.getGlobalScale();
                var width = globalScale.x * actor.getWidth() / actor.scale.x;
                var height = globalScale.y * actor.getHeight() / actor.scale.y;
                var worldPos = actor.getWorldPos();
                var actorScreenCoords = engine.worldToScreenCoordinates(new ex.Vector(worldPos.x - anchor.x * width, worldPos.y - anchor.y * height));
                var zoom = 1.0;
                if (actor.scene && actor.scene.camera) {
                    zoom = Math.abs(actor.scene.camera.getZoom());
                }
                var isSpriteOffScreen = true;
                if (actor.currentDrawing != null) {
                    isSpriteOffScreen = this.cullingBox.isSpriteOffScreen(actor, engine);
                }
                if (!actor.isOffScreen) {
                    if ((actorScreenCoords.x + width * zoom < 0 ||
                        actorScreenCoords.y + height * zoom < 0 ||
                        actorScreenCoords.x > engine.width ||
                        actorScreenCoords.y > engine.height) &&
                        isSpriteOffScreen) {
                        eventDispatcher.emit('exitviewport', new ex.ExitViewPortEvent());
                        actor.isOffScreen = true;
                    }
                }
                else {
                    if ((actorScreenCoords.x + width * zoom > 0 &&
                        actorScreenCoords.y + height * zoom > 0 &&
                        actorScreenCoords.x < engine.width &&
                        actorScreenCoords.y < engine.height) ||
                        !isSpriteOffScreen) {
                        eventDispatcher.emit('enterviewport', new ex.EnterViewPortEvent());
                        actor.isOffScreen = false;
                    }
                }
            };
            return OffscreenCulling;
        }());
        Traits.OffscreenCulling = OffscreenCulling;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
/// <reference path="../Interfaces/IActorTrait.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        /**
         * Propogates pointer events to the actor
         */
        var CapturePointer = (function () {
            function CapturePointer() {
            }
            CapturePointer.prototype.update = function (actor, engine, delta) {
                if (!actor.enableCapturePointer) {
                    return;
                }
                if (actor.isKilled()) {
                    return;
                }
                engine.input.pointers.propogate(actor);
            };
            return CapturePointer;
        }());
        Traits.CapturePointer = CapturePointer;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
/// <reference path="../Interfaces/IActorTrait.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        var TileMapCollisionDetection = (function () {
            function TileMapCollisionDetection() {
            }
            TileMapCollisionDetection.prototype.update = function (actor, engine, delta) {
                var eventDispatcher = actor.eventDispatcher;
                if (actor.collisionType !== ex.CollisionType.PreventCollision && engine.currentScene && engine.currentScene.tileMaps) {
                    for (var j = 0; j < engine.currentScene.tileMaps.length; j++) {
                        var map = engine.currentScene.tileMaps[j];
                        var intersectMap;
                        var side = ex.Side.None;
                        var max = 2;
                        var hasBounced = false;
                        while (intersectMap = map.collides(actor)) {
                            if (max-- < 0) {
                                break;
                            }
                            side = actor.getSideFromIntersect(intersectMap);
                            eventDispatcher.emit('collision', new ex.CollisionEvent(actor, null, side, intersectMap));
                            if ((actor.collisionType === ex.CollisionType.Active || actor.collisionType === ex.CollisionType.Elastic)) {
                                actor.pos.y += intersectMap.y;
                                actor.pos.x += intersectMap.x;
                                // Naive elastic bounce
                                if (actor.collisionType === ex.CollisionType.Elastic && !hasBounced) {
                                    hasBounced = true;
                                    if (side === ex.Side.Left) {
                                        actor.vel.x = Math.abs(actor.vel.x);
                                    }
                                    else if (side === ex.Side.Right) {
                                        actor.vel.x = -Math.abs(actor.vel.x);
                                    }
                                    else if (side === ex.Side.Top) {
                                        actor.vel.y = Math.abs(actor.vel.y);
                                    }
                                    else if (side === ex.Side.Bottom) {
                                        actor.vel.y = -Math.abs(actor.vel.y);
                                    }
                                }
                            }
                        }
                    }
                }
            };
            return TileMapCollisionDetection;
        }());
        Traits.TileMapCollisionDetection = TileMapCollisionDetection;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * An enum that describes the sides of an Actor for collision
     */
    (function (Side) {
        Side[Side["None"] = 0] = "None";
        Side[Side["Top"] = 1] = "Top";
        Side[Side["Bottom"] = 2] = "Bottom";
        Side[Side["Left"] = 3] = "Left";
        Side[Side["Right"] = 4] = "Right";
    })(ex.Side || (ex.Side = {}));
    var Side = ex.Side;
})(ex || (ex = {}));
/// <reference path="../Algebra.ts"/>
/// <reference path="../Events.ts"/>
/**
 * Utilities
 *
 * Excalibur utilities for math, string manipulation, etc.
 */
var ex;
(function (ex) {
    var Util;
    (function (Util) {
        Util.TwoPI = Math.PI * 2;
        /**
         * Merges one or more objects into a single target object
         *
         * @returns Merged object with properties from other objects
         * @credit https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
         */
        function extend() {
            var extended = {};
            var deep = false;
            var i = 0;
            var length = arguments.length;
            // Check if a deep merge
            if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
                deep = arguments[0];
                i++;
            }
            // Merge the object into the extended object
            var merge = function (obj) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        // If deep merge and property is an object, merge properties
                        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                            extended[prop] = extend(true, extended[prop], obj[prop]);
                        }
                        else {
                            extended[prop] = obj[prop];
                        }
                    }
                }
            };
            // Loop through each object and conduct a merge
            for (; i < length; i++) {
                var obj = arguments[i];
                merge(obj);
            }
            return extended;
        }
        Util.extend = extend;
        function base64Encode(inputStr) {
            var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            var outputStr = '';
            var i = 0;
            while (i < inputStr.length) {
                //all three "& 0xff" added below are there to fix a known bug 
                //with bytes returned by xhr.responseText
                var byte1 = inputStr.charCodeAt(i++) & 0xff;
                var byte2 = inputStr.charCodeAt(i++) & 0xff;
                var byte3 = inputStr.charCodeAt(i++) & 0xff;
                var enc1 = byte1 >> 2;
                var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
                var enc3, enc4;
                if (isNaN(byte2)) {
                    enc3 = enc4 = 64;
                }
                else {
                    enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
                    if (isNaN(byte3)) {
                        enc4 = 64;
                    }
                    else {
                        enc4 = byte3 & 63;
                    }
                }
                outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
            }
            return outputStr;
        }
        Util.base64Encode = base64Encode;
        /**
         * Clamps a value between a min and max inclusive
         */
        function clamp(val, min, max) {
            return Math.min(Math.max(min, val), max);
        }
        Util.clamp = clamp;
        function randomInRange(min, max) {
            return min + Math.random() * (max - min);
        }
        Util.randomInRange = randomInRange;
        function randomIntInRange(min, max) {
            return Math.round(randomInRange(min, max));
        }
        Util.randomIntInRange = randomIntInRange;
        function canonicalizeAngle(angle) {
            var tmpAngle = angle;
            if (angle > this.TwoPI) {
                while (tmpAngle > this.TwoPI) {
                    tmpAngle -= this.TwoPI;
                }
            }
            if (angle < 0) {
                while (tmpAngle < 0) {
                    tmpAngle += this.TwoPI;
                }
            }
            return tmpAngle;
        }
        Util.canonicalizeAngle = canonicalizeAngle;
        function toDegrees(radians) {
            return 180 / Math.PI * radians;
        }
        Util.toDegrees = toDegrees;
        function toRadians(degrees) {
            return degrees / 180 * Math.PI;
        }
        Util.toRadians = toRadians;
        function getPosition(el) {
            var oLeft = 0, oTop = 0;
            var calcOffsetLeft = function (parent) {
                oLeft += parent.offsetLeft;
                if (parent.offsetParent) {
                    calcOffsetLeft(parent.offsetParent);
                }
            };
            var calcOffsetTop = function (parent) {
                oTop += parent.offsetTop;
                if (parent.offsetParent) {
                    calcOffsetTop(parent.offsetParent);
                }
            };
            calcOffsetLeft(el);
            calcOffsetTop(el);
            return new ex.Vector(oLeft, oTop);
        }
        Util.getPosition = getPosition;
        function addItemToArray(item, array) {
            if (array.indexOf(item) === -1) {
                array.push(item);
                return true;
            }
            return false;
        }
        Util.addItemToArray = addItemToArray;
        function removeItemToArray(item, array) {
            var index = -1;
            if ((index = array.indexOf(item)) > -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
        }
        Util.removeItemToArray = removeItemToArray;
        function contains(array, obj) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === obj) {
                    return true;
                }
            }
            return false;
        }
        Util.contains = contains;
        function getOppositeSide(side) {
            if (side === ex.Side.Top) {
                return ex.Side.Bottom;
            }
            if (side === ex.Side.Bottom) {
                return ex.Side.Top;
            }
            if (side === ex.Side.Left) {
                return ex.Side.Right;
            }
            if (side === ex.Side.Right) {
                return ex.Side.Left;
            }
            return ex.Side.None;
        }
        Util.getOppositeSide = getOppositeSide;
        function getSideFromVector(direction) {
            var left = direction.dot(ex.Vector.Left);
            var right = direction.dot(ex.Vector.Right);
            var up = direction.dot(ex.Vector.Up);
            var down = direction.dot(ex.Vector.Down);
            // a very fortran approach
            var directions = [ex.Vector.Left, ex.Vector.Right, ex.Vector.Up, ex.Vector.Down];
            var directionEnum = [ex.Side.Left, ex.Side.Right, ex.Side.Top, ex.Side.Bottom];
            var max = -Number.MAX_VALUE;
            var maxIndex = -1;
            for (var i = 0; i < directions.length; i++) {
                if (directions[i].dot(direction) > max) {
                    max = directions[i].dot(direction);
                    maxIndex = i;
                }
            }
            return directionEnum[maxIndex];
        }
        Util.getSideFromVector = getSideFromVector;
        /**
         * Excalibur's dynamically resizing collection
         */
        var Collection = (function () {
            /**
             * @param initialSize  Initial size of the internal backing array
             */
            function Collection(initialSize) {
                if (initialSize === void 0) { initialSize = Collection.DefaultSize; }
                this._internalArray = null;
                this._endPointer = 0;
                this._internalArray = new Array(initialSize);
            }
            Collection.prototype._resize = function () {
                var newSize = this._internalArray.length * 2;
                var newArray = new Array(newSize);
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    newArray[i] = this._internalArray[i];
                }
                delete this._internalArray;
                this._internalArray = newArray;
            };
            /**
             * Push elements to the end of the collection
             */
            Collection.prototype.push = function (element) {
                if (this._endPointer === this._internalArray.length) {
                    this._resize();
                }
                return this._internalArray[this._endPointer++] = element;
            };
            /**
             * Removes elements from the end of the collection
             */
            Collection.prototype.pop = function () {
                this._endPointer = this._endPointer - 1 < 0 ? 0 : this._endPointer - 1;
                return this._internalArray[this._endPointer];
            };
            /**
             * Returns the count of the collection
             */
            Collection.prototype.count = function () {
                return this._endPointer;
            };
            /**
             * Empties the collection
             */
            Collection.prototype.clear = function () {
                this._endPointer = 0;
            };
            /**
             * Returns the size of the internal backing array
             */
            Collection.prototype.internalSize = function () {
                return this._internalArray.length;
            };
            /**
             * Returns an element at a specific index
             * @param index  Index of element to retrieve
             */
            Collection.prototype.elementAt = function (index) {
                if (index >= this.count()) {
                    return;
                }
                return this._internalArray[index];
            };
            /**
             * Inserts an element at a specific index
             * @param index  Index to insert the element
             * @param value  Element to insert
             */
            Collection.prototype.insert = function (index, value) {
                if (index >= this.count()) {
                    this._resize();
                }
                return this._internalArray[index] = value;
            };
            /**
             * Removes an element at a specific index
             * @param index  Index of element to remove
             */
            Collection.prototype.remove = function (index) {
                var count = this.count();
                if (count === 0) {
                    return;
                }
                // O(n) Shift 
                var removed = this._internalArray[index];
                for (var i = index; i < count; i++) {
                    this._internalArray[i] = this._internalArray[i + 1];
                }
                this._endPointer--;
                return removed;
            };
            /**
             * Removes an element by reference
             * @param element  Element to retrieve
             */
            Collection.prototype.removeElement = function (element) {
                var index = this._internalArray.indexOf(element);
                this.remove(index);
            };
            /**
             * Returns a array representing the collection
             */
            Collection.prototype.toArray = function () {
                return this._internalArray.slice(0, this._endPointer);
            };
            /**
             * Iterate over every element in the collection
             * @param func  Callback to call for each element passing a reference to the element and its index, returned values are ignored
             */
            Collection.prototype.forEach = function (func) {
                var i = 0, count = this.count();
                for (i; i < count; i++) {
                    func.call(this, this._internalArray[i], i);
                }
            };
            /**
             * Mutate every element in the collection
             * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate
             * the collection
             */
            Collection.prototype.map = function (func) {
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    this._internalArray[i] = func.call(this, this._internalArray[i], i);
                }
            };
            /**
             * Default collection size
             */
            Collection.DefaultSize = 200;
            return Collection;
        }());
        Util.Collection = Collection;
    })(Util = ex.Util || (ex.Util = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var clamp = ex.Util.clamp;
    /**
     * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
     * images or parts of images from a [[Texture]] resource to the screen.
     *
     * [[include:Sprites.md]]
     */
    var Sprite = (function () {
        /**
         * @param image   The backing image texture to build the Sprite
         * @param sx      The x position of the sprite
         * @param sy      The y position of the sprite
         * @param swidth  The width of the sprite in pixels
         * @param sheight The height of the sprite in pixels
         */
        function Sprite(image, sx, sy, swidth, sheight) {
            var _this = this;
            this.sx = sx;
            this.sy = sy;
            this.swidth = swidth;
            this.sheight = sheight;
            this.rotation = 0.0;
            this.anchor = new ex.Vector(0.0, 0.0);
            this.scale = new ex.Vector(1, 1);
            this.logger = ex.Logger.getInstance();
            /**
             * Draws the sprite flipped vertically
             */
            this.flipVertical = false;
            /**
             * Draws the sprite flipped horizontally
             */
            this.flipHorizontal = false;
            this.width = 0;
            this.height = 0;
            this.effects = [];
            this.internalImage = new Image();
            this.naturalWidth = 0;
            this.naturalHeight = 0;
            this._spriteCanvas = null;
            this._spriteCtx = null;
            this._pixelData = null;
            this._pixelsLoaded = false;
            this._dirtyEffect = false;
            if (sx < 0 || sy < 0 || swidth < 0 || sheight < 0) {
                this.logger.error('Sprite cannot have any negative dimensions x:', sx, 'y:', sy, 'width:', swidth, 'height:', sheight);
            }
            this._texture = image;
            this._spriteCanvas = document.createElement('canvas');
            this._spriteCanvas.width = swidth;
            this._spriteCanvas.height = sheight;
            this._spriteCtx = this._spriteCanvas.getContext('2d');
            this._texture.loaded.then(function () {
                _this._spriteCanvas.width = _this._spriteCanvas.width || _this._texture.image.naturalWidth;
                _this._spriteCanvas.height = _this._spriteCanvas.height || _this._texture.image.naturalHeight;
                _this._loadPixels();
                _this._dirtyEffect = true;
            }).error(function (e) {
                _this.logger.error('Error loading texture ', _this._texture.path, e);
            });
            this.width = swidth;
            this.height = sheight;
            this.naturalWidth = swidth;
            this.naturalHeight = sheight;
        }
        Sprite.prototype._loadPixels = function () {
            if (this._texture.isLoaded() && !this._pixelsLoaded) {
                var naturalWidth = this._texture.image.naturalWidth || 0;
                var naturalHeight = this._texture.image.naturalHeight || 0;
                if (this.swidth > naturalWidth) {
                    this.logger.warn('The sprite width', this.swidth, 'exceeds the width', naturalWidth, 'of the backing texture', this._texture.path);
                }
                if (this.sheight > naturalHeight) {
                    this.logger.warn('The sprite height', this.sheight, 'exceeds the height', naturalHeight, 'of the backing texture', this._texture.path);
                }
                this._spriteCtx.drawImage(this._texture.image, clamp(this.sx, 0, naturalWidth), clamp(this.sy, 0, naturalHeight), clamp(this.swidth, 0, naturalWidth), clamp(this.sheight, 0, naturalHeight), 0, 0, this.swidth, this.sheight);
                //this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
                this.internalImage.src = this._spriteCanvas.toDataURL('image/png');
                this._pixelsLoaded = true;
            }
        };
        /**
         * Applies the [[Effects.Opacity]] to a sprite, setting the alpha of all pixels to a given value
         */
        Sprite.prototype.opacity = function (value) {
            this.addEffect(new ex.Effects.Opacity(value));
        };
        /**
         * Applies the [[Effects.Grayscale]] to a sprite, removing color information.
         */
        Sprite.prototype.grayscale = function () {
            this.addEffect(new ex.Effects.Grayscale());
        };
        /**
         * Applies the [[Effects.Invert]] to a sprite, inverting the pixel colors.
         */
        Sprite.prototype.invert = function () {
            this.addEffect(new ex.Effects.Invert());
        };
        /**
         * Applies the [[Effects.Fill]] to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        Sprite.prototype.fill = function (color) {
            this.addEffect(new ex.Effects.Fill(color));
        };
        /**
         * Applies the [[Effects.Colorize]] to a sprite, changing the color channels of all pixels to be the average of the original color
         * and the provided color.
         */
        Sprite.prototype.colorize = function (color) {
            this.addEffect(new ex.Effects.Colorize(color));
        };
        /**
         * Applies the [[Effects.Lighten]] to a sprite, changes the lightness of the color according to HSL
         */
        Sprite.prototype.lighten = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Lighten(factor));
        };
        /**
         * Applies the [[Effects.Darken]] to a sprite, changes the darkness of the color according to HSL
         */
        Sprite.prototype.darken = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Darken(factor));
        };
        /**
         * Applies the [[Effects.Saturate]] to a sprite, saturates the color according to HSL
         */
        Sprite.prototype.saturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Saturate(factor));
        };
        /**
         * Applies the [[Effects.Desaturate]] to a sprite, desaturates the color according to HSL
         */
        Sprite.prototype.desaturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Desaturate(factor));
        };
        /**
         * Adds a new [[Effects.ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        Sprite.prototype.addEffect = function (effect) {
            this.effects.push(effect);
            // We must check if the texture and the backing sprite pixels are loaded as well before 
            // an effect can be applied
            if (!this._texture.isLoaded() || !this._pixelsLoaded) {
                this._dirtyEffect = true;
            }
            else {
                this._applyEffects();
            }
        };
        Sprite.prototype.removeEffect = function (param) {
            var indexToRemove = -1;
            if (typeof param === 'number') {
                indexToRemove = param;
            }
            else {
                indexToRemove = this.effects.indexOf(param);
            }
            // bounds check
            if (indexToRemove < 0 || indexToRemove >= this.effects.length) {
                return;
            }
            this.effects.splice(indexToRemove, 1);
            // We must check if the texture and the backing sprite pixels are loaded as well before 
            // an effect can be applied
            if (!this._texture.isLoaded() || !this._pixelsLoaded) {
                this._dirtyEffect = true;
            }
            else {
                this._applyEffects();
            }
        };
        Sprite.prototype._applyEffects = function () {
            var naturalWidth = this._texture.image.naturalWidth || 0;
            var naturalHeight = this._texture.image.naturalHeight || 0;
            this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
            this._spriteCtx.drawImage(this._texture.image, clamp(this.sx, 0, naturalWidth), clamp(this.sy, 0, naturalHeight), clamp(this.swidth, 0, naturalWidth), clamp(this.sheight, 0, naturalHeight), 0, 0, this.swidth, this.sheight);
            this._pixelData = this._spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
            var i = 0, x = 0, y = 0, len = this.effects.length;
            for (i; i < len; i++) {
                y = 0;
                for (y; y < this.sheight; y++) {
                    x = 0;
                    for (x; x < this.swidth; x++) {
                        this.effects[i].updatePixel(x, y, this._pixelData);
                    }
                }
            }
            this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
            this._spriteCtx.putImageData(this._pixelData, 0, 0);
            this.internalImage.src = this._spriteCanvas.toDataURL('image/png');
            this._dirtyEffect = false;
        };
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        Sprite.prototype.clearEffects = function () {
            this.effects.length = 0;
            this._applyEffects();
        };
        /**
         * Resets the internal state of the drawing (if any)
         */
        Sprite.prototype.reset = function () {
            // do nothing
        };
        Sprite.prototype.debugDraw = function (ctx, x, y) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.rotation);
            var scaledSWidth = this.width * this.scale.x;
            var scaledSHeight = this.height * this.scale.y;
            var xpoint = (scaledSWidth) * this.anchor.x;
            var ypoint = (scaledSHeight) * this.anchor.y;
            ctx.strokeStyle = ex.Color.Black;
            ctx.strokeRect(-xpoint, -ypoint, scaledSWidth, scaledSHeight);
            ctx.restore();
        };
        /**
         * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        Sprite.prototype.draw = function (ctx, x, y) {
            if (this._dirtyEffect) {
                this._applyEffects();
            }
            // calculating current dimensions
            this.width = this.naturalWidth * this.scale.x;
            this.height = this.naturalHeight * this.scale.y;
            ctx.save();
            var xpoint = this.width * this.anchor.x;
            var ypoint = this.height * this.anchor.y;
            ctx.translate(x, y);
            ctx.rotate(this.rotation);
            var scaledSWidth = this.swidth * this.scale.x;
            var scaledSHeight = this.sheight * this.scale.y;
            // todo cache flipped sprites
            if (this.flipHorizontal) {
                ctx.translate(scaledSWidth, 0);
                ctx.scale(-1, 1);
            }
            if (this.flipVertical) {
                ctx.translate(0, scaledSHeight);
                ctx.scale(1, -1);
            }
            if (this.internalImage) {
                ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, -xpoint, -ypoint, scaledSWidth, scaledSHeight);
            }
            ctx.restore();
        };
        /**
         * Produces a copy of the current sprite
         */
        Sprite.prototype.clone = function () {
            var result = new Sprite(this._texture, this.sx, this.sy, this.swidth, this.sheight);
            result.scale = this.scale.clone();
            result.rotation = this.rotation;
            result.flipHorizontal = this.flipHorizontal;
            result.flipVertical = this.flipVertical;
            var i = 0, len = this.effects.length;
            for (i; i < len; i++) {
                result.addEffect(this.effects[i]);
            }
            return result;
        };
        return Sprite;
    }());
    ex.Sprite = Sprite;
})(ex || (ex = {}));
/// <reference path="Sprite.ts" />
var ex;
(function (ex) {
    /**
     * Sprite sheets are a useful mechanism for slicing up image resources into
     * separate sprites or for generating in game animations. [[Sprite|Sprites]] are organized
     * in row major order in the [[SpriteSheet]].
     *
     * [[include:SpriteSheets.md]]
     */
    var SpriteSheet = (function () {
        /**
         * @param image     The backing image texture to build the SpriteSheet
         * @param columns   The number of columns in the image texture
         * @param rows      The number of rows in the image texture
         * @param spWidth   The width of each individual sprite in pixels
         * @param spHeight  The height of each individual sprite in pixels
         */
        function SpriteSheet(image, columns, rows, spWidth, spHeight) {
            this.image = image;
            this.columns = columns;
            this.rows = rows;
            this.sprites = [];
            this._internalImage = image.image;
            this.sprites = new Array(columns * rows);
            // TODO: Inspect actual image dimensions with preloading
            /*if(spWidth * columns > this.internalImage.naturalWidth){
               throw new Error("SpriteSheet specified is wider than image width");
            }
   
            if(spHeight * rows > this.internalImage.naturalHeight){
               throw new Error("SpriteSheet specified is higher than image height");
            }*/
            var i = 0;
            var j = 0;
            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    this.sprites[j + i * columns] = new ex.Sprite(this.image, j * spWidth, i * spHeight, spWidth, spHeight);
                }
            }
        }
        /**
         * Create an animation from the this SpriteSheet by listing out the
         * sprite indices. Sprites are organized in row major order in the SpriteSheet.
         * @param engine   Reference to the current game [[Engine]]
         * @param indices  An array of sprite indices to use in the animation
         * @param speed    The number in milliseconds to display each frame in the animation
         */
        SpriteSheet.prototype.getAnimationByIndices = function (engine, indices, speed) {
            var _this = this;
            var images = indices.map(function (index) {
                return _this.sprites[index];
            });
            images = images.map(function (i) {
                return i.clone();
            });
            return new ex.Animation(engine, images, speed);
        };
        /**
         * Create an animation from the this SpriteSheet by specifing the range of
         * images with the beginning and ending index
         * @param engine      Reference to the current game Engine
         * @param beginIndex  The index to start taking frames
         * @param endIndex    The index to stop taking frames
         * @param speed       The number in milliseconds to display each frame in the animation
         */
        SpriteSheet.prototype.getAnimationBetween = function (engine, beginIndex, endIndex, speed) {
            var images = this.sprites.slice(beginIndex, endIndex);
            images = images.map(function (i) {
                return i.clone();
            });
            return new ex.Animation(engine, images, speed);
        };
        /**
         * Treat the entire SpriteSheet as one animation, organizing the frames in
         * row major order.
         * @param engine  Reference to the current game [[Engine]]
         * @param speed   The number in milliseconds to display each frame the animation
         */
        SpriteSheet.prototype.getAnimationForAll = function (engine, speed) {
            var sprites = this.sprites.map(function (i) {
                return i.clone();
            });
            return new ex.Animation(engine, sprites, speed);
        };
        /**
         * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
         * in row major order in the SpriteSheet.
         * @param index  The index of the sprite
         */
        SpriteSheet.prototype.getSprite = function (index) {
            if (index >= 0 && index < this.sprites.length) {
                return this.sprites[index];
            }
        };
        return SpriteSheet;
    }());
    ex.SpriteSheet = SpriteSheet;
    /**
     * Sprite fonts are a used in conjunction with a [[Label]] to specify
     * a particular bitmap as a font. Note that some font features are not
     * supported by Sprite fonts.
     *
     * [[include:SpriteFonts.md]]
     */
    var SpriteFont = (function (_super) {
        __extends(SpriteFont, _super);
        /**
         * @param image           The backing image texture to build the SpriteFont
         * @param alphabet        A string representing all the characters in the image, in row major order.
         * @param caseInsensitive  Indicate whether this font takes case into account
         * @param columns         The number of columns of characters in the image
         * @param rows            The number of rows of characters in the image
         * @param spWidth         The width of each character in pixels
         * @param spHeight        The height of each character in pixels
         */
        function SpriteFont(image, alphabet, caseInsensitive, columns, rows, spWidth, spHeight) {
            _super.call(this, image, columns, rows, spWidth, spHeight);
            this.image = image;
            this.alphabet = alphabet;
            this.caseInsensitive = caseInsensitive;
            this.spWidth = spWidth;
            this.spHeight = spHeight;
            this._spriteLookup = {};
            this._colorLookup = {};
            this._currentColor = ex.Color.Black.clone();
            this._currentOpacity = 1.0;
            this._sprites = {};
            // text shadow
            this._textShadowOn = false;
            this._textShadowDirty = true;
            this._textShadowColor = ex.Color.Black.clone();
            this._textShadowSprites = {};
            this._shadowOffsetX = 5;
            this._shadowOffsetY = 5;
            this._sprites = this.getTextSprites();
        }
        /**
         * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
         */
        SpriteFont.prototype.getTextSprites = function () {
            var lookup = {};
            for (var i = 0; i < this.alphabet.length; i++) {
                var char = this.alphabet[i];
                if (this.caseInsensitive) {
                    char = char.toLowerCase();
                }
                lookup[char] = this.sprites[i].clone();
            }
            return lookup;
        };
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixels to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        SpriteFont.prototype.setTextShadow = function (offsetX, offsetY, shadowColor) {
            this._textShadowOn = true;
            this._shadowOffsetX = offsetX;
            this._shadowOffsetY = offsetY;
            this._textShadowColor = shadowColor.clone();
            this._textShadowDirty = true;
            for (var character in this._sprites) {
                this._textShadowSprites[character] = this._sprites[character].clone();
            }
        };
        /**
         * Toggles text shadows on or off
         */
        SpriteFont.prototype.useTextShadow = function (on) {
            this._textShadowOn = on;
            if (on) {
                this.setTextShadow(5, 5, this._textShadowColor);
            }
        };
        /**
         * Draws the current sprite font
         */
        SpriteFont.prototype.draw = function (ctx, text, x, y, options) {
            options = this._parseOptions(options);
            if (this._currentColor.toString() !== options.color.toString() || this._currentOpacity !== options.opacity) {
                this._currentOpacity = options.opacity;
                this._currentColor = options.color;
                for (var char in this._sprites) {
                    this._sprites[char].clearEffects();
                    this._sprites[char].fill(options.color);
                    this._sprites[char].opacity(options.opacity);
                }
            }
            if (this._textShadowOn && this._textShadowDirty && this._textShadowColor) {
                for (var characterShadow in this._textShadowSprites) {
                    this._textShadowSprites[characterShadow].clearEffects();
                    this._textShadowSprites[characterShadow].addEffect(new ex.Effects.Fill(this._textShadowColor.clone()));
                }
                this._textShadowDirty = false;
            }
            // find the current length of text in pixels
            var sprite = this.sprites[0];
            // find the current height fo the text in pixels
            var height = sprite.sheight;
            // calculate appropriate scale for font size
            var scale = options.fontSize / height;
            var length = (text.length * sprite.swidth * scale) + (text.length * options.letterSpacing);
            var currX = x;
            if (options.textAlign === ex.TextAlign.Left || options.textAlign === ex.TextAlign.Start) {
                currX = x;
            }
            else if (options.textAlign === ex.TextAlign.Right || options.textAlign === ex.TextAlign.End) {
                currX = x - length;
            }
            else if (options.textAlign === ex.TextAlign.Center) {
                currX = x - length / 2;
            }
            var currY = y - height * scale;
            if (options.baseAlign === ex.BaseAlign.Top || options.baseAlign === ex.BaseAlign.Hanging) {
                currY = y;
            }
            else if (options.baseAlign === ex.BaseAlign.Ideographic ||
                options.baseAlign === ex.BaseAlign.Bottom ||
                options.baseAlign === ex.BaseAlign.Alphabetic) {
                currY = y - height * scale;
            }
            else if (options.baseAlign === ex.BaseAlign.Middle) {
                currY = y - (height * scale) / 2;
            }
            for (var i = 0; i < text.length; i++) {
                var character = text[i];
                if (this.caseInsensitive) {
                    character = character.toLowerCase();
                }
                try {
                    // if text shadow
                    if (this._textShadowOn) {
                        this._textShadowSprites[character].scale.x = scale;
                        this._textShadowSprites[character].scale.y = scale;
                        this._textShadowSprites[character].draw(ctx, currX + this._shadowOffsetX, currY + this._shadowOffsetY);
                    }
                    var charSprite = this._sprites[character];
                    charSprite.scale.x = scale;
                    charSprite.scale.y = scale;
                    charSprite.draw(ctx, currX, currY);
                    currX += (charSprite.width + options.letterSpacing);
                }
                catch (e) {
                    ex.Logger.getInstance().error("SpriteFont Error drawing char " + character);
                }
            }
        };
        SpriteFont.prototype._parseOptions = function (options) {
            return {
                fontSize: options.fontSize || 10,
                letterSpacing: options.letterSpacing || 0,
                color: options.color || ex.Color.Black.clone(),
                textAlign: typeof options.textAlign === undefined ? ex.TextAlign.Left : options.textAlign,
                baseAlign: typeof options.baseAlign === undefined ? ex.BaseAlign.Bottom : options.baseAlign,
                maxWidth: options.maxWidth || -1,
                opacity: options.opacity || 0
            };
        };
        return SpriteFont;
    }(SpriteSheet));
    ex.SpriteFont = SpriteFont;
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="Drawing/SpriteSheet.ts" />
var ex;
(function (ex) {
    /**
     * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
     * without the overhead of actors.
     *
     * [[include:TileMaps.md]]
     */
    var TileMap = (function () {
        /**
         * @param x             The x coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
         * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
         * @param rows          The number of rows in the TileMap (should not be changed once set)
         * @param cols          The number of cols in the TileMap (should not be changed once set)
         */
        function TileMap(x, y, cellWidth, cellHeight, rows, cols) {
            var _this = this;
            this.x = x;
            this.y = y;
            this.cellWidth = cellWidth;
            this.cellHeight = cellHeight;
            this.rows = rows;
            this.cols = cols;
            this._collidingX = -1;
            this._collidingY = -1;
            this._onScreenXStart = 0;
            this._onScreenXEnd = 9999;
            this._onScreenYStart = 0;
            this._onScreenYEnd = 9999;
            this._spriteSheets = {};
            this.logger = ex.Logger.getInstance();
            this.data = [];
            this.data = new Array(rows * cols);
            for (var i = 0; i < cols; i++) {
                for (var j = 0; j < rows; j++) {
                    (function () {
                        var cd = new Cell(i * cellWidth + x, j * cellHeight + y, cellWidth, cellHeight, i + j * cols);
                        _this.data[i + j * cols] = cd;
                    })();
                }
            }
        }
        TileMap.prototype.registerSpriteSheet = function (key, spriteSheet) {
            this._spriteSheets[key] = spriteSheet;
        };
        /**
         * Returns the intersection vector that can be used to resolve collisions with actors. If there
         * is no collision null is returned.
         */
        TileMap.prototype.collides = function (actor) {
            var points = [];
            var width = actor.pos.x + actor.getWidth();
            var height = actor.pos.y + actor.getHeight();
            var actorBounds = actor.getBounds();
            var overlaps = [];
            // trace points for overlap
            for (var x = actorBounds.left; x <= width; x += Math.min(actor.getWidth() / 2, this.cellWidth / 2)) {
                for (var y = actorBounds.top; y <= height; y += Math.min(actor.getHeight() / 2, this.cellHeight / 2)) {
                    var cell = this.getCellByPoint(x, y);
                    if (cell && cell.solid) {
                        var overlap = actorBounds.collides(cell.getBounds());
                        var dir = actor.getCenter().sub(cell.getCenter());
                        if (overlap && overlap.dot(dir) > 0) {
                            overlaps.push(overlap);
                        }
                    }
                }
            }
            if (overlaps.length === 0) {
                return null;
            }
            // Return the smallest change other than zero
            var result = overlaps.reduce(function (accum, next) {
                var x = accum.x;
                var y = accum.y;
                if (Math.abs(accum.x) < Math.abs(next.x)) {
                    x = next.x;
                }
                if (Math.abs(accum.y) < Math.abs(next.y)) {
                    y = next.y;
                }
                return new ex.Vector(x, y);
            });
            return result;
        };
        /**
         * Returns the [[Cell]] by index (row major order)
         */
        TileMap.prototype.getCellByIndex = function (index) {
            return this.data[index];
        };
        /**
         * Returns the [[Cell]] by its x and y coordinates
         */
        TileMap.prototype.getCell = function (x, y) {
            if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
                return null;
            }
            return this.data[x + y * this.cols];
        };
        /**
         * Returns the [[Cell]] by testing a point in global coordinates,
         * returns `null` if no cell was found.
         */
        TileMap.prototype.getCellByPoint = function (x, y) {
            x = Math.floor((x - this.x) / this.cellWidth);
            y = Math.floor((y - this.y) / this.cellHeight);
            var cell = this.getCell(x, y);
            if (x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell) {
                return cell;
            }
            return null;
        };
        TileMap.prototype.update = function (engine, delta) {
            var worldCoordsUpperLeft = engine.screenToWorldCoordinates(new ex.Vector(0, 0));
            var worldCoordsLowerRight = engine.screenToWorldCoordinates(new ex.Vector(engine.canvas.clientWidth, engine.canvas.clientHeight));
            this._onScreenXStart = Math.max(Math.floor(worldCoordsUpperLeft.x / this.cellWidth) - 2, 0);
            this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2, 0);
            this._onScreenXEnd = Math.max(Math.floor(worldCoordsLowerRight.x / this.cellWidth) + 2, 0);
            this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2, 0);
        };
        /**
         * Draws the tile map to the screen. Called by the [[Scene]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        TileMap.prototype.draw = function (ctx, delta) {
            ctx.save();
            ctx.translate(this.x, this.y);
            var x = this._onScreenXStart, xEnd = Math.min(this._onScreenXEnd, this.cols);
            var y = this._onScreenYStart, yEnd = Math.min(this._onScreenYEnd, this.rows);
            var cs, csi, cslen;
            for (x; x < xEnd; x++) {
                for (y; y < yEnd; y++) {
                    // get non-negative tile sprites
                    cs = this.getCell(x, y).sprites.filter(function (s) {
                        return s.spriteId > -1;
                    });
                    for (csi = 0, cslen = cs.length; csi < cslen; csi++) {
                        var ss = this._spriteSheets[cs[csi].spriteSheetKey];
                        // draw sprite, warning if sprite doesn't exist
                        if (ss) {
                            var sprite = ss.getSprite(cs[csi].spriteId);
                            if (sprite) {
                                sprite.draw(ctx, x * this.cellWidth, y * this.cellHeight);
                            }
                            else {
                                this.logger.warn('Sprite does not exist for id', cs[csi].spriteId, 'in sprite sheet', cs[csi].spriteSheetKey, sprite, ss);
                            }
                        }
                        else {
                            this.logger.warn('Sprite sheet', cs[csi].spriteSheetKey, 'does not exist', ss);
                        }
                    }
                }
                y = this._onScreenYStart;
            }
            ctx.restore();
        };
        /**
         * Draws all the tile map's debug info. Called by the [[Scene]].
         * @param ctx  The current rendering context
         */
        TileMap.prototype.debugDraw = function (ctx) {
            var width = this.cols * this.cellWidth;
            var height = this.rows * this.cellHeight;
            ctx.save();
            ctx.strokeStyle = ex.Color.Red.toString();
            for (var x = 0; x < this.cols + 1; x++) {
                ctx.beginPath();
                ctx.moveTo(this.x + x * this.cellWidth, this.y);
                ctx.lineTo(this.x + x * this.cellWidth, this.y + height);
                ctx.stroke();
            }
            for (var y = 0; y < this.rows + 1; y++) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + y * this.cellHeight);
                ctx.lineTo(this.x + width, this.y + y * this.cellHeight);
                ctx.stroke();
            }
            var solid = ex.Color.Red.clone();
            solid.a = .3;
            this.data.filter(function (cell) {
                return cell.solid;
            }).forEach(function (cell) {
                ctx.fillStyle = solid.toString();
                ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
            });
            if (this._collidingY > -1 && this._collidingX > -1) {
                ctx.fillStyle = ex.Color.Cyan.toString();
                ctx.fillRect(this.x + this._collidingX * this.cellWidth, this.y + this._collidingY * this.cellHeight, this.cellWidth, this.cellHeight);
            }
            ctx.restore();
        };
        return TileMap;
    }());
    ex.TileMap = TileMap;
    /**
     * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
     */
    var TileSprite = (function () {
        /**
         * @param spriteSheetKey  The key of the spritesheet to use
         * @param spriteId        The index of the sprite in the [[SpriteSheet]]
         */
        function TileSprite(spriteSheetKey, spriteId) {
            this.spriteSheetKey = spriteSheetKey;
            this.spriteId = spriteId;
        }
        return TileSprite;
    }());
    ex.TileSprite = TileSprite;
    /**
     * TileMap Cell
     *
     * A light-weight object that occupies a space in a collision map. Generally
     * created by a [[TileMap]].
     *
     * Cells can draw multiple sprites. Note that the order of drawing is the order
     * of the sprites in the array so the last one will be drawn on top. You can
     * use transparency to create layers this way.
     */
    var Cell = (function () {
        /**
         * @param x       Gets or sets x coordinate of the cell in world coordinates
         * @param y       Gets or sets y coordinate of the cell in world coordinates
         * @param width   Gets or sets the width of the cell
         * @param height  Gets or sets the height of the cell
         * @param index   The index of the cell in row major order
         * @param solid   Gets or sets whether this cell is solid
         * @param sprites The list of tile sprites to use to draw in this cell (in order)
         */
        function Cell(x, y, width, height, index, solid, sprites) {
            if (solid === void 0) { solid = false; }
            if (sprites === void 0) { sprites = []; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.index = index;
            this.solid = solid;
            this.sprites = sprites;
            this._bounds = new ex.BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
        }
        /**
         * Returns the bounding box for this cell
         */
        Cell.prototype.getBounds = function () {
            return this._bounds;
        };
        /**
         * Gets the center coordinate of this cell
         */
        Cell.prototype.getCenter = function () {
            return new ex.Vector(this.x + this.width / 2, this.y + this.height / 2);
        };
        /**
         * Add another [[TileSprite]] to this cell
         */
        Cell.prototype.pushSprite = function (tileSprite) {
            this.sprites.push(tileSprite);
        };
        /**
         * Remove an instance of [[TileSprite]] from this cell
         */
        Cell.prototype.removeSprite = function (tileSprite) {
            var index = -1;
            if ((index = this.sprites.indexOf(tileSprite)) > -1) {
                this.sprites.splice(index, 1);
            }
        };
        /**
         * Clear all sprites from this cell
         */
        Cell.prototype.clearSprites = function () {
            this.sprites.length = 0;
        };
        return Cell;
    }());
    ex.Cell = Cell;
})(ex || (ex = {}));
/// <reference path="../Algebra.ts" />
var ex;
(function (ex) {
    /**
     * Axis Aligned collision primitive for Excalibur.
     */
    var BoundingBox = (function () {
        /**
         * @param left    x coordinate of the left edge
         * @param top     y coordinate of the top edge
         * @param right   x coordinate of the right edge
         * @param bottom  y coordinate of the bottom edge
         */
        function BoundingBox(left, top, right, bottom) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            if (right === void 0) { right = 0; }
            if (bottom === void 0) { bottom = 0; }
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
        BoundingBox.fromPoints = function (points) {
            var minX = Infinity;
            var minY = Infinity;
            var maxX = -Infinity;
            var maxY = -Infinity;
            for (var i = 0; i < points.length; i++) {
                if (points[i].x < minX) {
                    minX = points[i].x;
                }
                if (points[i].x > maxX) {
                    maxX = points[i].x;
                }
                if (points[i].y < minY) {
                    minY = points[i].y;
                }
                if (points[i].y > maxY) {
                    maxY = points[i].y;
                }
            }
            return new BoundingBox(minX, minY, maxX, maxY);
        };
        /**
         * Returns the calculated width of the bounding box
         */
        BoundingBox.prototype.getWidth = function () {
            return this.right - this.left;
        };
        /**
         * Returns the calculated height of the bounding box
         */
        BoundingBox.prototype.getHeight = function () {
            return this.bottom - this.top;
        };
        /**
         * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default
         */
        BoundingBox.prototype.rotate = function (angle, point) {
            if (point === void 0) { point = ex.Vector.Zero.clone(); }
            var points = this.getPoints().map(function (p) { return p.rotate(angle, point); });
            return BoundingBox.fromPoints(points);
        };
        /**
         * Returns the perimeter of the bounding box
         */
        BoundingBox.prototype.getPerimeter = function () {
            var wx = this.getWidth();
            var wy = this.getHeight();
            return 2 * (wx + wy);
        };
        BoundingBox.prototype.getPoints = function () {
            var results = [];
            results.push(new ex.Vector(this.left, this.top));
            results.push(new ex.Vector(this.right, this.top));
            results.push(new ex.Vector(this.right, this.bottom));
            results.push(new ex.Vector(this.left, this.bottom));
            return results;
        };
        /**
         * Creates a Polygon collision area from the points of the bounding box
         */
        BoundingBox.prototype.toPolygon = function (actor) {
            return new ex.PolygonArea({
                body: actor ? actor.body : null,
                points: this.getPoints(),
                pos: ex.Vector.Zero.clone()
            });
        };
        /**
         * Determines whether a ray intersects with a bounding box
         */
        BoundingBox.prototype.rayCast = function (ray, farClipDistance) {
            if (farClipDistance === void 0) { farClipDistance = Infinity; }
            // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/ 
            var tmin = -Infinity;
            var tmax = +Infinity;
            if (ray.dir.x !== 0) {
                var tx1 = (this.left - ray.pos.x) / ray.dir.x;
                var tx2 = (this.right - ray.pos.x) / ray.dir.x;
                tmin = Math.max(tmin, Math.min(tx1, tx2));
                tmax = Math.min(tmax, Math.max(tx1, tx2));
            }
            if (ray.dir.y !== 0) {
                var ty1 = (this.top - ray.pos.y) / ray.dir.y;
                var ty2 = (this.bottom - ray.pos.y) / ray.dir.y;
                tmin = Math.max(tmin, Math.min(ty1, ty2));
                tmax = Math.min(tmax, Math.max(ty1, ty2));
            }
            return tmax >= Math.max(0, tmin) && tmin < farClipDistance;
        };
        BoundingBox.prototype.contains = function (val) {
            if (val instanceof ex.Vector) {
                return (this.left <= val.x && this.top <= val.y && this.bottom >= val.y && this.right >= val.x);
            }
            else if (val instanceof BoundingBox) {
                if (this.left < val.left &&
                    this.top < val.top &&
                    val.bottom < this.bottom &&
                    val.right < this.right) {
                    return true;
                }
                return false;
            }
            return false;
        };
        /**
         * Combines this bounding box and another together returning a new bounding box
         * @param other  The bounding box to combine
         */
        BoundingBox.prototype.combine = function (other) {
            var compositeBB = new BoundingBox(Math.min(this.left, other.left), Math.min(this.top, other.top), Math.max(this.right, other.right), Math.max(this.bottom, other.bottom));
            return compositeBB;
        };
        /**
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resolve the collision. If there
         * is no collision null is returned.
         * @param collidable  Other collidable to test
         */
        BoundingBox.prototype.collides = function (collidable) {
            if (collidable instanceof BoundingBox) {
                var other = collidable;
                var totalBoundingBox = this.combine(other);
                // If the total bounding box is less than the sum of the 2 bounds then there is collision
                if (totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() &&
                    totalBoundingBox.getHeight() < other.getHeight() + this.getHeight()) {
                    // collision
                    var overlapX = 0;
                    if (this.right >= other.left && this.right <= other.right) {
                        overlapX = other.left - this.right;
                    }
                    else {
                        overlapX = other.right - this.left;
                    }
                    var overlapY = 0;
                    if (this.top <= other.bottom && this.top >= other.top) {
                        overlapY = other.bottom - this.top;
                    }
                    else {
                        overlapY = other.top - this.bottom;
                    }
                    if (Math.abs(overlapX) < Math.abs(overlapY)) {
                        return new ex.Vector(overlapX, 0);
                    }
                    else {
                        return new ex.Vector(0, overlapY);
                    }
                }
                else {
                    return null;
                }
            }
            return null;
        };
        /* istanbul ignore next */
        BoundingBox.prototype.debugDraw = function (ctx, color) {
            if (color === void 0) { color = ex.Color.Yellow; }
            ctx.strokeStyle = color.toString();
            ctx.strokeRect(this.left, this.top, this.getWidth(), this.getHeight());
        };
        return BoundingBox;
    }());
    ex.BoundingBox = BoundingBox;
})(ex || (ex = {}));
/// <reference path="../Algebra.ts" />
var ex;
(function (ex) {
    var Body = (function () {
        /**
         * Constructs a new physics body associated with an actor
         */
        function Body(actor) {
            this.actor = actor;
            /**
             * [ICollisionArea|Collision area] of this physics body, defines the shape for rigid body collision
             */
            this.collisionArea = null;
            /**
             * The (x, y) position of the actor this will be in the middle of the actor if the [[anchor]] is set to (0.5, 0.5) which is default.
             * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
             */
            this.pos = new ex.Vector(0, 0);
            /**
             * The position of the actor last frame (x, y) in pixels
             */
            this.oldPos = new ex.Vector(0, 0);
            /**
             * The current velocity vector (vx, vy) of the actor in pixels/second
             */
            this.vel = new ex.Vector(0, 0);
            /**
             * The velocity of the actor last frame (vx, vy) in pixels/second
             */
            this.oldVel = new ex.Vector(0, 0);
            /**
             * The curret acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
             * be useful to simulate a gravitational effect.
             */
            this.acc = new ex.Vector(0, 0);
            /**
             * The current torque applied to the actor
             */
            this.torque = 0;
            /**
             * The current mass of the actor, mass can be thought of as the resistance to acceleration.
             */
            this.mass = 1.0;
            /**
             * The current moment of inertia, moi can be thought of as the resistance to rotation.
             */
            this.moi = 1000;
            /**
             * The current "motion" of the actor, used to calculated sleep in the physics simulation
             */
            this.motion = 10;
            /**
             * The coefficient of friction on this actor
             */
            this.friction = .99;
            /**
             * The coefficient of restitution of this actor, represents the amount of energy preserved after collision
             */
            this.restitution = .2;
            /**
             * The rotation of the actor in radians
             */
            this.rotation = 0; // radians
            /**
             * The rotational velocity of the actor in radians/second
             */
            this.rx = 0; //radians/sec
            this._totalMtv = ex.Vector.Zero.clone();
        }
        /**
         * Add minimum translation vectors accumulated during the current frame to resolve collisions.
         */
        Body.prototype.addMtv = function (mtv) {
            this._totalMtv.addEqual(mtv);
        };
        /**
         * Applies the accumulated translation vectors to the actors position
         */
        Body.prototype.applyMtv = function () {
            this.pos.addEqual(this._totalMtv);
            this._totalMtv.setTo(0, 0);
        };
        /**
         * Returns the body's [[BoundingBox]] calculated for this instant in world space.
         */
        Body.prototype.getBounds = function () {
            if (ex.Physics.collisionResolutionStrategy === ex.CollisionResolutionStrategy.Box) {
                return this.actor.getBounds();
            }
            else {
                return this.collisionArea.getBounds();
            }
        };
        /**
         * Returns the actor's [[BoundingBox]] relative to the actors position.
         */
        Body.prototype.getRelativeBounds = function () {
            if (ex.Physics.collisionResolutionStrategy === ex.CollisionResolutionStrategy.Box) {
                return this.actor.getRelativeBounds();
            }
            else {
                return this.actor.getRelativeBounds();
            }
        };
        /**
         * Updates the collision area geometry and internal caches
         */
        Body.prototype.update = function () {
            if (this.collisionArea) {
                this.collisionArea.recalc();
            }
        };
        /**
         * Sets up a box collision area based on the current bounds of the associated actor of this physics body.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        Body.prototype.useBoxCollision = function (center) {
            if (center === void 0) { center = ex.Vector.Zero.clone(); }
            this.collisionArea = new ex.PolygonArea({
                body: this,
                points: this.actor.getRelativeBounds().getPoints(),
                pos: center // position relative to actor
            });
            // in case of a nan moi, coalesce to a safe default
            this.moi = this.collisionArea.getMomentOfInertia() || this.moi;
        };
        /**
         * Sets up a polygon collision area based on a list of of points relative to the anchor of the associated actor of this physics body.
         *
         * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        Body.prototype.usePolygonCollision = function (points, center) {
            if (center === void 0) { center = ex.Vector.Zero.clone(); }
            this.collisionArea = new ex.PolygonArea({
                body: this,
                points: points,
                pos: center // position relative to actor
            });
            // in case of a nan moi, collesce to a safe default
            this.moi = this.collisionArea.getMomentOfInertia() || this.moi;
        };
        /**
         * Sets up a [[CircleArea|circle collision area]] with a specified radius in pixels.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        Body.prototype.useCircleCollision = function (radius, center) {
            if (center === void 0) { center = ex.Vector.Zero.clone(); }
            if (!radius) {
                radius = this.actor.getWidth() / 2;
            }
            this.collisionArea = new ex.CircleArea({
                body: this,
                radius: radius,
                pos: center
            });
            this.moi = this.collisionArea.getMomentOfInertia() || this.moi;
        };
        /**
         * Sets up an [[EdgeArea|edge collision]] with a start point and an end point relative to the anchor of the associated actor
         * of this physics body.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        Body.prototype.useEdgeCollision = function (begin, end, center) {
            if (center === void 0) { center = ex.Vector.Zero.clone(); }
            this.collisionArea = new ex.EdgeArea({
                begin: begin,
                end: end,
                body: this
            });
            this.moi = this.collisionArea.getMomentOfInertia() || this.moi;
        };
        /* istanbul ignore next */
        Body.prototype.debugDraw = function (ctx) {
            // Draw motion vectors
            if (ex.Physics.showMotionVectors) {
                ex.Util.DrawUtil.vector(ctx, ex.Color.Yellow, this.pos, (this.acc.add(ex.Physics.acc)));
                ex.Util.DrawUtil.vector(ctx, ex.Color.Red, this.pos, (this.vel));
                ex.Util.DrawUtil.point(ctx, ex.Color.Red, this.pos);
            }
            if (ex.Physics.showBounds) {
                this.getBounds().debugDraw(ctx, ex.Color.Yellow);
            }
            if (ex.Physics.showArea) {
                this.collisionArea.debugDraw(ctx, ex.Color.Green);
            }
        };
        return Body;
    }());
    ex.Body = Body;
})(ex || (ex = {}));
/// <reference path="Events.ts" />
/// <reference path="Interfaces/IEvented.ts" />
var ex;
(function (ex) {
    /**
     * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
     * and extending abilities for vanilla Javascript projects
     */
    var Class = (function () {
        function Class() {
            this.eventDispatcher = new ex.EventDispatcher(this);
        }
        /**
         * Alias for `addEventListener`. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        Class.prototype.on = function (eventName, handler) {
            this.eventDispatcher.on(eventName, handler);
        };
        /**
         * Alias for `removeEventListener`. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified only that handler will be removed.
         *
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        Class.prototype.off = function (eventName, handler) {
            this.eventDispatcher.off(eventName, handler);
        };
        /**
         * Emits a new event
         * @param eventName   Name of the event to emit
         * @param eventObject Data associated with this event
         */
        Class.prototype.emit = function (eventName, eventObject) {
            this.eventDispatcher.emit(eventName, eventObject);
        };
        /**
         * You may wish to extend native Excalibur functionality in vanilla Javascript.
         * Any method on a class inheriting [[Class]] may be extended to support
         * additional functionality. In the example below we create a new type called `MyActor`.
         *
         *
         * ```js
         * var MyActor = Actor.extend({
         *
         *    constructor: function() {
         *       this.newprop = 'something';
         *       Actor.apply(this, arguments);
         *    },
         *
         *    update: function(engine, delta) {
         *       // Implement custom update
         *       // Call super constructor update
         *       Actor.prototype.update.call(this, engine, delta);
         *
         *       console.log("Something cool!");
         *    }
         * });
         *
         * var myActor = new MyActor(100, 100, 100, 100, Color.Azure);
         * ```
         *
         * In TypeScript, you only need to use the `extends` syntax, you do not need
         * to use this method of extension.
         *
         * @param methods A JSON object contain any methods/properties you want to extend
         */
        Class.extend = function (methods) {
            var parent = this;
            var child;
            if (methods && methods.hasOwnProperty('constructor')) {
                child = methods.constructor;
            }
            else {
                child = function () { return parent.apply(this, arguments); };
            }
            // Using constructor allows JS to lazily instantiate super classes
            var Super = function () { this.constructor = child; };
            Super.prototype = parent.prototype;
            child.prototype = new Super;
            if (methods) {
                for (var prop in methods) {
                    if (methods.hasOwnProperty(prop)) {
                        child.prototype[prop] = methods[prop];
                    }
                }
            }
            // Make subclasses extendable
            child.extend = Class.extend;
            return child;
        };
        return Class;
    }());
    ex.Class = Class;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * The Excalibur timer hooks into the internal timer and fires callbacks,
     * after a certain interval, optionally repeating.
     */
    var Timer = (function () {
        /**
         * @param fcn        The callback to be fired after the interval is complete.
         * @param interval   Interval length
         * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
         */
        function Timer(fcn, interval, repeats) {
            this.id = 0;
            this.interval = 10;
            this.fcn = function () { return; };
            this.repeats = false;
            this._elapsedTime = 0;
            this._totalTimeAlive = 0;
            this.complete = false;
            this.scene = null;
            this.id = Timer.id++;
            this.interval = interval || this.interval;
            this.fcn = fcn || this.fcn;
            this.repeats = repeats || this.repeats;
        }
        /**
         * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
         * @param delta  Number of elapsed milliseconds since the last update.
         */
        Timer.prototype.update = function (delta) {
            this._totalTimeAlive += delta;
            this._elapsedTime += delta;
            if (this._elapsedTime > this.interval) {
                this.fcn.call(this);
                if (this.repeats) {
                    this._elapsedTime = 0;
                }
                else {
                    this.complete = true;
                }
            }
        };
        Timer.prototype.getTimeRunning = function () {
            return this._totalTimeAlive;
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
    ex.Timer = Timer;
})(ex || (ex = {}));
/// <reference path="../Actor.ts"/>
/// <reference path="Side.ts"/>
/// <reference path="ICollisionResolver.ts"/> 
var ex;
(function (ex) {
    var NaiveCollisionBroadphase = (function () {
        function NaiveCollisionBroadphase() {
        }
        NaiveCollisionBroadphase.prototype.track = function (target) {
            // pass
        };
        NaiveCollisionBroadphase.prototype.untrack = function (tartet) {
            // pass
        };
        /**
         * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
         */
        NaiveCollisionBroadphase.prototype.broadphase = function (targets, delta) {
            // Retrieve the list of potential colliders, exclude killed, prevented, and self
            var potentialColliders = targets.filter(function (other) {
                return !other.isKilled() && other.collisionType !== ex.CollisionType.PreventCollision;
            });
            var actor1;
            var actor2;
            var collisionPairs = [];
            for (var j = 0, l = potentialColliders.length; j < l; j++) {
                actor1 = potentialColliders[j];
                for (var i = j + 1; i < l; i++) {
                    actor2 = potentialColliders[i];
                    var minimumTranslationVector;
                    if (minimumTranslationVector = actor1.collides(actor2)) {
                        var pair = new ex.Pair(actor1.body, actor2.body);
                        var side = actor1.getSideFromIntersect(minimumTranslationVector);
                        pair.collision = new ex.CollisionContact(actor1.collisionArea, actor2.collisionArea, minimumTranslationVector, actor1.pos, minimumTranslationVector);
                        if (!collisionPairs.some(function (cp) {
                            return cp.id === pair.id;
                        })) {
                            collisionPairs.push(pair);
                        }
                    }
                }
            }
            var k = 0, len = collisionPairs.length;
            for (k; k < len; k++) {
                collisionPairs[k].resolve(delta, ex.Physics.collisionResolutionStrategy);
            }
            return collisionPairs;
        };
        /**
         * Identify actual collisions from those pairs, and calculate collision impulse
         */
        NaiveCollisionBroadphase.prototype.narrowphase = function (pairs) {
            // pass
        };
        /**
         * Resolve the position and velocity of the physics bodies
         */
        NaiveCollisionBroadphase.prototype.resolve = function (delta, strategy) {
            // pass
        };
        NaiveCollisionBroadphase.prototype.update = function (targets) {
            return 0;
        };
        NaiveCollisionBroadphase.prototype.debugDraw = function (ctx, delta) {
            return;
        };
        return NaiveCollisionBroadphase;
    }());
    ex.NaiveCollisionBroadphase = NaiveCollisionBroadphase;
})(ex || (ex = {}));
/// <reference path="BoundingBox.ts"/>
var ex;
(function (ex) {
    /**
     * Dynamic Tree Node used for tracking bounds within the tree
     */
    var TreeNode = (function () {
        function TreeNode(parent) {
            this.parent = parent;
            this.parent = parent || null;
            this.body = null;
            this.bounds = new ex.BoundingBox();
            this.left = null;
            this.right = null;
            this.height = 0;
        }
        TreeNode.prototype.isLeaf = function () {
            return (!this.left && !this.right);
        };
        return TreeNode;
    }());
    ex.TreeNode = TreeNode;
    /**
     * The DynamicTrees provides a spatial partiioning data structure for quickly querying for overlapping bounding boxes for
     * all tracked bodies. The worst case performance of this is O(n*log(n)) where n is the number of bodies in the tree.
     *
     * Internally the bounding boxes are organized as a balanced binary tree of bounding boxes, where the leaf nodes are tracked bodies.
     * Every non-leaf node is a bounding box that contains child bounding boxes.
     */
    var DynamicTree = (function () {
        function DynamicTree(worldBounds) {
            if (worldBounds === void 0) { worldBounds = new ex.BoundingBox(-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE); }
            this.worldBounds = worldBounds;
            this.root = null;
            this.nodes = {};
        }
        /**
         * Inserts a node into the dynamic tree
         */
        DynamicTree.prototype._insert = function (leaf) {
            // If there are no nodes in the tree, make this the root leaf
            if (this.root === null) {
                this.root = leaf;
                this.root.parent = null;
                return;
            }
            // Search the tree for a node that is not a leaf and find the best place to insert
            var leafAABB = leaf.bounds;
            var currentRoot = this.root;
            while (!currentRoot.isLeaf()) {
                var left = currentRoot.left;
                var right = currentRoot.right;
                var area = currentRoot.bounds.getPerimeter();
                var combinedAABB = currentRoot.bounds.combine(leafAABB);
                var combinedArea = combinedAABB.getPerimeter();
                // Calculate cost heuristic for creating a new parent and leaf
                var cost = 2 * combinedArea;
                // Minimum cost of pushing the leaf down the tree
                var inheritanceCost = 2 * (combinedArea - area);
                // Cost of descending
                var leftCost = 0;
                var leftCombined = leafAABB.combine(left.bounds);
                var newArea;
                var oldArea;
                if (left.isLeaf()) {
                    leftCost = leftCombined.getPerimeter() + inheritanceCost;
                }
                else {
                    oldArea = left.bounds.getPerimeter();
                    newArea = leftCombined.getPerimeter();
                    leftCost = (newArea - oldArea) + inheritanceCost;
                }
                var rightCost = 0;
                var rightCombined = leafAABB.combine(right.bounds);
                if (right.isLeaf()) {
                    rightCost = rightCombined.getPerimeter() + inheritanceCost;
                }
                else {
                    oldArea = right.bounds.getPerimeter();
                    newArea = rightCombined.getPerimeter();
                    rightCost = (newArea - oldArea) + inheritanceCost;
                }
                // cost is acceptable
                if (cost < leftCost && cost < rightCost) {
                    break;
                }
                // Descend to the depths
                if (leftCost < rightCost) {
                    currentRoot = left;
                }
                else {
                    currentRoot = right;
                }
            }
            // Create the new parent node and insert into the tree
            var oldParent = currentRoot.parent;
            var newParent = new TreeNode(oldParent);
            newParent.bounds = leafAABB.combine(currentRoot.bounds);
            newParent.height = currentRoot.height + 1;
            if (oldParent !== null) {
                // The sibling node was not the root
                if (oldParent.left === currentRoot) {
                    oldParent.left = newParent;
                }
                else {
                    oldParent.right = newParent;
                }
                newParent.left = currentRoot;
                newParent.right = leaf;
                currentRoot.parent = newParent;
                leaf.parent = newParent;
            }
            else {
                // The sibling node was the root
                newParent.left = currentRoot;
                newParent.right = leaf;
                currentRoot.parent = newParent;
                leaf.parent = newParent;
                this.root = newParent;
            }
            // Walk up the tree fixing heights and AABBs
            var currentNode = leaf.parent;
            while (currentNode) {
                currentNode = this._balance(currentNode);
                if (!currentNode.left) {
                    throw new Error('Parent of current leaf cannot have a null left child' + currentNode);
                }
                if (!currentNode.right) {
                    throw new Error('Parent of current leaf cannot have a null right child' + currentNode);
                }
                currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
                currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
                currentNode = currentNode.parent;
            }
        };
        /**
         * Removes a node from the dynamic tree
         */
        DynamicTree.prototype._remove = function (leaf) {
            if (leaf === this.root) {
                this.root = null;
                return;
            }
            var parent = leaf.parent;
            var grandParent = parent.parent;
            var sibling;
            if (parent.left === leaf) {
                sibling = parent.right;
            }
            else {
                sibling = parent.left;
            }
            if (grandParent) {
                if (grandParent.left === parent) {
                    grandParent.left = sibling;
                }
                else {
                    grandParent.right = sibling;
                }
                sibling.parent = grandParent;
                var currentNode = grandParent;
                while (currentNode) {
                    currentNode = this._balance(currentNode);
                    currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
                    currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
                    currentNode = currentNode.parent;
                }
            }
            else {
                this.root = sibling;
                sibling.parent = null;
            }
        };
        /**
         * Tracks a body in the dynamic tree
         */
        DynamicTree.prototype.trackBody = function (body) {
            var node = new TreeNode();
            node.body = body;
            node.bounds = body.getBounds();
            node.bounds.left -= 2;
            node.bounds.top -= 2;
            node.bounds.right += 2;
            node.bounds.bottom += 2;
            this.nodes[body.actor.id] = node;
            this._insert(node);
        };
        /**
         * Updates the dynamic tree given the current bounds of each body being tracked
         */
        DynamicTree.prototype.updateBody = function (body) {
            var node = this.nodes[body.actor.id];
            if (!node) {
                return;
            }
            var b = body.getBounds();
            // if the body is outside the world no longer update it
            if (!this.worldBounds.contains(b)) {
                ex.Logger.getInstance().warn('Actor with id ' + body.actor.id +
                    ' is outside the world bounds and will no longer be tracked for physics');
                this.untrackBody(body);
                return false;
            }
            if (node.bounds.contains(b)) {
                return false;
            }
            this._remove(node);
            b.left -= ex.Physics.boundsPadding;
            b.top -= ex.Physics.boundsPadding;
            b.right += ex.Physics.boundsPadding;
            b.bottom += ex.Physics.boundsPadding;
            var multdx = body.vel.x * ex.Physics.dynamicTreeVelocityMultiplyer;
            var multdy = body.vel.y * ex.Physics.dynamicTreeVelocityMultiplyer;
            if (multdx < 0) {
                b.left += multdx;
            }
            else {
                b.right += multdx;
            }
            if (multdy < 0) {
                b.top += multdy;
            }
            else {
                b.bottom += multdy;
            }
            node.bounds = b;
            this._insert(node);
            return true;
        };
        /**
         * Untracks a body from the dynamic tree
         */
        DynamicTree.prototype.untrackBody = function (body) {
            var node = this.nodes[body.actor.id];
            if (!node) {
                return;
            }
            this._remove(node);
            this.nodes[body.actor.id] = null;
            delete this.nodes[body.actor.id];
        };
        /**
         * Balances the tree about a node
         */
        DynamicTree.prototype._balance = function (node) {
            if (node === null) {
                throw new Error('Cannot balance at null node');
            }
            if (node.isLeaf() || node.height < 2) {
                return node;
            }
            var left = node.left;
            var right = node.right;
            var a = node;
            var b = left;
            var c = right;
            var d = left.left;
            var e = left.right;
            var f = right.left;
            var g = right.right;
            var balance = c.height - b.height;
            // Rotate c node up
            if (balance > 1) {
                // Swap the right node with it's parent
                c.left = a;
                c.parent = a.parent;
                a.parent = c;
                // The original node's old parent should point to the right node
                // this is mega confusing
                if (c.parent) {
                    if (c.parent.left === a) {
                        c.parent.left = c;
                    }
                    else {
                        c.parent.right = c;
                    }
                }
                else {
                    this.root = c;
                }
                // Rotate
                if (f.height > g.height) {
                    c.right = f;
                    a.right = g;
                    g.parent = a;
                    a.bounds = b.bounds.combine(g.bounds);
                    c.bounds = a.bounds.combine(f.bounds);
                    a.height = 1 + Math.max(b.height, g.height);
                    c.height = 1 + Math.max(a.height, f.height);
                }
                else {
                    c.right = g;
                    a.right = f;
                    f.parent = a;
                    a.bounds = b.bounds.combine(f.bounds);
                    c.bounds = a.bounds.combine(g.bounds);
                    a.height = 1 + Math.max(b.height, f.height);
                    c.height = 1 + Math.max(a.height, g.height);
                }
                return c;
            }
            // Rotate left node up
            if (balance < -1) {
                // swap
                b.left = a;
                b.parent = a.parent;
                a.parent = b;
                // node's old parent should point to b
                if (b.parent) {
                    if (b.parent.left === a) {
                        b.parent.left = b;
                    }
                    else {
                        if (b.parent.right !== a) {
                            throw 'Error rotating Dynamic Tree';
                        }
                        b.parent.right = b;
                    }
                }
                else {
                    this.root = b;
                }
                // rotate
                if (d.height > e.height) {
                    b.right = d;
                    a.left = e;
                    e.parent = a;
                    a.bounds = c.bounds.combine(e.bounds);
                    b.bounds = a.bounds.combine(d.bounds);
                    a.height = 1 + Math.max(c.height, e.height);
                    b.height = 1 + Math.max(a.height, d.height);
                }
                else {
                    b.right = e;
                    a.left = d;
                    d.parent = a;
                    a.bounds = c.bounds.combine(d.bounds);
                    b.bounds = a.bounds.combine(e.bounds);
                    a.height = 1 + Math.max(c.height, d.height);
                    b.height = 1 + Math.max(a.height, e.height);
                }
                return b;
            }
            return node;
        };
        /**
         * Returns the internal height of the tree, shorter trees are better. Performance drops as the tree grows
         */
        DynamicTree.prototype.getHeight = function () {
            if (this.root === null) {
                return 0;
            }
            return this.root.height;
        };
        /**
         * Queries the Dynamic Axis Aligned Tree for bodies that could be colliding with the provided body.
         *
         * In the query callback, it will be passed a potential collider. Returning true from this callback indicates
         * that you are complete with your query and you do not want to continue. Returning false will continue searching
         * the tree until all possible colliders have been returned.
         */
        DynamicTree.prototype.query = function (body, callback) {
            var bounds = body.getBounds();
            var helper = function (currentNode) {
                if (currentNode && currentNode.bounds.collides(bounds)) {
                    if (currentNode.isLeaf() && currentNode.body !== body) {
                        if (callback.call(body, currentNode.body)) {
                            return true;
                        }
                    }
                    else {
                        return helper(currentNode.left) || helper(currentNode.right);
                    }
                }
                else {
                    return null;
                }
            };
            return helper(this.root);
        };
        /**
         * Queries the Dynamic Axis Aligned Tree for bodies that could be intersecting. By default the raycast query uses an infinitely
         * long ray to test the tree specified by `max`.
         *
         * In the query callback, it will be passed a potential body that intersects with the racast. Returning true from this
         * callback indicates that your are complete with your query and do not want to continue. Return false will continue searching
         * the tree until all possible bodies that would intersect with the ray have been returned.
         */
        DynamicTree.prototype.rayCastQuery = function (ray, max, callback) {
            if (max === void 0) { max = Infinity; }
            var helper = function (currentNode) {
                if (currentNode && currentNode.bounds.rayCast(ray, max)) {
                    if (currentNode.isLeaf()) {
                        if (callback.call(ray, currentNode.body)) {
                            // ray hit a leaf! return the body
                            return true;
                        }
                    }
                    else {
                        // ray hit but not at a leaf, recurse deeper
                        return helper(currentNode.left) || helper(currentNode.right);
                    }
                }
                else {
                    return null; // ray missed
                }
            };
            return helper(this.root);
        };
        DynamicTree.prototype.getNodes = function () {
            var helper = function (currentNode) {
                if (currentNode) {
                    return [currentNode].concat(helper(currentNode.left), helper(currentNode.right));
                }
                else {
                    return [];
                }
            };
            return helper(this.root);
        };
        DynamicTree.prototype.debugDraw = function (ctx, delta) {
            // draw all the nodes in the Dynamic Tree
            var helper = function (currentNode) {
                if (currentNode) {
                    if (currentNode.isLeaf()) {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'green';
                    }
                    else {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'white';
                    }
                    currentNode.bounds.debugDraw(ctx);
                    if (currentNode.left) {
                        helper(currentNode.left);
                    }
                    if (currentNode.right) {
                        helper(currentNode.right);
                    }
                }
            };
            helper(this.root);
        };
        return DynamicTree;
    }());
    ex.DynamicTree = DynamicTree;
})(ex || (ex = {}));
/// <reference path="Body.ts" />
/// <reference path="CollisionContact.ts" />
var ex;
(function (ex) {
    /**
     * Models a potential collision between 2 bodies
     */
    var Pair = (function () {
        function Pair(bodyA, bodyB) {
            this.bodyA = bodyA;
            this.bodyB = bodyB;
            this.id = null;
            this.collision = null;
            this.id = Pair.calculatePairHash(bodyA, bodyB);
        }
        /**
         * Runs the collison intersection logic on the members of this pair
         */
        Pair.prototype.collide = function () {
            this.collision = this.bodyA.collisionArea.collide(this.bodyB.collisionArea);
        };
        /**
         * Resovles the collision body position and velocity if a collision occured
         */
        Pair.prototype.resolve = function (delta, strategy) {
            if (this.collision) {
                this.collision.resolve(delta, strategy);
            }
        };
        /**
         * Calculates the unique pair hash id for this collision pair
         */
        Pair.calculatePairHash = function (bodyA, bodyB) {
            if (bodyA.actor.id < bodyB.actor.id) {
                return "#" + bodyA.actor.id + "+" + bodyB.actor.id;
            }
            else {
                return "#" + bodyB.actor.id + "+" + bodyA.actor.id;
            }
        };
        /* istanbul ignore next */
        Pair.prototype.debugDraw = function (ctx) {
            if (this.collision) {
                if (ex.Physics.showContacts) {
                    ex.Util.DrawUtil.point(ctx, ex.Color.Red, this.collision.point);
                }
                if (ex.Physics.showCollisionNormals) {
                    ex.Util.DrawUtil.vector(ctx, ex.Color.Cyan, this.collision.point, this.collision.normal, 30);
                }
            }
        };
        return Pair;
    }());
    ex.Pair = Pair;
})(ex || (ex = {}));
/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>
/// <reference path="Pair.ts" />
var ex;
(function (ex) {
    var DynamicTreeCollisionBroadphase = (function () {
        function DynamicTreeCollisionBroadphase() {
            this._dynamicCollisionTree = new ex.DynamicTree();
            this._collisionHash = {};
            this._collisionPairCache = [];
        }
        /**
         * Tracks a physics body for collisions
         */
        DynamicTreeCollisionBroadphase.prototype.track = function (target) {
            if (!target) {
                ex.Logger.getInstance().warn('Cannot track null physics body');
                return;
            }
            this._dynamicCollisionTree.trackBody(target);
        };
        /**
         * Untracks a physics body
         */
        DynamicTreeCollisionBroadphase.prototype.untrack = function (target) {
            if (!target) {
                ex.Logger.getInstance().warn('Cannot untrack a null physics body');
                return;
            }
            this._dynamicCollisionTree.untrackBody(target);
        };
        DynamicTreeCollisionBroadphase.prototype._canCollide = function (actorA, actorB) {
            // if the collision pair has been calculated already short circuit
            var hash = ex.Pair.calculatePairHash(actorA.body, actorB.body);
            if (this._collisionHash[hash]) {
                return false; // pair exists easy exit return false
            }
            // if both are fixed short circuit
            if (actorA.collisionType === ex.CollisionType.Fixed && actorB.collisionType === ex.CollisionType.Fixed) {
                return false;
            }
            // if the other is prevent collision or is dead short circuit
            if (actorB.collisionType === ex.CollisionType.PreventCollision || actorB.isKilled()) {
                return false;
            }
            // they can collide
            return true;
        };
        /**
         * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
         */
        DynamicTreeCollisionBroadphase.prototype.broadphase = function (targets, delta, stats) {
            var _this = this;
            var seconds = delta / 1000;
            // TODO optimization use only the actors that are moving to start 
            // Retrieve the list of potential colliders, exclude killed, prevented, and self
            var potentialColliders = targets.filter(function (other) {
                return !other.isKilled() && other.collisionType !== ex.CollisionType.PreventCollision;
            });
            // clear old list of collision pairs
            this._collisionPairCache = [];
            this._collisionHash = {};
            // check for normal collision pairs
            var actor;
            for (var j = 0, l = potentialColliders.length; j < l; j++) {
                actor = potentialColliders[j];
                // Query the collision tree for potential colliders
                this._dynamicCollisionTree.query(actor.body, function (other) {
                    if (_this._canCollide(actor, other.actor)) {
                        var pair = new ex.Pair(actor.body, other);
                        _this._collisionHash[pair.id] = true;
                        _this._collisionPairCache.push(pair);
                    }
                    // Always return false, to query whole tree. Returning true in the query method stops searching
                    return false;
                });
            }
            if (stats) {
                stats.physics.pairs = this._collisionPairCache.length;
            }
            // Check dynamic tree for fast moving objects
            // Fast moving objects are those moving at least there smallest bound per frame
            if (ex.Physics.checkForFastBodies) {
                for (var _i = 0, potentialColliders_1 = potentialColliders; _i < potentialColliders_1.length; _i++) {
                    var actor = potentialColliders_1[_i];
                    // Skip non-active objects. Does not make sense on other collison types
                    if (actor.collisionType !== ex.CollisionType.Active) {
                        continue;
                    }
                    ;
                    // Maximum travel distance next frame
                    var updateDistance = (actor.vel.magnitude() * seconds) +
                        (actor.acc.magnitude() * .5 * seconds * seconds); // acc term
                    // Find the minimum dimension
                    var minDimension = Math.min(actor.body.getBounds().getHeight(), actor.body.getBounds().getWidth());
                    if (ex.Physics.disableMinimumSpeedForFastBody || updateDistance > (minDimension / 2)) {
                        if (stats) {
                            stats.physics.fastBodies++;
                        }
                        // start with the oldPos because the integration for actors has already happened
                        // objects resting on a surface may be slightly penatrating in the current position
                        var updateVec = actor.pos.sub(actor.oldPos);
                        var centerPoint = actor.body.collisionArea.getCenter();
                        var furthestPoint = actor.body.collisionArea.getFurthestPoint(actor.vel);
                        var origin = furthestPoint.sub(updateVec);
                        var ray = new ex.Ray(origin, actor.vel);
                        // back the ray up by -2x surfaceEpsilon to account for fast moving objects starting on the surface 
                        ray.pos = ray.pos.add(ray.dir.scale(-2 * ex.Physics.surfaceEpsilon));
                        var minBody;
                        var minTranslate = new ex.Vector(Infinity, Infinity);
                        this._dynamicCollisionTree.rayCastQuery(ray, updateDistance + ex.Physics.surfaceEpsilon * 2, function (other) {
                            if (actor.body !== other && other.collisionArea) {
                                var hitPoint = other.collisionArea.rayCast(ray, updateDistance + ex.Physics.surfaceEpsilon * 10);
                                if (hitPoint) {
                                    var translate = hitPoint.sub(origin);
                                    if (translate.magnitude() < minTranslate.magnitude()) {
                                        minTranslate = translate;
                                        minBody = other;
                                    }
                                }
                            }
                            return false;
                        });
                        if (minBody && ex.Vector.isValid(minTranslate)) {
                            var pair = new ex.Pair(actor.body, minBody);
                            if (!this._collisionHash[pair.id]) {
                                this._collisionHash[pair.id] = true;
                                this._collisionPairCache.push(pair);
                            }
                            // move the fast moving object to the other body
                            // need to push into the surface by ex.Physics.surfaceEpsilon
                            var shift = centerPoint.sub(furthestPoint);
                            actor.pos = origin.add(shift).add(minTranslate).add(ray.dir.scale(2 * ex.Physics.surfaceEpsilon));
                            actor.body.collisionArea.recalc();
                            if (stats) {
                                stats.physics.fastBodyCollisions++;
                            }
                        }
                    }
                }
            }
            // return cache
            return this._collisionPairCache;
        };
        /**
         * Applies narrow phase on collision pairs to find actual area intersections
         */
        DynamicTreeCollisionBroadphase.prototype.narrowphase = function (pairs, stats) {
            for (var i = 0; i < pairs.length; i++) {
                pairs[i].collide();
                if (stats && pairs[i].collision) {
                    stats.physics.collisions++;
                }
            }
        };
        /**
         * Perform collision resolution given a strategy (rigid body or box) and move objects out of intersect.
         */
        DynamicTreeCollisionBroadphase.prototype.resolve = function (delta, strategy) {
            // resolve collision pairs
            var i = 0, len = this._collisionPairCache.length;
            for (i = 0; i < len; i++) {
                this._collisionPairCache[i].resolve(delta, strategy);
            }
            // We must apply mtv after all pairs have been resolved for more accuracy
            // apply integration of collision pairs
            for (i = 0; i < len; i++) {
                if (this._collisionPairCache[i].collision) {
                    this._collisionPairCache[i].bodyA.applyMtv();
                    this._collisionPairCache[i].bodyB.applyMtv();
                    // todo still don't like this, this is a small integration step to resolve narrowphase collisions
                    this._collisionPairCache[i].bodyA.actor.integrate(delta * ex.Physics.collisionShift);
                    this._collisionPairCache[i].bodyB.actor.integrate(delta * ex.Physics.collisionShift);
                }
            }
        };
        /**
         * Update the dynamic tree positions
         */
        DynamicTreeCollisionBroadphase.prototype.update = function (targets, delta) {
            var updated = 0, i = 0, len = targets.length;
            for (i; i < len; i++) {
                if (this._dynamicCollisionTree.updateBody(targets[i].body)) {
                    updated++;
                }
            }
            return updated;
        };
        /* istanbul ignore next */
        DynamicTreeCollisionBroadphase.prototype.debugDraw = function (ctx, delta) {
            if (ex.Physics.broadphaseDebug) {
                this._dynamicCollisionTree.debugDraw(ctx, delta);
            }
            if (ex.Physics.showContacts || ex.Physics.showCollisionNormals) {
                for (var _i = 0, _a = this._collisionPairCache; _i < _a.length; _i++) {
                    var pair = _a[_i];
                    pair.debugDraw(ctx);
                }
            }
        };
        return DynamicTreeCollisionBroadphase;
    }());
    ex.DynamicTreeCollisionBroadphase = DynamicTreeCollisionBroadphase;
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />
var ex;
(function (ex) {
    /**
     * Cameras
     *
     * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
     * to move around your game and set focus. They are used to determine
     * what is "off screen" and can be used to scale the game.
     *
     * [[include:Cameras.md]]
     */
    var BaseCamera = (function () {
        function BaseCamera() {
            // camera physical quantities
            this.z = 1;
            this.dx = 0;
            this.dy = 0;
            this.dz = 0;
            this.ax = 0;
            this.ay = 0;
            this.az = 0;
            this.rotation = 0;
            this.rx = 0;
            this._x = 0;
            this._y = 0;
            this._cameraMoving = false;
            this._currentLerpTime = 0;
            this._lerpDuration = 1000; // 1 second
            this._totalLerpTime = 0;
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
            this._currentZoomScale = 1;
            this._maxZoomScale = 1;
            this._zoomDuration = 0;
            this._elapsedZoomTime = 0;
            this._zoomIncrement = 0.01;
            this._easing = ex.EasingFunctions.EaseInOutCubic;
        }
        Object.defineProperty(BaseCamera.prototype, "x", {
            /**
             * Get the camera's x position
             */
            get: function () {
                return this._x;
            },
            /**
             * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
             */
            set: function (value) {
                if (!this._follow && !this._cameraMoving) {
                    this._x = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCamera.prototype, "y", {
            /**
             * Get the camera's y position
             */
            get: function () {
                return this._y;
            },
            /**
             * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
             */
            set: function (value) {
                if (!this._follow && !this._cameraMoving) {
                    this._y = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Sets the [[Actor]] to follow with the camera
         * @param actor  The actor to follow
         */
        BaseCamera.prototype.setActorToFollow = function (actor) {
            this._follow = actor;
        };
        /**
         * Returns the focal point of the camera, a new point giving the x and y position of the camera
         */
        BaseCamera.prototype.getFocus = function () {
            return new ex.Vector(this.x, this.y);
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
        BaseCamera.prototype.move = function (pos, duration, easingFn) {
            if (easingFn === void 0) { easingFn = ex.EasingFunctions.EaseInOutCubic; }
            if (typeof easingFn !== 'function') {
                throw 'Please specify an EasingFunction';
            }
            // cannot move when following an actor
            if (this._follow) {
                return new ex.Promise().reject(pos);
            }
            // resolve existing promise, if any
            if (this._lerpPromise && this._lerpPromise.state() === ex.PromiseState.Pending) {
                this._lerpPromise.resolve(pos);
            }
            this._lerpPromise = new ex.Promise();
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
        BaseCamera.prototype.shake = function (magnitudeX, magnitudeY, duration) {
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
        BaseCamera.prototype.zoom = function (scale, duration) {
            if (duration === void 0) { duration = 0; }
            this._isZooming = true;
            this._maxZoomScale = scale;
            this._zoomDuration = duration;
            if (duration) {
                this._zoomIncrement = Math.abs(this._maxZoomScale - this._currentZoomScale) / duration * 1000;
            }
            if (this._maxZoomScale < 1) {
                if (duration) {
                    this._zoomIncrement = -1 * this._zoomIncrement;
                }
                else {
                    this._isZooming = false;
                    this._setCurrentZoomScale(this._maxZoomScale);
                }
            }
            else {
                if (!duration) {
                    this._isZooming = false;
                    this._setCurrentZoomScale(this._maxZoomScale);
                }
            }
        };
        /**
         * Gets the current zoom scale
         */
        BaseCamera.prototype.getZoom = function () {
            return this.z;
        };
        BaseCamera.prototype._setCurrentZoomScale = function (zoomScale) {
            this.z = zoomScale;
        };
        BaseCamera.prototype.update = function (engine, delta) {
            // Update placements based on linear algebra
            this._x += this.dx * delta / 1000;
            this._y += this.dy * delta / 1000;
            this.z += this.dz * delta / 1000;
            this.dx += this.ax * delta / 1000;
            this.dy += this.ay * delta / 1000;
            this.dz += this.az * delta / 1000;
            this.rotation += this.rx * delta / 1000;
            if (this._cameraMoving) {
                if (this._currentLerpTime < this._lerpDuration) {
                    if (this._lerpEnd.x < this._lerpStart.x) {
                        this._x = this._lerpStart.x - (this._easing(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
                    }
                    else {
                        this._x = this._easing(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
                    }
                    if (this._lerpEnd.y < this._lerpStart.y) {
                        this._y = this._lerpStart.y - (this._easing(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
                    }
                    else {
                        this._y = this._easing(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
                    }
                    this._currentLerpTime += delta;
                }
                else {
                    this._x = this._lerpEnd.x;
                    this._y = this._lerpEnd.y;
                    this._lerpPromise.resolve(this._lerpEnd);
                    this._lerpStart = null;
                    this._lerpEnd = null;
                    this._currentLerpTime = 0;
                    this._cameraMoving = false;
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
                this._xShake = (Math.random() * this._shakeMagnitudeX | 0) + 1;
                this._yShake = (Math.random() * this._shakeMagnitudeY | 0) + 1;
            }
        };
        /**
         * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
         * @param ctx    Canvas context to apply transformations
         * @param delta  The number of milliseconds since the last update
         */
        BaseCamera.prototype.draw = function (ctx, delta) {
            var focus = this.getFocus();
            var canvasWidth = ctx.canvas.width;
            var canvasHeight = ctx.canvas.height;
            // if zoom is 2x then canvas is 1/2 as high
            // if zoom is .5x then canvas is 2x as high
            var newCanvasWidth = canvasWidth / this.getZoom();
            var newCanvasHeight = canvasHeight / this.getZoom();
            /*if (this._isDoneZooming()) {
               this._isZooming = false;
               this._elapsedZoomTime = 0;
               this._zoomDuration = 0;
               this._setCurrentZoomScale(this._maxZoomScale);
   
            } else {
               this._elapsedZoomTime += delta;
   
               this._setCurrentZoomScale(this.getZoom() + this._zoomIncrement * delta / 1000);
            }*/
            ctx.scale(this.getZoom(), this.getZoom());
            ctx.translate(-focus.x + newCanvasWidth / 2 + this._xShake, -focus.y + newCanvasHeight / 2 + this._yShake);
        };
        BaseCamera.prototype.debugDraw = function (ctx) {
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
        };
        BaseCamera.prototype._isDoneShaking = function () {
            return !(this._isShaking) || (this._elapsedShakeTime >= this._shakeDuration);
        };
        BaseCamera.prototype._isDoneZooming = function () {
            if (this._zoomDuration !== 0) {
                return (this._elapsedZoomTime >= this._zoomDuration);
            }
            else {
                if (this._maxZoomScale < 1) {
                    return (this._currentZoomScale <= this._maxZoomScale);
                }
                else {
                    return (this._currentZoomScale >= this._maxZoomScale);
                }
            }
        };
        return BaseCamera;
    }());
    ex.BaseCamera = BaseCamera;
    /**
     * An extension of [[BaseCamera]] that is locked vertically; it will only move side to side.
     *
     * Common usages: platformers.
     */
    var SideCamera = (function (_super) {
        __extends(SideCamera, _super);
        function SideCamera() {
            _super.apply(this, arguments);
        }
        SideCamera.prototype.getFocus = function () {
            if (this._follow) {
                return new ex.Vector(this._follow.pos.x + this._follow.getWidth() / 2, _super.prototype.getFocus.call(this).y);
            }
            else {
                return _super.prototype.getFocus.call(this);
            }
        };
        return SideCamera;
    }(BaseCamera));
    ex.SideCamera = SideCamera;
    /**
     * An extension of [[BaseCamera]] that is locked to an [[Actor]] or
     * [[LockedCamera.focus|focal point]]; the actor will appear in the
     * center of the screen.
     *
     * Common usages: RPGs, adventure games, top-down games.
     */
    var LockedCamera = (function (_super) {
        __extends(LockedCamera, _super);
        function LockedCamera() {
            _super.apply(this, arguments);
        }
        LockedCamera.prototype.getFocus = function () {
            if (this._follow) {
                return new ex.Vector(this._follow.pos.x + this._follow.getWidth() / 2, this._follow.pos.y + this._follow.getHeight() / 2);
            }
            else {
                return _super.prototype.getFocus.call(this);
            }
        };
        return LockedCamera;
    }(BaseCamera));
    ex.LockedCamera = LockedCamera;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * An enum that describes the strategies that rotation actions can use
     */
    (function (RotationType) {
        /**
         * Rotation via `ShortestPath` will use the smallest angle
         * between the starting and ending points. This strategy is the default behavior.
         */
        RotationType[RotationType["ShortestPath"] = 0] = "ShortestPath";
        /**
         * Rotation via `LongestPath` will use the largest angle
         * between the starting and ending points.
         */
        RotationType[RotationType["LongestPath"] = 1] = "LongestPath";
        /**
         * Rotation via `Clockwise` will travel in a clockwise direction,
         * regardless of the starting and ending points.
         */
        RotationType[RotationType["Clockwise"] = 2] = "Clockwise";
        /**
         * Rotation via `CounterClockwise` will travel in a counterclockwise direction,
         * regardless of the starting and ending points.
         */
        RotationType[RotationType["CounterClockwise"] = 3] = "CounterClockwise";
    })(ex.RotationType || (ex.RotationType = {}));
    var RotationType = ex.RotationType;
})(ex || (ex = {}));
/// <reference path="../Algebra.ts" />
/// <reference path="../Engine.ts" />
/// <reference path="../Actor.ts" />
/// <reference path="RotationType.ts" />
/**
 * See [[ActionContext|Action API]] for more information about Actions.
 */
var ex;
(function (ex) {
    var Internal;
    (function (Internal) {
        var Actions;
        (function (Actions) {
            var EaseTo = (function () {
                function EaseTo(actor, x, y, duration, easingFcn) {
                    this.actor = actor;
                    this.easingFcn = easingFcn;
                    this._currentLerpTime = 0;
                    this._lerpDuration = 1 * 1000; // 1 second
                    this._lerpStart = new ex.Vector(0, 0);
                    this._lerpEnd = new ex.Vector(0, 0);
                    this._initialized = false;
                    this._stopped = false;
                    this._distance = 0;
                    this._lerpDuration = duration;
                    this._lerpEnd = new ex.Vector(x, y);
                }
                EaseTo.prototype._initialize = function () {
                    this._lerpStart = new ex.Vector(this.actor.pos.x, this.actor.pos.y);
                    this._currentLerpTime = 0;
                    this._distance = this._lerpStart.distance(this._lerpEnd);
                };
                EaseTo.prototype.update = function (delta) {
                    if (!this._initialized) {
                        this._initialize();
                        this._initialized = true;
                    }
                    var newX = this.actor.pos.x;
                    var newY = this.actor.pos.y;
                    if (this._currentLerpTime < this._lerpDuration) {
                        if (this._lerpEnd.x < this._lerpStart.x) {
                            newX = this._lerpStart.x - (this.easingFcn(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
                        }
                        else {
                            newX = this.easingFcn(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
                        }
                        if (this._lerpEnd.y < this._lerpStart.y) {
                            newY = this._lerpStart.y - (this.easingFcn(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
                        }
                        else {
                            newY = this.easingFcn(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
                        }
                        this.actor.pos.x = newX;
                        this.actor.pos.y = newY;
                        this._currentLerpTime += delta;
                    }
                    else {
                        this.actor.pos.x = this._lerpEnd.x;
                        this.actor.pos.y = this._lerpEnd.y;
                    }
                };
                EaseTo.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.pos.x, actor.pos.y)).distance(this._lerpStart) >= this._distance;
                };
                EaseTo.prototype.reset = function () {
                    this._initialized = false;
                };
                EaseTo.prototype.stop = function () {
                    this._stopped = true;
                };
                return EaseTo;
            }());
            Actions.EaseTo = EaseTo;
            var MoveTo = (function () {
                function MoveTo(actor, destx, desty, speed) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._end = new ex.Vector(destx, desty);
                    this._speed = speed;
                }
                MoveTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = new ex.Vector(this._actor.pos.x, this._actor.pos.y);
                        this._distance = this._start.distance(this._end);
                        this._dir = this._end.sub(this._start).normalize();
                    }
                    var m = this._dir.scale(this._speed);
                    this._actor.vel.x = m.x;
                    this._actor.vel.y = m.y;
                    if (this.isComplete(this._actor)) {
                        this._actor.pos.x = this._end.x;
                        this._actor.pos.y = this._end.y;
                        this._actor.vel.y = 0;
                        this._actor.vel.x = 0;
                    }
                };
                MoveTo.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.pos.x, actor.pos.y)).distance(this._start) >= this._distance;
                };
                MoveTo.prototype.stop = function () {
                    this._actor.vel.y = 0;
                    this._actor.vel.x = 0;
                    this._stopped = true;
                };
                MoveTo.prototype.reset = function () {
                    this._started = false;
                };
                return MoveTo;
            }());
            Actions.MoveTo = MoveTo;
            var MoveBy = (function () {
                function MoveBy(actor, destx, desty, time) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._end = new ex.Vector(destx, desty);
                    if (time <= 0) {
                        ex.Logger.getInstance().error('Attempted to moveBy time less than or equal to zero : ' + time);
                        throw new Error('Cannot move in time <= 0');
                    }
                    this._time = time;
                }
                MoveBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = new ex.Vector(this._actor.pos.x, this._actor.pos.y);
                        this._distance = this._start.distance(this._end);
                        this._dir = this._end.sub(this._start).normalize();
                        this._speed = this._distance / (this._time / 1000);
                    }
                    var m = this._dir.scale(this._speed);
                    this._actor.vel.x = m.x;
                    this._actor.vel.y = m.y;
                    if (this.isComplete(this._actor)) {
                        this._actor.pos.x = this._end.x;
                        this._actor.pos.y = this._end.y;
                        this._actor.vel.y = 0;
                        this._actor.vel.x = 0;
                    }
                };
                MoveBy.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.pos.x, actor.pos.y)).distance(this._start) >= this._distance;
                };
                MoveBy.prototype.stop = function () {
                    this._actor.vel.y = 0;
                    this._actor.vel.x = 0;
                    this._stopped = true;
                };
                MoveBy.prototype.reset = function () {
                    this._started = false;
                };
                return MoveBy;
            }());
            Actions.MoveBy = MoveBy;
            var Follow = (function () {
                function Follow(actor, actorToFollow, followDistance) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._actorToFollow = actorToFollow;
                    this._current = new ex.Vector(this._actor.pos.x, this._actor.pos.y);
                    this._end = new ex.Vector(actorToFollow.pos.x, actorToFollow.pos.y);
                    this._maximumDistance = (followDistance !== undefined) ? followDistance : this._current.distance(this._end);
                    this._speed = 0;
                }
                Follow.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._distanceBetween = this._current.distance(this._end);
                        this._dir = this._end.sub(this._current).normalize();
                    }
                    var actorToFollowSpeed = Math.sqrt(Math.pow(this._actorToFollow.vel.x, 2) + Math.pow(this._actorToFollow.vel.y, 2));
                    if (actorToFollowSpeed !== 0) {
                        this._speed = actorToFollowSpeed;
                    }
                    this._current.x = this._actor.pos.x;
                    this._current.y = this._actor.pos.y;
                    this._end.x = this._actorToFollow.pos.x;
                    this._end.y = this._actorToFollow.pos.y;
                    this._distanceBetween = this._current.distance(this._end);
                    this._dir = this._end.sub(this._current).normalize();
                    if (this._distanceBetween >= this._maximumDistance) {
                        var m = this._dir.scale(this._speed);
                        this._actor.vel.x = m.x;
                        this._actor.vel.y = m.y;
                    }
                    else {
                        this._actor.vel.x = 0;
                        this._actor.vel.y = 0;
                    }
                    if (this.isComplete(this._actor)) {
                        // TODO this should never occur
                        this._actor.pos.x = this._end.x;
                        this._actor.pos.y = this._end.y;
                        this._actor.vel.y = 0;
                        this._actor.vel.x = 0;
                    }
                };
                Follow.prototype.stop = function () {
                    this._actor.vel.y = 0;
                    this._actor.vel.x = 0;
                    this._stopped = true;
                };
                Follow.prototype.isComplete = function (actor) {
                    // the actor following should never stop unless specified to do so
                    return this._stopped;
                };
                Follow.prototype.reset = function () {
                    this._started = false;
                };
                return Follow;
            }());
            Actions.Follow = Follow;
            var Meet = (function () {
                function Meet(actor, actorToMeet, speed) {
                    this._started = false;
                    this._stopped = false;
                    this._speedWasSpecified = false;
                    this._actor = actor;
                    this._actorToMeet = actorToMeet;
                    this._current = new ex.Vector(this._actor.pos.x, this._actor.pos.y);
                    this._end = new ex.Vector(actorToMeet.pos.x, actorToMeet.pos.y);
                    this._speed = speed || 0;
                    if (speed !== undefined) {
                        this._speedWasSpecified = true;
                    }
                }
                Meet.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._distanceBetween = this._current.distance(this._end);
                        this._dir = this._end.sub(this._current).normalize();
                    }
                    var actorToMeetSpeed = Math.sqrt(Math.pow(this._actorToMeet.vel.x, 2) + Math.pow(this._actorToMeet.vel.y, 2));
                    if ((actorToMeetSpeed !== 0) && (!this._speedWasSpecified)) {
                        this._speed = actorToMeetSpeed;
                    }
                    this._current.x = this._actor.pos.x;
                    this._current.y = this._actor.pos.y;
                    this._end.x = this._actorToMeet.pos.x;
                    this._end.y = this._actorToMeet.pos.y;
                    this._distanceBetween = this._current.distance(this._end);
                    this._dir = this._end.sub(this._current).normalize();
                    var m = this._dir.scale(this._speed);
                    this._actor.vel.x = m.x;
                    this._actor.vel.y = m.y;
                    if (this.isComplete(this._actor)) {
                        this._actor.pos.x = this._end.x;
                        this._actor.pos.y = this._end.y;
                        this._actor.vel.y = 0;
                        this._actor.vel.x = 0;
                    }
                };
                Meet.prototype.isComplete = function (actor) {
                    return this._stopped || (this._distanceBetween <= 1);
                };
                Meet.prototype.stop = function () {
                    this._actor.vel.y = 0;
                    this._actor.vel.x = 0;
                    this._stopped = true;
                };
                Meet.prototype.reset = function () {
                    this._started = false;
                };
                return Meet;
            }());
            Actions.Meet = Meet;
            var RotateTo = (function () {
                function RotateTo(actor, angleRadians, speed, rotationType) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._end = angleRadians;
                    this._speed = speed;
                    this._rotationType = rotationType || ex.RotationType.ShortestPath;
                }
                RotateTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = this._actor.rotation;
                        var distance1 = Math.abs(this._end - this._start);
                        var distance2 = ex.Util.TwoPI - distance1;
                        if (distance1 > distance2) {
                            this._shortDistance = distance2;
                            this._longDistance = distance1;
                        }
                        else {
                            this._shortDistance = distance1;
                            this._longDistance = distance2;
                        }
                        this._shortestPathIsPositive = (this._start - this._end + ex.Util.TwoPI) % ex.Util.TwoPI >= Math.PI;
                        switch (this._rotationType) {
                            case ex.RotationType.ShortestPath:
                                this._distance = this._shortDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = 1;
                                }
                                else {
                                    this._direction = -1;
                                }
                                break;
                            case ex.RotationType.LongestPath:
                                this._distance = this._longDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = -1;
                                }
                                else {
                                    this._direction = 1;
                                }
                                break;
                            case ex.RotationType.Clockwise:
                                this._direction = 1;
                                if (this._shortestPathIsPositive) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                            case ex.RotationType.CounterClockwise:
                                this._direction = -1;
                                if (!this._shortestPathIsPositive) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                        }
                    }
                    this._actor.rx = this._direction * this._speed;
                    if (this.isComplete(this._actor)) {
                        this._actor.rotation = this._end;
                        this._actor.rx = 0;
                        this._stopped = true;
                    }
                };
                RotateTo.prototype.isComplete = function (actor) {
                    var distanceTravelled = Math.abs(this._actor.rotation - this._start);
                    return this._stopped || (distanceTravelled >= Math.abs(this._distance));
                };
                RotateTo.prototype.stop = function () {
                    this._actor.rx = 0;
                    this._stopped = true;
                };
                RotateTo.prototype.reset = function () {
                    this._started = false;
                };
                return RotateTo;
            }());
            Actions.RotateTo = RotateTo;
            var RotateBy = (function () {
                function RotateBy(actor, angleRadians, time, rotationType) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._end = angleRadians;
                    this._time = time;
                    this._rotationType = rotationType || ex.RotationType.ShortestPath;
                }
                RotateBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = this._actor.rotation;
                        var distance1 = Math.abs(this._end - this._start);
                        var distance2 = ex.Util.TwoPI - distance1;
                        if (distance1 > distance2) {
                            this._shortDistance = distance2;
                            this._longDistance = distance1;
                        }
                        else {
                            this._shortDistance = distance1;
                            this._longDistance = distance2;
                        }
                        this._shortestPathIsPositive = (this._start - this._end + ex.Util.TwoPI) % ex.Util.TwoPI >= Math.PI;
                        switch (this._rotationType) {
                            case ex.RotationType.ShortestPath:
                                this._distance = this._shortDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = 1;
                                }
                                else {
                                    this._direction = -1;
                                }
                                break;
                            case ex.RotationType.LongestPath:
                                this._distance = this._longDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = -1;
                                }
                                else {
                                    this._direction = 1;
                                }
                                break;
                            case ex.RotationType.Clockwise:
                                this._direction = 1;
                                if (this._shortDistance >= 0) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                            case ex.RotationType.CounterClockwise:
                                this._direction = -1;
                                if (this._shortDistance <= 0) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                        }
                        this._speed = Math.abs(this._distance / this._time * 1000);
                    }
                    this._actor.rx = this._direction * this._speed;
                    if (this.isComplete(this._actor)) {
                        this._actor.rotation = this._end;
                        this._actor.rx = 0;
                        this._stopped = true;
                    }
                };
                RotateBy.prototype.isComplete = function (actor) {
                    var distanceTravelled = Math.abs(this._actor.rotation - this._start);
                    return this._stopped || (distanceTravelled >= Math.abs(this._distance));
                };
                RotateBy.prototype.stop = function () {
                    this._actor.rx = 0;
                    this._stopped = true;
                };
                RotateBy.prototype.reset = function () {
                    this._started = false;
                };
                return RotateBy;
            }());
            Actions.RotateBy = RotateBy;
            var ScaleTo = (function () {
                function ScaleTo(actor, scaleX, scaleY, speedX, speedY) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._endX = scaleX;
                    this._endY = scaleY;
                    this._speedX = speedX;
                    this._speedY = speedY;
                }
                ScaleTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._startX = this._actor.scale.x;
                        this._startY = this._actor.scale.y;
                        this._distanceX = Math.abs(this._endX - this._startX);
                        this._distanceY = Math.abs(this._endY - this._startY);
                    }
                    if (!(Math.abs(this._actor.scale.x - this._startX) >= this._distanceX)) {
                        var directionX = this._endY < this._startY ? -1 : 1;
                        this._actor.sx = this._speedX * directionX;
                    }
                    else {
                        this._actor.sx = 0;
                    }
                    if (!(Math.abs(this._actor.scale.y - this._startY) >= this._distanceY)) {
                        var directionY = this._endY < this._startY ? -1 : 1;
                        this._actor.sy = this._speedY * directionY;
                    }
                    else {
                        this._actor.sy = 0;
                    }
                    if (this.isComplete(this._actor)) {
                        this._actor.scale.x = this._endX;
                        this._actor.scale.y = this._endY;
                        this._actor.sx = 0;
                        this._actor.sy = 0;
                    }
                };
                ScaleTo.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this._actor.scale.y - this._startX) >= this._distanceX) &&
                        (Math.abs(this._actor.scale.y - this._startY) >= this._distanceY));
                };
                ScaleTo.prototype.stop = function () {
                    this._actor.sx = 0;
                    this._actor.sy = 0;
                    this._stopped = true;
                };
                ScaleTo.prototype.reset = function () {
                    this._started = false;
                };
                return ScaleTo;
            }());
            Actions.ScaleTo = ScaleTo;
            var ScaleBy = (function () {
                function ScaleBy(actor, scaleX, scaleY, time) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._endX = scaleX;
                    this._endY = scaleY;
                    this._time = time;
                    this._speedX = (this._endX - this._actor.scale.x) / time * 1000;
                    this._speedY = (this._endY - this._actor.scale.y) / time * 1000;
                }
                ScaleBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._startX = this._actor.scale.x;
                        this._startY = this._actor.scale.y;
                        this._distanceX = Math.abs(this._endX - this._startX);
                        this._distanceY = Math.abs(this._endY - this._startY);
                    }
                    var directionX = this._endX < this._startX ? -1 : 1;
                    var directionY = this._endY < this._startY ? -1 : 1;
                    this._actor.sx = this._speedX * directionX;
                    this._actor.sy = this._speedY * directionY;
                    if (this.isComplete(this._actor)) {
                        this._actor.scale.x = this._endX;
                        this._actor.scale.y = this._endY;
                        this._actor.sx = 0;
                        this._actor.sy = 0;
                    }
                };
                ScaleBy.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this._actor.scale.x - this._startX) >= this._distanceX) &&
                        (Math.abs(this._actor.scale.y - this._startY) >= this._distanceY));
                };
                ScaleBy.prototype.stop = function () {
                    this._actor.sx = 0;
                    this._actor.sy = 0;
                    this._stopped = true;
                };
                ScaleBy.prototype.reset = function () {
                    this._started = false;
                };
                return ScaleBy;
            }());
            Actions.ScaleBy = ScaleBy;
            var Delay = (function () {
                function Delay(actor, delay) {
                    this._elapsedTime = 0;
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._delay = delay;
                }
                Delay.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }
                    this.x = this._actor.pos.x;
                    this.y = this._actor.pos.y;
                    this._elapsedTime += delta;
                };
                Delay.prototype.isComplete = function (actor) {
                    return this._stopped || (this._elapsedTime >= this._delay);
                };
                Delay.prototype.stop = function () {
                    this._stopped = true;
                };
                Delay.prototype.reset = function () {
                    this._elapsedTime = 0;
                    this._started = false;
                };
                return Delay;
            }());
            Actions.Delay = Delay;
            var Blink = (function () {
                function Blink(actor, timeVisible, timeNotVisible, numBlinks) {
                    if (numBlinks === void 0) { numBlinks = 1; }
                    this._timeVisible = 0;
                    this._timeNotVisible = 0;
                    this._elapsedTime = 0;
                    this._totalTime = 0;
                    this._stopped = false;
                    this._started = false;
                    this._actor = actor;
                    this._timeVisible = timeVisible;
                    this._timeNotVisible = timeNotVisible;
                    this._duration = (timeVisible + timeNotVisible) * numBlinks;
                }
                Blink.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }
                    this._elapsedTime += delta;
                    this._totalTime += delta;
                    if (this._actor.visible && this._elapsedTime >= this._timeVisible) {
                        this._actor.visible = false;
                        this._elapsedTime = 0;
                    }
                    if (!this._actor.visible && this._elapsedTime >= this._timeNotVisible) {
                        this._actor.visible = true;
                        this._elapsedTime = 0;
                    }
                    if (this.isComplete(this._actor)) {
                        this._actor.visible = true;
                    }
                };
                Blink.prototype.isComplete = function (actor) {
                    return this._stopped || (this._totalTime >= this._duration);
                };
                Blink.prototype.stop = function () {
                    this._actor.visible = true;
                    this._stopped = true;
                };
                Blink.prototype.reset = function () {
                    this._started = false;
                    this._elapsedTime = 0;
                    this._totalTime = 0;
                };
                return Blink;
            }());
            Actions.Blink = Blink;
            var Fade = (function () {
                function Fade(actor, endOpacity, speed) {
                    this._multiplier = 1;
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._endOpacity = endOpacity;
                    this._speed = speed;
                }
                Fade.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        // determine direction when we start
                        if (this._endOpacity < this._actor.opacity) {
                            this._multiplier = -1;
                        }
                        else {
                            this._multiplier = 1;
                        }
                    }
                    if (this._speed > 0) {
                        this._actor.opacity += this._multiplier * (Math.abs(this._actor.opacity - this._endOpacity) * delta) / this._speed;
                    }
                    this._speed -= delta;
                    if (this.isComplete(this._actor)) {
                        this._actor.opacity = this._endOpacity;
                    }
                    ex.Logger.getInstance().debug('[Action fade] Actor opacity:', this._actor.opacity);
                };
                Fade.prototype.isComplete = function (actor) {
                    return this._stopped || (Math.abs(this._actor.opacity - this._endOpacity) < 0.05);
                };
                Fade.prototype.stop = function () {
                    this._stopped = true;
                };
                Fade.prototype.reset = function () {
                    this._started = false;
                };
                return Fade;
            }());
            Actions.Fade = Fade;
            var Die = (function () {
                function Die(actor) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                }
                Die.prototype.update = function (delta) {
                    this._actor.actionQueue.clearActions();
                    this._actor.kill();
                    this._stopped = true;
                };
                Die.prototype.isComplete = function () {
                    return this._stopped;
                };
                Die.prototype.stop = function () { return; };
                Die.prototype.reset = function () { return; };
                return Die;
            }());
            Actions.Die = Die;
            var CallMethod = (function () {
                function CallMethod(actor, method) {
                    this._method = null;
                    this._actor = null;
                    this._hasBeenCalled = false;
                    this._actor = actor;
                    this._method = method;
                }
                CallMethod.prototype.update = function (delta) {
                    this._method.call(this._actor);
                    this._hasBeenCalled = true;
                };
                CallMethod.prototype.isComplete = function (actor) {
                    return this._hasBeenCalled;
                };
                CallMethod.prototype.reset = function () {
                    this._hasBeenCalled = false;
                };
                CallMethod.prototype.stop = function () {
                    this._hasBeenCalled = true;
                };
                return CallMethod;
            }());
            Actions.CallMethod = CallMethod;
            var Repeat = (function () {
                function Repeat(actor, repeat, actions) {
                    this._stopped = false;
                    this._actor = actor;
                    this._actionQueue = new ActionQueue(actor);
                    this._repeat = repeat;
                    this._originalRepeat = repeat;
                    var i = 0, len = actions.length;
                    for (i; i < len; i++) {
                        actions[i].reset();
                        this._actionQueue.add(actions[i]);
                    }
                    ;
                }
                Repeat.prototype.update = function (delta) {
                    this.x = this._actor.pos.x;
                    this.y = this._actor.pos.y;
                    if (!this._actionQueue.hasNext()) {
                        this._actionQueue.reset();
                        this._repeat--;
                    }
                    this._actionQueue.update(delta);
                };
                Repeat.prototype.isComplete = function () {
                    return this._stopped || (this._repeat <= 0);
                };
                Repeat.prototype.stop = function () {
                    this._stopped = true;
                };
                Repeat.prototype.reset = function () {
                    this._repeat = this._originalRepeat;
                };
                return Repeat;
            }());
            Actions.Repeat = Repeat;
            var RepeatForever = (function () {
                function RepeatForever(actor, actions) {
                    this._stopped = false;
                    this._actor = actor;
                    this._actionQueue = new ActionQueue(actor);
                    var i = 0, len = actions.length;
                    for (i; i < len; i++) {
                        actions[i].reset();
                        this._actionQueue.add(actions[i]);
                    }
                    ;
                }
                RepeatForever.prototype.update = function (delta) {
                    this.x = this._actor.pos.x;
                    this.y = this._actor.pos.y;
                    if (this._stopped) {
                        return;
                    }
                    if (!this._actionQueue.hasNext()) {
                        this._actionQueue.reset();
                    }
                    this._actionQueue.update(delta);
                };
                RepeatForever.prototype.isComplete = function () {
                    return this._stopped;
                };
                RepeatForever.prototype.stop = function () {
                    this._stopped = true;
                    this._actionQueue.clearActions();
                };
                RepeatForever.prototype.reset = function () { return; };
                return RepeatForever;
            }());
            Actions.RepeatForever = RepeatForever;
            /**
             * Action Queues
             *
             * Action queues are part of the [[ActionContext|Action API]] and
             * store the list of actions to be executed for an [[Actor]].
             *
             * Actors implement [[Action.actionQueue]] which can be manipulated by
             * advanced users to adjust the actions currently being executed in the
             * queue.
             */
            var ActionQueue = (function () {
                function ActionQueue(actor) {
                    this._actions = [];
                    this._completedActions = [];
                    this._actor = actor;
                }
                ActionQueue.prototype.add = function (action) {
                    this._actions.push(action);
                };
                ActionQueue.prototype.remove = function (action) {
                    var index = this._actions.indexOf(action);
                    this._actions.splice(index, 1);
                };
                ActionQueue.prototype.clearActions = function () {
                    this._actions.length = 0;
                    this._completedActions.length = 0;
                    if (this._currentAction) {
                        this._currentAction.stop();
                    }
                };
                ActionQueue.prototype.getActions = function () {
                    return this._actions.concat(this._completedActions);
                };
                ActionQueue.prototype.hasNext = function () {
                    return this._actions.length > 0;
                };
                ActionQueue.prototype.reset = function () {
                    this._actions = this.getActions();
                    var i = 0, len = this._actions.length;
                    for (i; i < len; i++) {
                        this._actions[i].reset();
                    }
                    this._completedActions = [];
                };
                ActionQueue.prototype.update = function (delta) {
                    if (this._actions.length > 0) {
                        this._currentAction = this._actions[0];
                        this._currentAction.update(delta);
                        if (this._currentAction.isComplete(this._actor)) {
                            this._completedActions.push(this._actions.shift());
                        }
                    }
                };
                return ActionQueue;
            }());
            Actions.ActionQueue = ActionQueue;
        })(Actions = Internal.Actions || (Internal.Actions = {}));
    })(Internal = ex.Internal || (ex.Internal = {}));
})(ex || (ex = {}));
/// <reference path="Action.ts"/>
var ex;
(function (ex) {
    /**
     * The fluent Action API allows you to perform "actions" on
     * [[Actor|Actors]] such as following, moving, rotating, and
     * more. You can implement your own actions by implementing
     * the [[IAction]] interface.
     *
     * [[include:Actions.md]]
     */
    var ActionContext = (function () {
        function ActionContext() {
            this._actors = [];
            this._queues = [];
            if (arguments !== null) {
                this._actors = Array.prototype.slice.call(arguments, 0);
                this._queues = this._actors.map(function (a) {
                    return a.actionQueue;
                });
            }
        }
        /**
         * Clears all queued actions from the Actor
         */
        ActionContext.prototype.clearActions = function () {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].clearActions();
            }
        };
        ActionContext.prototype.addActorToContext = function (actor) {
            this._actors.push(actor);
            // if we run into problems replace the line below with:
            this._queues.push(actor.actionQueue);
        };
        ActionContext.prototype.removeActorFromContext = function (actor) {
            var index = this._actors.indexOf(actor);
            if (index > -1) {
                this._actors.splice(index, 1);
                this._queues.splice(index, 1);
            }
        };
        /**
         * This method will move an actor to the specified `x` and `y` position over the
         * specified duration using a given [[EasingFunctions]] and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
         */
        ActionContext.prototype.easeTo = function (x, y, duration, easingFcn) {
            if (easingFcn === void 0) { easingFcn = ex.EasingFunctions.Linear; }
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.EaseTo(this._actors[i], x, y, duration, easingFcn));
            }
            return this;
        };
        /**
         * This method will move an actor to the specified x and y position at the
         * speed specified (in pixels per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x      The x location to move the actor to
         * @param y      The y location to move the actor to
         * @param speed  The speed in pixels per second to move
         */
        ActionContext.prototype.moveTo = function (x, y, speed) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.MoveTo(this._actors[i], x, y, speed));
            }
            return this;
        };
        /**
         * This method will move an actor to the specified x and y position by a
         * certain time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param x     The x location to move the actor to
         * @param y     The y location to move the actor to
         * @param time  The time it should take the actor to move to the new location in milliseconds
         */
        ActionContext.prototype.moveBy = function (x, y, time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.MoveBy(this._actors[i], x, y, time));
            }
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle at the speed
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param speed         The angular velocity of the rotation specified in radians per second
         * @param rotationType  The [[RotationType]] to use for this rotation
         */
        ActionContext.prototype.rotateTo = function (angleRadians, speed, rotationType) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.RotateTo(this._actors[i], angleRadians, speed, rotationType));
            }
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle by a certain
         * time (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param time          The time it should take the actor to complete the rotation in milliseconds
         * @param rotationType  The [[RotationType]] to use for this rotation
         */
        ActionContext.prototype.rotateBy = function (angleRadians, time, rotationType) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.RotateBy(this._actors[i], angleRadians, time, rotationType));
            }
            return this;
        };
        /**
         * This method will scale an actor to the specified size at the speed
         * specified (in magnitude increase per second) and return back the
         * actor. This method is part of the actor 'Action' fluent API allowing
         * action chaining.
         * @param sizeX   The scaling factor to apply on X axis
         * @param sizeY   The scaling factor to apply on Y axis
         * @param speedX  The speed of scaling specified in magnitude increase per second on X axis
         * @param speedY  The speed of scaling specified in magnitude increase per second on Y axis
         */
        ActionContext.prototype.scaleTo = function (sizeX, sizeY, speedX, speedY) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.ScaleTo(this._actors[i], sizeX, sizeY, speedX, speedY));
            }
            return this;
        };
        /**
         * This method will scale an actor to the specified size by a certain time
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @param sizeX   The scaling factor to apply on X axis
         * @param sizeY   The scaling factor to apply on Y axis
         * @param time    The time it should take to complete the scaling in milliseconds
         */
        ActionContext.prototype.scaleBy = function (sizeX, sizeY, time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.ScaleBy(this._actors[i], sizeX, sizeY, time));
            }
            return this;
        };
        /**
         * This method will cause an actor to blink (become visible and not
         * visible). Optionally, you may specify the number of blinks. Specify the amount of time
         * the actor should be visible per blink, and the amount of time not visible.
         * This method is part of the actor 'Action' fluent API allowing action chaining.
         * @param timeVisible     The amount of time to stay visible per blink in milliseconds
         * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
         * @param numBlinks       The number of times to blink
         */
        ActionContext.prototype.blink = function (timeVisible, timeNotVisible, numBlinks) {
            if (numBlinks === void 0) { numBlinks = 1; }
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Blink(this._actors[i], timeVisible, timeNotVisible, numBlinks));
            }
            return this;
        };
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified time (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @param opacity  The ending opacity
         * @param time     The time it should take to fade the actor (in milliseconds)
         */
        ActionContext.prototype.fade = function (opacity, time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Fade(this._actors[i], opacity, time));
            }
            return this;
        };
        /**
         * This method will delay the next action from executing for a certain
         * amount of time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param time  The amount of time to delay the next action in the queue from executing in milliseconds
         */
        ActionContext.prototype.delay = function (time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Delay(this._actors[i], time));
            }
            return this;
        };
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         */
        ActionContext.prototype.die = function () {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Die(this._actors[i]));
            }
            return this;
        };
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destination after traversing a path
         */
        ActionContext.prototype.callMethod = function (method) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.CallMethod(this._actors[i], method));
            }
            return this;
        };
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
         * will repeat forever
         */
        ActionContext.prototype.repeat = function (times) {
            if (!times) {
                this.repeatForever();
                return this;
            }
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Repeat(this._actors[i], times, this._actors[i].actionQueue.getActions()));
            }
            return this;
        };
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         */
        ActionContext.prototype.repeatForever = function () {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.RepeatForever(this._actors[i], this._actors[i].actionQueue.getActions()));
            }
            return this;
        };
        /**
         * This method will cause the actor to follow another at a specified distance
         * @param actor           The actor to follow
         * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
         */
        ActionContext.prototype.follow = function (actor, followDistance) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                if (followDistance === undefined) {
                    this._queues[i].add(new ex.Internal.Actions.Follow(this._actors[i], actor));
                }
                else {
                    this._queues[i].add(new ex.Internal.Actions.Follow(this._actors[i], actor, followDistance));
                }
            }
            return this;
        };
        /**
         * This method will cause the actor to move towards another until they
         * collide "meet" at a specified speed.
         * @param actor  The actor to meet
         * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
         */
        ActionContext.prototype.meet = function (actor, speed) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                if (speed === undefined) {
                    this._queues[i].add(new ex.Internal.Actions.Meet(this._actors[i], actor));
                }
                else {
                    this._queues[i].add(new ex.Internal.Actions.Meet(this._actors[i], actor, speed));
                }
            }
            return this;
        };
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         */
        ActionContext.prototype.asPromise = function () {
            var _this = this;
            var promises = this._queues.map(function (q, i) {
                var temp = new ex.Promise();
                q.add(new ex.Internal.Actions.CallMethod(_this._actors[i], function () {
                    temp.resolve();
                }));
                return temp;
            });
            return ex.Promise.join.apply(this, promises);
        };
        return ActionContext;
    }());
    ex.ActionContext = ActionContext;
})(ex || (ex = {}));
/// <reference path="Actions/IActionable.ts"/>
/// <reference path="Actions/ActionContext.ts"/>
/// <reference path="Collision/BoundingBox.ts"/>
/// <reference path="Interfaces/IEvented.ts" />
var ex;
(function (ex) {
    /**
     * Groups are used for logically grouping Actors so they can be acted upon
     * in bulk.
     *
     * [[include:Groups.md]]
     */
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(name, scene) {
            _super.call(this);
            this.name = name;
            this.scene = scene;
            this._logger = ex.Logger.getInstance();
            this._members = [];
            this.actions = new ex.ActionContext();
            if (scene == null) {
                this._logger.error('Invalid constructor arguments passed to Group: ', name, ', scene must not be null!');
            }
            else {
                var existingGroup = scene.groups[name];
                if (existingGroup) {
                    this._logger.warn('Group with name', name, 'already exists. This new group will replace it.');
                }
                scene.groups[name] = this;
            }
        }
        Group.prototype.add = function (actorOrActors) {
            if (actorOrActors instanceof ex.Actor) {
                actorOrActors = [].concat(actorOrActors);
            }
            var i = 0, len = actorOrActors.length, groupIdx;
            for (i; i < len; i++) {
                groupIdx = this.getMembers().indexOf(actorOrActors[i]);
                if (groupIdx === -1) {
                    this._members.push(actorOrActors[i]);
                    this.scene.add(actorOrActors[i]);
                    this.actions.addActorToContext(actorOrActors[i]);
                    this.eventDispatcher.wire(actorOrActors[i].eventDispatcher);
                }
            }
        };
        Group.prototype.remove = function (actor) {
            var index = this._members.indexOf(actor);
            if (index > -1) {
                this._members.splice(index, 1);
                this.actions.removeActorFromContext(actor);
                this.eventDispatcher.unwire(actor.eventDispatcher);
            }
        };
        Group.prototype.move = function (args) {
            var i = 0, members = this.getMembers(), len = members.length;
            if (arguments.length === 1 && args instanceof ex.Vector) {
                for (i; i < len; i++) {
                    members[i].pos.x += args.x;
                    members[i].pos.y += args.y;
                }
            }
            else if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
                var x = arguments[0];
                var y = arguments[1];
                for (i; i < len; i++) {
                    members[i].pos.x += x;
                    members[i].pos.y += y;
                }
            }
            else {
                this._logger.error('Invalid arguments passed to group move', this.name, 'args:', arguments);
            }
        };
        Group.prototype.rotate = function (angle) {
            if (typeof arguments[0] === 'number') {
                var r = arguments[0], i = 0, members = this.getMembers(), len = members.length;
                for (i; i < len; i++) {
                    members[i].rotation += r;
                }
            }
            else {
                this._logger.error('Invalid arguments passed to group rotate', this.name, 'args:', arguments);
            }
        };
        Group.prototype.on = function (eventName, handler) {
            this.eventDispatcher.on(eventName, handler);
        };
        Group.prototype.off = function (eventName, handler) {
            this.eventDispatcher.off(eventName, handler);
        };
        Group.prototype.emit = function (topic, event) {
            this.eventDispatcher.emit(topic, event);
        };
        Group.prototype.contains = function (actor) {
            return this.getMembers().indexOf(actor) > -1;
        };
        Group.prototype.getMembers = function () {
            return this._members;
        };
        Group.prototype.getRandomMember = function () {
            return this._members[Math.floor(Math.random() * this._members.length)];
        };
        Group.prototype.getBounds = function () {
            return this.getMembers().map(function (a) { return a.getBounds(); }).reduce(function (prev, curr) {
                return prev.combine(curr);
            });
        };
        return Group;
    }(ex.Class));
    ex.Group = Group;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * A sorted list implementation. NOTE: this implementation is not self-balancing
     */
    var SortedList = (function () {
        function SortedList(getComparable) {
            this._getComparable = getComparable;
        }
        SortedList.prototype.find = function (element) {
            return this._find(this._root, element);
        };
        SortedList.prototype._find = function (node, element) {
            if (node == null) {
                return false;
            }
            else if (this._getComparable.call(element) === node.getKey()) {
                if (node.getData().indexOf(element) > -1) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (this._getComparable.call(element) < node.getKey()) {
                return this._find(node.getLeft(), element);
            }
            else {
                return this._find(node.getRight(), element);
            }
        };
        // returns the array of elements at a specific key value
        SortedList.prototype.get = function (key) {
            return this._get(this._root, key);
        };
        SortedList.prototype._get = function (node, key) {
            if (node == null) {
                return [];
            }
            else if (key === node.getKey()) {
                return node.getData();
            }
            else if (key < node.getKey()) {
                return this._get(node.getLeft(), key);
            }
            else {
                return this._get(node.getRight(), key);
            }
        };
        SortedList.prototype.add = function (element) {
            if (this._root == null) {
                this._root = new BinaryTreeNode(this._getComparable.call(element), [element], null, null);
                return true;
            }
            else {
                return this._insert(this._root, element);
            }
        };
        SortedList.prototype._insert = function (node, element) {
            if (node != null) {
                if (this._getComparable.call(element) === node.getKey()) {
                    if (node.getData().indexOf(element) > -1) {
                        return false; // the element we're trying to insert already exists
                    }
                    else {
                        node.getData().push(element);
                        return true;
                    }
                }
                else if (this._getComparable.call(element) < node.getKey()) {
                    if (node.getLeft() == null) {
                        node.setLeft(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                        return true;
                    }
                    else {
                        return this._insert(node.getLeft(), element);
                    }
                }
                else {
                    if (node.getRight() == null) {
                        node.setRight(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                        return true;
                    }
                    else {
                        return this._insert(node.getRight(), element);
                    }
                }
            }
            return false;
        };
        SortedList.prototype.removeByComparable = function (element) {
            this._root = this._remove(this._root, element);
        };
        SortedList.prototype._remove = function (node, element) {
            if (node == null) {
                return null;
            }
            else if (this._getComparable.call(element) === node.getKey()) {
                var elementIndex = node.getData().indexOf(element);
                // if the node contains the element, remove the element
                if (elementIndex > -1) {
                    node.getData().splice(elementIndex, 1);
                    // if we have removed the last element at this node, remove the node
                    if (node.getData().length === 0) {
                        // if the node is a leaf
                        if (node.getLeft() == null && node.getRight() == null) {
                            return null;
                        }
                        else if (node.getLeft() == null) {
                            return node.getRight();
                        }
                        else if (node.getRight() == null) {
                            return node.getLeft();
                        }
                        // if node has 2 children
                        var temp = this._findMinNode(node.getRight());
                        node.setKey(temp.getKey());
                        node.setData(temp.getData());
                        node.setRight(this._cleanup(node.getRight(), temp)); //"cleanup nodes" (move them up recursively)
                        return node;
                    }
                    else {
                        // this prevents the node from being removed since it still contains elements
                        return node;
                    }
                }
            }
            else if (this._getComparable.call(element) < node.getKey()) {
                node.setLeft(this._remove(node.getLeft(), element));
                return node;
            }
            else {
                node.setRight(this._remove(node.getRight(), element));
                return node;
            }
        };
        // called once we have successfully removed the element we wanted, recursively corrects the part of the tree below the removed node
        SortedList.prototype._cleanup = function (node, element) {
            var comparable = element.getKey();
            if (node == null) {
                return null;
            }
            else if (comparable === node.getKey()) {
                // if the node is a leaf
                if (node.getLeft() == null && node.getRight() == null) {
                    return null;
                }
                else if (node.getLeft() == null) {
                    return node.getRight();
                }
                else if (node.getRight() == null) {
                    return node.getLeft();
                }
                // if node has 2 children
                var temp = this._findMinNode(node.getRight());
                node.setKey(temp.getKey());
                node.setData(temp.getData());
                node.setRight(this._cleanup(node.getRight(), temp));
                return node;
            }
            else if (this._getComparable.call(element) < node.getKey()) {
                node.setLeft(this._cleanup(node.getLeft(), element));
                return node;
            }
            else {
                node.setRight(this._cleanup(node.getRight(), element));
                return node;
            }
        };
        SortedList.prototype._findMinNode = function (node) {
            var current = node;
            while (current.getLeft() != null) {
                current = current.getLeft();
            }
            return current;
        };
        SortedList.prototype.list = function () {
            var results = new Array();
            this._list(this._root, results);
            return results;
        };
        SortedList.prototype._list = function (treeNode, results) {
            if (treeNode != null) {
                this._list(treeNode.getLeft(), results);
                treeNode.getData().forEach(function (element) {
                    results.push(element);
                });
                this._list(treeNode.getRight(), results);
            }
        };
        return SortedList;
    }());
    ex.SortedList = SortedList;
    /**
     * A tree node part of [[SortedList]]
     */
    var BinaryTreeNode = (function () {
        function BinaryTreeNode(key, data, left, right) {
            this._key = key;
            this._data = data;
            this._left = left;
            this._right = right;
        }
        BinaryTreeNode.prototype.getKey = function () {
            return this._key;
        };
        BinaryTreeNode.prototype.setKey = function (key) {
            this._key = key;
        };
        BinaryTreeNode.prototype.getData = function () {
            return this._data;
        };
        BinaryTreeNode.prototype.setData = function (data) {
            this._data = data;
        };
        BinaryTreeNode.prototype.getLeft = function () {
            return this._left;
        };
        BinaryTreeNode.prototype.setLeft = function (left) {
            this._left = left;
        };
        BinaryTreeNode.prototype.getRight = function () {
            return this._right;
        };
        BinaryTreeNode.prototype.setRight = function (right) {
            this._right = right;
        };
        return BinaryTreeNode;
    }());
    ex.BinaryTreeNode = BinaryTreeNode;
    /**
     * Mock element for testing
     *
     * @internal
     */
    var MockedElement = (function () {
        function MockedElement(key) {
            this._key = 0;
            this._key = key;
        }
        MockedElement.prototype.getTheKey = function () {
            return this._key;
        };
        MockedElement.prototype.setKey = function (key) {
            this._key = key;
        };
        return MockedElement;
    }());
    ex.MockedElement = MockedElement;
})(ex || (ex = {}));
/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
/// <reference path="Collision/NaiveCollisionBroadphase.ts"/>
/// <reference path="Collision/DynamicTreeCollisionBroadphase.ts"/>
/// <reference path="Camera.ts" />
/// <reference path="Group.ts"/>
/// <reference path="Util/SortedList.ts"/>
var ex;
(function (ex) {
    /**
     * [[Actor|Actors]] are composed together into groupings called Scenes in
     * Excalibur. The metaphor models the same idea behind real world
     * actors in a scene. Only actors in scenes will be updated and drawn.
     *
     * Typical usages of a scene include: levels, menus, loading screens, etc.
     *
     * [[include:Scenes.md]]
     */
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene(engine) {
            _super.call(this);
            /**
             * The actors in the current scene
             */
            this.children = [];
            /**
             * The [[TileMap]]s in the scene, if any
             */
            this.tileMaps = [];
            /**
             * The [[Group]]s in the scene, if any
             */
            this.groups = {};
            /**
             * The [[UIActor]]s in a scene, if any; these are drawn last
             */
            this.uiActors = [];
            this._isInitialized = false;
            this._sortedDrawingTree = new ex.SortedList(ex.Actor.prototype.getZIndex);
            this._broadphase = new ex.DynamicTreeCollisionBroadphase();
            this._killQueue = [];
            this._timers = [];
            this._cancelQueue = [];
            this._logger = ex.Logger.getInstance();
            this.camera = new ex.BaseCamera();
            if (engine) {
                this.camera.x = engine.width / 2;
                this.camera.y = engine.height / 2;
            }
        }
        Scene.prototype.on = function (eventName, handler) {
            _super.prototype.on.call(this, eventName, handler);
        };
        /**
         * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        Scene.prototype.onInitialize = function (engine) {
            // will be overridden
            if (this.camera) {
                this.camera.x = engine.width / 2;
                this.camera.y = engine.height / 2;
            }
            this._logger.debug('Scene.onInitialize', this, engine);
        };
        /**
         * This is called when the scene is made active and started. It is meant to be overriden,
         * this is where you should setup any DOM UI or event handlers needed for the scene.
         */
        Scene.prototype.onActivate = function () {
            // will be overridden
            this._logger.debug('Scene.onActivate', this);
        };
        /**
         * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
         * this is where you should cleanup any DOM UI or event handlers needed for the scene.
         */
        Scene.prototype.onDeactivate = function () {
            // will be overridden
            this._logger.debug('Scene.onDeactivate', this);
        };
        /**
         * Initializes actors in the scene
         */
        Scene.prototype._initializeChildren = function () {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
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
            enumerable: true,
            configurable: true
        });
        /**
         * Initializes the scene before the first update, meant to be called by engine not by users of
         * Excalibur
         * @internal
         */
        Scene.prototype._initialize = function (engine) {
            if (!this.isInitialized) {
                this.onInitialize.call(this, engine);
                this.eventDispatcher.emit('initialize', new ex.InitializeEvent(engine));
                this._initializeChildren();
                this._isInitialized = true;
            }
        };
        /**
         * Updates all the actors and timers in the scene. Called by the [[Engine]].
         * @param engine  Reference to the current Engine
         * @param delta   The number of milliseconds since the last update
         */
        Scene.prototype.update = function (engine, delta) {
            this.emit('preupdate', new ex.PreUpdateEvent(engine, delta, this));
            var i, len;
            if (this.camera) {
                this.camera.update(engine, delta);
            }
            // Cycle through actors updating UI actors
            for (i = 0, len = this.uiActors.length; i < len; i++) {
                engine.stats.currFrame.actors.ui++;
                this.uiActors[i].update(engine, delta);
            }
            // Cycle through actors updating tile maps
            for (i = 0, len = this.tileMaps.length; i < len; i++) {
                this.tileMaps[i].update(engine, delta);
            }
            // Cycle through actors updating actors
            for (i = 0, len = this.children.length; i < len; i++) {
                engine.stats.currFrame.actors.alive++;
                this.children[i].update(engine, delta);
            }
            // Run the broadphase and narrowphase
            if (this._broadphase && ex.Physics.enabled) {
                var beforeBroadphase = Date.now();
                this._broadphase.update(this.children, delta);
                var pairs = this._broadphase.broadphase(this.children, delta, engine.stats.currFrame);
                var afterBroadphase = Date.now();
                var beforeNarrowphase = Date.now();
                var iter = ex.Physics.collisionPasses;
                var collisionDelta = delta / iter;
                while (iter > 0) {
                    // Run the narrowphase
                    this._broadphase.narrowphase(pairs, engine.stats.currFrame);
                    // Run collision resolution strategy
                    this._broadphase.resolve(collisionDelta, ex.Physics.collisionResolutionStrategy);
                    iter--;
                }
                var afterNarrowphase = Date.now();
                engine.stats.currFrame.physics.broadphase = afterBroadphase - beforeBroadphase;
                engine.stats.currFrame.physics.narrowphase = afterNarrowphase - beforeNarrowphase;
            }
            // Remove actors from scene graph after being killed
            var actorIndex;
            for (i = 0, len = this._killQueue.length; i < len; i++) {
                actorIndex = this.children.indexOf(this._killQueue[i]);
                if (actorIndex > -1) {
                    this._sortedDrawingTree.removeByComparable(this._killQueue[i]);
                    this.children.splice(actorIndex, 1);
                }
            }
            engine.stats.currFrame.actors.killed = this._killQueue.length;
            this._killQueue.length = 0;
            // Remove timers in the cancel queue before updating them
            for (i = 0, len = this._cancelQueue.length; i < len; i++) {
                this.removeTimer(this._cancelQueue[i]);
            }
            this._cancelQueue.length = 0;
            // Cycle through timers updating timers
            this._timers = this._timers.filter(function (timer) {
                timer.update(delta);
                return !timer.complete;
            });
            this.emit('postupdate', new ex.PostUpdateEvent(engine, delta, this));
        };
        /**
         * Draws all the actors in the Scene. Called by the [[Engine]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        Scene.prototype.draw = function (ctx, delta) {
            this.emit('predraw', new ex.PreDrawEvent(ctx, delta, this));
            ctx.save();
            if (this.camera) {
                this.camera.draw(ctx, delta);
            }
            var i, len;
            for (i = 0, len = this.tileMaps.length; i < len; i++) {
                this.tileMaps[i].draw(ctx, delta);
            }
            var sortedChildren = this._sortedDrawingTree.list();
            for (i = 0, len = sortedChildren.length; i < len; i++) {
                // only draw actors that are visible and on screen
                if (sortedChildren[i].visible && !sortedChildren[i].isOffScreen) {
                    sortedChildren[i].draw(ctx, delta);
                }
            }
            if (this.engine && this.engine.isDebug) {
                ctx.strokeStyle = 'yellow';
                this.debugDraw(ctx);
            }
            ctx.restore();
            for (i = 0, len = this.uiActors.length; i < len; i++) {
                // only draw ui actors that are visible and on screen
                if (this.uiActors[i].visible) {
                    this.uiActors[i].draw(ctx, delta);
                }
            }
            if (this.engine && this.engine.isDebug) {
                for (i = 0, len = this.uiActors.length; i < len; i++) {
                    this.uiActors[i].debugDraw(ctx);
                }
            }
            this.emit('postdraw', new ex.PostDrawEvent(ctx, delta, this));
        };
        /**
         * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
         * @param ctx  The current rendering context
         */
        /* istanbul ignore next */
        Scene.prototype.debugDraw = function (ctx) {
            this.emit('predebugdraw', new ex.PreDebugDrawEvent(ctx, this));
            var i, len;
            for (i = 0, len = this.tileMaps.length; i < len; i++) {
                this.tileMaps[i].debugDraw(ctx);
            }
            for (i = 0, len = this.children.length; i < len; i++) {
                this.children[i].debugDraw(ctx);
            }
            this._broadphase.debugDraw(ctx, 20);
            this.camera.debugDraw(ctx);
            this.emit('postdebugdraw', new ex.PostDebugDrawEvent(ctx, this));
        };
        /**
         * Checks whether an actor is contained in this scene or not
         */
        Scene.prototype.contains = function (actor) {
            return this.children.indexOf(actor) > -1;
        };
        Scene.prototype.add = function (entity) {
            if (entity instanceof ex.Actor) {
                entity.unkill();
            }
            if (entity instanceof ex.UIActor) {
                if (!ex.Util.contains(this.uiActors, entity)) {
                    this.addUIActor(entity);
                }
                return;
            }
            if (entity instanceof ex.Actor) {
                if (!ex.Util.contains(this.children, entity)) {
                    this._addChild(entity);
                    this._sortedDrawingTree.add(entity);
                }
                return;
            }
            if (entity instanceof ex.Timer) {
                if (!ex.Util.contains(this._timers, entity)) {
                    this.addTimer(entity);
                }
                return;
            }
            if (entity instanceof ex.TileMap) {
                if (!ex.Util.contains(this.tileMaps, entity)) {
                    this.addTileMap(entity);
                }
            }
        };
        Scene.prototype.remove = function (entity) {
            if (entity instanceof ex.UIActor) {
                this.removeUIActor(entity);
                return;
            }
            if (entity instanceof ex.Actor) {
                this._broadphase.untrack(entity.body);
                this._removeChild(entity);
            }
            if (entity instanceof ex.Timer) {
                this.removeTimer(entity);
            }
            if (entity instanceof ex.TileMap) {
                this.removeTileMap(entity);
            }
        };
        /**
         * Adds (any) actor to act as a piece of UI, meaning it is always positioned
         * in screen coordinates. UI actors do not participate in collisions.
         * @todo Should this be `UIActor` only?
         */
        Scene.prototype.addUIActor = function (actor) {
            this.uiActors.push(actor);
            actor.scene = this;
        };
        /**
         * Removes an actor as a piece of UI
         */
        Scene.prototype.removeUIActor = function (actor) {
            var index = this.uiActors.indexOf(actor);
            if (index > -1) {
                this.uiActors.splice(index, 1);
            }
        };
        /**
         * Adds an actor to the scene, once this is done the actor will be drawn and updated.
         */
        Scene.prototype._addChild = function (actor) {
            this._broadphase.track(actor.body);
            actor.scene = this;
            this.children.push(actor);
            this._sortedDrawingTree.add(actor);
            actor.parent = this.actor;
        };
        /**
         * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
         */
        Scene.prototype.addTileMap = function (tileMap) {
            this.tileMaps.push(tileMap);
        };
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         */
        Scene.prototype.removeTileMap = function (tileMap) {
            var index = this.tileMaps.indexOf(tileMap);
            if (index > -1) {
                this.tileMaps.splice(index, 1);
            }
        };
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         */
        Scene.prototype._removeChild = function (actor) {
            this._broadphase.untrack(actor.body);
            this._killQueue.push(actor);
            actor.parent = null;
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
            return (this._timers.indexOf(timer) > -1);
        };
        /**
         * Creates and adds a [[Group]] to the scene with a name
         */
        Scene.prototype.createGroup = function (name) {
            return new ex.Group(name, this);
        };
        /**
         * Returns a [[Group]] by name
         */
        Scene.prototype.getGroup = function (name) {
            return this.groups[name];
        };
        Scene.prototype.removeGroup = function (group) {
            if (typeof group === 'string') {
                delete this.groups[group];
            }
            else if (group instanceof ex.Group) {
                delete this.groups[group.name];
            }
            else {
                this._logger.error('Invalid arguments to removeGroup', group);
            }
        };
        /**
         * Removes the given actor from the sorted drawing tree
         */
        Scene.prototype.cleanupDrawTree = function (actor) {
            this._sortedDrawingTree.removeByComparable(actor);
        };
        /**
         * Updates the given actor's position in the sorted drawing tree
         */
        Scene.prototype.updateDrawTree = function (actor) {
            this._sortedDrawingTree.add(actor);
        };
        return Scene;
    }(ex.Class));
    ex.Scene = Scene;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Standard easing functions for motion in Excalibur, defined on a domain of [0, duration] and a range from [+startValue,+endValue]
     * Given a time, the function will return a value from positive startValue to positive endValue.
     *
     * ```js
     * function Linear (t) {
     *    return t * t;
     * }
     *
     * // accelerating from zero velocity
     * function EaseInQuad (t) {
     *    return t * t;
     * }
     *
     * // decelerating to zero velocity
     * function EaseOutQuad (t) {
     *    return t * (2 - t);
     * }
     *
     * // acceleration until halfway, then deceleration
     * function EaseInOutQuad (t) {
     *    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
     * }
     *
     * // accelerating from zero velocity
     * function EaseInCubic (t) {
     *    return t * t * t;
     * }
     *
     * // decelerating to zero velocity
     * function EaseOutCubic (t) {
     *    return (--t) * t * t + 1;
     * }
     *
     * // acceleration until halfway, then deceleration
     * function EaseInOutCubic (t) {
     *    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
     * }
     * ```
     */
    var EasingFunctions = (function () {
        function EasingFunctions() {
        }
        EasingFunctions.Linear = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            return endValue * currentTime / duration + startValue;
        };
        EasingFunctions.EaseInQuad = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration;
            return endValue * currentTime * currentTime + startValue;
        };
        EasingFunctions.EaseOutQuad = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration;
            return -endValue * currentTime * (currentTime - 2) + startValue;
        };
        EasingFunctions.EaseInOutQuad = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return endValue / 2 * currentTime * currentTime + startValue;
            }
            currentTime--;
            return -endValue / 2 * (currentTime * (currentTime - 2) - 1) + startValue;
        };
        EasingFunctions.EaseInCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration;
            return endValue * currentTime * currentTime * currentTime + startValue;
        };
        EasingFunctions.EaseOutCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration;
            currentTime--;
            return endValue * (currentTime * currentTime * currentTime + 1) + startValue;
        };
        EasingFunctions.EaseInOutCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return endValue / 2 * currentTime * currentTime * currentTime + startValue;
            }
            currentTime -= 2;
            return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
        };
        return EasingFunctions;
    }());
    ex.EasingFunctions = EasingFunctions;
})(ex || (ex = {}));
/// <reference path="Interfaces/IDrawable.ts" />
/// <reference path="Collision/ICollisionArea.ts" />
/// <reference path="Collision/PolygonArea.ts" />
/// <reference path="Interfaces/IEvented.ts" />
/// <reference path="Traits/EulerMovement.ts" />
/// <reference path="Traits/OffscreenCulling.ts" />
/// <reference path="Traits/CapturePointer.ts" />
/// <reference path="Traits/TileMapCollisionDetection.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Collision/BoundingBox.ts" />
/// <reference path="Collision/Body.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actions/IActionable.ts"/>
/// <reference path="Actions/Action.ts" />
/// <reference path="Actions/ActionContext.ts"/>
/// <reference path="Util/EasingFunctions.ts"/>
var ex;
(function (ex) {
    /**
     * The most important primitive in Excalibur is an `Actor`. Anything that
     * can move on the screen, collide with another `Actor`, respond to events,
     * or interact with the current scene, must be an actor. An `Actor` **must**
     * be part of a [[Scene]] for it to be drawn to the screen.
     *
     * [[include:Actors.md]]
     *
     */
    var Actor = (function (_super) {
        __extends(Actor, _super);
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
         * initial [[opacity]].
         */
        function Actor(x, y, width, height, color) {
            _super.call(this);
            /**
             * The unique identifier for the actor
             */
            this.id = Actor.maxId++;
            /**
             * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
             * acceleration, mass, inertia, etc.
             */
            this.body = new ex.Body(this);
            this._height = 0;
            this._width = 0;
            /**
             * The scale vector of the actor
             */
            this.scale = new ex.Vector(1, 1);
            /**
             * The x scalar velocity of the actor in scale/second
             */
            this.sx = 0; //scale/sec
            /**
             * The y scalar velocity of the actor in scale/second
             */
            this.sy = 0; //scale/sec
            /**
             * Indicates whether the actor is physically in the viewport
             */
            this.isOffScreen = false;
            /**
             * The visibility of an actor
             */
            this.visible = true;
            /**
             * The opacity of an actor. Passing in a color in the [[constructor]] will use the
             * color's opacity.
             */
            this.opacity = 1;
            this.previousOpacity = 1;
            /**
             * Convenience reference to the global logger
             */
            this.logger = ex.Logger.getInstance();
            /**
             * The scene that the actor is in
             */
            this.scene = null;
            /**
             * The parent of this actor
             */
            this.parent = null;
            // TODO: Replace this with the new actor collection once z-indexing is built
            /**
             * The children of this actor
             */
            this.children = [];
            /**
             * Gets or sets the current collision type of this actor. By
             * default it is ([[CollisionType.PreventCollision]]).
             */
            this.collisionType = CollisionType.PreventCollision;
            this.collisionGroups = [];
            this._collisionHandlers = {};
            this._isInitialized = false;
            this.frames = {};
            this._effectsDirty = false;
            /**
             * Access to the current drawing for the actor, this can be
             * an [[Animation]], [[Sprite]], or [[Polygon]].
             * Set drawings with [[setDrawing]].
             */
            this.currentDrawing = null;
            /**
             * Modify the current actor update pipeline.
             */
            this.traits = [];
            /**
             * Whether or not to enable the [[CapturePointer]] trait that propagates
             * pointer events to this actor
             */
            this.enableCapturePointer = false;
            /**
             * Configuration for [[CapturePointer]] trait
             */
            this.capturePointer = {
                captureMoveEvents: false
            };
            this._zIndex = 0;
            this._isKilled = false;
            this._opacityFx = new ex.Effects.Opacity(this.opacity);
            this.pos.x = x || 0;
            this.pos.y = y || 0;
            this._width = width || 0;
            this._height = height || 0;
            if (color) {
                this.color = color.clone();
                // set default opacity of an actor to the color
                this.opacity = color.a;
            }
            // Build default pipeline
            //this.traits.push(new ex.Traits.EulerMovement());
            // TODO: TileMaps should be converted to a collision area
            this.traits.push(new ex.Traits.TileMapCollisionDetection());
            this.traits.push(new ex.Traits.OffscreenCulling());
            this.traits.push(new ex.Traits.CapturePointer());
            // Build the action queue
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
            this.actions = new ex.ActionContext(this);
            // default anchor is in the middle
            this.anchor = new ex.Vector(.5, .5);
            // Initialize default collision area to be box
            this.body.useBoxCollision();
        }
        Object.defineProperty(Actor.prototype, "collisionArea", {
            /**
             * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and
             * [EdgeArea|edges].
             */
            get: function () {
                return this.body.collisionArea;
            },
            /**
             * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and
             * [EdgeArea|edges].
             */
            set: function (area) {
                this.body.collisionArea = area;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "x", {
            /**
             * Gets the x position of the actor relative to it's parent (if any)
             */
            get: function () {
                return this.body.pos.x;
            },
            /**
             * Sets the x position of the actor relative to it's parent (if any)
             */
            set: function (theX) {
                this.body.pos.x = theX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "y", {
            /**
             * Gets the y position of the actor relative to it's parent (if any)
             */
            get: function () {
                return this.body.pos.y;
            },
            /**
             * Sets the y position of the actor relative to it's parent (if any)
             */
            set: function (theY) {
                this.body.pos.y = theY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "pos", {
            /**
             * Gets the position vector of the actor in pixels
             */
            get: function () {
                return this.body.pos;
            },
            /**
             * Sets the position vector of the actor in pixels
             */
            set: function (thePos) {
                this.body.pos = thePos;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "oldPos", {
            /**
             * Gets the position vector of the actor from the last frame
             */
            get: function () {
                return this.body.oldPos;
            },
            /**
             * Sets the position vector of the actor in the last frame
             */
            set: function (thePos) {
                this.body.oldPos = thePos;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "vel", {
            /**
             * Gets the velocity vector of the actor in pixels/sec
             */
            get: function () {
                return this.body.vel;
            },
            /**
             * Sets the velocity vector of the actor in pixels/sec
             */
            set: function (theVel) {
                this.body.vel = theVel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "oldVel", {
            /**
             * Gets the velocity vector of the actor from the last frame
             */
            get: function () {
                return this.body.oldVel;
            },
            /**
             * Sets the velocity vector of the actor from the last frame
             */
            set: function (theVel) {
                this.body.oldVel = theVel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "acc", {
            /**
             * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
             * useful to simulate a gravitational effect.
             */
            get: function () {
                return this.body.acc;
            },
            /**
             * Sets the acceleration vector of teh actor in pixels/second/second
             */
            set: function (theAcc) {
                this.body.acc = theAcc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "rotation", {
            /**
             * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
             */
            get: function () {
                return this.body.rotation;
            },
            /**
             * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
             */
            set: function (theAngle) {
                this.body.rotation = theAngle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "rx", {
            /**
             * Gets the rotational velocity of the actor in radians/second
             */
            get: function () {
                return this.body.rx;
            },
            /**
             * Sets the rotational velocity of the actor in radians/sec
             */
            set: function (angularVelocity) {
                this.body.rx = angularVelocity;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "torque", {
            /**
             * Gets the current torque applied to the actor. Torque can be thought of as rotational force
             */
            get: function () {
                return this.body.torque;
            },
            /**
             * Sets the current torque applied to the actor. Torque can be thought of as rotational force
             */
            set: function (theTorque) {
                this.body.torque = theTorque;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "mass", {
            /**
             * Get the current mass of the actor, mass can be thought of as the resistance to acceleration.
             */
            get: function () {
                return this.body.mass;
            },
            /**
             * Sets the mass of the actor, mass can be thought of as the resistance to acceleration.
             */
            set: function (theMass) {
                this.body.mass = theMass;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "moi", {
            /**
             * Gets the current moment of inertia, moi can be thought of as the resistance to rotation.
             */
            get: function () {
                return this.body.moi;
            },
            /**
             * Sets the current moment of inertia, moi can be thought of as the resistance to rotation.
             */
            set: function (theMoi) {
                this.body.moi = theMoi;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "friction", {
            /**
             * Gets the coefficient of friction on this actor, this can be thought of as how sticky or slippery an object is.
             */
            get: function () {
                return this.body.friction;
            },
            /**
             * Sets the coefficient of friction of this actor, this can ve thought of as how stick or slippery an object is.
             */
            set: function (theFriction) {
                this.body.friction = theFriction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "restitution", {
            /**
             * Gets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
             * as bounciness.
             */
            get: function () {
                return this.body.restitution;
            },
            /**
             * Sets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
             * as bounciness.
             */
            set: function (theRestitution) {
                this.body.restitution = theRestitution;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        Actor.prototype.onInitialize = function (engine) {
            // Override me
        };
        Object.defineProperty(Actor.prototype, "isInitialized", {
            /**
             * Gets wether the actor is Initialized
             */
            get: function () {
                return this._isInitialized;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
         * @internal
         */
        Actor.prototype._initialize = function (engine) {
            if (!this.isInitialized) {
                this.onInitialize(engine);
                this.eventDispatcher.emit('initialize', new ex.InitializeEvent(engine));
                this._isInitialized = true;
            }
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child._initialize(engine);
            }
        };
        Actor.prototype._checkForPointerOptIn = function (eventName) {
            if (eventName) {
                var normalized = eventName.toLowerCase();
                if (normalized === 'pointerup' || normalized === 'pointerdown' || normalized === 'pointermove') {
                    this.enableCapturePointer = true;
                    if (normalized === 'pointermove') {
                        this.capturePointer.captureMoveEvents = true;
                    }
                }
            }
        };
        Actor.prototype.on = function (eventName, handler) {
            this._checkForPointerOptIn(eventName);
            this.eventDispatcher.on(eventName, handler);
        };
        /**
         * If the current actor is a member of the scene, this will remove
         * it from the scene graph. It will no longer be drawn or updated.
         */
        Actor.prototype.kill = function () {
            if (this.scene) {
                this.emit('kill', new ex.KillEvent(this));
                this.scene.remove(this);
                this._isKilled = true;
            }
            else {
                this.logger.warn('Cannot kill actor, it was never added to the Scene');
            }
        };
        /**
         * If the current actor is killed, it will now not be killed.
         */
        Actor.prototype.unkill = function () {
            this._isKilled = false;
        };
        /**
         * Indicates wether the actor has been killed.
         */
        Actor.prototype.isKilled = function () {
            return this._isKilled;
        };
        /**
         * Adds a child actor to this actor. All movement of the child actor will be
         * relative to the parent actor. Meaning if the parent moves the child will
         * move with it.
         * @param actor The child actor to add
         */
        Actor.prototype.add = function (actor) {
            actor.collisionType = CollisionType.PreventCollision;
            if (ex.Util.addItemToArray(actor, this.children)) {
                actor.parent = this;
            }
        };
        /**
         * Removes a child actor from this actor.
         * @param actor The child actor to remove
         */
        Actor.prototype.remove = function (actor) {
            if (ex.Util.removeItemToArray(actor, this.children)) {
                actor.parent = null;
            }
        };
        Actor.prototype.setDrawing = function (key) {
            key = key.toString();
            if (this.currentDrawing !== this.frames[key]) {
                if (this.frames[key] != null) {
                    this.frames[key].reset();
                    this.currentDrawing = this.frames[key];
                }
                else {
                    ex.Logger.getInstance().error('the specified drawing key \'' + key + '\' does not exist');
                }
            }
        };
        Actor.prototype.addDrawing = function (args) {
            if (arguments.length === 2) {
                this.frames[arguments[0]] = arguments[1];
                if (!this.currentDrawing) {
                    this.currentDrawing = arguments[1];
                }
                this._effectsDirty = true;
            }
            else {
                if (arguments[0] instanceof ex.Sprite) {
                    this.addDrawing('default', arguments[0]);
                }
                if (arguments[0] instanceof ex.Texture) {
                    this.addDrawing('default', arguments[0].asSprite());
                }
            }
        };
        Object.defineProperty(Actor.prototype, "z", {
            get: function () {
                return this.getZIndex();
            },
            set: function (newZ) {
                this.setZIndex(newZ);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         */
        Actor.prototype.getZIndex = function () {
            return this._zIndex;
        };
        /**
         * Sets the z-index of an actor and updates it in the drawing list for the scene.
         * The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         * @param newIndex new z-index to assign
         */
        Actor.prototype.setZIndex = function (newIndex) {
            this.scene.cleanupDrawTree(this);
            this._zIndex = newIndex;
            this.scene.updateDrawTree(this);
        };
        /**
         * Adds an actor to a collision group. Actors with no named collision groups are
         * considered to be in every collision group.
         *
         * Once in a collision group(s) actors will only collide with other actors in
         * that group.
         *
         * @param name The name of the collision group
         */
        Actor.prototype.addCollisionGroup = function (name) {
            this.collisionGroups.push(name);
        };
        /**
         * Removes an actor from a collision group.
         * @param name The name of the collision group
         */
        Actor.prototype.removeCollisionGroup = function (name) {
            var index = this.collisionGroups.indexOf(name);
            if (index !== -1) {
                this.collisionGroups.splice(index, 1);
            }
        };
        /**
         * Get the center point of an actor
         */
        Actor.prototype.getCenter = function () {
            return new ex.Vector(this.pos.x + this.getWidth() / 2 - this.anchor.x * this.getWidth(), this.pos.y + this.getHeight() / 2 - this.anchor.y * this.getHeight());
        };
        /**
         * Gets the calculated width of an actor, factoring in scale
         */
        Actor.prototype.getWidth = function () {
            return this._width * this.getGlobalScale().x;
        };
        /**
         * Sets the width of an actor, factoring in the current scale
         */
        Actor.prototype.setWidth = function (width) {
            this._width = width / this.scale.x;
        };
        /**
         * Gets the calculated height of an actor, factoring in scale
         */
        Actor.prototype.getHeight = function () {
            return this._height * this.getGlobalScale().y;
        };
        /**
         * Sets the height of an actor, factoring in the current scale
         */
        Actor.prototype.setHeight = function (height) {
            this._height = height / this.scale.y;
        };
        /**
         * Gets the left edge of the actor
         */
        Actor.prototype.getLeft = function () {
            return this.getBounds().left;
        };
        /**
         * Gets the right edge of the actor
         */
        Actor.prototype.getRight = function () {
            return this.getBounds().right;
        };
        /**
         * Gets the top edge of the actor
         */
        Actor.prototype.getTop = function () {
            return this.getBounds().top;
        };
        /**
         * Gets the bottom edge of the actor
         */
        Actor.prototype.getBottom = function () {
            return this.getBounds().bottom;
        };
        /**
         * Gets this actor's rotation taking into account any parent relationships
         *
         * @returns Rotation angle in radians
         */
        Actor.prototype.getWorldRotation = function () {
            if (!this.parent) {
                return this.rotation;
            }
            return this.rotation + this.parent.getWorldRotation();
        };
        /**
         * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
         *
         * @returns Position in world coordinates
         */
        Actor.prototype.getWorldPos = function () {
            if (!this.parent) {
                return this.pos.clone();
            }
            // collect parents                  
            var parents = [];
            var root = this;
            parents.push(this);
            // find parents
            while (root.parent) {
                root = root.parent;
                parents.push(root);
            }
            // calculate position       
            var x = parents.reduceRight(function (px, p, i, arr) {
                if (p.parent) {
                    return px + (p.pos.x * p.getGlobalScale().x);
                }
                return px + p.pos.x;
            }, 0);
            var y = parents.reduceRight(function (py, p, i, arr) {
                if (p.parent) {
                    return py + (p.pos.y * p.getGlobalScale().y);
                }
                return py + p.pos.y;
            }, 0);
            // rotate around root anchor
            var ra = root.getWorldPos(); // 10, 10
            var r = this.getWorldRotation();
            return new ex.Vector(x, y).rotate(r, ra);
        };
        /**
         * Gets the global scale of the Actor
         */
        Actor.prototype.getGlobalScale = function () {
            if (!this.parent) {
                return new ex.Vector(this.scale.x, this.scale.y);
            }
            var parentScale = this.parent.getGlobalScale();
            return new ex.Vector(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
        };
        /**
         * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
         */
        Actor.prototype.getBounds = function () {
            // todo cache bounding box
            var anchor = this._getCalculatedAnchor();
            var pos = this.getWorldPos();
            return new ex.BoundingBox(pos.x - anchor.x, pos.y - anchor.y, pos.x + this.getWidth() - anchor.x, pos.y + this.getHeight() - anchor.y).rotate(this.rotation, pos);
        };
        /**
         * Returns the actor's [[BoundingBox]] relative to the actors position.
         */
        Actor.prototype.getRelativeBounds = function () {
            // todo cache bounding box
            var anchor = this._getCalculatedAnchor();
            return new ex.BoundingBox(-anchor.x, -anchor.y, this.getWidth() - anchor.x, this.getHeight() - anchor.y).rotate(this.rotation);
        };
        /**
         * Tests whether the x/y specified are contained in the actor
         * @param x  X coordinate to test (in world coordinates)
         * @param y  Y coordinate to test (in world coordinates)
         * @param recurse checks whether the x/y are contained in any child actors (if they exist).
         */
        Actor.prototype.contains = function (x, y, recurse) {
            if (recurse === void 0) { recurse = false; }
            var containment = this.getBounds().contains(new ex.Vector(x, y));
            if (recurse) {
                return containment || this.children.some(function (child) {
                    return child.contains(x, y, true);
                });
            }
            return containment;
        };
        /**
         * Returns the side of the collision based on the intersection
         * @param intersect The displacement vector returned by a collision
         */
        Actor.prototype.getSideFromIntersect = function (intersect) {
            if (intersect) {
                if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
                    if (intersect.x < 0) {
                        return ex.Side.Right;
                    }
                    return ex.Side.Left;
                }
                else {
                    if (intersect.y < 0) {
                        return ex.Side.Bottom;
                    }
                    return ex.Side.Top;
                }
            }
            return ex.Side.None;
        };
        /**
         * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
         * @param actor The other actor to test
         */
        Actor.prototype.collidesWithSide = function (actor) {
            var separationVector = this.collides(actor);
            if (!separationVector) {
                return ex.Side.None;
            }
            if (Math.abs(separationVector.x) > Math.abs(separationVector.y)) {
                if (this.pos.x < actor.pos.x) {
                    return ex.Side.Right;
                }
                else {
                    return ex.Side.Left;
                }
            }
            else {
                if (this.pos.y < actor.pos.y) {
                    return ex.Side.Bottom;
                }
                else {
                    return ex.Side.Top;
                }
            }
        };
        /**
         * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
         * `null` when there is no collision;
         * @param actor The other actor to test
         */
        Actor.prototype.collides = function (actor) {
            var bounds = this.getBounds();
            var otherBounds = actor.getBounds();
            var intersect = bounds.collides(otherBounds);
            return intersect;
        };
        /**
         * Register a handler to fire when this actor collides with another in a specified group
         * @param group The group name to listen for
         * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
         */
        Actor.prototype.onCollidesWith = function (group, func) {
            if (!this._collisionHandlers[group]) {
                this._collisionHandlers[group] = [];
            }
            this._collisionHandlers[group].push(func);
        };
        Actor.prototype.getCollisionHandlers = function () {
            return this._collisionHandlers;
        };
        /**
         * Removes all collision handlers for this group on this actor
         * @param group Group to remove all handlers for on this actor.
         */
        Actor.prototype.removeCollidesWith = function (group) {
            this._collisionHandlers[group] = [];
        };
        /**
         * Returns true if the two actors are less than or equal to the distance specified from each other
         * @param actor     Actor to test
         * @param distance  Distance in pixels to test
         */
        Actor.prototype.within = function (actor, distance) {
            return Math.sqrt(Math.pow(this.pos.x - actor.pos.x, 2) + Math.pow(this.pos.y - actor.pos.y, 2)) <= distance;
        };
        Actor.prototype._getCalculatedAnchor = function () {
            return new ex.Vector(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);
        };
        Actor.prototype._reapplyEffects = function (drawing) {
            drawing.removeEffect(this._opacityFx);
            drawing.addEffect(this._opacityFx);
        };
        /**
         * Perform euler integration at the specified time step
         */
        Actor.prototype.integrate = function (delta) {
            // Update placements based on linear algebra
            var seconds = delta / 1000;
            var totalAcc = this.acc.clone();
            // Only active vanilla actors are affected by global acceleration
            if (this.collisionType === ex.CollisionType.Active &&
                !(this instanceof ex.UIActor) &&
                !(this instanceof ex.Trigger) &&
                !(this instanceof ex.Label)) {
                totalAcc.addEqual(ex.Physics.acc);
            }
            this.vel.addEqual(totalAcc.scale(seconds));
            this.pos.addEqual(this.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));
            this.rx += this.torque * (1.0 / this.moi) * seconds;
            this.rotation += this.rx * seconds;
            this.scale.x += this.sx * delta / 1000;
            this.scale.y += this.sy * delta / 1000;
            // Update physics body
            this.body.update();
        };
        /**
         * Called by the Engine, updates the state of the actor
         * @param engine The reference to the current game engine
         * @param delta  The time elapsed since the last update in milliseconds
         */
        Actor.prototype.update = function (engine, delta) {
            this._initialize(engine);
            this.emit('preupdate', new ex.PreUpdateEvent(engine, delta, this));
            // Update action queue
            this.actionQueue.update(delta);
            // Update color only opacity
            if (this.color) {
                this.color.a = this.opacity;
            }
            // calculate changing opacity
            if (this.previousOpacity !== this.opacity) {
                this.previousOpacity = this.opacity;
                this._opacityFx.opacity = this.opacity;
                this._effectsDirty = true;
            }
            // Capture old values before integration step updates them
            this.oldVel.setTo(this.vel.x, this.vel.y);
            this.oldPos.setTo(this.pos.x, this.pos.y);
            // Run Euler integration
            this.integrate(delta);
            // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
            for (var _i = 0, _a = this.traits; _i < _a.length; _i++) {
                var trait = _a[_i];
                trait.update(this, engine, delta);
            }
            // Update child actors
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] instanceof ex.UIActor) {
                    engine.stats.currFrame.actors.ui++;
                }
                else {
                    engine.stats.currFrame.actors.alive++;
                }
                this.children[i].update(engine, delta);
            }
            // TODO: Obsolete `update` event on Actor
            this.eventDispatcher.emit('update', new ex.PostUpdateEvent(engine, delta, this));
            this.emit('postupdate', new ex.PostUpdateEvent(engine, delta, this));
        };
        /**
         * Called by the Engine, draws the actor to the screen
         * @param ctx   The rendering context
         * @param delta The time since the last draw in milliseconds
         */
        Actor.prototype.draw = function (ctx, delta) {
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.scale(this.scale.x, this.scale.y);
            ctx.rotate(this.rotation);
            // translate canvas by anchor offset
            ctx.save();
            ctx.translate(-(this._width * this.anchor.x), -(this._height * this.anchor.y));
            this.emit('predraw', new ex.PreDrawEvent(ctx, delta, this));
            if (this.currentDrawing) {
                var drawing = this.currentDrawing;
                // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula          
                var offsetX = (this._width - drawing.naturalWidth * drawing.scale.x) * this.anchor.x;
                var offsetY = (this._height - drawing.naturalHeight * drawing.scale.y) * this.anchor.y;
                if (this._effectsDirty) {
                    this._reapplyEffects(this.currentDrawing);
                    this._effectsDirty = false;
                }
                this.currentDrawing.draw(ctx, offsetX, offsetY);
            }
            else {
                if (this.color) {
                    ctx.fillStyle = this.color.toString();
                    ctx.fillRect(0, 0, this._width, this._height);
                }
            }
            ctx.restore();
            // Draw child actors
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].visible) {
                    this.children[i].draw(ctx, delta);
                }
            }
            this.emit('postdraw', new ex.PostDrawEvent(ctx, delta, this));
            ctx.restore();
        };
        /**
         * Called by the Engine, draws the actors debugging to the screen
         * @param ctx The rendering context
         */
        /* istanbul ignore next */
        Actor.prototype.debugDraw = function (ctx) {
            this.emit('predebugdraw', new ex.PreDebugDrawEvent(ctx, this));
            this.body.debugDraw(ctx);
            // Draw actor bounding box
            var bb = this.getBounds();
            bb.debugDraw(ctx);
            // Draw actor Id
            ctx.fillText('id: ' + this.id, bb.left + 3, bb.top + 10);
            // Draw actor anchor Vector
            ctx.fillStyle = ex.Color.Yellow.toString();
            ctx.beginPath();
            ctx.arc(this.getWorldPos().x, this.getWorldPos().y, 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            // Culling Box debug draw
            for (var j = 0; j < this.traits.length; j++) {
                if (this.traits[j] instanceof ex.Traits.OffscreenCulling) {
                    this.traits[j].cullingBox.debugDraw(ctx);
                }
            }
            // Unit Circle debug draw
            ctx.strokeStyle = ex.Color.Yellow.toString();
            ctx.beginPath();
            var radius = Math.min(this.getWidth(), this.getHeight());
            ctx.arc(this.getWorldPos().x, this.getWorldPos().y, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            var ticks = { '0 Pi': 0,
                'Pi/2': Math.PI / 2,
                'Pi': Math.PI,
                '3/2 Pi': 3 * Math.PI / 2 };
            var oldFont = ctx.font;
            for (var tick in ticks) {
                ctx.fillStyle = ex.Color.Yellow.toString();
                ctx.font = '14px';
                ctx.textAlign = 'center';
                ctx.fillText(tick, this.getWorldPos().x + Math.cos(ticks[tick]) * (radius + 10), this.getWorldPos().y + Math.sin(ticks[tick]) * (radius + 10));
            }
            ctx.font = oldFont;
            // Draw child actors
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].debugDraw(ctx);
            }
            this.emit('postdebugdraw', new ex.PostDebugDrawEvent(ctx, this));
        };
        /**
         * Indicates the next id to be set
         */
        Actor.maxId = 0;
        return Actor;
    }(ex.Class));
    ex.Actor = Actor;
    /**
     * An enum that describes the types of collisions actors can participate in
     */
    (function (CollisionType) {
        /**
         * Actors with the `PreventCollision` setting do not participate in any
         * collisions and do not raise collision events.
         */
        CollisionType[CollisionType["PreventCollision"] = 0] = "PreventCollision";
        /**
         * Actors with the `Passive` setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         */
        CollisionType[CollisionType["Passive"] = 1] = "Passive";
        /**
         * Actors with the `Active` setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the `Active` or `Fixed` setting.
         */
        CollisionType[CollisionType["Active"] = 2] = "Active";
        /**
         * Actors with the `Elastic` setting will behave the same as `Active`, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         * @obsolete This behavior will be handled by a future physics system
         */
        CollisionType[CollisionType["Elastic"] = 3] = "Elastic";
        /**
         * Actors with the `Fixed` setting raise collision events and participate in
         * collisions with other actors. Actors with the `Fixed` setting will not be
         * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
         * actors as "immovable/onstoppable" objects. If two `Fixed` actors meet they will
         * not be pushed or moved by each other, they will not interact except to throw
         * collision events.
         */
        CollisionType[CollisionType["Fixed"] = 4] = "Fixed";
    })(ex.CollisionType || (ex.CollisionType = {}));
    var CollisionType = ex.CollisionType;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Logging level that Excalibur will tag
     */
    (function (LogLevel) {
        LogLevel[LogLevel["Debug"] = 0] = "Debug";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
        LogLevel[LogLevel["Fatal"] = 4] = "Fatal";
    })(ex.LogLevel || (ex.LogLevel = {}));
    var LogLevel = ex.LogLevel;
    /**
     * Static singleton that represents the logging facility for Excalibur.
     * Excalibur comes built-in with a [[ConsoleAppender]] and [[ScreenAppender]].
     * Derive from [[IAppender]] to create your own logging appenders.
     *
     * [[include:Logger.md]]
     */
    var Logger = (function () {
        function Logger() {
            this._appenders = [];
            /**
             * Gets or sets the default logging level. Excalibur will only log
             * messages if equal to or above this level. Default: [[LogLevel.Info]]
             */
            this.defaultLevel = LogLevel.Info;
            if (Logger._instance) {
                throw new Error('Logger is a singleton');
            }
            Logger._instance = this;
            // Default console appender
            Logger._instance.addAppender(new ConsoleAppender());
            return Logger._instance;
        }
        /**
         * Gets the current static instance of Logger
         */
        Logger.getInstance = function () {
            if (Logger._instance == null) {
                Logger._instance = new Logger();
            }
            return Logger._instance;
        };
        /**
         * Adds a new [[IAppender]] to the list of appenders to write to
         */
        Logger.prototype.addAppender = function (appender) {
            this._appenders.push(appender);
        };
        /**
         * Clears all appenders from the logger
         */
        Logger.prototype.clearAppenders = function () {
            this._appenders.length = 0;
        };
        /**
         * Logs a message at a given LogLevel
         * @param level  The LogLevel`to log the message at
         * @param args   An array of arguments to write to an appender
         */
        Logger.prototype._log = function (level, args) {
            if (level == null) {
                level = this.defaultLevel;
            }
            var i = 0, len = this._appenders.length;
            for (i; i < len; i++) {
                if (level >= this.defaultLevel) {
                    this._appenders[i].log(level, args);
                }
            }
        };
        /**
         * Writes a log message at the [[LogLevel.Debug]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Debug, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Info]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Info, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Warn]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Warn, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Error]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Error, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Fatal]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.fatal = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Fatal, args);
        };
        Logger._instance = null;
        return Logger;
    }());
    ex.Logger = Logger;
    /**
     * Console appender for browsers (i.e. `console.log`)
     */
    var ConsoleAppender = (function () {
        function ConsoleAppender() {
        }
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        ConsoleAppender.prototype.log = function (level, args) {
            // Check for console support
            if (!console && !console.log && console.warn && console.error) {
                // todo maybe do something better than nothing
                return;
            }
            // Create a new console args array
            var consoleArgs = [];
            consoleArgs.unshift.apply(consoleArgs, args);
            consoleArgs.unshift('[' + LogLevel[level] + '] : ');
            if (level < LogLevel.Warn) {
                // Call .log for Debug/Info
                if (console.log.apply) {
                    // this is required on some older browsers that don't support apply on console.log :(
                    console.log.apply(console, consoleArgs);
                }
                else {
                    console.log(consoleArgs.join(' '));
                }
            }
            else if (level < LogLevel.Error) {
                // Call .warn for Warn
                if (console.warn.apply) {
                    console.warn.apply(console, consoleArgs);
                }
                else {
                    console.warn(consoleArgs.join(' '));
                }
            }
            else {
                // Call .error for Error/Fatal
                if (console.error.apply) {
                    console.error.apply(console, consoleArgs);
                }
                else {
                    console.error(consoleArgs.join(' '));
                }
            }
        };
        return ConsoleAppender;
    }());
    ex.ConsoleAppender = ConsoleAppender;
    /**
     * On-screen (canvas) appender
     */
    var ScreenAppender = (function () {
        /**
         * @param width   Width of the screen appender in pixels
         * @param height  Height of the screen appender in pixels
         */
        function ScreenAppender(width, height) {
            // @todo Clean this up
            this._messages = [];
            this._canvas = document.createElement('canvas');
            this._canvas.width = width || window.innerWidth;
            this._canvas.height = height || window.innerHeight;
            this._canvas.style.position = 'absolute';
            this._ctx = this._canvas.getContext('2d');
            document.body.appendChild(this._canvas);
        }
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        ScreenAppender.prototype.log = function (level, args) {
            var message = args.join(',');
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._messages.unshift('[' + LogLevel[level] + '] : ' + message);
            var pos = 10;
            var opacity = 1.0;
            for (var i = 0; i < this._messages.length; i++) {
                this._ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(2) + ')';
                this._ctx.fillText(this._messages[i], 200, pos);
                pos += 10;
                opacity = opacity > 0 ? opacity - .05 : 0;
            }
        };
        return ScreenAppender;
    }());
    ex.ScreenAppender = ScreenAppender;
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="Actor.ts" />
/// <reference path="Util/Log.ts" />
var ex;
(function (ex) {
    /**
     * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
     * some events are unique to a type, others are not.
     *
     */
    var GameEvent = (function () {
        function GameEvent() {
        }
        return GameEvent;
    }());
    ex.GameEvent = GameEvent;
    /**
     * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed.
     */
    var KillEvent = (function (_super) {
        __extends(KillEvent, _super);
        function KillEvent(target) {
            _super.call(this);
            this.target = target;
        }
        return KillEvent;
    }(GameEvent));
    ex.KillEvent = KillEvent;
    /**
     * The 'start' event is emitted on engine when has started and is ready for interaction.
     */
    var GameStartEvent = (function (_super) {
        __extends(GameStartEvent, _super);
        function GameStartEvent(target) {
            _super.call(this);
            this.target = target;
        }
        return GameStartEvent;
    }(GameEvent));
    ex.GameStartEvent = GameStartEvent;
    /**
     * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
     */
    var GameStopEvent = (function (_super) {
        __extends(GameStopEvent, _super);
        function GameStopEvent(target) {
            _super.call(this);
            this.target = target;
        }
        return GameStopEvent;
    }(GameEvent));
    ex.GameStopEvent = GameStopEvent;
    /**
     * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    var PreDrawEvent = (function (_super) {
        __extends(PreDrawEvent, _super);
        function PreDrawEvent(ctx, delta, target) {
            _super.call(this);
            this.ctx = ctx;
            this.delta = delta;
            this.target = target;
        }
        return PreDrawEvent;
    }(GameEvent));
    ex.PreDrawEvent = PreDrawEvent;
    /**
     * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    var PostDrawEvent = (function (_super) {
        __extends(PostDrawEvent, _super);
        function PostDrawEvent(ctx, delta, target) {
            _super.call(this);
            this.ctx = ctx;
            this.delta = delta;
            this.target = target;
        }
        return PostDrawEvent;
    }(GameEvent));
    ex.PostDrawEvent = PostDrawEvent;
    /**
     * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
     */
    var PreDebugDrawEvent = (function (_super) {
        __extends(PreDebugDrawEvent, _super);
        function PreDebugDrawEvent(ctx, target) {
            _super.call(this);
            this.ctx = ctx;
            this.target = target;
        }
        return PreDebugDrawEvent;
    }(GameEvent));
    ex.PreDebugDrawEvent = PreDebugDrawEvent;
    /**
     * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
     */
    var PostDebugDrawEvent = (function (_super) {
        __extends(PostDebugDrawEvent, _super);
        function PostDebugDrawEvent(ctx, target) {
            _super.call(this);
            this.ctx = ctx;
            this.target = target;
        }
        return PostDebugDrawEvent;
    }(GameEvent));
    ex.PostDebugDrawEvent = PostDebugDrawEvent;
    /**
     * The 'preupdate' event is emitted on actors, scenes, and engine before the update starts.
     */
    var PreUpdateEvent = (function (_super) {
        __extends(PreUpdateEvent, _super);
        function PreUpdateEvent(engine, delta, target) {
            _super.call(this);
            this.engine = engine;
            this.delta = delta;
            this.target = target;
        }
        return PreUpdateEvent;
    }(GameEvent));
    ex.PreUpdateEvent = PreUpdateEvent;
    /**
     * The 'postupdate' event is emitted on actors, scenes, and engine after the update ends. This is equivalent to the obsolete 'update'
     * event.
     */
    var PostUpdateEvent = (function (_super) {
        __extends(PostUpdateEvent, _super);
        function PostUpdateEvent(engine, delta, target) {
            _super.call(this);
            this.engine = engine;
            this.delta = delta;
            this.target = target;
        }
        return PostUpdateEvent;
    }(GameEvent));
    ex.PostUpdateEvent = PostUpdateEvent;
    /**
     * The 'preframe' event is emitted on the engine, before the frame begins.
     */
    var PreFrameEvent = (function (_super) {
        __extends(PreFrameEvent, _super);
        function PreFrameEvent(engine, prevStats, target) {
            _super.call(this);
            this.engine = engine;
            this.prevStats = prevStats;
            this.target = target;
        }
        return PreFrameEvent;
    }(GameEvent));
    ex.PreFrameEvent = PreFrameEvent;
    /**
     * The 'postframe' event is emitted on the engine, after a frame ends.
     */
    var PostFrameEvent = (function (_super) {
        __extends(PostFrameEvent, _super);
        function PostFrameEvent(engine, stats, target) {
            _super.call(this);
            this.engine = engine;
            this.stats = stats;
            this.target = target;
        }
        return PostFrameEvent;
    }(GameEvent));
    ex.PostFrameEvent = PostFrameEvent;
    /**
     * Event received when a gamepad is connected to Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
     */
    var GamepadConnectEvent = (function (_super) {
        __extends(GamepadConnectEvent, _super);
        function GamepadConnectEvent(index, gamepad) {
            _super.call(this);
            this.index = index;
            this.gamepad = gamepad;
        }
        return GamepadConnectEvent;
    }(GameEvent));
    ex.GamepadConnectEvent = GamepadConnectEvent;
    /**
     * Event received when a gamepad is disconnected from Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
     */
    var GamepadDisconnectEvent = (function (_super) {
        __extends(GamepadDisconnectEvent, _super);
        function GamepadDisconnectEvent(index) {
            _super.call(this);
            this.index = index;
        }
        return GamepadDisconnectEvent;
    }(GameEvent));
    ex.GamepadDisconnectEvent = GamepadDisconnectEvent;
    /**
     * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    var GamepadButtonEvent = (function (_super) {
        __extends(GamepadButtonEvent, _super);
        /**
         * @param button  The Gamepad button
         * @param value   A numeric value between 0 and 1
         */
        function GamepadButtonEvent(button, value) {
            _super.call(this);
            this.button = button;
            this.value = value;
        }
        return GamepadButtonEvent;
    }(ex.GameEvent));
    ex.GamepadButtonEvent = GamepadButtonEvent;
    /**
     * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    var GamepadAxisEvent = (function (_super) {
        __extends(GamepadAxisEvent, _super);
        /**
         * @param axis  The Gamepad axis
         * @param value A numeric value between -1 and 1
         */
        function GamepadAxisEvent(axis, value) {
            _super.call(this);
            this.axis = axis;
            this.value = value;
        }
        return GamepadAxisEvent;
    }(ex.GameEvent));
    ex.GamepadAxisEvent = GamepadAxisEvent;
    /**
     * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    var SubscribeEvent = (function (_super) {
        __extends(SubscribeEvent, _super);
        function SubscribeEvent(topic, handler) {
            _super.call(this);
            this.topic = topic;
            this.handler = handler;
        }
        return SubscribeEvent;
    }(GameEvent));
    ex.SubscribeEvent = SubscribeEvent;
    /**
     * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    var UnsubscribeEvent = (function (_super) {
        __extends(UnsubscribeEvent, _super);
        function UnsubscribeEvent(topic, handler) {
            _super.call(this);
            this.topic = topic;
            this.handler = handler;
        }
        return UnsubscribeEvent;
    }(GameEvent));
    ex.UnsubscribeEvent = UnsubscribeEvent;
    /**
     * Event received by the [[Engine]] when the browser window is visible on a screen.
     */
    var VisibleEvent = (function (_super) {
        __extends(VisibleEvent, _super);
        function VisibleEvent() {
            _super.call(this);
        }
        return VisibleEvent;
    }(GameEvent));
    ex.VisibleEvent = VisibleEvent;
    /**
     * Event received by the [[Engine]] when the browser window is hidden from all screens.
     */
    var HiddenEvent = (function (_super) {
        __extends(HiddenEvent, _super);
        function HiddenEvent() {
            _super.call(this);
        }
        return HiddenEvent;
    }(GameEvent));
    ex.HiddenEvent = HiddenEvent;
    /**
     * Event thrown on an [[Actor|actor]] when a collision has occurred
     */
    var CollisionEvent = (function (_super) {
        __extends(CollisionEvent, _super);
        /**
         * @param actor         The actor the event was thrown on
         * @param other         The actor that was collided with
         * @param side          The side that was collided with
         * @param intersection  Intersection vector
         */
        function CollisionEvent(actor, other, side, intersection) {
            _super.call(this);
            this.actor = actor;
            this.other = other;
            this.side = side;
            this.intersection = intersection;
        }
        return CollisionEvent;
    }(GameEvent));
    ex.CollisionEvent = CollisionEvent;
    /**
     * Event thrown on an [[Actor]] and a [[Scene]] only once before the first update call
     */
    var InitializeEvent = (function (_super) {
        __extends(InitializeEvent, _super);
        /**
         * @param engine  The reference to the current engine
         */
        function InitializeEvent(engine) {
            _super.call(this);
            this.engine = engine;
        }
        return InitializeEvent;
    }(GameEvent));
    ex.InitializeEvent = InitializeEvent;
    /**
     * Event thrown on a [[Scene]] on activation
     */
    var ActivateEvent = (function (_super) {
        __extends(ActivateEvent, _super);
        /**
         * @param oldScene  The reference to the old scene
         */
        function ActivateEvent(oldScene) {
            _super.call(this);
            this.oldScene = oldScene;
        }
        return ActivateEvent;
    }(GameEvent));
    ex.ActivateEvent = ActivateEvent;
    /**
     * Event thrown on a [[Scene]] on deactivation
     */
    var DeactivateEvent = (function (_super) {
        __extends(DeactivateEvent, _super);
        /**
         * @param newScene  The reference to the new scene
         */
        function DeactivateEvent(newScene) {
            _super.call(this);
            this.newScene = newScene;
        }
        return DeactivateEvent;
    }(GameEvent));
    ex.DeactivateEvent = DeactivateEvent;
    /**
     * Event thrown on an [[Actor]] when it completely leaves the screen.
     */
    var ExitViewPortEvent = (function (_super) {
        __extends(ExitViewPortEvent, _super);
        function ExitViewPortEvent() {
            _super.call(this);
        }
        return ExitViewPortEvent;
    }(GameEvent));
    ex.ExitViewPortEvent = ExitViewPortEvent;
    /**
     * Event thrown on an [[Actor]] when it completely leaves the screen.
     */
    var EnterViewPortEvent = (function (_super) {
        __extends(EnterViewPortEvent, _super);
        function EnterViewPortEvent() {
            _super.call(this);
        }
        return EnterViewPortEvent;
    }(GameEvent));
    ex.EnterViewPortEvent = EnterViewPortEvent;
})(ex || (ex = {}));
/// <reference path="Events.ts" />
/// <reference path="Interfaces/IEvented.ts" />
var ex;
(function (ex) {
    /**
     * Excalibur's internal event dispatcher implementation.
     * Callbacks are fired immediately after an event is published.
     * Typically you will use [[Class.eventDispatcher]] since most classes in
     * Excalibur inherit from [[Class]]. You will rarely create an `EventDispatcher`
     * yourself.
     *
     * [[include:Events.md]]
     */
    var EventDispatcher = (function () {
        /**
         * @param target  The object that will be the recipient of events from this event dispatcher
         */
        function EventDispatcher(target) {
            this._handlers = {};
            this._wiredEventDispatchers = [];
            this._log = ex.Logger.getInstance();
            this._target = target;
        }
        /**
         * Emits an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        EventDispatcher.prototype.emit = function (eventName, event) {
            if (!eventName) {
                // key not mapped
                return;
            }
            eventName = eventName.toLowerCase();
            var target = this._target;
            if (!event) {
                event = new ex.GameEvent();
            }
            event.target = target;
            var i, len;
            if (this._handlers[eventName]) {
                i = 0;
                len = this._handlers[eventName].length;
                for (i; i < len; i++) {
                    this._handlers[eventName][i].call(target, event);
                }
            }
            i = 0;
            len = this._wiredEventDispatchers.length;
            for (i; i < len; i++) {
                this._wiredEventDispatchers[i].emit(eventName, event);
            }
        };
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @param eventName  The name of the event to subscribe to
         * @param handler    The handler callback to fire on this event
         */
        EventDispatcher.prototype.on = function (eventName, handler) {
            eventName = eventName.toLowerCase();
            if (!this._handlers[eventName]) {
                this._handlers[eventName] = [];
            }
            this._handlers[eventName].push(handler);
            // meta event handlers
            if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
                this.emit('subscribe', new ex.SubscribeEvent(eventName, handler));
            }
        };
        /**
         * Unsubscribe an event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         *
         * @param eventName  The name of the event to unsubscribe
         * @param handler    Optionally the specific handler to unsubscribe
         *
         */
        EventDispatcher.prototype.off = function (eventName, handler) {
            eventName = eventName.toLowerCase();
            var eventHandlers = this._handlers[eventName];
            if (eventHandlers) {
                // if no explicit handler is give with the event name clear all handlers
                if (!handler) {
                    this._handlers[eventName].length = 0;
                }
                else {
                    var index = eventHandlers.indexOf(handler);
                    this._handlers[eventName].splice(index, 1);
                }
            }
            // meta event handlers
            if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
                this.emit('unsubscribe', new ex.UnsubscribeEvent(eventName, handler));
            }
        };
        /**
         * Wires this event dispatcher to also recieve events from another
         */
        EventDispatcher.prototype.wire = function (eventDispatcher) {
            eventDispatcher._wiredEventDispatchers.push(this);
        };
        /**
         * Unwires this event dispatcher from another
         */
        EventDispatcher.prototype.unwire = function (eventDispatcher) {
            var index = eventDispatcher._wiredEventDispatchers.indexOf(this);
            if (index > -1) {
                eventDispatcher._wiredEventDispatchers.splice(index, 1);
            }
        };
        return EventDispatcher;
    }());
    ex.EventDispatcher = EventDispatcher;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Provides standard colors (e.g. [[Color.Black]])
     * but you can also create custom colors using RGB, HSL, or Hex. Also provides
     * useful color operations like [[Color.lighten]], [[Color.darken]], and more.
     *
     * [[include:Colors.md]]
     */
    var Color = (function () {
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = (a != null ? a : 1);
        }
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        Color.fromRGB = function (r, g, b, a) {
            return new Color(r, g, b, a);
        };
        /**
         * Creates a new inscance of Color from a hex string
         *
         * @param hex  CSS color string of the form #ffffff, the alpha component is optional
         */
        Color.fromHex = function (hex) {
            var hexRegEx = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
            var match = null;
            if (match = hex.match(hexRegEx)) {
                var r = parseInt(match[1], 16);
                var g = parseInt(match[2], 16);
                var b = parseInt(match[3], 16);
                var a = 1;
                if (match[4]) {
                    a = parseInt(match[4], 16) / 255;
                }
                return new Color(r, g, b, a);
            }
            else {
                throw new Error('Invalid hex string: ' + hex);
            }
        };
        /**
         * Creats a new instance of Color from hsla values
         *
         * @param h  Hue is represented [0-1]
         * @param s  Saturation is represented [0-1]
         * @param l  Luminance is represented [0-1]
         * @param a  Alpha is represented [0-1]
         */
        Color.fromHSL = function (h, s, l, a) {
            if (a === void 0) { a = 1.0; }
            var temp = new HSLColor(h, s, l, a);
            return temp.toRGBA();
        };
        /**
         * Lightens the current color by a specified amount
         *
         * @param factor  The amount to lighten by [0-1]
         */
        Color.prototype.lighten = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.l += (temp.l * factor);
            return temp.toRGBA();
        };
        /**
         * Darkens the current color by a specified amount
         *
         * @param factor  The amount to darken by [0-1]
         */
        Color.prototype.darken = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.l -= (temp.l * factor);
            return temp.toRGBA();
        };
        /**
         * Saturates the current color by a specified amount
         *
         * @param factor  The amount to saturate by [0-1]
         */
        Color.prototype.saturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.s += (temp.s * factor);
            return temp.toRGBA();
        };
        /**
         * Desaturates the current color by a specified amount
         *
         * @param factor  The amount to desaturate by [0-1]
         */
        Color.prototype.desaturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.s -= (temp.s * factor);
            return temp.toRGBA();
        };
        /**
         * Multiplies a color by another, results in a darker color
         *
         * @param color  The other color
         */
        Color.prototype.mulitiply = function (color) {
            var newR = ((color.r / 255 * this.r / 255) * 255);
            var newG = ((color.g / 255 * this.g / 255) * 255);
            var newB = ((color.b / 255 * this.b / 255) * 255);
            var newA = (color.a * this.a);
            return new Color(newR, newG, newB, newA);
        };
        /**
         * Screens a color by another, results in a lighter color
         *
         * @param color  The other color
         */
        Color.prototype.screen = function (color) {
            var color1 = color.invert();
            var color2 = color.invert();
            return color1.mulitiply(color2).invert();
        };
        /**
         * Inverts the current color
         */
        Color.prototype.invert = function () {
            return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1.0 - this.a);
        };
        /**
         * Averages the current color with another
         *
         * @param color  The other color
         */
        Color.prototype.average = function (color) {
            var newR = (color.r + this.r) / 2;
            var newG = (color.g + this.g) / 2;
            var newB = (color.b + this.b) / 2;
            var newA = (color.a + this.a) / 2;
            return new Color(newR, newG, newB, newA);
        };
        /**
         * Returns a CSS string representation of a color.
         */
        Color.prototype.toString = function () {
            var result = String(this.r.toFixed(0)) + ', ' + String(this.g.toFixed(0)) + ', ' + String(this.b.toFixed(0));
            if (this.a !== undefined || this.a !== null) {
                return 'rgba(' + result + ', ' + String(this.a) + ')';
            }
            return 'rgb(' + result + ')';
        };
        /**
         * Returns a CSS string representation of a color.
         */
        Color.prototype.fillStyle = function () {
            return this.toString();
        };
        /**
         * Returns a clone of the current color.
         */
        Color.prototype.clone = function () {
            return new Color(this.r, this.g, this.b, this.a);
        };
        /**
         * Black (#000000)
         */
        Color.Black = Color.fromHex('#000000');
        /**
         * White (#FFFFFF)
         */
        Color.White = Color.fromHex('#FFFFFF');
        /**
         * Gray (#808080)
         */
        Color.Gray = Color.fromHex('#808080');
        /**
         * Light gray (#D3D3D3)
         */
        Color.LightGray = Color.fromHex('#D3D3D3');
        /**
         * Dark gray (#A9A9A9)
         */
        Color.DarkGray = Color.fromHex('#A9A9A9');
        /**
         * Yellow (#FFFF00)
         */
        Color.Yellow = Color.fromHex('#FFFF00');
        /**
         * Orange (#FFA500)
         */
        Color.Orange = Color.fromHex('#FFA500');
        /**
         * Red (#FF0000)
         */
        Color.Red = Color.fromHex('#FF0000');
        /**
         * Vermillion (#FF5B31)
         */
        Color.Vermillion = Color.fromHex('#FF5B31');
        /**
         * Rose (#FF007F)
         */
        Color.Rose = Color.fromHex('#FF007F');
        /**
         * Magenta (#FF00FF)
         */
        Color.Magenta = Color.fromHex('#FF00FF');
        /**
         * Violet (#7F00FF)
         */
        Color.Violet = Color.fromHex('#7F00FF');
        /**
         * Blue (#0000FF)
         */
        Color.Blue = Color.fromHex('#0000FF');
        /**
         * Azure (#007FFF)
         */
        Color.Azure = Color.fromHex('#007FFF');
        /**
         * Cyan (#00FFFF)
         */
        Color.Cyan = Color.fromHex('#00FFFF');
        /**
         * Viridian (#59978F)
         */
        Color.Viridian = Color.fromHex('#59978F');
        /**
         * Green (#00FF00)
         */
        Color.Green = Color.fromHex('#00FF00');
        /**
         * Chartreuse (#7FFF00)
         */
        Color.Chartreuse = Color.fromHex('#7FFF00');
        /**
         * Transparent (#FFFFFF00)
         */
        Color.Transparent = Color.fromHex('#FFFFFF00');
        return Color;
    }());
    ex.Color = Color;
    /**
     * Internal HSL Color representation
     *
     * http://en.wikipedia.org/wiki/HSL_and_HSV
     * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
     */
    var HSLColor = (function () {
        function HSLColor(h, s, l, a) {
            this.h = h;
            this.s = s;
            this.l = l;
            this.a = a;
        }
        HSLColor.hue2rgb = function (p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        };
        HSLColor.fromRGBA = function (r, g, b, a) {
            r /= 255;
            g /= 255;
            b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return new HSLColor(h, s, l, a);
        };
        HSLColor.prototype.toRGBA = function () {
            var r, g, b;
            if (this.s === 0) {
                r = g = b = this.l; // achromatic
            }
            else {
                var q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
                var p = 2 * this.l - q;
                r = HSLColor.hue2rgb(p, q, this.h + 1 / 3);
                g = HSLColor.hue2rgb(p, q, this.h);
                b = HSLColor.hue2rgb(p, q, this.h - 1 / 3);
            }
            return new Color(r * 255, g * 255, b * 255, this.a);
        };
        return HSLColor;
    }());
})(ex || (ex = {}));
/// <reference path="../Interfaces/IDrawable.ts" />
/// <reference path="../Algebra.ts" />
/// <reference path="Color.ts" />
var ex;
(function (ex) {
    /**
     * Creates a closed polygon drawing given a list of [[Point]]s.
     *
     * @warning Use sparingly as Polygons are performance intensive
     */
    var Polygon = (function () {
        /**
         * @param points  The vectors to use to build the polygon in order
         */
        function Polygon(points) {
            /**
             * The width of the lines of the polygon
             */
            this.lineWidth = 5;
            /**
             * Indicates whether the polygon is filled or not.
             */
            this.filled = false;
            this._points = [];
            this.anchor = new ex.Vector(0, 0);
            this.rotation = 0;
            this.scale = new ex.Vector(1, 1);
            this._points = points;
            var minX = this._points.reduce(function (prev, curr) {
                return Math.min(prev, curr.x);
            }, 0);
            var maxX = this._points.reduce(function (prev, curr) {
                return Math.max(prev, curr.x);
            }, 0);
            this.width = maxX - minX;
            var minY = this._points.reduce(function (prev, curr) {
                return Math.min(prev, curr.y);
            }, 0);
            var maxY = this._points.reduce(function (prev, curr) {
                return Math.max(prev, curr.y);
            }, 0);
            this.height = maxY - minY;
            this.naturalHeight = this.height;
            this.naturalWidth = this.width;
        }
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        Polygon.prototype.addEffect = function (effect) {
            // not supported on polygons
        };
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        Polygon.prototype.removeEffect = function (param) {
            // not supported on polygons
        };
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        Polygon.prototype.clearEffects = function () {
            // not supported on polygons
        };
        Polygon.prototype.reset = function () {
            //pass
        };
        Polygon.prototype.draw = function (ctx, x, y) {
            ctx.save();
            ctx.translate(x + this.anchor.x, y + this.anchor.y);
            ctx.scale(this.scale.x, this.scale.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.lineWidth = this.lineWidth;
            // Iterate through the supplied points and construct a 'polygon'
            var firstPoint = this._points[0];
            ctx.moveTo(firstPoint.x, firstPoint.y);
            var i = 0, len = this._points.length;
            for (i; i < len; i++) {
                ctx.lineTo(this._points[i].x, this._points[i].y);
            }
            ctx.lineTo(firstPoint.x, firstPoint.y);
            ctx.closePath();
            if (this.filled) {
                ctx.fillStyle = this.fillColor.toString();
                ctx.fill();
            }
            ctx.strokeStyle = this.lineColor.toString();
            if (this.flipHorizontal) {
                ctx.translate(this.width, 0);
                ctx.scale(-1, 1);
            }
            if (this.flipVertical) {
                ctx.translate(0, this.height);
                ctx.scale(1, -1);
            }
            ctx.stroke();
            ctx.restore();
        };
        return Polygon;
    }());
    ex.Polygon = Polygon;
})(ex || (ex = {}));
/// <reference path="../Interfaces/ILoadable.ts" />
var ex;
(function (ex) {
    /**
     * The [[Resource]] type allows games built in Excalibur to load generic resources.
     * For any type of remote resource it is recommended to use [[Resource]] for preloading.
     *
     * [[include:Resources.md]]
     */
    var Resource = (function (_super) {
        __extends(Resource, _super);
        /**
         * @param path          Path to the remote resource
         * @param responseType  The Content-Type to expect (e.g. `application/json`)
         * @param bustCache     Whether or not to cache-bust requests
         */
        function Resource(path, responseType, bustCache) {
            if (bustCache === void 0) { bustCache = true; }
            _super.call(this);
            this.path = path;
            this.responseType = responseType;
            this.bustCache = bustCache;
            this.data = null;
            this.logger = ex.Logger.getInstance();
            this.onprogress = function () { return; };
            this.oncomplete = function () { return; };
            this.onerror = function () { return; };
        }
        /**
         * Returns true if the Resource is completely loaded and is ready
         * to be drawn.
         */
        Resource.prototype.isLoaded = function () {
            return this.data !== null;
        };
        Resource.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        Resource.prototype._cacheBust = function (uri) {
            var query = /\?\w*=\w*/;
            if (query.test(uri)) {
                uri += ('&__=' + Date.now());
            }
            else {
                uri += ('?__=' + Date.now());
            }
            return uri;
        };
        Resource.prototype._start = function (e) {
            this.logger.debug('Started loading resource ' + this.path);
        };
        /**
         * Begin loading the resource and returns a promise to be resolved on completion
         */
        Resource.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            // Exit early if we already have data
            if (this.data !== null) {
                this.logger.debug('Already have data for resource', this.path);
                complete.resolve(this.data);
                this.oncomplete();
                return complete;
            }
            var request = new XMLHttpRequest();
            request.open('GET', this.bustCache ? this._cacheBust(this.path) : this.path, true);
            request.responseType = this.responseType;
            request.onloadstart = function (e) { _this._start(e); };
            request.onprogress = this.onprogress;
            request.onerror = this.onerror;
            request.onload = function (e) {
                if (request.status !== 200) {
                    _this.logger.error('Failed to load resource ', _this.path, ' server responded with error code', request.status);
                    _this.onerror(request.response);
                    complete.resolve(request.response);
                    return;
                }
                _this.data = _this.processData(request.response);
                _this.oncomplete();
                _this.logger.debug('Completed loading resource', _this.path);
                complete.resolve(_this.data);
            };
            request.send();
            return complete;
        };
        /**
         * Returns the loaded data once the resource is loaded
         */
        Resource.prototype.getData = function () {
            return this.data;
        };
        /**
         * Sets the data for this resource directly
         */
        Resource.prototype.setData = function (data) {
            this.data = this.processData(data);
        };
        /**
         * This method is meant to be overriden to handle any additional
         * processing. Such as decoding downloaded audio bits.
         */
        Resource.prototype.processData = function (data) {
            // Handle any additional loading after the xhr has completed.
            return URL.createObjectURL(data);
        };
        return Resource;
    }(ex.Class));
    ex.Resource = Resource;
})(ex || (ex = {}));
/// <reference path="Util/Log.ts" />
// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/
var ex;
(function (ex) {
    /**
     * Valid states for a promise to be in
     */
    (function (PromiseState) {
        PromiseState[PromiseState["Resolved"] = 0] = "Resolved";
        PromiseState[PromiseState["Rejected"] = 1] = "Rejected";
        PromiseState[PromiseState["Pending"] = 2] = "Pending";
    })(ex.PromiseState || (ex.PromiseState = {}));
    var PromiseState = ex.PromiseState;
    /**
     * Promises are used to do asynchronous work and they are useful for
     * creating a chain of actions. In Excalibur they are used for loading,
     * sounds, animation, actions, and more.
     *
     * [[include:Promises.md]]
     */
    var Promise = (function () {
        function Promise() {
            this._state = PromiseState.Pending;
            this._successCallbacks = [];
            this._rejectCallback = function () { return; };
            this._logger = ex.Logger.getInstance();
        }
        /**
         * Wrap a value in a resolved promise
         * @param value  An optional value to wrap in a resolved promise
         * @obsolete Use [[resolve]] instead. This will be deprecated in future versions.
         */
        Promise.wrap = function (value) {
            ex.Logger.getInstance().warn('[obsolete] Promise.wrap is obsolete. Use Promise.resolve/reject instead.');
            return Promise.resolve(value);
        };
        /**
         * Create and resolve a Promise with an optional value
         * @param value  An optional value to wrap in a resolved promise
         */
        Promise.resolve = function (value) {
            var promise = (new Promise()).resolve(value);
            return promise;
        };
        /**
         * Create and reject a Promise with an optional value
         * @param value  An optional value to wrap in a rejected promise
         */
        Promise.reject = function (value) {
            var promise = (new Promise()).reject(value);
            return promise;
        };
        Promise.join = function () {
            var promises = [];
            if (arguments.length > 0 && !Array.isArray(arguments[0])) {
                for (var _i = 0; _i < arguments.length; _i++) {
                    promises[_i - 0] = arguments[_i];
                }
            }
            else if (arguments.length === 1 && Array.isArray(arguments[0])) {
                promises = arguments[0];
            }
            var joinedPromise = new Promise();
            if (!promises || !promises.length) {
                return joinedPromise.resolve();
            }
            var total = promises.length;
            var successes = 0;
            var rejects = 0;
            var errors = [];
            promises.forEach(function (p) {
                p.then(function () {
                    successes += 1;
                    if (successes === total) {
                        joinedPromise.resolve();
                    }
                    else if (successes + rejects + errors.length === total) {
                        joinedPromise.reject(errors);
                    }
                }, function () {
                    rejects += 1;
                    if (successes + rejects + errors.length === total) {
                        joinedPromise.reject(errors);
                    }
                }).error(function (e) {
                    errors.push(e);
                    if ((errors.length + successes + rejects) === total) {
                        joinedPromise.reject(errors);
                    }
                });
            });
            return joinedPromise;
        };
        /**
         * Chain success and reject callbacks after the promise is resolved
         * @param successCallback  Call on resolution of promise
         * @param rejectCallback   Call on rejection of promise
         */
        Promise.prototype.then = function (successCallback, rejectCallback) {
            if (successCallback) {
                this._successCallbacks.push(successCallback);
                // If the promise is already resovled call immediately
                if (this.state() === PromiseState.Resolved) {
                    try {
                        successCallback.call(this, this._value);
                    }
                    catch (e) {
                        this._handleError(e);
                    }
                }
            }
            if (rejectCallback) {
                this._rejectCallback = rejectCallback;
                // If the promise is already rejected call immediately
                if (this.state() === PromiseState.Rejected) {
                    try {
                        rejectCallback.call(this, this._value);
                    }
                    catch (e) {
                        this._handleError(e);
                    }
                }
            }
            return this;
        };
        /**
         * Add an error callback to the promise
         * @param errorCallback  Call if there was an error in a callback
         */
        Promise.prototype.error = function (errorCallback) {
            if (errorCallback) {
                this._errorCallback = errorCallback;
            }
            return this;
        };
        /**
         * Resolve the promise and pass an option value to the success callbacks
         * @param value  Value to pass to the success callbacks
         */
        Promise.prototype.resolve = function (value) {
            var _this = this;
            if (this._state === PromiseState.Pending) {
                this._value = value;
                try {
                    this._state = PromiseState.Resolved;
                    this._successCallbacks.forEach(function (cb) {
                        cb.call(_this, _this._value);
                    });
                }
                catch (e) {
                    this._handleError(e);
                }
            }
            else {
                throw new Error('Cannot resolve a promise that is not in a pending state!');
            }
            return this;
        };
        /**
         * Reject the promise and pass an option value to the reject callbacks
         * @param value  Value to pass to the reject callbacks
         */
        Promise.prototype.reject = function (value) {
            if (this._state === PromiseState.Pending) {
                this._value = value;
                try {
                    this._state = PromiseState.Rejected;
                    this._rejectCallback.call(this, this._value);
                }
                catch (e) {
                    this._handleError(e);
                }
            }
            else {
                throw new Error('Cannot reject a promise that is not in a pending state!');
            }
            return this;
        };
        /**
         * Inspect the current state of a promise
         */
        Promise.prototype.state = function () {
            return this._state;
        };
        Promise.prototype._handleError = function (e) {
            if (this._errorCallback) {
                this._errorCallback.call(this, e);
            }
            else {
                // rethrow error
                throw e;
            }
        };
        return Promise;
    }());
    ex.Promise = Promise;
})(ex || (ex = {}));
/// <reference path="../Util/Util.ts" />
/// <reference path="../Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="../Interfaces/ILoadable.ts" />
var ex;
(function (ex) {
    /**
     * The [[Texture]] object allows games built in Excalibur to load image resources.
     * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
     * to pre-load before starting a level or game.
     *
     * [[include:Textures.md]]
     */
    var Texture = (function (_super) {
        __extends(Texture, _super);
        /**
         * @param path       Path to the image resource
         * @param bustCache  Optionally load texture with cache busting
         */
        function Texture(path, bustCache) {
            if (bustCache === void 0) { bustCache = true; }
            _super.call(this, path, 'blob', bustCache);
            this.path = path;
            this.bustCache = bustCache;
            /**
             * A [[Promise]] that resolves when the Texture is loaded.
             */
            this.loaded = new ex.Promise();
            this._isLoaded = false;
            this._sprite = null;
            this._sprite = new ex.Sprite(this, 0, 0, 0, 0);
        }
        /**
         * Returns true if the Texture is completely loaded and is ready
         * to be drawn.
         */
        Texture.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        /**
         * Begins loading the texture and returns a promise to be resolved on completion
         */
        Texture.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var loaded = _super.prototype.load.call(this);
            loaded.then(function () {
                _this.image = new Image();
                _this.image.addEventListener('load', function () {
                    _this._isLoaded = true;
                    _this.width = _this._sprite.swidth = _this._sprite.naturalWidth = _this._sprite.width = _this.image.naturalWidth;
                    _this.height = _this._sprite.sheight = _this._sprite.naturalHeight = _this._sprite.height = _this.image.naturalHeight;
                    _this.loaded.resolve(_this.image);
                    complete.resolve(_this.image);
                });
                _this.image.src = _super.prototype.getData.call(_this);
            }, function () {
                complete.reject('Error loading texture.');
            });
            return complete;
        };
        Texture.prototype.asSprite = function () {
            return this._sprite;
        };
        return Texture;
    }(ex.Resource));
    ex.Texture = Texture;
})(ex || (ex = {}));
/// <reference path="../Promises.ts" />
/// <reference path="../Util/Util.ts" />
/// <reference path="../Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="../Interfaces/ILoadable.ts" />
/// <reference path="../Interfaces/IAudio.ts" />
/// <reference path="../Interfaces/IAudioImplementation.ts" />
var ex;
(function (ex) {
    // set up audio context reference
    // when we introduce multi-tracking, we may need to move this to a factory method
    if (window.AudioContext) {
        var audioContext = new window.AudioContext();
    }
    /**
     * An audio implementation for HTML5 audio.
     */
    var AudioTag = (function () {
        function AudioTag() {
            this.responseType = 'blob';
        }
        /**
         * Transforms raw Blob data into a object URL for use in audio tag
         */
        AudioTag.prototype.processData = function (data) {
            var url = URL.createObjectURL(data);
            return ex.Promise.resolve(url);
        };
        /**
         * Creates a new instance of an audio tag referencing the provided audio URL
         */
        AudioTag.prototype.createInstance = function (url) {
            return new AudioTagInstance(url);
        };
        return AudioTag;
    }());
    ex.AudioTag = AudioTag;
    /**
     * An audio implementation for Web Audio API.
     */
    var WebAudio = (function () {
        function WebAudio() {
            this._logger = ex.Logger.getInstance();
            this.responseType = 'arraybuffer';
        }
        /**
         * Processes raw arraybuffer data and decodes into WebAudio buffer (async).
         */
        WebAudio.prototype.processData = function (data) {
            var _this = this;
            var complete = new ex.Promise();
            audioContext.decodeAudioData(data, function (buffer) {
                complete.resolve(buffer);
            }, function () {
                _this._logger.error('Unable to decode ' +
                    ' this browser may not fully support this format, or the file may be corrupt, ' +
                    'if this is an mp3 try removing id3 tags and album art from the file.');
                complete.resolve(undefined);
            });
            return complete;
        };
        /**
         * Creates a new WebAudio AudioBufferSourceNode to play a sound instance
         */
        WebAudio.prototype.createInstance = function (buffer) {
            return new WebAudioInstance(buffer);
        };
        /**
         * Play an empty sound to unlock Safari WebAudio context. Call this function
         * right after a user interaction event. Typically used by [[PauseAfterLoader]]
         * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         */
        WebAudio.unlock = function () {
            if (this._unlocked || !audioContext) {
                return;
            }
            // create empty buffer and play it
            var buffer = audioContext.createBuffer(1, 1, 22050);
            var source = audioContext.createBufferSource();
            var ended = false;
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.onended = function () { return ended = true; };
            if (source.noteOn) {
                // deprecated
                source.noteOn(0);
            }
            else {
                source.start(0);
            }
            // by checking the play state after some time, we know if we're really unlocked
            setTimeout(function () {
                if (source.playbackState) {
                    var legacySource = source;
                    if (legacySource.playbackState === legacySource.PLAYING_STATE ||
                        legacySource.playbackState === legacySource.FINISHED_STATE) {
                        this._unlocked = true;
                    }
                }
                else {
                    if (audioContext.currentTime > 0 || ended) {
                        this._unlocked = true;
                    }
                }
            }, 0);
        };
        WebAudio.isUnlocked = function () {
            return this._unlocked;
        };
        WebAudio._unlocked = false;
        return WebAudio;
    }());
    ex.WebAudio = WebAudio;
    /**
     * Factory method that gets the audio implementation to use
     */
    function getAudioImplementation() {
        if (window.AudioContext) {
            return new WebAudio();
        }
        else {
            return new AudioTag();
        }
    }
    ex.getAudioImplementation = getAudioImplementation;
    ;
    /**
     * The [[Sound]] object allows games built in Excalibur to load audio
     * components, from soundtracks to sound effects. [[Sound]] is an [[ILoadable]]
     * which means it can be passed to a [[Loader]] to pre-load before a game or level.
     *
     * [[include:Sounds.md]]
     */
    var Sound = (function () {
        /**
         * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
         */
        function Sound() {
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i - 0] = arguments[_i];
            }
            this._logger = ex.Logger.getInstance();
            this._data = null;
            this._tracks = [];
            this._isLoaded = false;
            this._isPaused = false;
            this._loop = false;
            this._volume = 1.0;
            this.onprogress = function () { return; };
            this.oncomplete = function () { return; };
            this.onerror = function () { return; };
            this._wasPlayingOnHidden = false;
            /* Chrome : MP3, WAV, Ogg
             * Firefox : WAV, Ogg,
             * IE : MP3, WAV coming soon
             * Safari MP3, WAV, Ogg
             */
            this.path = '';
            for (var _a = 0, paths_1 = paths; _a < paths_1.length; _a++) {
                var path = paths_1[_a];
                if (Sound.canPlayFile(path)) {
                    this.path = path;
                    break;
                }
            }
            if (!this.path) {
                this._logger.warn('This browser does not support any of the audio files specified:', paths.join(', '));
                this._logger.warn('Attempting to use', paths[0]);
                this.path = paths[0]; // select the first specified
            }
            this.sound = ex.getAudioImplementation(); // reference namespaced function to allow mocks
        }
        /**
         * Whether or not the browser can play this file as HTML5 Audio
         */
        Sound.canPlayFile = function (file) {
            try {
                var a = new Audio();
                var filetype = /.*\.([A-Za-z0-9]+)$/;
                var type = file.match(filetype)[1];
                if (a.canPlayType('audio/' + type)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                ex.Logger.getInstance().warn('Cannot determine audio support, assuming no support for the Audio Tag', e);
                return false;
            }
        };
        Sound.prototype.wireEngine = function (engine) {
            var _this = this;
            if (engine) {
                this._engine = engine;
                this._engine.on('hidden', function () {
                    if (engine.pauseAudioWhenHidden && _this.isPlaying()) {
                        _this._wasPlayingOnHidden = true;
                        _this.pause();
                    }
                });
                this._engine.on('visible', function () {
                    if (engine.pauseAudioWhenHidden && _this._wasPlayingOnHidden) {
                        _this.play();
                        _this._wasPlayingOnHidden = false;
                    }
                });
            }
        };
        /**
         * Returns how many instances of the sound are currently playing
         */
        Sound.prototype.instanceCount = function () {
            return this._tracks.length;
        };
        /**
         * Sets the volume of the sound clip
         * @param volume  A volume value between 0-1.0
         */
        Sound.prototype.setVolume = function (volume) {
            this._volume = volume;
            for (var _i = 0, _a = this._tracks; _i < _a.length; _i++) {
                var track = _a[_i];
                track.setVolume(volume);
            }
            this._logger.debug('Set volume for all instances of sound', this.path, 'to', volume);
        };
        /**
         * Indicates whether the clip should loop when complete
         * @param loop  Set the looping flag
         */
        Sound.prototype.setLoop = function (loop) {
            this._loop = loop;
            for (var _i = 0, _a = this._tracks; _i < _a.length; _i++) {
                var track = _a[_i];
                track.setLoop(loop);
            }
            this._logger.debug('Set loop for all instances of sound', this.path, 'to', loop);
        };
        /**
         * Whether or not the sound is playing right now
         */
        Sound.prototype.isPlaying = function () {
            return this._tracks.some(function (t) { return t.isPlaying(); });
        };
        /**
         * Play the sound, returns a promise that resolves when the sound is done playing
         */
        Sound.prototype.play = function () {
            var _this = this;
            if (this._isLoaded) {
                var resumed = [];
                // ensure we resume *current* tracks (if paused)
                for (var _i = 0, _a = this._tracks; _i < _a.length; _i++) {
                    var track = _a[_i];
                    resumed.push(track.play());
                }
                // when paused, don't start playing new track
                if (this._isPaused) {
                    this._isPaused = false;
                    this._logger.debug('Resuming paused instances for sound', this.path, this._tracks);
                    // resolve when resumed tracks are done
                    return ex.Promise.join(resumed);
                }
                // push a new track
                var newTrack = this.sound.createInstance(this._data);
                newTrack.setLoop(this._loop);
                newTrack.setVolume(this._volume);
                this._tracks.push(newTrack);
                this._logger.debug('Playing new instance for sound', this.path);
                return newTrack.play().then(function () {
                    // when done, remove track
                    _this._tracks.splice(_this._tracks.indexOf(newTrack), 1);
                    return true;
                });
            }
            else {
                return ex.Promise.resolve(true);
            }
        };
        /**
         * Stop the sound, and do not rewind
         */
        Sound.prototype.pause = function () {
            for (var _i = 0, _a = this._tracks; _i < _a.length; _i++) {
                var track = _a[_i];
                track.pause();
            }
            this._isPaused = true;
            this._logger.debug('Paused all instances of sound', this.path);
        };
        /**
         * Stop the sound and rewind
         */
        Sound.prototype.stop = function () {
            this._isPaused = false;
            var tracks = this._tracks.concat([]);
            for (var _i = 0, tracks_1 = tracks; _i < tracks_1.length; _i++) {
                var track = tracks_1[_i];
                track.stop();
            }
            this._logger.debug('Stopped all instances of sound', this.path);
        };
        /**
         * Returns true if the sound is loaded
         */
        Sound.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        /**
         * Begins loading the sound and returns a promise to be resolved on completion
         */
        Sound.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            if (!!this.getData()) {
                this._logger.debug('Already have data for audio resource', this.path);
                complete.resolve(this.sound);
                this.oncomplete();
                return complete;
            }
            this._logger.debug('Started loading sound', this.path);
            try {
                this._fetchResource(function (request) {
                    if (request.status !== 200) {
                        _this._logger.error('Failed to load audio resource ', _this.path, ' server responded with error code', request.status);
                        _this.onerror(request.response);
                        complete.resolve(null);
                        return;
                    }
                    // load sound
                    _this.setData(request.response).then(function () {
                        _this.oncomplete();
                        _this._logger.debug('Completed loading sound', _this.path);
                        complete.resolve(_this.sound);
                    }, function (e) { return complete.resolve(e); });
                });
            }
            catch (e) {
                this._logger.error('Error loading sound! If this is a cross origin error, \
               you must host your sound with your html and javascript.');
                this.onerror(e);
                complete.resolve(e);
            }
            return complete;
        };
        /* istanbul ignore next */
        Sound.prototype._fetchResource = function (onload) {
            var request = new XMLHttpRequest();
            request.open('GET', this.path, true);
            request.responseType = this.sound.responseType;
            request.onprogress = this.onprogress;
            request.onerror = this.onerror;
            request.onload = function (e) { return onload(request); };
            request.send();
        };
        /**
         * Gets the raw sound data (e.g. blob URL or AudioBuffer)
         */
        Sound.prototype.getData = function () {
            return this._data;
        };
        /**
         * Sets raw sound data and returns a Promise that is resolved when sound data is processed
         *
         * @param data The XHR data for the sound implementation to process (Blob or ArrayBuffer)
         */
        Sound.prototype.setData = function (data) {
            var _this = this;
            return this.sound.processData(data).then(function (data) {
                _this._isLoaded = true;
                _this._data = _this.processData(data);
                return data;
            });
        };
        /**
         * Set the raw sound data (e.g. blob URL or AudioBuffer)
         */
        Sound.prototype.processData = function (data) {
            return data;
        };
        return Sound;
    }());
    ex.Sound = Sound;
    /**
     * Internal class representing a HTML5 audio instance
     */
    /* istanbul ignore next */
    var AudioTagInstance = (function () {
        function AudioTagInstance(_src) {
            this._src = _src;
            this._isPlaying = false;
            this._isPaused = false;
            this._loop = false;
            this._volume = 1.0;
            this._audioElement = new Audio(_src);
        }
        AudioTagInstance.prototype.isPlaying = function () {
            return this._isPlaying;
        };
        Object.defineProperty(AudioTagInstance.prototype, "loop", {
            get: function () {
                return this._loop;
            },
            enumerable: true,
            configurable: true
        });
        AudioTagInstance.prototype.setLoop = function (value) {
            this._loop = value;
            this._audioElement.loop = value;
            this._wireUpOnEnded();
        };
        AudioTagInstance.prototype.setVolume = function (value) {
            this._volume = value;
            this._audioElement.volume = ex.Util.clamp(value, 0, 1.0);
        };
        AudioTagInstance.prototype.play = function () {
            if (this._isPaused) {
                this._resume();
            }
            else if (!this._isPlaying) {
                this._start();
            }
            return this._playingPromise;
        };
        AudioTagInstance.prototype._start = function () {
            this._audioElement.load();
            this._audioElement.loop = this._loop;
            this._audioElement.play();
            this._isPlaying = true;
            this._isPaused = false;
            this._playingPromise = new ex.Promise();
            this._wireUpOnEnded();
        };
        AudioTagInstance.prototype._resume = function () {
            if (!this._isPaused) {
                return;
            }
            this._audioElement.play();
            this._isPaused = false;
            this._isPlaying = true;
            this._wireUpOnEnded();
        };
        AudioTagInstance.prototype.pause = function () {
            if (!this._isPlaying) {
                return;
            }
            this._audioElement.pause();
            this._isPaused = true;
            this._isPlaying = false;
        };
        AudioTagInstance.prototype.stop = function () {
            if (!this._isPlaying) {
                return;
            }
            this._audioElement.pause();
            this._audioElement.currentTime = 0;
            this._handleOnEnded();
        };
        AudioTagInstance.prototype._wireUpOnEnded = function () {
            var _this = this;
            if (!this._loop) {
                this._audioElement.onended = function () { return _this._handleOnEnded(); };
            }
        };
        AudioTagInstance.prototype._handleOnEnded = function () {
            this._isPlaying = false;
            this._isPaused = false;
            this._playingPromise.resolve(true);
        };
        return AudioTagInstance;
    }());
    /**
     * Internal class representing a Web Audio AudioBufferSourceNode instance
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
     */
    /* istanbul ignore next */
    var WebAudioInstance = (function () {
        function WebAudioInstance(_buffer) {
            this._buffer = _buffer;
            this._volumeNode = audioContext.createGain();
            this._isPlaying = false;
            this._isPaused = false;
            this._loop = false;
            this._volume = 1.0;
            /**
             * Current playback offset (in seconds)
             */
            this._currentOffset = 0;
        }
        WebAudioInstance.prototype.isPlaying = function () {
            return this._isPlaying;
        };
        WebAudioInstance.prototype.setVolume = function (value) {
            this._volume = value;
            this._volumeNode.gain.value = ex.Util.clamp(value, 0, 1.0);
        };
        WebAudioInstance.prototype.setLoop = function (value) {
            this._loop = value;
            if (this._bufferSource) {
                this._bufferSource.loop = value;
                this._wireUpOnEnded();
            }
        };
        WebAudioInstance.prototype.play = function () {
            if (this._isPaused) {
                this._resume();
            }
            else if (!this._isPlaying) {
                this._start();
            }
            return this._playingPromise;
        };
        WebAudioInstance.prototype._start = function () {
            this._volumeNode.connect(audioContext.destination);
            this._createBufferSource();
            this._bufferSource.start(0, 0);
            this._startTime = new Date().getTime();
            this._currentOffset = 0;
            this._isPlaying = true;
            this._isPaused = false;
            this._playingPromise = new ex.Promise();
            this._wireUpOnEnded();
        };
        WebAudioInstance.prototype._resume = function () {
            if (!this._isPaused) {
                return;
            }
            // a buffer source can only be started once
            // so we need to dispose of the previous instance before
            // "resuming" the next one
            this._bufferSource.onended = null; // dispose of any previous event handler
            this._createBufferSource();
            var duration = (1 / this._bufferSource.playbackRate.value) * this._buffer.duration;
            this._bufferSource.start(0, this._currentOffset % duration);
            this._isPaused = false;
            this._isPlaying = true;
            this._wireUpOnEnded();
        };
        WebAudioInstance.prototype._createBufferSource = function () {
            this._bufferSource = audioContext.createBufferSource();
            this._bufferSource.buffer = this._buffer;
            this._bufferSource.loop = this._loop;
            this._bufferSource.playbackRate.value = 1.0;
            this._bufferSource.connect(this._volumeNode);
        };
        WebAudioInstance.prototype.pause = function () {
            if (!this._isPlaying) {
                return;
            }
            this._bufferSource.stop(0);
            // Playback rate will be a scale factor of how fast/slow the audio is being played
            // default is 1.0
            // we need to invert it to get the time scale
            var pbRate = 1 / (this._bufferSource.playbackRate.value || 1.0);
            this._currentOffset = ((new Date().getTime() - this._startTime) * pbRate) / 1000; // in seconds
            this._isPaused = true;
            this._isPlaying = false;
        };
        WebAudioInstance.prototype.stop = function () {
            if (!this._isPlaying) {
                return;
            }
            this._bufferSource.stop(0);
            // handler will not be wired up if we were looping
            if (!this._bufferSource.onended) {
                this._handleOnEnded();
            }
            this._currentOffset = 0;
            this._isPlaying = false;
            this._isPaused = false;
        };
        WebAudioInstance.prototype._wireUpOnEnded = function () {
            var _this = this;
            if (!this._loop) {
                this._bufferSource.onended = function () { return _this._handleOnEnded(); };
            }
        };
        WebAudioInstance.prototype._handleOnEnded = function () {
            // pausing calls stop(0) which triggers onended event
            // so we don't "resolve" yet (when we resume we'll try again)
            if (!this._isPaused) {
                this._isPlaying = false;
                this._playingPromise.resolve(true);
            }
        };
        return WebAudioInstance;
    }());
})(ex || (ex = {}));
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
     * not participate in collisions. Drawn on top of all other actors.
     */
    var UIActor = (function (_super) {
        __extends(UIActor, _super);
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         */
        function UIActor(x, y, width, height) {
            _super.call(this, x, y, width, height);
            this.traits = [];
            this.traits.push(new ex.Traits.EulerMovement());
            this.traits.push(new ex.Traits.CapturePointer());
            this.anchor.setTo(0, 0);
            this.collisionType = ex.CollisionType.PreventCollision;
            this.enableCapturePointer = true;
        }
        UIActor.prototype.onInitialize = function (engine) {
            this._engine = engine;
        };
        UIActor.prototype.contains = function (x, y, useWorld) {
            if (useWorld === void 0) { useWorld = true; }
            if (useWorld) {
                return _super.prototype.contains.call(this, x, y);
            }
            var coords = this._engine.worldToScreenCoordinates(new ex.Vector(x, y));
            return _super.prototype.contains.call(this, coords.x, coords.y);
        };
        return UIActor;
    }(ex.Actor));
    ex.UIActor = UIActor;
})(ex || (ex = {}));
/// <reference path="Actor.ts" />
/// <reference path="Engine.ts" />
var ex;
(function (ex) {
    /**
     * Triggers are a method of firing arbitrary code on collision. These are useful
     * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
     * are invisible, and can only be seen when [[Engine.isDebug]] is set to `true`.
     *
     * [[include:Triggers.md]]
     */
    var Trigger = (function (_super) {
        __extends(Trigger, _super);
        /**
         * @param x       The x position of the trigger
         * @param y       The y position of the trigger
         * @param width   The width of the trigger
         * @param height  The height of the trigger
         * @param action  Callback to fire when trigger is activated, `this` will be bound to the Trigger instance
         * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
         */
        function Trigger(x, y, width, height, action, repeats) {
            _super.call(this, x, y, width, height);
            this._action = function () { return; };
            this.repeats = 1;
            this.target = null;
            this.repeats = repeats || this.repeats;
            this._action = action || this._action;
            this.collisionType = ex.CollisionType.PreventCollision;
            this.eventDispatcher = new ex.EventDispatcher(this);
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
        }
        Trigger.prototype.update = function (engine, delta) {
            // Update action queue
            this.actionQueue.update(delta);
            // Update placements based on linear algebra
            this.pos.x += this.vel.x * delta / 1000;
            this.pos.y += this.vel.y * delta / 1000;
            this.rotation += this.rx * delta / 1000;
            this.scale.x += this.sx * delta / 1000;
            this.scale.y += this.sy * delta / 1000;
            // check for trigger collisions
            if (this.target) {
                if (this.collides(this.target)) {
                    this._dispatchAction();
                }
            }
            else {
                for (var i = 0; i < engine.currentScene.children.length; i++) {
                    var other = engine.currentScene.children[i];
                    if (other !== this &&
                        other.collisionType !== ex.CollisionType.PreventCollision &&
                        this.collides(other)) {
                        this._dispatchAction();
                    }
                }
            }
            // remove trigger if its done, -1 repeat forever
            if (this.repeats === 0) {
                this.kill();
            }
        };
        Trigger.prototype._dispatchAction = function () {
            this._action.call(this);
            this.repeats--;
        };
        Trigger.prototype.draw = function (ctx, delta) {
            // does not draw
            return;
        };
        Trigger.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
            // Meant to draw debug information about actors
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            var bb = this.getBounds();
            var wp = this.getWorldPos();
            bb.left = bb.left - wp.x;
            bb.right = bb.right - wp.x;
            bb.top = bb.top - wp.y;
            bb.bottom = bb.bottom - wp.y;
            // Currently collision primitives cannot rotate 
            // ctx.rotate(this.rotation);
            ctx.fillStyle = ex.Color.Violet.toString();
            ctx.strokeStyle = ex.Color.Violet.toString();
            ctx.fillText('Trigger', 10, 10);
            bb.debugDraw(ctx);
            ctx.restore();
        };
        return Trigger;
    }(ex.Actor));
    ex.Trigger = Trigger;
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * An enum that represents the types of emitter nozzles
     */
    (function (EmitterType) {
        /**
         * Constant for the circular emitter type
         */
        EmitterType[EmitterType["Circle"] = 0] = "Circle";
        /**
         * Constant for the rectangular emitter type
         */
        EmitterType[EmitterType["Rectangle"] = 1] = "Rectangle";
    })(ex.EmitterType || (ex.EmitterType = {}));
    var EmitterType = ex.EmitterType;
    /**
     * Particle is used in a [[ParticleEmitter]]
     */
    var Particle = (function () {
        function Particle(emitter, life, opacity, beginColor, endColor, position, velocity, acceleration, startSize, endSize) {
            this.position = new ex.Vector(0, 0);
            this.velocity = new ex.Vector(0, 0);
            this.acceleration = new ex.Vector(0, 0);
            this.particleRotationalVelocity = 0;
            this.currentRotation = 0;
            this.focus = null;
            this.focusAccel = 0;
            this.opacity = 1;
            this.beginColor = ex.Color.White.clone();
            this.endColor = ex.Color.White.clone();
            // Life is counted in ms
            this.life = 300;
            this.fadeFlag = false;
            // Color transitions
            this._rRate = 1;
            this._gRate = 1;
            this._bRate = 1;
            this._aRate = 0;
            this._currentColor = ex.Color.White.clone();
            this.emitter = null;
            this.particleSize = 5;
            this.particleSprite = null;
            this.sizeRate = 0;
            this.elapsedMultiplier = 0;
            this.emitter = emitter;
            this.life = life || this.life;
            this.opacity = opacity || this.opacity;
            this.endColor = endColor || this.endColor.clone();
            this.beginColor = beginColor || this.beginColor.clone();
            this._currentColor = this.beginColor.clone();
            this.position = position || this.position;
            this.velocity = velocity || this.velocity;
            this.acceleration = acceleration || this.acceleration;
            this._rRate = (this.endColor.r - this.beginColor.r) / this.life;
            this._gRate = (this.endColor.g - this.beginColor.g) / this.life;
            this._bRate = (this.endColor.b - this.beginColor.b) / this.life;
            this._aRate = this.opacity / this.life;
            this.startSize = startSize || 0;
            this.endSize = endSize || 0;
            if ((this.endSize > 0) && (this.startSize > 0)) {
                this.sizeRate = (this.endSize - this.startSize) / this.life;
                this.particleSize = this.startSize;
            }
        }
        Particle.prototype.kill = function () {
            this.emitter.removeParticle(this);
        };
        Particle.prototype.update = function (delta) {
            this.life = this.life - delta;
            this.elapsedMultiplier = this.elapsedMultiplier + delta;
            if (this.life < 0) {
                this.kill();
            }
            if (this.fadeFlag) {
                this.opacity = ex.Util.clamp(this._aRate * this.life, 0.0001, 1);
            }
            if ((this.startSize > 0) && (this.endSize > 0)) {
                this.particleSize = ex.Util.clamp(this.sizeRate * delta + this.particleSize, Math.min(this.startSize, this.endSize), Math.max(this.startSize, this.endSize));
            }
            this._currentColor.r = ex.Util.clamp(this._currentColor.r + this._rRate * delta, 0, 255);
            this._currentColor.g = ex.Util.clamp(this._currentColor.g + this._gRate * delta, 0, 255);
            this._currentColor.b = ex.Util.clamp(this._currentColor.b + this._bRate * delta, 0, 255);
            this._currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);
            if (this.focus) {
                var accel = this.focus.sub(this.position).normalize().scale(this.focusAccel).scale(delta / 1000);
                this.velocity = this.velocity.add(accel);
            }
            else {
                this.velocity = this.velocity.add(this.acceleration.scale(delta / 1000));
            }
            this.position = this.position.add(this.velocity.scale(delta / 1000));
            if (this.particleRotationalVelocity) {
                this.currentRotation = (this.currentRotation + this.particleRotationalVelocity * delta / 1000) % (2 * Math.PI);
            }
        };
        Particle.prototype.draw = function (ctx) {
            if (this.particleSprite) {
                this.particleSprite.rotation = this.currentRotation;
                this.particleSprite.scale.setTo(this.particleSize, this.particleSize);
                this.particleSprite.draw(ctx, this.position.x, this.position.y);
                return;
            }
            this._currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);
            ctx.fillStyle = this._currentColor.toString();
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.particleSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        };
        return Particle;
    }());
    ex.Particle = Particle;
    /**
     * Using a particle emitter is a great way to create interesting effects
     * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
     * extend [[Actor]] allowing you to use all of the features that come with.
     *
     * [[include:Particles.md]]
     */
    var ParticleEmitter = (function (_super) {
        __extends(ParticleEmitter, _super);
        /**
         * @param x       The x position of the emitter
         * @param y       The y position of the emitter
         * @param width   The width of the emitter
         * @param height  The height of the emitter
         */
        function ParticleEmitter(x, y, width, height) {
            _super.call(this, x, y, width, height, ex.Color.White);
            this._particlesToEmit = 0;
            this.numParticles = 0;
            /**
             * Gets or sets the isEmitting flag
             */
            this.isEmitting = true;
            /**
             * Gets or sets the backing particle collection
             */
            this.particles = null;
            /**
             * Gets or sets the backing deadParticle collection
             */
            this.deadParticles = null;
            /**
             * Gets or sets the minimum particle velocity
             */
            this.minVel = 0;
            /**
             * Gets or sets the maximum particle velocity
             */
            this.maxVel = 0;
            /**
             * Gets or sets the acceleration vector for all particles
             */
            this.acceleration = new ex.Vector(0, 0);
            /**
             * Gets or sets the minimum angle in radians
             */
            this.minAngle = 0;
            /**
             * Gets or sets the maximum angle in radians
             */
            this.maxAngle = 0;
            /**
             * Gets or sets the emission rate for particles (particles/sec)
             */
            this.emitRate = 1; //particles/sec
            /**
             * Gets or sets the life of each particle in milliseconds
             */
            this.particleLife = 2000;
            /**
             * Gets or sets the opacity of each particle from 0 to 1.0
             */
            this.opacity = 1;
            /**
             * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
             */
            this.fadeFlag = false;
            /**
             * Gets or sets the optional focus where all particles should accelerate towards
             */
            this.focus = null;
            /**
             * Gets or sets the acceleration for focusing particles if a focus has been specified
             */
            this.focusAccel = 1;
            /*
             * Gets or sets the optional starting size for the particles
             */
            this.startSize = null;
            /*
             * Gets or sets the optional ending size for the particles
             */
            this.endSize = null;
            /**
             * Gets or sets the minimum size of all particles
             */
            this.minSize = 5;
            /**
             * Gets or sets the maximum size of all particles
             */
            this.maxSize = 5;
            /**
             * Gets or sets the beginning color of all particles
             */
            this.beginColor = ex.Color.White;
            /**
             * Gets or sets the ending color of all particles
             */
            this.endColor = ex.Color.White;
            /**
             * Gets or sets the sprite that a particle should use
             * @warning Performance intensive
             */
            this.particleSprite = null;
            /**
             * Gets or sets the emitter type for the particle emitter
             */
            this.emitterType = EmitterType.Rectangle;
            /**
             * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
             */
            this.radius = 0;
            /**
             * Gets or sets the particle rotational speed velocity
             */
            this.particleRotationalVelocity = 0;
            /**
             * Indicates whether particles should start with a random rotation
             */
            this.randomRotation = false;
            this.collisionType = ex.CollisionType.PreventCollision;
            this.particles = new ex.Util.Collection();
            this.deadParticles = new ex.Util.Collection();
            // Remove offscreen culling from particle emitters
            for (var i = 0; i < this.traits.length; i++) {
                if (this.traits[i] instanceof ex.Traits.OffscreenCulling) {
                    this.traits.splice(i, 1);
                }
            }
        }
        ParticleEmitter.prototype.removeParticle = function (particle) {
            this.deadParticles.push(particle);
        };
        /**
         * Causes the emitter to emit particles
         * @param particleCount  Number of particles to emit right now
         */
        ParticleEmitter.prototype.emitParticles = function (particleCount) {
            for (var i = 0; i < particleCount; i++) {
                this.particles.push(this._createParticle());
            }
        };
        ParticleEmitter.prototype.clearParticles = function () {
            this.particles.clear();
        };
        // Creates a new particle given the constraints of the emitter
        ParticleEmitter.prototype._createParticle = function () {
            // todo implement emitter constraints;
            var ranX = 0;
            var ranY = 0;
            var angle = ex.Util.randomInRange(this.minAngle, this.maxAngle);
            var vel = ex.Util.randomInRange(this.minVel, this.maxVel);
            var size = this.startSize || ex.Util.randomInRange(this.minSize, this.maxSize);
            var dx = vel * Math.cos(angle);
            var dy = vel * Math.sin(angle);
            if (this.emitterType === EmitterType.Rectangle) {
                ranX = ex.Util.randomInRange(this.pos.x, this.pos.x + this.getWidth());
                ranY = ex.Util.randomInRange(this.pos.y, this.pos.y + this.getHeight());
            }
            else if (this.emitterType === EmitterType.Circle) {
                var radius = ex.Util.randomInRange(0, this.radius);
                ranX = radius * Math.cos(angle) + this.pos.x;
                ranY = radius * Math.sin(angle) + this.pos.y;
            }
            var p = new Particle(this, this.particleLife, this.opacity, this.beginColor, this.endColor, new ex.Vector(ranX, ranY), new ex.Vector(dx, dy), this.acceleration, this.startSize, this.endSize);
            p.fadeFlag = this.fadeFlag;
            p.particleSize = size;
            if (this.particleSprite) {
                p.particleSprite = this.particleSprite;
            }
            p.particleRotationalVelocity = this.particleRotationalVelocity;
            if (this.randomRotation) {
                p.currentRotation = ex.Util.randomInRange(0, Math.PI * 2);
            }
            if (this.focus) {
                p.focus = this.focus.add(new ex.Vector(this.pos.x, this.pos.y));
                p.focusAccel = this.focusAccel;
            }
            return p;
        };
        ParticleEmitter.prototype.update = function (engine, delta) {
            var _this = this;
            _super.prototype.update.call(this, engine, delta);
            if (this.isEmitting) {
                this._particlesToEmit += this.emitRate * (delta / 1000);
                //var numParticles = Math.ceil(this.emitRate * delta / 1000);
                if (this._particlesToEmit > 1.0) {
                    this.emitParticles(Math.floor(this._particlesToEmit));
                    this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
                }
            }
            this.particles.forEach(function (p) { return p.update(delta); });
            this.deadParticles.forEach(function (p) { return _this.particles.removeElement(p); });
            this.deadParticles.clear();
        };
        ParticleEmitter.prototype.draw = function (ctx, delta) {
            // todo is there a more efficient to draw 
            // possibly use a webgl offscreen canvas and shaders to do particles?
            this.particles.forEach(function (p) { return p.draw(ctx); });
        };
        ParticleEmitter.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
            ctx.fillStyle = ex.Color.Black.toString();
            ctx.fillText('Particles: ' + this.particles.count(), this.pos.x, this.pos.y + 20);
            if (this.focus) {
                ctx.fillRect(this.focus.x + this.pos.x, this.focus.y + this.pos.y, 3, 3);
                ex.Util.DrawUtil.line(ctx, ex.Color.Yellow, this.focus.x + this.pos.x, this.focus.y + this.pos.y, _super.prototype.getCenter.call(this).x, _super.prototype.getCenter.call(this).y);
                ctx.fillText('Focus', this.focus.x + this.pos.x, this.focus.y + this.pos.y);
            }
        };
        return ParticleEmitter;
    }(ex.Actor));
    ex.ParticleEmitter = ParticleEmitter;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Animations allow you to display a series of images one after another,
     * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
     *
     * [[include:Animations.md]]
     */
    var Animation = (function () {
        /**
         * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
         *
         * @param engine  Reference to the current game engine
         * @param images  An array of sprites to create the frames for the animation
         * @param speed   The number in milliseconds to display each frame in the animation
         * @param loop    Indicates whether the animation should loop after it is completed
         */
        function Animation(engine, images, speed, loop) {
            /**
             * Current frame index being shown
             */
            this.currentFrame = 0;
            this._oldTime = Date.now();
            this.anchor = new ex.Vector(0.0, 0.0);
            this.rotation = 0.0;
            this.scale = new ex.Vector(1, 1);
            /**
             * Indicates whether the animation should loop after it is completed
             */
            this.loop = false;
            /**
             * Indicates the frame index the animation should freeze on for a non-looping
             * animation. By default it is the last frame.
             */
            this.freezeFrame = -1;
            /**
             * Flip each frame vertically. Sets [[Sprite.flipVertical]].
             */
            this.flipVertical = false;
            /**
             * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
             */
            this.flipHorizontal = false;
            this.width = 0;
            this.height = 0;
            this.naturalWidth = 0;
            this.naturalHeight = 0;
            this.sprites = images;
            this.speed = speed;
            this._engine = engine;
            if (loop != null) {
                this.loop = loop;
            }
            if (images && images[0]) {
                this.height = images[0] ? images[0].height : 0;
                this.width = images[0] ? images[0].width : 0;
                this.naturalWidth = images[0] ? images[0].naturalWidth : 0;
                this.naturalHeight = images[0] ? images[0].naturalHeight : 0;
                this.freezeFrame = images.length - 1;
            }
        }
        /**
         * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
         */
        Animation.prototype.opacity = function (value) {
            this.addEffect(new ex.Effects.Opacity(value));
        };
        /**
         * Applies the grayscale effect to a sprite, removing color information.
         */
        Animation.prototype.grayscale = function () {
            this.addEffect(new ex.Effects.Grayscale());
        };
        /**
         * Applies the invert effect to a sprite, inverting the pixel colors.
         */
        Animation.prototype.invert = function () {
            this.addEffect(new ex.Effects.Invert());
        };
        /**
         * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        Animation.prototype.fill = function (color) {
            this.addEffect(new ex.Effects.Fill(color));
        };
        /**
         * Applies the colorize effect to a sprite, changing the color channels of all pixels to be the average of the original color and the
         * provided color.
         */
        Animation.prototype.colorize = function (color) {
            this.addEffect(new ex.Effects.Colorize(color));
        };
        /**
         * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
         */
        Animation.prototype.lighten = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Lighten(factor));
        };
        /**
         * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
         */
        Animation.prototype.darken = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Darken(factor));
        };
        /**
         * Applies the saturate effect to a sprite, saturates the color according to hsl
         */
        Animation.prototype.saturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Saturate(factor));
        };
        /**
         * Applies the desaturate effect to a sprite, desaturates the color according to hsl
         */
        Animation.prototype.desaturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Desaturate(factor));
        };
        /**
         * Add a [[ISpriteEffect]] manually
         */
        Animation.prototype.addEffect = function (effect) {
            for (var i in this.sprites) {
                this.sprites[i].addEffect(effect);
            }
        };
        Animation.prototype.removeEffect = function (param) {
            for (var i in this.sprites) {
                this.sprites[i].removeEffect(param);
            }
        };
        /**
         * Clear all sprite effects
         */
        Animation.prototype.clearEffects = function () {
            for (var i in this.sprites) {
                this.sprites[i].clearEffects();
            }
        };
        Animation.prototype._setAnchor = function (point) {
            //if (!this.anchor.equals(point)) {
            for (var i in this.sprites) {
                this.sprites[i].anchor.setTo(point.x, point.y);
            }
            //}
        };
        Animation.prototype._setRotation = function (radians) {
            //if (this.rotation !== radians) {
            for (var i in this.sprites) {
                this.sprites[i].rotation = radians;
            }
            //}
        };
        Animation.prototype._setScale = function (scale) {
            //if (!this.scale.equals(scale)) {
            for (var i in this.sprites) {
                this.sprites[i].scale = scale;
            }
            //}
        };
        /**
         * Resets the animation to first frame.
         */
        Animation.prototype.reset = function () {
            this.currentFrame = 0;
        };
        /**
         * Indicates whether the animation is complete, animations that loop are never complete.
         */
        Animation.prototype.isDone = function () {
            return (!this.loop && this.currentFrame >= this.sprites.length);
        };
        /**
         * Not meant to be called by game developers. Ticks the animation forward internally and
         * calculates whether to change to the frame.
         * @internal
         */
        Animation.prototype.tick = function () {
            var time = Date.now();
            if ((time - this._oldTime) > this.speed) {
                this.currentFrame = (this.loop ? (this.currentFrame + 1) % this.sprites.length : this.currentFrame + 1);
                this._oldTime = time;
            }
        };
        Animation.prototype._updateValues = function () {
            this._setAnchor(this.anchor);
            this._setRotation(this.rotation);
            this._setScale(this.scale);
        };
        /**
         * Skips ahead a specified number of frames in the animation
         * @param frames  Frames to skip ahead
         */
        Animation.prototype.skip = function (frames) {
            this.currentFrame = (this.currentFrame + frames) % this.sprites.length;
        };
        Animation.prototype.draw = function (ctx, x, y) {
            this.tick();
            this._updateValues();
            var currSprite;
            if (this.currentFrame < this.sprites.length) {
                currSprite = this.sprites[this.currentFrame];
                if (this.flipVertical) {
                    currSprite.flipVertical = this.flipVertical;
                }
                if (this.flipHorizontal) {
                    currSprite.flipHorizontal = this.flipHorizontal;
                }
                currSprite.draw(ctx, x, y);
            }
            if (this.freezeFrame !== -1 && this.currentFrame >= this.sprites.length) {
                currSprite = this.sprites[ex.Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
                currSprite.draw(ctx, x, y);
            }
            // add the calculated width
            if (currSprite) {
                this.width = currSprite.width;
                this.height = currSprite.height;
            }
        };
        /**
         * Plays an animation at an arbitrary location in the game.
         * @param x  The x position in the game to play
         * @param y  The y position in the game to play
         */
        Animation.prototype.play = function (x, y) {
            this.reset();
            this._engine.playAnimation(this, x, y);
        };
        return Animation;
    }());
    ex.Animation = Animation;
})(ex || (ex = {}));
/// <reference path="../Drawing/Color.ts" />
var ex;
(function (ex) {
    var Util;
    (function (Util) {
        var DrawUtil;
        (function (DrawUtil) {
            /**
             * Draw a line on canvas context
             *
             * @param ctx The canvas context
             * @param color The color of the line
             * @param x1 The start x coordinate
             * @param y1 The start y coordinate
             * @param x2 The ending x coordinate
             * @param y2 The ending y coordinate
             * @param thickness The line thickness
             * @param cap The [[LineCapStyle]] (butt, round, or square)
             */
            /* istanbul ignore next */
            function line(ctx, color, x1, y1, x2, y2, thickness, cap) {
                if (color === void 0) { color = ex.Color.Red.clone(); }
                if (thickness === void 0) { thickness = 1; }
                if (cap === void 0) { cap = 'butt'; }
                ctx.beginPath();
                ctx.lineWidth = thickness;
                ctx.lineCap = cap;
                ctx.strokeStyle = color.toString();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
                ctx.stroke();
            }
            DrawUtil.line = line;
            /**
             * Draw the vector as a point onto the canvas.
             */
            /* istanbul ignore next */
            function point(ctx, color, point) {
                if (color === void 0) { color = ex.Color.Red.clone(); }
                ctx.beginPath();
                ctx.strokeStyle = color.toString();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.closePath();
                ctx.stroke();
            }
            DrawUtil.point = point;
            /**
             * Draw the vector as a line onto the canvas starting a origin point.
             */
            /* istanbul ignore next */
            function vector(ctx, color, origin, vector, scale) {
                if (scale === void 0) { scale = 1.0; }
                var c = color ? color.toString() : 'blue';
                var v = vector.scale(scale);
                ctx.beginPath();
                ctx.strokeStyle = c;
                ctx.moveTo(origin.x, origin.y);
                ctx.lineTo(origin.x + v.x, origin.y + v.y);
                ctx.closePath();
                ctx.stroke();
            }
            DrawUtil.vector = vector;
            /**
             * Draw a round rectangle on a canvas context
             *
             * @param ctx The canvas context
             * @param x The top-left x coordinate
             * @param y The top-left y coordinate
             * @param width The width of the rectangle
             * @param height The height of the rectangle
             * @param radius The border radius of the rectangle
             * @param fill The [[ex.Color]] to fill rectangle with
             * @param stroke The [[ex.Color]] to stroke rectangle with
             */
            function roundRect(ctx, x, y, width, height, radius, stroke, fill) {
                if (radius === void 0) { radius = 5; }
                if (stroke === void 0) { stroke = ex.Color.White; }
                if (fill === void 0) { fill = null; }
                var br;
                if (typeof radius === 'number') {
                    br = { tl: radius, tr: radius, br: radius, bl: radius };
                }
                else {
                    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
                    for (var side in defaultRadius) {
                        br[side] = radius[side] || defaultRadius[side];
                    }
                }
                ctx.beginPath();
                ctx.moveTo(x + br.tl, y);
                ctx.lineTo(x + width - br.tr, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + br.tr);
                ctx.lineTo(x + width, y + height - br.br);
                ctx.quadraticCurveTo(x + width, y + height, x + width - br.br, y + height);
                ctx.lineTo(x + br.bl, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - br.bl);
                ctx.lineTo(x, y + br.tl);
                ctx.quadraticCurveTo(x, y, x + br.tl, y);
                ctx.closePath();
                if (fill) {
                    ctx.fillStyle = fill.toString();
                    ctx.fill();
                }
                if (stroke) {
                    ctx.strokeStyle = stroke.toString();
                    ctx.stroke();
                }
            }
            DrawUtil.roundRect = roundRect;
            function circle(ctx, x, y, radius, stroke, fill) {
                if (stroke === void 0) { stroke = ex.Color.White; }
                if (fill === void 0) { fill = null; }
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.closePath();
                if (fill) {
                    ctx.fillStyle = fill.toString();
                    ctx.fill();
                }
                if (stroke) {
                    ctx.strokeStyle = stroke.toString();
                    ctx.stroke();
                }
            }
            DrawUtil.circle = circle;
        })(DrawUtil = Util.DrawUtil || (Util.DrawUtil = {}));
    })(Util = ex.Util || (ex.Util = {}));
})(ex || (ex = {}));
/// <reference path="ILoadable.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Util/DrawUtil.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Resources/Resource.ts" />
/// <reference path="Resources/Sound.ts" />
/// <reference path="Interfaces/ILoadable.ts" />
/// <reference path="Interfaces/ILoader.ts" />
var ex;
(function (ex) {
    /**
     * Pre-loading assets
     *
     * The loader provides a mechanism to preload multiple resources at
     * one time. The loader must be passed to the engine in order to
     * trigger the loading progress bar.
     *
     * The [[Loader]] itself implements [[ILoadable]] so you can load loaders.
     *
     * ## Example: Pre-loading resources for a game
     *
     * ```js
     * // create a loader
     * var loader = new ex.Loader();
     *
     * // create a resource dictionary (best practice is to keep a separate file)
     * var resources = {
     *   TextureGround: new ex.Texture("/images/textures/ground.png"),
     *   SoundDeath: new ex.Sound("/sound/death.wav", "/sound/death.mp3")
     * };
     *
     * // loop through dictionary and add to loader
     * for (var loadable in resources) {
     *   if (resources.hasOwnProperty(loadable)) {
     *     loader.addResource(resources[loadable]);
     *   }
     * }
     *
     * // start game
     * game.start(loader).then(function () {
     *   console.log("Game started!");
     * });
     * ```
     */
    var Loader = (function (_super) {
        __extends(Loader, _super);
        /**
         * @param loadables  Optionally provide the list of resources you want to load at constructor time
         */
        function Loader(loadables) {
            _super.call(this);
            this._resourceList = [];
            this._index = 0;
            this._resourceCount = 0;
            this._numLoaded = 0;
            this._progressCounts = {};
            this._totalCounts = {};
            // logo drawing stuff
            /* tslint:disable:max-line-length */
            // base64 string encoding of the excalibur logo (logo-white.png)
            this.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdQAAAB2CAYAAABxhGI9AAAACXBIWXMAAAsSAAALEgHS3X78AAAKnUlEQVR42u3dP2wjSx0H8N8hJIonIRmJjsq0SBR+BQ1dcqKhe0lD77SvSwpKkJKGPulpktfRIMUdEqKIqV57rpAokM4dbSiyq7ONPTP7x39ifz7SFbnEnp3xer47O7uzH15fXwMA6OYHmgAABCoACFQAEKgAgEAFAIEKAAIVAAQqACBQAUCgAoBABQCBCgAIVAAQqAAgUAFAoAIAAhUABCoACFQAEKgAgECFLbmOiNeFf2PbAyz68Pr6qhUgbRwR92v+/zwiJrYHMEKFMmcN///UtgcQqFBk1PD/97U9Qx8VCFSgu4EmAIEKAAIVAAQqACBQ4Z25jojP8eX+0WtNAgIVaOY+Im5j+eKh24h41jQgUIEyZ7F5NaPU7wCBCiwYd/w9cOB+qAlgJ3KLLow0EV198803RWvJfvfddx+0lhEqHKu5JgAjVCBvlhmFzjQRXUekHz9+TP79y8uLRjNChXfvoePvAYEKxNtj1e42/O5JoIJABcrdRMRVLM+X3kTEpaaB988cKuzWg9EobTWdMx0Oly8uN4dqhAoARqgnaN3arHfqu7OyH8ItKLVB/P+CEfMTHyGPY3npx1m8zWGDEeoBfUk/xdti57dr/r1Wv2+6EPow3tZ5rRdS72s1neuF97xvWd+XTH0/V+UMttDWqbI/r2nrxfp+jv2uSjSO7S+OXy/A/3lN+9xX5T5HxEUPZZ0tfB71+w57eJ/HFu+z+jkv1u92YX9fbI/HhX3JA9rp5MPr66tWaG9UfUGbrHIzi7cLUyYFf/tpTady03EEeL8mUJ6i7MKYNvWNqr4Pe2jradXO60LrvPAz2PQ5RPX684ah8dxD+2zantnCgVipSVV+m/tgB9W2DDq2Sx/vM95wcHhZhWVJm8yrv58cSgfTdc70+++/X/r522+/tUKSEepBqo+om4ZLPerMjUwuNnQCtx1GWJtee1FwdD5uWd86xLs8UaVt2aNEO1/saZ/Z5rYMW4zq6v34rGV9Bg3q2eZ9SkeNm9qwyUh30OPIHYFKx5FG03C7znSOqYBq+qW/zpQ3anH037TNHluG6f0WPsPhHvab4QFty7ogOeuxDYcNy2/zu2214WNYWxmBurNO8bGn97pNBOO8xy/9uCorZZ4I2r4C7aJgO7ZV9iE49Dm6NvOWx+pWE9CUq3zbdTp9doz38TbXtzqH9RT5CyWe422OaZoZGeZCabrhPQY9HjwsjpTvCg4YtlE2+Ta/j2bzn8fqrDqgm+6yUHOmAvWUjAtGhbNYvsBknDnqH1Qhc7VmxHgeb/NbudA5j/UXlYwif2p6luhAc9teu1npiHKnDs8if6tCm7JLX3NKpgttXe9ruc9mHMd7a83iwdxF5vt8tutARaCeklRnNK9C8WnNF7geJQ4T4XG3JhSnVdilQrG+yOnrlVHfsEGYzhNBn7Lu6tS7+HJafJQ4EMiNlNqWXZ9WPvVgnVYHG5M1ByDXkT6leX2EgTqJtyt45yv7S2qO3sEZjZhDLXeR+YKdJ0Zdk8QocvH9N732KrNtq+FZ/zzIHABcJrYpd+Xv14lOd5ap76SgrduW/VTQ1qcQpqnbgu4ifZvUMNpd9XuoZmvCtPaQ2Y/BCHVLgbrJTeRPDdVf6pfMKDU2fOkHmVFFfXr3MsouLsnNvV5kRoe5+s431PeuoKPqWnaurY/ZPBEeqwceN4l96iwO6H7Mjq4y7VGPVNe10VaZMzVCPVWpI/Z6FZbcv5fMqGCU+dLfFGzj58jP8+bCdJCo7yzKTwdOF0bu9Ug7V4c+yz7FJfYeGoysUss0HssIdVZwYLDujMqlESoCdTtGsZtbHnJBeNdDSJSs0jTKdMJN1HNX54Wv7bvsU9NkVJVa13dX+/wuArV0X/l5RHyo/lnfF4G6p6DrS0kHdtXhy35TGErDPYZUn2WfWqDOo/lVqdMD2O/hKJhD7S/odukymq9s02QN4EEPR/zbaOumZc+r15zK1Zqznl9jsfiemTM1QmV3HUuTkedlg9HIQzRbUD93dfC+2tpj2fIHEH2+RqCCQH13gZq7hWXTNpVu19OB1fc9nQ0AKOKUb5lU0P1kDyOneoWk0lOZ9cIP0x7qu8+2BhCoR2wYu1+e7DmaXzBSsu5vaX1ne2zrpmUPTmxf7PM1Dm4y/vC7ny7Nif7+z/9ZmtM0Z3panPLtPmra9f16bcK0Dpbnwk43Vd/RHtu6zfNQTy1QBy3aqG2g9nVmxml+BOoJyT3NpWmn9xhfFnu4bvDa+44BXhqqfdf3uUF9+yz77AT31Yue2mjecYQ62NLfgkA9ghHqLNEhNem4H1c6vdyDxhf/bpz5m4coW/c39wi6VH2bPtHlcaV9cvXts+zxCe6rTeqc2ndL7uGd93QwM9bFcAzMoZZ7SgTBbWx+asui61h/iq1+RmjqdbnQXQ3T1DNQ63V/U9ucqm/pMzPb1rePsk/1iTOjgvatR4W3Lc8ULB78pELyrnAfeTcj1NU509/86mfJ33/8+Mf00a05UyPUEw7UVCeWG/WNEiExyHRMt5ltW30izUPk18ytt7lNfc8i//DvtvXto+ySA5BjljsLUF8lPkqMPEtW1JomDsiGBZ9Byb4NAvUITSN9GuwsIj6t6UTOqk7jJREkmzqli8xIs96udSO20sX0H1vW92IL9e1a9rgqVyf91gbPsTy9UD9n9lOkT8k+RfkFR5PMNqxOcdSf32PBvg3vilO+zdxE+okx9Wm0ph36XYsRZCpMF993GOk5qvqB3Dct6jvssb67KvuUNJ3frw92bhr8/STSF0JdRPMLpUCgnsgo9S76PZ246ZFk1wWvK5m3vVoYvW1Sz7nN91jfXbQ1ZQc7TW6HeaoOalypG/8/p/rP1aNAc6ZHzSnfdqPUPhdy2PQw6Nz9gSVhuhiqueUHR3uu7y7K3rdDX4u46ZrPbUa0IFBZ0seKQ3XQTRt2vm3W/a2DbNKys++rvm3ep6+y1x2UdP3bWU9lzra47U1GmlctX/sQ23t+aOlByLTh/4NAPaCRxtcdO5HLSJ/6vNtCwGx67VPmPbvWd1q9frKHtp4kAqRJ2HR9j762JfX3bZ//elPtj13PPDx1+D5tqk/Xi6NO8SHz7MmH19dXrdBNfVFP6T2PT1UHNit87/t4m5+aRH+nQBdvqyhZDKJLfZs8h7XPsqdV2ZOV+tanKB8aln0dyxdAXbV4j4gvt4oMOrbP6vbU73NW7TMlbdTnPrWpfqXfh9HKZ9vke7KuTeZRNtXRSe6+1FV//ce/ln5eXfsXgcqXzr6+9261M3moOoa7E6nvTZTfy7iNsmfb7kjfgXGsvxe0vihsEts9HTquPpt1q1vtahu2TqAiUAEEKj0zhwoARqgAu/OnX/442WH+9xc/Wvr58re/Tr7f41/+ZsRqhAoACFQAEKgAcHjMoQJskJsz/eqrr5Z+vvr7v5fmQFevAl5lztQIFQAQqAAgUAHgIJlDBdhgdQ41N2eKESoAIFABQKACwFEwhwoARqgAIFABQKACAAIVAAQqAAhUABCoAIBABQCBCgACFQAEKgAgUAFAoAKAQAUAgQoACFQAEKgAIFABQKACAAIVAAQqAAhUABCoAIBABQCBCgACFQAQqAAgUAFAoAKAQAUAlvwPcFDns1DsH4sAAAAASUVORK5CYII=';
            /* tslint:enable:max-line-length */
            this.logoWidth = 468;
            this.logoHeight = 118;
            this.backgroundColor = '#176BAA';
            this.getData = function () { return; };
            this.setData = function (data) { return; };
            this.processData = function (data) { return; };
            this.onprogress = function (e) {
                ex.Logger.getInstance().debug('[ex.Loader] Loading ' + (100 * e.loaded / e.total).toFixed(0));
                return;
            };
            this.oncomplete = function () { return; };
            this.onerror = function () { return; };
            if (loadables) {
                this.addResources(loadables);
            }
        }
        Object.defineProperty(Loader.prototype, "_image", {
            get: function () {
                if (!this._imageElement) {
                    this._imageElement = new Image();
                    this._imageElement.src = this.logo;
                }
                return this._imageElement;
            },
            enumerable: true,
            configurable: true
        });
        ;
        Loader.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        /**
         * Add a resource to the loader to load
         * @param loadable  Resource to add
         */
        Loader.prototype.addResource = function (loadable) {
            var key = this._index++;
            this._resourceList.push(loadable);
            this._progressCounts[key] = 0;
            this._totalCounts[key] = 1;
            this._resourceCount++;
        };
        /**
         * Add a list of resources to the loader to load
         * @param loadables  The list of resources to load
         */
        Loader.prototype.addResources = function (loadables) {
            var i = 0, len = loadables.length;
            for (i; i < len; i++) {
                this.addResource(loadables[i]);
            }
        };
        Loader.prototype._sumCounts = function (obj) {
            var sum = 0;
            var prev = 0;
            for (var i in obj) {
                sum += obj[i] | 0;
            }
            return sum;
        };
        /**
         * Returns true if the loader has completely loaded all resources
         */
        Loader.prototype.isLoaded = function () {
            return this._numLoaded === this._resourceCount;
        };
        /**
         * Begin loading all of the supplied resources, returning a promise
         * that resolves when loading of all is complete
         */
        Loader.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var me = this;
            if (this._resourceList.length === 0) {
                me.oncomplete.call(me);
                return complete;
            }
            var progressArray = new Array(this._resourceList.length);
            var progressChunks = this._resourceList.length;
            this._resourceList.forEach(function (r, i) {
                if (_this._engine) {
                    r.wireEngine(_this._engine);
                }
                r.onprogress = function (e) {
                    var total = e.total;
                    var loaded = e.loaded;
                    progressArray[i] = { loaded: ((loaded / total) * (100 / progressChunks)), total: 100 };
                    var progressResult = progressArray.reduce(function (accum, next) {
                        return { loaded: (accum.loaded + next.loaded), total: 100 };
                    }, { loaded: 0, total: 100 });
                    me.onprogress.call(me, progressResult);
                };
                r.oncomplete = r.onerror = function () {
                    me._numLoaded++;
                    if (me._numLoaded === me._resourceCount) {
                        me.oncomplete.call(me);
                        complete.resolve();
                    }
                };
            });
            function loadNext(list, index) {
                if (!list[index]) {
                    return;
                }
                list[index].load().then(function () {
                    loadNext(list, index + 1);
                });
            }
            loadNext(this._resourceList, 0);
            return complete;
        };
        /**
         * Loader draw function. Draws the default Excalibur loading screen.
         * Override `logo`, `logoWidth`, `logoHeight` and `backgroundColor` properties
         * to customize the drawing, or just override entire method.
         */
        Loader.prototype.draw = function (ctx, delta) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, this._engine.width, this._engine.height);
            var y = this._engine.canvas.height / 2;
            var width = Math.min(this.logoWidth, this._engine.canvas.width * 0.75);
            var x = (this._engine.width / 2) - (width / 2);
            var imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor
            var oldAntialias = this._engine.getAntialiasing();
            this._engine.setAntialiasing(true);
            ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, x, y - imageHeight - 20, width, imageHeight);
            // loading box
            ctx.lineWidth = 2;
            ex.Util.DrawUtil.roundRect(ctx, x, y, width, 20, 10);
            var progress = width * (this._numLoaded / this._resourceCount);
            var margin = 5;
            var progressWidth = progress - margin * 2;
            var height = 20 - margin * 2;
            ex.Util.DrawUtil.roundRect(ctx, x + margin, y + margin, progressWidth > 0 ? progressWidth : 0, height, 5, null, ex.Color.White);
            this._engine.setAntialiasing(oldAntialias);
        };
        /**
         * Perform any calculations or logic in the `update` method. The default `Loader` does not
         * do anything in this method so it is safe to override.
         */
        Loader.prototype.update = function (engine, delta) {
            // overridable update
        };
        return Loader;
    }(ex.Class));
    ex.Loader = Loader;
    /**
     * A [[Loader]] that pauses after loading to allow user
     * to proceed to play the game. Typically you will
     * want to use this loader for iOS to allow sounds
     * to play after loading (Apple Safari requires user
     * interaction to allow sounds, even for games)
     *
     * **Note:** Because Loader is not part of a Scene, you must
     * call `update` and `draw` manually on "child" objects.
     *
     * ## Implementing a Trigger
     *
     * The `PauseAfterLoader` requires an element to act as the trigger button
     * to start the game.
     *
     * For example, let's create an `<a>` tag to be our trigger and call it `tap-to-play`.
     *
     * ```html
     * <div id="wrapper">
     *    <canvas id="game"></canvas>
     *    <a id="tap-to-play" href='javascript:void(0);'>Tap to Play</a>
     * </div>
     * ```
     *
     * We've put it inside a wrapper to position it properly over the game canvas.
     *
     * Now let's add some CSS to style it (insert into `<head>`):
     *
     * ```html
     * <style>
     *     #wrapper {
     *         position: relative;
     *         width: 500px;
     *         height: 500px;
     *     }
     *     #tap-to-play {
     *         display: none;
     *         font-size: 24px;
     *         font-family: sans-serif;
     *         text-align: center;
     *         border: 3px solid white;
     *         position: absolute;
     *         color: white;
     *         width: 200px;
     *         height: 50px;
     *         line-height: 50px;
     *         text-decoration: none;
     *         left: 147px;
     *         top: 80%;
     *     }
     * </style>
     * ```
     *
     * Now we can create a `PauseAfterLoader` with a reference to our trigger button:
     *
     * ```ts
     * var loader = new ex.PauseAfterLoader('tap-to-play', [...]);
     * ```
     *
     * ## Use PauseAfterLoader for iOS
     *
     * The primary use case for pausing before starting the game is to
     * pass Apple's requirement of user interaction. The Web Audio context
     * in Safari is disabled by default until user interaction.
     *
     * Therefore, you can use this snippet to only use PauseAfterLoader when
     * iOS is detected (see [this thread](http://stackoverflow.com/questions/9038625/detect-if-device-is-ios)
     * for more techniques).
     *
     * ```ts
     * var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
     * var loader: ex.Loader = iOS ? new ex.PauseAfterLoader('tap-to-play') : new ex.Loader();
     *
     * loader.addResource(...);
     * ```
     */
    var PauseAfterLoader = (function (_super) {
        __extends(PauseAfterLoader, _super);
        function PauseAfterLoader(triggerElementId, loadables) {
            var _this = this;
            _super.call(this, loadables);
            this._handleOnTrigger = function () {
                if (_this._waitPromise.state() !== ex.PromiseState.Pending) {
                    return false;
                }
                // unlock Safari WebAudio context
                ex.WebAudio.unlock();
                // continue to play game
                _this._waitPromise.resolve(_this._loadedValue);
                // hide DOM element
                _this._playTrigger.style.display = 'none';
                return false;
            };
            this._playTrigger = document.getElementById(triggerElementId);
            this._playTrigger.addEventListener('click', this._handleOnTrigger);
        }
        PauseAfterLoader.prototype.load = function () {
            var _this = this;
            this._waitPromise = new ex.Promise();
            // wait until user indicates to proceed before finishing load
            var superLoad = _super.prototype.load.call(this).then(function (value) {
                _this._loaded = true;
                _this._loadedValue = value;
                // show element
                _this._playTrigger.style.display = 'block';
            }, function (value) {
                _this._waitPromise.reject(value);
            });
            return this._waitPromise;
        };
        return PauseAfterLoader;
    }(Loader));
    ex.PauseAfterLoader = PauseAfterLoader;
})(ex || (ex = {}));
/// <reference path="Log.ts" />
/**
 * This is the list of features that will be used to log the supported
 * features to the console when Detector.logBrowserFeatures() is called.
 */
var REPORTED_FEATURES = {
    webgl: 'WebGL',
    webaudio: 'WebAudio',
    gamepadapi: 'Gamepad API'
};
var ex;
(function (ex) {
    /**
     * Excalibur internal feature detection helper class
     */
    var Detector = (function () {
        function Detector() {
            this._features = null;
            this.failedTests = [];
            // critical browser features required for ex to run
            this._criticalTests = {
                // Test canvas/2d context support
                canvasSupport: function () {
                    var elem = document.createElement('canvas');
                    return !!(elem.getContext && elem.getContext('2d'));
                },
                // Test array buffer support ex uses for downloading binary data
                arrayBufferSupport: function () {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', '/');
                    try {
                        xhr.responseType = 'arraybuffer';
                    }
                    catch (e) {
                        return false;
                    }
                    return xhr.responseType === 'arraybuffer';
                },
                // Test data urls ex uses for sprites
                dataUrlSupport: function () {
                    var canvas = document.createElement('canvas');
                    return canvas.toDataURL('image/png').indexOf('data:image/png') === 0;
                },
                // Test object url support for loading
                objectUrlSupport: function () {
                    return ('URL' in window) && ('revokeObjectURL' in URL) && ('createObjectURL' in URL);
                },
                // RGBA support for colors
                rgbaSupport: function () {
                    var style = document.createElement('a').style;
                    style.cssText = 'background-color:rgba(150,255,150,.5)';
                    return ('' + style.backgroundColor).indexOf('rgba') > -1;
                }
            };
            // warnings excalibur performance will be degraded
            this._warningTest = {
                webAudioSupport: function () {
                    return !!(window.AudioContext ||
                        window.webkitAudioContext ||
                        window.mozAudioContext ||
                        window.msAudioContext ||
                        window.oAudioContext);
                },
                webglSupport: function () {
                    var elem = document.createElement('canvas');
                    return !!(elem.getContext && elem.getContext('webgl'));
                }
            };
            this._features = this._loadBrowserFeatures();
        }
        /**
         * Returns a map of currently supported browser features. This method
         * treats the features as a singleton and will only calculate feature
         * support if it has not previously been done.
         */
        Detector.prototype.getBrowserFeatures = function () {
            if (this._features === null) {
                this._features = this._loadBrowserFeatures();
            }
            return this._features;
        };
        /**
         * Report on non-critical browser support for debugging purposes.
         * Use native browser console colors for visibility.
         */
        Detector.prototype.logBrowserFeatures = function () {
            var msg = '%cSUPPORTED BROWSER FEATURES\n==========================%c\n';
            var args = [
                'font-weight: bold; color: navy',
                'font-weight: normal; color: inherit'
            ];
            var supported = this.getBrowserFeatures();
            for (var _i = 0, _a = Object.keys(REPORTED_FEATURES); _i < _a.length; _i++) {
                var feature = _a[_i];
                if (supported[feature]) {
                    msg += '(%c\u2713%c)'; // (✓)
                    args.push('font-weight: bold; color: green');
                    args.push('font-weight: normal; color: inherit');
                }
                else {
                    msg += '(%c\u2717%c)'; // (✗)
                    args.push('font-weight: bold; color: red');
                    args.push('font-weight: normal; color: inherit');
                }
                ;
                msg += ' ' + REPORTED_FEATURES[feature] + '\n';
            }
            args.unshift(msg);
            console.log.apply(console, args);
        };
        /**
         * Executes several IIFE's to get a constant reference to supported
         * features within the current execution context.
         */
        Detector.prototype._loadBrowserFeatures = function () {
            var _this = this;
            return {
                // IIFE to check canvas support
                canvas: (function () {
                    return _this._criticalTests.canvasSupport();
                })(),
                // IIFE to check arraybuffer support
                arraybuffer: (function () {
                    return _this._criticalTests.arrayBufferSupport();
                })(),
                // IIFE to check dataurl support
                dataurl: (function () {
                    return _this._criticalTests.dataUrlSupport();
                })(),
                // IIFE to check objecturl support
                objecturl: (function () {
                    return _this._criticalTests.objectUrlSupport();
                })(),
                // IIFE to check rgba support
                rgba: (function () {
                    return _this._criticalTests.rgbaSupport();
                })(),
                // IIFE to check webaudio support
                webaudio: (function () {
                    return _this._warningTest.webAudioSupport();
                })(),
                // IIFE to check webgl support
                webgl: (function () {
                    return _this._warningTest.webglSupport();
                })(),
                // IIFE to check gamepadapi support
                gamepadapi: (function () {
                    return !!navigator.getGamepads;
                })()
            };
        };
        Detector.prototype.test = function () {
            // Critical test will for ex not to run
            var failedCritical = false;
            for (var test in this._criticalTests) {
                if (!this._criticalTests[test].call(this)) {
                    this.failedTests.push(test);
                    ex.Logger.getInstance().error('Critical browser feature missing, Excalibur requires:', test);
                    failedCritical = true;
                }
            }
            if (failedCritical) {
                return false;
            }
            // Warning tests do not for ex to return false to compatibility
            for (var warning in this._warningTest) {
                if (!this._warningTest[warning]()) {
                    ex.Logger.getInstance().warn('Warning browser feature missing, Excalibur will have reduced performance:', warning);
                }
            }
            return true;
        };
        return Detector;
    }());
    ex.Detector = Detector;
})(ex || (ex = {}));
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * Enum representing the different font size units
     * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
     */
    (function (FontUnit) {
        /**
         * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
         */
        FontUnit[FontUnit["Em"] = 0] = "Em";
        /**
         * Rem is similar to the Em, it is a scalable unit. 1 rem is eqaul to the font size of the root element
         */
        FontUnit[FontUnit["Rem"] = 1] = "Rem";
        /**
         * Pixel is a unit of length in screen pixels
         */
        FontUnit[FontUnit["Px"] = 2] = "Px";
        /**
         * Point is a physical unit length (1/72 of an inch)
         */
        FontUnit[FontUnit["Pt"] = 3] = "Pt";
        /**
         * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
         */
        FontUnit[FontUnit["Percent"] = 4] = "Percent";
    })(ex.FontUnit || (ex.FontUnit = {}));
    var FontUnit = ex.FontUnit;
    /**
     * Enum representing the different horizontal text alignments
     */
    (function (TextAlign) {
        /**
         * The text is left-aligned.
         */
        TextAlign[TextAlign["Left"] = 0] = "Left";
        /**
         * The text is right-aligned.
         */
        TextAlign[TextAlign["Right"] = 1] = "Right";
        /**
         * The text is centered.
         */
        TextAlign[TextAlign["Center"] = 2] = "Center";
        /**
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
         * right-aligned for right-to-left locales).
         */
        TextAlign[TextAlign["Start"] = 3] = "Start";
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
         * left-aligned for right-to-left locales).
         */
        TextAlign[TextAlign["End"] = 4] = "End";
    })(ex.TextAlign || (ex.TextAlign = {}));
    var TextAlign = ex.TextAlign;
    /**
     * Enum representing the different baseline text alignments
     */
    (function (BaseAlign) {
        /**
         * The text baseline is the top of the em square.
         */
        BaseAlign[BaseAlign["Top"] = 0] = "Top";
        /**
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like
         * alphabetic.
         */
        BaseAlign[BaseAlign["Hanging"] = 1] = "Hanging";
        /**
         * The text baseline is the middle of the em square.
         */
        BaseAlign[BaseAlign["Middle"] = 2] = "Middle";
        /**
         * The text baseline is the normal alphabetic baseline.
         */
        BaseAlign[BaseAlign["Alphabetic"] = 3] = "Alphabetic";
        /**
         * The text baseline is the ideographic baseline; this is the bottom of
         * the body of the characters, if the main body of characters protrudes
         * beneath the alphabetic baseline.  Currently unsupported; this will
         * act like alphabetic.
         */
        BaseAlign[BaseAlign["Ideographic"] = 4] = "Ideographic";
        /**
         * The text baseline is the bottom of the bounding box.  This differs
         * from the ideographic baseline in that the ideographic baseline
         * doesn't consider descenders.
         */
        BaseAlign[BaseAlign["Bottom"] = 5] = "Bottom";
    })(ex.BaseAlign || (ex.BaseAlign = {}));
    var BaseAlign = ex.BaseAlign;
    /**
     * Labels are the way to draw small amounts of text to the screen. They are
     * actors and inherit all of the benefits and capabilities.
     *
     * [[include:Labels.md]]
     */
    var Label = (function (_super) {
        __extends(Label, _super);
        /**
         * @param text        The text of the label
         * @param x           The x position of the label
         * @param y           The y position of the label
         * @param fontFamily  Use any valid CSS font string for the label's font. Web fonts are supported. Default is `10px sans-serif`.
         * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precedence
         * over a css font.
         */
        function Label(text, x, y, fontFamily, spriteFont) {
            _super.call(this, x, y);
            /**
             * The font size in the selected units, default is 10 (default units is pixel)
             */
            this.fontSize = 10;
            /**
             * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
             */
            this.fontUnit = FontUnit.Px;
            /**
             * Gets or sets the horizontal text alignment property for the label.
             */
            this.textAlign = TextAlign.Left;
            /**
             * Gets or sets the baseline alignment property for the label.
             */
            this.baseAlign = BaseAlign.Bottom;
            /**
             * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
             */
            this.letterSpacing = 0; //px
            /**
             * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
             */
            this.caseInsensitive = true;
            this._textShadowOn = false;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._shadowColor = ex.Color.Black.clone();
            this._shadowColorDirty = false;
            this._textSprites = {};
            this._shadowSprites = {};
            this._color = ex.Color.Black.clone();
            this.text = text || '';
            this.color = ex.Color.Black.clone();
            this.spriteFont = spriteFont;
            this.collisionType = ex.CollisionType.PreventCollision;
            this.fontFamily = fontFamily || 'sans-serif'; // coalesce to default canvas font
            if (spriteFont) {
            }
        }
        /**
         * Returns the width of the text in the label (in pixels);
         * @param ctx  Rendering context to measure the string with
         */
        Label.prototype.getTextWidth = function (ctx) {
            var oldFont = ctx.font;
            ctx.font = this._fontString;
            var width = ctx.measureText(this.text).width;
            ctx.font = oldFont;
            return width;
        };
        // TypeScript doesn't support string enums :(
        Label.prototype._lookupFontUnit = function (fontUnit) {
            switch (fontUnit) {
                case FontUnit.Em:
                    return 'em';
                case FontUnit.Rem:
                    return 'rem';
                case FontUnit.Pt:
                    return 'pt';
                case FontUnit.Px:
                    return 'px';
                case FontUnit.Percent:
                    return '%';
                default:
                    return 'px';
            }
        };
        Label.prototype._lookupTextAlign = function (textAlign) {
            switch (textAlign) {
                case TextAlign.Left:
                    return 'left';
                case TextAlign.Right:
                    return 'right';
                case TextAlign.Center:
                    return 'center';
                case TextAlign.End:
                    return 'end';
                case TextAlign.Start:
                    return 'start';
                default:
                    return 'start';
            }
        };
        Label.prototype._lookupBaseAlign = function (baseAlign) {
            switch (baseAlign) {
                case BaseAlign.Alphabetic:
                    return 'alphabetic';
                case BaseAlign.Bottom:
                    return 'bottom';
                case BaseAlign.Hanging:
                    return 'hangin';
                case BaseAlign.Ideographic:
                    return 'ideographic';
                case BaseAlign.Middle:
                    return 'middle';
                case BaseAlign.Top:
                    return 'top';
                default:
                    return 'alphabetic';
            }
        };
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixels to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        Label.prototype.setTextShadow = function (offsetX, offsetY, shadowColor) {
            this.spriteFont.setTextShadow(offsetX, offsetY, shadowColor);
        };
        /**
         * Toggles text shadows on or off, only applies when using sprite fonts
         */
        Label.prototype.useTextShadow = function (on) {
            this.spriteFont.useTextShadow(on);
        };
        /**
         * Clears the current text shadow
         */
        Label.prototype.clearTextShadow = function () {
            this._textShadowOn = false;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._shadowColor = ex.Color.Black.clone();
        };
        Label.prototype.update = function (engine, delta) {
            _super.prototype.update.call(this, engine, delta);
            /*
           if (this.spriteFont && (this._color !== this.color || this.previousOpacity !== this.opacity)) {
              for (var character in this._textSprites) {
                 this._textSprites[character].clearEffects();
                 this._textSprites[character].fill(this.color.clone());
                 this._textSprites[character].opacity(this.opacity);
                 
              }
              this._color = this.color;
              this.previousOpacity = this.opacity;
           }
  
           if (this.spriteFont && this._textShadowOn && this._shadowColorDirty && this._shadowColor) {
              for (var characterShadow in this._shadowSprites) {
                 this._shadowSprites[characterShadow].clearEffects();
                 this._shadowSprites[characterShadow].addEffect(new Effects.Fill(this._shadowColor.clone()));
              }
              this._shadowColorDirty = false;
           }*/
        };
        Label.prototype.draw = function (ctx, delta) {
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.scale(this.scale.x, this.scale.y);
            ctx.rotate(this.rotation);
            if (this._textShadowOn) {
                ctx.save();
                ctx.translate(this._shadowOffsetX, this._shadowOffsetY);
                this._fontDraw(ctx, delta, this._shadowSprites);
                ctx.restore();
            }
            this._fontDraw(ctx, delta, this._textSprites);
            _super.prototype.draw.call(this, ctx, delta);
            ctx.restore();
        };
        Label.prototype._fontDraw = function (ctx, delta, sprites) {
            if (this.spriteFont) {
                this.spriteFont.draw(ctx, this.text, 0, 0, {
                    color: this.color.clone(),
                    baseAlign: this.baseAlign,
                    textAlign: this.textAlign,
                    fontSize: this.fontSize,
                    letterSpacing: this.letterSpacing,
                    opacity: this.opacity
                });
            }
            else {
                var oldAlign = ctx.textAlign;
                var oldTextBaseline = ctx.textBaseline;
                ctx.textAlign = this._lookupTextAlign(this.textAlign);
                ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);
                if (this.color) {
                    this.color.a = this.opacity;
                }
                ctx.fillStyle = this.color.toString();
                ctx.font = this._fontString;
                if (this.maxWidth) {
                    ctx.fillText(this.text, 0, 0, this.maxWidth);
                }
                else {
                    ctx.fillText(this.text, 0, 0);
                }
                ctx.textAlign = oldAlign;
                ctx.textBaseline = oldTextBaseline;
            }
        };
        Object.defineProperty(Label.prototype, "_fontString", {
            get: function () {
                return "" + this.fontSize + this._lookupFontUnit(this.fontUnit) + " " + this.fontFamily;
            },
            enumerable: true,
            configurable: true
        });
        Label.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
        };
        return Label;
    }(ex.Actor));
    ex.Label = Label;
})(ex || (ex = {}));
/// <reference path="../Events.ts"/>
var ex;
(function (ex) {
    var Input;
    (function (Input) {
        /**
         * The type of pointer for a [[PointerEvent]].
         */
        (function (PointerType) {
            PointerType[PointerType["Touch"] = 0] = "Touch";
            PointerType[PointerType["Mouse"] = 1] = "Mouse";
            PointerType[PointerType["Pen"] = 2] = "Pen";
            PointerType[PointerType["Unknown"] = 3] = "Unknown";
        })(Input.PointerType || (Input.PointerType = {}));
        var PointerType = Input.PointerType;
        /**
         * The mouse button being pressed.
         */
        (function (PointerButton) {
            PointerButton[PointerButton["Left"] = 0] = "Left";
            PointerButton[PointerButton["Middle"] = 1] = "Middle";
            PointerButton[PointerButton["Right"] = 2] = "Right";
            PointerButton[PointerButton["Unknown"] = 3] = "Unknown";
        })(Input.PointerButton || (Input.PointerButton = {}));
        var PointerButton = Input.PointerButton;
        /**
         * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
         */
        (function (PointerScope) {
            /**
             * Handle events on the `canvas` element only. Events originating outside the
             * `canvas` will not be handled.
             */
            PointerScope[PointerScope["Canvas"] = 0] = "Canvas";
            /**
             * Handles events on the entire document. All events will be handled by Excalibur.
             */
            PointerScope[PointerScope["Document"] = 1] = "Document";
        })(Input.PointerScope || (Input.PointerScope = {}));
        var PointerScope = Input.PointerScope;
        /**
         * Pointer events
         *
         * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
         * handling pointer input.
         *
         * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
         */
        var PointerEvent = (function (_super) {
            __extends(PointerEvent, _super);
            /**
             * @param x            The `x` coordinate of the event (in world coordinates)
             * @param y            The `y` coordinate of the event (in world coordinates)
             * @param index        The index of the pointer (zero-based)
             * @param pointerType  The type of pointer
             * @param button       The button pressed (if [[PointerType.Mouse]])
             * @param ev           The raw DOM event being handled
             */
            function PointerEvent(x, y, index, pointerType, button, ev) {
                _super.call(this);
                this.x = x;
                this.y = y;
                this.index = index;
                this.pointerType = pointerType;
                this.button = button;
                this.ev = ev;
            }
            return PointerEvent;
        }(ex.GameEvent));
        Input.PointerEvent = PointerEvent;
        ;
        /**
         * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to
         * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
         *
         * [[include:Pointers.md]]
         */
        var Pointers = (function (_super) {
            __extends(Pointers, _super);
            function Pointers(engine) {
                _super.call(this);
                this._pointerDown = [];
                this._pointerUp = [];
                this._pointerMove = [];
                this._pointerCancel = [];
                this._pointers = [];
                this._activePointers = [];
                this._engine = engine;
                this._pointers.push(new Pointer());
                this._activePointers = [-1];
                this.primary = this._pointers[0];
            }
            Pointers.prototype.on = function (eventName, handler) {
                _super.prototype.on.call(this, eventName, handler);
            };
            /**
             * Initializes pointer event listeners
             */
            Pointers.prototype.init = function (scope) {
                if (scope === void 0) { scope = PointerScope.Document; }
                var target = document;
                if (scope === PointerScope.Document) {
                    target = document;
                }
                else {
                    target = this._engine.canvas;
                }
                // Touch Events
                target.addEventListener('touchstart', this._handleTouchEvent('down', this._pointerDown));
                target.addEventListener('touchend', this._handleTouchEvent('up', this._pointerUp));
                target.addEventListener('touchmove', this._handleTouchEvent('move', this._pointerMove));
                target.addEventListener('touchcancel', this._handleTouchEvent('cancel', this._pointerCancel));
                // W3C Pointer Events
                // Current: IE11, IE10
                if (window.PointerEvent) {
                    // IE11
                    this._engine.canvas.style.touchAction = 'none';
                    target.addEventListener('pointerdown', this._handlePointerEvent('down', this._pointerDown));
                    target.addEventListener('pointerup', this._handlePointerEvent('up', this._pointerUp));
                    target.addEventListener('pointermove', this._handlePointerEvent('move', this._pointerMove));
                    target.addEventListener('pointercancel', this._handlePointerEvent('cancel', this._pointerMove));
                }
                else if (window.MSPointerEvent) {
                    // IE10
                    this._engine.canvas.style.msTouchAction = 'none';
                    target.addEventListener('MSPointerDown', this._handlePointerEvent('down', this._pointerDown));
                    target.addEventListener('MSPointerUp', this._handlePointerEvent('up', this._pointerUp));
                    target.addEventListener('MSPointerMove', this._handlePointerEvent('move', this._pointerMove));
                    target.addEventListener('MSPointerCancel', this._handlePointerEvent('cancel', this._pointerMove));
                }
                else {
                    // Mouse Events
                    target.addEventListener('mousedown', this._handleMouseEvent('down', this._pointerDown));
                    target.addEventListener('mouseup', this._handleMouseEvent('up', this._pointerUp));
                    target.addEventListener('mousemove', this._handleMouseEvent('move', this._pointerMove));
                }
            };
            Pointers.prototype.update = function (delta) {
                this._pointerUp.length = 0;
                this._pointerDown.length = 0;
                this._pointerMove.length = 0;
                this._pointerCancel.length = 0;
            };
            /**
             * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
             * @param index  The pointer index to retrieve
             */
            Pointers.prototype.at = function (index) {
                if (index >= this._pointers.length) {
                    // Ensure there is a pointer to retrieve
                    for (var i = this._pointers.length - 1, max = index; i < max; i++) {
                        this._pointers.push(new Pointer());
                        this._activePointers.push(-1);
                    }
                }
                return this._pointers[index];
            };
            /**
             * Get number of pointers being watched
             */
            Pointers.prototype.count = function () {
                return this._pointers.length;
            };
            /**
             * Propogates events to actor if necessary
             */
            Pointers.prototype.propogate = function (actor) {
                var isUIActor = actor instanceof ex.UIActor;
                var i = 0, len = this._pointerUp.length;
                for (i; i < len; i++) {
                    if (actor.contains(this._pointerUp[i].x, this._pointerUp[i].y, !isUIActor)) {
                        actor.eventDispatcher.emit('pointerup', this._pointerUp[i]);
                    }
                }
                i = 0;
                len = this._pointerDown.length;
                for (i; i < len; i++) {
                    if (actor.contains(this._pointerDown[i].x, this._pointerDown[i].y, !isUIActor)) {
                        actor.eventDispatcher.emit('pointerdown', this._pointerDown[i]);
                    }
                }
                if (actor.capturePointer.captureMoveEvents) {
                    i = 0;
                    len = this._pointerMove.length;
                    for (i; i < len; i++) {
                        if (actor.contains(this._pointerMove[i].x, this._pointerMove[i].y, !isUIActor)) {
                            actor.eventDispatcher.emit('pointermove', this._pointerMove[i]);
                        }
                    }
                }
                i = 0;
                len = this._pointerCancel.length;
                for (i; i < len; i++) {
                    if (actor.contains(this._pointerCancel[i].x, this._pointerCancel[i].y, !isUIActor)) {
                        actor.eventDispatcher.emit('pointercancel', this._pointerCancel[i]);
                    }
                }
            };
            Pointers.prototype._handleMouseEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Vector(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, 0, PointerType.Mouse, e.button, e);
                    eventArr.push(pe);
                    _this.at(0).eventDispatcher.emit(eventName, pe);
                };
            };
            Pointers.prototype._handleTouchEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    for (var i = 0, len = e.changedTouches.length; i < len; i++) {
                        var index = _this._pointers.length > 1 ? _this._getPointerIndex(e.changedTouches[i].identifier) : 0;
                        if (index === -1) {
                            continue;
                        }
                        var x = e.changedTouches[i].pageX - ex.Util.getPosition(_this._engine.canvas).x;
                        var y = e.changedTouches[i].pageY - ex.Util.getPosition(_this._engine.canvas).y;
                        var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Vector(x, y));
                        var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, PointerType.Touch, PointerButton.Unknown, e);
                        eventArr.push(pe);
                        _this.at(index).eventDispatcher.emit(eventName, pe);
                        // only with multi-pointer
                        if (_this._pointers.length > 1) {
                            if (eventName === 'up') {
                                // remove pointer ID from pool when pointer is lifted
                                _this._activePointers[index] = -1;
                            }
                            else if (eventName === 'down') {
                                // set pointer ID to given index
                                _this._activePointers[index] = e.changedTouches[i].identifier;
                            }
                        }
                    }
                };
            };
            Pointers.prototype._handlePointerEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    // get the index for this pointer ID if multi-pointer is asked for
                    var index = _this._pointers.length > 1 ? _this._getPointerIndex(e.pointerId) : 0;
                    if (index === -1) {
                        return;
                    }
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Vector(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, _this._stringToPointerType(e.pointerType), e.button, e);
                    eventArr.push(pe);
                    _this.at(index).eventDispatcher.emit(eventName, pe);
                    // only with multi-pointer
                    if (_this._pointers.length > 1) {
                        if (eventName === 'up') {
                            // remove pointer ID from pool when pointer is lifted
                            _this._activePointers[index] = -1;
                        }
                        else if (eventName === 'down') {
                            // set pointer ID to given index
                            _this._activePointers[index] = e.pointerId;
                        }
                    }
                };
            };
            /**
             * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
             * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
             */
            Pointers.prototype._getPointerIndex = function (pointerId) {
                var idx;
                if ((idx = this._activePointers.indexOf(pointerId)) > -1) {
                    return idx;
                }
                for (var i = 0; i < this._activePointers.length; i++) {
                    if (this._activePointers[i] === -1) {
                        return i;
                    }
                }
                // ignore pointer because game isn't watching
                return -1;
            };
            Pointers.prototype._stringToPointerType = function (s) {
                switch (s) {
                    case 'touch':
                        return PointerType.Touch;
                    case 'mouse':
                        return PointerType.Mouse;
                    case 'pen':
                        return PointerType.Pen;
                    default:
                        return PointerType.Unknown;
                }
            };
            return Pointers;
        }(ex.Class));
        Input.Pointers = Pointers;
        /**
         * Captures and dispatches PointerEvents
         */
        var Pointer = (function (_super) {
            __extends(Pointer, _super);
            function Pointer() {
                _super.apply(this, arguments);
            }
            return Pointer;
        }(ex.Class));
        Input.Pointer = Pointer;
    })(Input = ex.Input || (ex.Input = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Input;
    (function (Input) {
        /**
         * Enum representing input key codes
         */
        (function (Keys) {
            Keys[Keys["Num1"] = 97] = "Num1";
            Keys[Keys["Num2"] = 98] = "Num2";
            Keys[Keys["Num3"] = 99] = "Num3";
            Keys[Keys["Num4"] = 100] = "Num4";
            Keys[Keys["Num5"] = 101] = "Num5";
            Keys[Keys["Num6"] = 102] = "Num6";
            Keys[Keys["Num7"] = 103] = "Num7";
            Keys[Keys["Num8"] = 104] = "Num8";
            Keys[Keys["Num9"] = 105] = "Num9";
            Keys[Keys["Num0"] = 96] = "Num0";
            Keys[Keys["Numlock"] = 144] = "Numlock";
            Keys[Keys["Semicolon"] = 186] = "Semicolon";
            Keys[Keys["A"] = 65] = "A";
            Keys[Keys["B"] = 66] = "B";
            Keys[Keys["C"] = 67] = "C";
            Keys[Keys["D"] = 68] = "D";
            Keys[Keys["E"] = 69] = "E";
            Keys[Keys["F"] = 70] = "F";
            Keys[Keys["G"] = 71] = "G";
            Keys[Keys["H"] = 72] = "H";
            Keys[Keys["I"] = 73] = "I";
            Keys[Keys["J"] = 74] = "J";
            Keys[Keys["K"] = 75] = "K";
            Keys[Keys["L"] = 76] = "L";
            Keys[Keys["M"] = 77] = "M";
            Keys[Keys["N"] = 78] = "N";
            Keys[Keys["O"] = 79] = "O";
            Keys[Keys["P"] = 80] = "P";
            Keys[Keys["Q"] = 81] = "Q";
            Keys[Keys["R"] = 82] = "R";
            Keys[Keys["S"] = 83] = "S";
            Keys[Keys["T"] = 84] = "T";
            Keys[Keys["U"] = 85] = "U";
            Keys[Keys["V"] = 86] = "V";
            Keys[Keys["W"] = 87] = "W";
            Keys[Keys["X"] = 88] = "X";
            Keys[Keys["Y"] = 89] = "Y";
            Keys[Keys["Z"] = 90] = "Z";
            Keys[Keys["Shift"] = 16] = "Shift";
            Keys[Keys["Alt"] = 18] = "Alt";
            Keys[Keys["Up"] = 38] = "Up";
            Keys[Keys["Down"] = 40] = "Down";
            Keys[Keys["Left"] = 37] = "Left";
            Keys[Keys["Right"] = 39] = "Right";
            Keys[Keys["Space"] = 32] = "Space";
            Keys[Keys["Esc"] = 27] = "Esc";
        })(Input.Keys || (Input.Keys = {}));
        var Keys = Input.Keys;
        ;
        /**
         * Event thrown on a game object for a key event
         */
        var KeyEvent = (function (_super) {
            __extends(KeyEvent, _super);
            /**
             * @param key  The key responsible for throwing the event
             */
            function KeyEvent(key) {
                _super.call(this);
                this.key = key;
            }
            return KeyEvent;
        }(ex.GameEvent));
        Input.KeyEvent = KeyEvent;
        /**
         * Provides keyboard support for Excalibur.
         *
         * [[include:Keyboard.md]]
         */
        var Keyboard = (function (_super) {
            __extends(Keyboard, _super);
            function Keyboard(engine) {
                _super.call(this);
                this._keys = [];
                this._keysUp = [];
                this._keysDown = [];
                this._engine = engine;
            }
            Keyboard.prototype.on = function (eventName, handler) {
                _super.prototype.on.call(this, eventName, handler);
            };
            /**
             * Initialize Keyboard event listeners
             */
            Keyboard.prototype.init = function (global) {
                var _this = this;
                global = global || window;
                global.addEventListener('blur', function (ev) {
                    _this._keys.length = 0; // empties array efficiently
                });
                // key up is on window because canvas cannot have focus
                global.addEventListener('keyup', function (ev) {
                    var key = _this._keys.indexOf(ev.keyCode);
                    _this._keys.splice(key, 1);
                    _this._keysUp.push(ev.keyCode);
                    var keyEvent = new KeyEvent(ev.keyCode);
                    // alias the old api, we may want to deprecate this in the future
                    _this.eventDispatcher.emit('up', keyEvent);
                    _this.eventDispatcher.emit('release', keyEvent);
                });
                // key down is on window because canvas cannot have focus
                global.addEventListener('keydown', function (ev) {
                    if (_this._keys.indexOf(ev.keyCode) === -1) {
                        _this._keys.push(ev.keyCode);
                        _this._keysDown.push(ev.keyCode);
                        var keyEvent = new KeyEvent(ev.keyCode);
                        _this.eventDispatcher.emit('down', keyEvent);
                        _this.eventDispatcher.emit('press', keyEvent);
                    }
                });
            };
            Keyboard.prototype.update = function (delta) {
                // Reset keysDown and keysUp after update is complete
                this._keysDown.length = 0;
                this._keysUp.length = 0;
                // Emit synthetic "hold" event
                for (var i = 0; i < this._keys.length; i++) {
                    this.eventDispatcher.emit('hold', new KeyEvent(this._keys[i]));
                }
            };
            /**
             * Gets list of keys being pressed down
             */
            Keyboard.prototype.getKeys = function () {
                return this._keys;
            };
            /**
             * Tests if a certain key was just pressed this frame. This is cleared at the end of the update frame.
             * @param key Test whether a key was just pressed
             */
            Keyboard.prototype.wasPressed = function (key) {
                return this._keysDown.indexOf(key) > -1;
            };
            /**
             * Tests if a certain key is held down. This is persisted between frames.
             * @param key  Test whether a key is held down
             */
            Keyboard.prototype.isHeld = function (key) {
                return this._keys.indexOf(key) > -1;
            };
            /**
             * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
             * @param key  Test whether a key was just released
             */
            Keyboard.prototype.wasReleased = function (key) {
                return this._keysUp.indexOf(key) > -1;
            };
            return Keyboard;
        }(ex.Class));
        Input.Keyboard = Keyboard;
    })(Input = ex.Input || (ex.Input = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Input;
    (function (Input) {
        /**
         * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
         * to provide controller support for your games.
         *
         * [[include:Gamepads.md]]
         */
        var Gamepads = (function (_super) {
            __extends(Gamepads, _super);
            function Gamepads(engine) {
                _super.call(this);
                /**
                 * Whether or not to poll for Gamepad input (default: `false`)
                 */
                this.enabled = false;
                /**
                 * Whether or not Gamepad API is supported
                 */
                this.supported = !!navigator.getGamepads;
                this._gamePadTimeStamps = [0, 0, 0, 0];
                this._oldPads = [];
                this._pads = [];
                this._initSuccess = false;
                this._navigator = navigator;
                this._minimumConfiguration = null;
                this._engine = engine;
            }
            Gamepads.prototype.init = function () {
                if (!this.supported) {
                    return;
                }
                if (this._initSuccess) {
                    return;
                }
                // In Chrome, this will return 4 undefined items until a button is pressed
                // In FF, this will not return any items until a button is pressed
                this._oldPads = this._clonePads(this._navigator.getGamepads());
                if (this._oldPads.length && this._oldPads[0]) {
                    this._initSuccess = true;
                }
            };
            /**
             * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
             * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
             * all other controllers with more axis or buttons are valid as well. If no minimum
             * configuration is set all pads are valid.
             */
            Gamepads.prototype.setMinimumGamepadConfiguration = function (config) {
                this._enableAndUpdate(); // if config is used, implicitly enable
                this._minimumConfiguration = config;
            };
            /**
             * When implicitly enabled, set the enabled flag and run an update so information is updated
             */
            Gamepads.prototype._enableAndUpdate = function () {
                if (!this.enabled) {
                    this.enabled = true;
                    this.update(100);
                }
            };
            /**
             * Checks a navigator gamepad against the minimum configuration if present.
             */
            Gamepads.prototype._isGamepadValid = function (pad) {
                if (!this._minimumConfiguration) {
                    return true;
                }
                ;
                if (!pad) {
                    return false;
                }
                ;
                var axesLength = pad.axes.filter(function (value, index, array) {
                    return (typeof value !== undefined);
                }).length;
                var buttonLength = pad.buttons.filter(function (value, index, array) {
                    return (typeof value !== undefined);
                }).length;
                return axesLength >= this._minimumConfiguration.axis &&
                    buttonLength >= this._minimumConfiguration.buttons &&
                    pad.connected;
            };
            Gamepads.prototype.on = function (eventName, handler) {
                this._enableAndUpdate(); // implicitly enable
                _super.prototype.on.call(this, eventName, handler);
            };
            Gamepads.prototype.off = function (eventName, handler) {
                this._enableAndUpdate(); // implicitly enable
                _super.prototype.off.call(this, eventName, handler);
            };
            /**
             * Updates Gamepad state and publishes Gamepad events
             */
            Gamepads.prototype.update = function (delta) {
                if (!this.enabled || !this.supported) {
                    return;
                }
                this.init();
                var gamepads = this._navigator.getGamepads();
                for (var i = 0; i < gamepads.length; i++) {
                    if (!gamepads[i]) {
                        // If was connected, but now isn't emit the disconnect event
                        if (this.at(i).connected) {
                            this.eventDispatcher.emit('disconnect', new ex.GamepadDisconnectEvent(i));
                        }
                        // Reset connection status
                        this.at(i).connected = false;
                        continue;
                    }
                    else {
                        if (!this.at(i).connected && this._isGamepadValid(gamepads[i])) {
                            this.eventDispatcher.emit('connect', new ex.GamepadConnectEvent(i, this.at(i)));
                        }
                        // Set connection status
                        this.at(i).connected = true;
                    }
                    ;
                    // Only supported in Chrome
                    if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
                        continue;
                    }
                    this._gamePadTimeStamps[i] = gamepads[i].timestamp;
                    // Add reference to navigator gamepad
                    this.at(i).navigatorGamepad = gamepads[i];
                    // Buttons
                    var b, bi, a, ai, value;
                    for (b in Buttons) {
                        bi = Buttons[b];
                        if (typeof bi === 'number') {
                            if (gamepads[i].buttons[bi]) {
                                value = gamepads[i].buttons[bi].value;
                                if (value !== this._oldPads[i].getButton(bi)) {
                                    if (gamepads[i].buttons[bi].pressed) {
                                        this.at(i).updateButton(bi, value);
                                        this.at(i).eventDispatcher.emit('button', new ex.GamepadButtonEvent(bi, value));
                                    }
                                    else {
                                        this.at(i).updateButton(bi, 0);
                                    }
                                }
                            }
                        }
                    }
                    // Axes
                    for (a in Axes) {
                        ai = Axes[a];
                        if (typeof ai === 'number') {
                            value = gamepads[i].axes[ai];
                            if (value !== this._oldPads[i].getAxes(ai)) {
                                this.at(i).updateAxes(ai, value);
                                this.at(i).eventDispatcher.emit('axis', new ex.GamepadAxisEvent(ai, value));
                            }
                        }
                    }
                    this._oldPads[i] = this._clonePad(gamepads[i]);
                }
            };
            /**
             * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
             */
            Gamepads.prototype.at = function (index) {
                this._enableAndUpdate(); // implicitly enable gamepads when at() is called         
                if (index >= this._pads.length) {
                    // Ensure there is a pad to retrieve
                    for (var i = this._pads.length - 1, max = index; i < max; i++) {
                        this._pads.push(new Gamepad());
                        this._oldPads.push(new Gamepad());
                    }
                }
                return this._pads[index];
            };
            /**
             * Returns a list of all valid gamepads that meet the minimum configuration requirement.
             */
            Gamepads.prototype.getValidGamepads = function () {
                this._enableAndUpdate();
                var result = [];
                for (var i = 0; i < this._pads.length; i++) {
                    if (this._isGamepadValid(this.at(i).navigatorGamepad) && this.at(i).connected) {
                        result.push(this.at(i));
                    }
                }
                return result;
            };
            /**
             * Gets the number of connected gamepads
             */
            Gamepads.prototype.count = function () {
                return this._pads.filter(function (p) { return p.connected; }).length;
            };
            Gamepads.prototype._clonePads = function (pads) {
                var arr = [];
                for (var i = 0, len = pads.length; i < len; i++) {
                    arr.push(this._clonePad(pads[i]));
                }
                return arr;
            };
            /**
             * Fastest way to clone a known object is to do it yourself
             */
            Gamepads.prototype._clonePad = function (pad) {
                var i, len;
                var clonedPad = new Gamepad();
                if (!pad) {
                    return clonedPad;
                }
                for (i = 0, len = pad.buttons.length; i < len; i++) {
                    if (pad.buttons[i]) {
                        clonedPad.updateButton(i, pad.buttons[i].value);
                    }
                }
                for (i = 0, len = pad.axes.length; i < len; i++) {
                    clonedPad.updateAxes(i, pad.axes[i]);
                }
                return clonedPad;
            };
            /**
             * The minimum value an axis has to move before considering it a change
             */
            Gamepads.MinAxisMoveThreshold = 0.05;
            return Gamepads;
        }(ex.Class));
        Input.Gamepads = Gamepads;
        /**
         * Gamepad holds state information for a connected controller. See [[Gamepads]]
         * for more information on handling controller input.
         */
        var Gamepad = (function (_super) {
            __extends(Gamepad, _super);
            function Gamepad() {
                _super.call(this);
                this.connected = false;
                this._buttons = new Array(16);
                this._axes = new Array(4);
                var i;
                for (i = 0; i < this._buttons.length; i++) {
                    this._buttons[i] = 0;
                }
                for (i = 0; i < this._axes.length; i++) {
                    this._axes[i] = 0;
                }
            }
            /**
             * Whether or not the given button is pressed
             * @param button     The button to query
             * @param threshold  The threshold over which the button is considered to be pressed
             */
            Gamepad.prototype.isButtonPressed = function (button, threshold) {
                if (threshold === void 0) { threshold = 1; }
                return this._buttons[button] >= threshold;
            };
            /**
             * Gets the given button value between 0 and 1
             */
            Gamepad.prototype.getButton = function (button) {
                return this._buttons[button];
            };
            /**
             * Gets the given axis value between -1 and 1. Values below
             * [[MinAxisMoveThreshold]] are considered 0.
             */
            Gamepad.prototype.getAxes = function (axes) {
                var value = this._axes[axes];
                if (Math.abs(value) < Gamepads.MinAxisMoveThreshold) {
                    return 0;
                }
                else {
                    return value;
                }
            };
            Gamepad.prototype.updateButton = function (buttonIndex, value) {
                this._buttons[buttonIndex] = value;
            };
            Gamepad.prototype.updateAxes = function (axesIndex, value) {
                this._axes[axesIndex] = value;
            };
            return Gamepad;
        }(ex.Class));
        Input.Gamepad = Gamepad;
        /**
         * Gamepad Buttons enumeration
         */
        (function (Buttons) {
            /**
             * Face 1 button (e.g. A)
             */
            Buttons[Buttons["Face1"] = 0] = "Face1";
            /**
             * Face 2 button (e.g. B)
             */
            Buttons[Buttons["Face2"] = 1] = "Face2";
            /**
             * Face 3 button (e.g. X)
             */
            Buttons[Buttons["Face3"] = 2] = "Face3";
            /**
             * Face 4 button (e.g. Y)
             */
            Buttons[Buttons["Face4"] = 3] = "Face4";
            /**
             * Left bumper button
             */
            Buttons[Buttons["LeftBumper"] = 4] = "LeftBumper";
            /**
             * Right bumper button
             */
            Buttons[Buttons["RightBumper"] = 5] = "RightBumper";
            /**
             * Left trigger button
             */
            Buttons[Buttons["LeftTrigger"] = 6] = "LeftTrigger";
            /**
             * Right trigger button
             */
            Buttons[Buttons["RightTrigger"] = 7] = "RightTrigger";
            /**
             * Select button
             */
            Buttons[Buttons["Select"] = 8] = "Select";
            /**
             * Start button
             */
            Buttons[Buttons["Start"] = 9] = "Start";
            /**
             * Left analog stick press (e.g. L3)
             */
            Buttons[Buttons["LeftStick"] = 10] = "LeftStick";
            /**
             * Right analog stick press (e.g. R3)
             */
            Buttons[Buttons["RightStick"] = 11] = "RightStick";
            /**
             * D-pad up
             */
            Buttons[Buttons["DpadUp"] = 12] = "DpadUp";
            /**
             * D-pad down
             */
            Buttons[Buttons["DpadDown"] = 13] = "DpadDown";
            /**
             * D-pad left
             */
            Buttons[Buttons["DpadLeft"] = 14] = "DpadLeft";
            /**
             * D-pad right
             */
            Buttons[Buttons["DpadRight"] = 15] = "DpadRight";
        })(Input.Buttons || (Input.Buttons = {}));
        var Buttons = Input.Buttons;
        /**
         * Gamepad Axes enumeration
         */
        (function (Axes) {
            /**
             * Left analogue stick X direction
             */
            Axes[Axes["LeftStickX"] = 0] = "LeftStickX";
            /**
             * Left analogue stick Y direction
             */
            Axes[Axes["LeftStickY"] = 1] = "LeftStickY";
            /**
             * Right analogue stick X direction
             */
            Axes[Axes["RightStickX"] = 2] = "RightStickX";
            /**
             * Right analogue stick Y direction
             */
            Axes[Axes["RightStickY"] = 3] = "RightStickY";
        })(Input.Axes || (Input.Axes = {}));
        var Axes = Input.Axes;
    })(Input = ex.Input || (ex.Input = {}));
})(ex || (ex = {}));
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Debug.ts" />
/// <reference path="Events.ts" />
/// <reference path="EventDispatcher.ts" />
/// <reference path="Class.ts" />
/// <reference path="Drawing/Color.ts" />
/// <reference path="Drawing/Polygon.ts" />
/// <reference path="Util/Log.ts" />
/// <reference path="Resources/Resource.ts" />
/// <reference path="Resources/Texture.ts" />
/// <reference path="Resources/Sound.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Physics.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actor.ts" />
/// <reference path="UIActor.ts" />
/// <reference path="Trigger.ts" />
/// <reference path="Particles.ts" />
/// <reference path="Drawing/Animation.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Util/Detector.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Label.ts" />
/// <reference path="PostProcessing/IPostProcessor.ts"/>
/// <reference path="Input/IEngineInput.ts"/>
/// <reference path="Input/Pointer.ts"/>
/// <reference path="Input/Keyboard.ts"/>
/// <reference path="Input/Gamepad.ts"/>
/**
 * The Excalibur API
 *
 * [[include:Index.md]]
 */
var ex;
(function (ex) {
    /**
     * Enum representing the different display modes available to Excalibur
     */
    (function (DisplayMode) {
        /**
         * Show the game as full screen
         */
        DisplayMode[DisplayMode["FullScreen"] = 0] = "FullScreen";
        /**
         * Scale the game to the parent DOM container
         */
        DisplayMode[DisplayMode["Container"] = 1] = "Container";
        /**
         * Show the game as a fixed size
         */
        DisplayMode[DisplayMode["Fixed"] = 2] = "Fixed";
    })(ex.DisplayMode || (ex.DisplayMode = {}));
    var DisplayMode = ex.DisplayMode;
    /**
     * The Excalibur Engine
     *
     * The [[Engine]] is the main driver for a game. It is responsible for
     * starting/stopping the game, maintaining state, transmitting events,
     * loading resources, and managing the scene.
     *
     * [[include:Engine.md]]
     */
    var Engine = (function (_super) {
        __extends(Engine, _super);
        /**
         * Creates a new game using the given [[IEngineOptions]]. By default, if no options are provided,
         * the game will be rendered full screen (taking up all available browser window space).
         * You can customize the game rendering through [[IEngineOptions]].
         *
         * Example:
         *
         * ```js
         * var game = new ex.Engine({
         *   width: 0, // the width of the canvas
         *   height: 0, // the height of the canvas
         *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
         *   displayMode: ex.DisplayMode.FullScreen, // the display mode
         *   pointerScope: ex.Input.PointerScope.Document // the scope of capturing pointer (mouse/touch) events
         * });
         *
         * // call game.start, which is a Promise
         * game.start().then(function () {
         *   // ready, set, go!
         * });
         * ```
         */
        function Engine(options) {
            _super.call(this);
            this._hasStarted = false;
            /**
             * Access Excalibur debugging functionality.
             */
            this.debug = new ex.Debug(this);
            /**
             * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
             */
            this.postProcessors = [];
            /**
             * Contains all the scenes currently registered with Excalibur
             */
            this.scenes = {};
            this._animations = [];
            /**
             * Indicates whether the engine is set to fullscreen or not
             */
            this.isFullscreen = false;
            /**
             * Indicates the current [[DisplayMode]] of the engine.
             */
            this.displayMode = DisplayMode.FullScreen;
            /**
             * Indicates whether audio should be paused when the game is no longer visible.
             */
            this.pauseAudioWhenHidden = true;
            /**
             * Indicates whether the engine should draw with debug information
             */
            this.isDebug = false;
            this.debugColor = new ex.Color(255, 255, 255);
            /**
             * Sets the background color for the engine.
             */
            this.backgroundColor = new ex.Color(0, 0, 100);
            /**
             * The action to take when a fatal exception is thrown
             */
            this.onFatalException = function (e) { ex.Logger.getInstance().fatal(e); };
            this._isSmoothingEnabled = true;
            this._timescale = 1.0;
            this._isLoading = false;
            options = ex.Util.extend({}, Engine._DefaultEngineOptions, options);
            // Check compatibility 
            var detector = new ex.Detector();
            if (!options.suppressMinimumBrowserFeatureDetection && !(this._compatible = detector.test())) {
                var message = document.createElement('div');
                message.innerText = 'Sorry, your browser does not support all the features needed for Excalibur';
                document.body.appendChild(message);
                detector.failedTests.forEach(function (test) {
                    var testMessage = document.createElement('div');
                    testMessage.innerText = 'Browser feature missing ' + test;
                    document.body.appendChild(testMessage);
                });
                if (options.canvasElementId) {
                    var canvas = document.getElementById(options.canvasElementId);
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
            if (console.log && !options.suppressConsoleBootMessage) {
                console.log("%cPowered by Excalibur.js (v" + EX_VERSION + ")", 'background: #176BAA; color: white; border-radius: 5px; padding: 15px; font-size: 1.5em; line-height: 80px;');
                console.log('\n\
      /| ________________\n\
O|===|* >________________>\n\
      \\|');
                console.log('Visit', 'http://excaliburjs.com', 'for more information');
            }
            this._logger = ex.Logger.getInstance();
            // If debug is enabled, let's log browser features to the console.
            if (this._logger.defaultLevel === ex.LogLevel.Debug) {
                detector.logBrowserFeatures();
            }
            this._logger.debug('Building engine...');
            this.canvasElementId = options.canvasElementId;
            if (options.canvasElementId) {
                this._logger.debug('Using Canvas element specified: ' + options.canvasElementId);
                this.canvas = document.getElementById(options.canvasElementId);
            }
            else {
                this._logger.debug('Using generated canvas element');
                this.canvas = document.createElement('canvas');
            }
            if (options.width && options.height) {
                if (options.displayMode === undefined) {
                    this.displayMode = DisplayMode.Fixed;
                }
                this._logger.debug('Engine viewport is size ' + options.width + ' x ' + options.height);
                this.width = options.width;
                this.canvas.width = options.width;
                this.height = options.height;
                this.canvas.height = options.height;
            }
            else if (!options.displayMode) {
                this._logger.debug('Engine viewport is fullscreen');
                this.displayMode = DisplayMode.FullScreen;
            }
            this._loader = new ex.Loader();
            this._initialize(options);
            this.rootScene = this.currentScene = new ex.Scene(this);
            this.addScene('root', this.rootScene);
            this.goToScene('root');
        }
        Object.defineProperty(Engine.prototype, "fps", {
            /**
             * Current FPS
             * @obsolete Use [[stats.currFrame.fps]]. Will be deprecated in future versions.
             */
            get: function () {
                return this.stats.currFrame.fps;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "stats", {
            /**
             * Access [[debug.stats]] that holds frame statistics.
             */
            get: function () {
                return this.debug.stats;
            },
            enumerable: true,
            configurable: true
        });
        Engine.prototype.on = function (eventName, handler) {
            _super.prototype.on.call(this, eventName, handler);
        };
        Object.defineProperty(Engine.prototype, "timescale", {
            /**
             * Gets the current engine timescale factor (default is 1.0 which is 1:1 time)
             */
            get: function () {
                return this._timescale;
            },
            /**
             * Sets the current engine timescale factor. Useful for creating slow-motion effects or fast-forward effects
             * when using time-based movement.
             */
            set: function (value) {
                if (value <= 0) {
                    ex.Logger.getInstance().error('Cannot set engine.timescale to a value of 0 or less than 0.');
                    return;
                }
                this._timescale = value;
            },
            enumerable: true,
            configurable: true
        });
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
         */
        Engine.prototype.playAnimation = function (animation, x, y) {
            this._animations.push(new AnimationNode(animation, x, y));
        };
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        Engine.prototype.addTileMap = function (tileMap) {
            this.currentScene.addTileMap(tileMap);
        };
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        Engine.prototype.removeTileMap = function (tileMap) {
            this.currentScene.removeTileMap(tileMap);
        };
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        Engine.prototype.addTimer = function (timer) {
            return this.currentScene.addTimer(timer);
        };
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        Engine.prototype.removeTimer = function (timer) {
            return this.currentScene.removeTimer(timer);
        };
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         *
         * @param key  The name of the scene, must be unique
         * @param scene The scene to add to the engine
         */
        Engine.prototype.addScene = function (key, scene) {
            if (this.scenes[key]) {
                this._logger.warn('Scene', key, 'already exists overwriting');
            }
            this.scenes[key] = scene;
            scene.engine = this;
        };
        /**
         * @internal
         */
        Engine.prototype.removeScene = function (entity) {
            if (entity instanceof ex.Scene) {
                // remove scene
                for (var key in this.scenes) {
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
        };
        Engine.prototype.add = function (entity) {
            if (entity instanceof ex.UIActor) {
                this.currentScene.addUIActor(entity);
                return;
            }
            if (entity instanceof ex.Actor) {
                this._addChild(entity);
            }
            if (entity instanceof ex.Timer) {
                this.addTimer(entity);
            }
            if (entity instanceof ex.TileMap) {
                this.addTileMap(entity);
            }
            if (arguments.length === 2) {
                this.addScene(arguments[0], arguments[1]);
            }
        };
        Engine.prototype.remove = function (entity) {
            if (entity instanceof ex.UIActor) {
                this.currentScene.removeUIActor(entity);
                return;
            }
            if (entity instanceof ex.Actor) {
                this._removeChild(entity);
            }
            if (entity instanceof ex.Timer) {
                this.removeTimer(entity);
            }
            if (entity instanceof ex.TileMap) {
                this.removeTileMap(entity);
            }
            if (entity instanceof ex.Scene) {
                this.removeScene(entity);
            }
            if (typeof entity === 'string') {
                this.removeScene(entity);
            }
        };
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.add(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         */
        Engine.prototype._addChild = function (actor) {
            this.currentScene.add(actor);
        };
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.remove(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        Engine.prototype._removeChild = function (actor) {
            this.currentScene.remove(actor);
        };
        /**
         * Changes the currently updating and drawing scene to a different,
         * named scene. Calls the [[Scene]] lifecycle events.
         * @param key  The key of the scene to trasition to.
         */
        Engine.prototype.goToScene = function (key) {
            if (this.scenes[key]) {
                var oldScene = this.currentScene;
                var newScene = this.scenes[key];
                this._logger.debug('Going to scene:', key);
                // only deactivate when initialized
                if (this.currentScene.isInitialized) {
                    this.currentScene.onDeactivate.call(this.currentScene);
                    this.currentScene.eventDispatcher.emit('deactivate', new ex.DeactivateEvent(newScene));
                }
                // set current scene to new one
                this.currentScene = newScene;
                // initialize the current scene if has not been already
                this.currentScene._initialize(this);
                this.currentScene.onActivate.call(this.currentScene);
                this.currentScene.eventDispatcher.emit('activate', new ex.ActivateEvent(oldScene));
            }
            else {
                this._logger.error('Scene', key, 'does not exist!');
            }
        };
        /**
         * Returns the width of the engine's drawing surface in pixels.
         */
        Engine.prototype.getWidth = function () {
            if (this.currentScene && this.currentScene.camera) {
                return this.width / this.currentScene.camera.getZoom();
            }
            return this.width;
        };
        /**
         * Returns the height of the engine's drawing surface in pixels.
         */
        Engine.prototype.getHeight = function () {
            if (this.currentScene && this.currentScene.camera) {
                return this.height / this.currentScene.camera.getZoom();
            }
            return this.height;
        };
        /**
         * Transforms the current x, y from screen coordinates to world coordinates
         * @param point  Screen coordinate to convert
         */
        Engine.prototype.screenToWorldCoordinates = function (point) {
            var newX = point.x;
            var newY = point.y;
            // transform back to world space
            newX = (newX / this.canvas.clientWidth) * this.getWidth();
            newY = (newY / this.canvas.clientHeight) * this.getHeight();
            // transform based on zoom
            newX = newX - this.getWidth() / 2;
            newY = newY - this.getHeight() / 2;
            // shift by focus
            if (this.currentScene && this.currentScene.camera) {
                var focus = this.currentScene.camera.getFocus();
                newX += focus.x;
                newY += focus.y;
            }
            return new ex.Vector(Math.floor(newX), Math.floor(newY));
        };
        /**
         * Transforms a world coordinate, to a screen coordinate
         * @param point  World coordinate to convert
         */
        Engine.prototype.worldToScreenCoordinates = function (point) {
            var screenX = point.x;
            var screenY = point.y;
            // shift by focus
            if (this.currentScene && this.currentScene.camera) {
                var focus = this.currentScene.camera.getFocus();
                screenX -= focus.x;
                screenY -= focus.y;
            }
            // transform back on zoom
            screenX = screenX + this.getWidth() / 2;
            screenY = screenY + this.getHeight() / 2;
            // transform back to screen space
            screenX = (screenX * this.canvas.clientWidth) / this.getWidth();
            screenY = (screenY * this.canvas.clientHeight) / this.getHeight();
            return new ex.Vector(Math.floor(screenX), Math.floor(screenY));
        };
        /**
         * Sets the internal canvas height based on the selected display mode.
         */
        Engine.prototype._setHeightByDisplayMode = function (parent) {
            if (this.displayMode === DisplayMode.Container) {
                this.width = this.canvas.width = parent.clientWidth;
                this.height = this.canvas.height = parent.clientHeight;
            }
            if (this.displayMode === DisplayMode.FullScreen) {
                document.body.style.margin = '0px';
                document.body.style.overflow = 'hidden';
                this.width = this.canvas.width = parent.innerWidth;
                this.height = this.canvas.height = parent.innerHeight;
            }
        };
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         */
        Engine.prototype._initialize = function (options) {
            var _this = this;
            if (this.displayMode === DisplayMode.FullScreen || this.displayMode === DisplayMode.Container) {
                var parent = (this.displayMode === DisplayMode.Container ?
                    (this.canvas.parentElement || document.body) : window);
                this._setHeightByDisplayMode(parent);
                window.addEventListener('resize', function (ev) {
                    _this._logger.debug('View port resized');
                    _this._setHeightByDisplayMode(parent);
                    _this._logger.info('parent.clientHeight ' + parent.clientHeight);
                    _this.setAntialiasing(_this._isSmoothingEnabled);
                });
            }
            // initialize inputs
            this.input = {
                keyboard: new ex.Input.Keyboard(this),
                pointers: new ex.Input.Pointers(this),
                gamepads: new ex.Input.Gamepads(this)
            };
            this.input.keyboard.init();
            this.input.pointers.init(options ? options.pointerScope : ex.Input.PointerScope.Document);
            this.input.gamepads.init();
            // Issue #385 make use of the visibility api
            // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
            var hidden, visibilityChange;
            if (typeof document.hidden !== 'undefined') {
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
            document.addEventListener(visibilityChange, function () {
                if (document[hidden]) {
                    _this.eventDispatcher.emit('hidden', new ex.HiddenEvent());
                    _this._logger.debug('Window hidden');
                }
                else {
                    _this.eventDispatcher.emit('visible', new ex.VisibleEvent());
                    _this._logger.debug('Window visible');
                }
            });
            this.ctx = this.canvas.getContext('2d');
            if (!this.canvasElementId) {
                document.body.appendChild(this.canvas);
            }
        };
        /**
         * If supported by the browser, this will set the antialiasing flag on the
         * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
         * image resources.
         * @param isSmooth  Set smoothing to true or false
         */
        Engine.prototype.setAntialiasing = function (isSmooth) {
            this._isSmoothingEnabled = isSmooth;
            var ctx = this.ctx;
            ctx.imageSmoothingEnabled = isSmooth;
            for (var _i = 0, _a = ['webkitImageSmoothingEnabled', 'mozImageSmoothingEnabled', 'msImageSmoothingEnabled']; _i < _a.length; _i++) {
                var smoothing = _a[_i];
                if (smoothing in ctx) {
                    ctx[smoothing] = isSmooth;
                }
            }
            ;
        };
        /**
         * Return the current smoothing status of the canvas
         */
        Engine.prototype.getAntialiasing = function () {
            return this.ctx.imageSmoothingEnabled ||
                this.ctx.webkitImageSmoothingEnabled ||
                this.ctx.mozImageSmoothingEnabled ||
                this.ctx.msImageSmoothingEnabled;
        };
        /**
         * Updates the entire state of the game
         * @param delta  Number of milliseconds elapsed since the last update.
         */
        Engine.prototype._update = function (delta) {
            if (this._isLoading) {
                // suspend updates untill loading is finished
                this._loader.update(this, delta);
                // Update input listeners
                this.input.keyboard.update(delta);
                this.input.pointers.update(delta);
                this.input.gamepads.update(delta);
                return;
            }
            this.emit('preupdate', new ex.PreUpdateEvent(this, delta, this));
            // process engine level events
            this.currentScene.update(this, delta);
            // update animations
            this._animations = this._animations.filter(function (a) {
                return !a.animation.isDone();
            });
            // Update input listeners
            this.input.keyboard.update(delta);
            this.input.pointers.update(delta);
            this.input.gamepads.update(delta);
            // Publish update event
            // TODO: Obsolete `update` event on Engine
            this.eventDispatcher.emit('update', new ex.PostUpdateEvent(this, delta, this));
            this.emit('postupdate', new ex.PostUpdateEvent(this, delta, this));
        };
        /**
         * Draws the entire game
         * @param delta  Number of milliseconds elapsed since the last draw.
         */
        Engine.prototype._draw = function (delta) {
            var ctx = this.ctx;
            this.emit('predraw', new ex.PreDrawEvent(ctx, delta, this));
            if (this._isLoading) {
                this._loader.draw(ctx, delta);
                // Drawing nothing else while loading
                return;
            }
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = this.backgroundColor.toString();
            ctx.fillRect(0, 0, this.width, this.height);
            this.currentScene.draw(this.ctx, delta);
            // todo needs to be a better way of doing this
            var a = 0, len = this._animations.length;
            for (a; a < len; a++) {
                this._animations[a].animation.draw(ctx, this._animations[a].x, this._animations[a].y);
            }
            // Draw debug information
            if (this.isDebug) {
                this.ctx.font = 'Consolas';
                this.ctx.fillStyle = this.debugColor.toString();
                var keys = this.input.keyboard.getKeys();
                for (var j = 0; j < keys.length; j++) {
                    this.ctx.fillText(keys[j].toString() + ' : ' + (ex.Input.Keys[keys[j]] ? ex.Input.Keys[keys[j]] : 'Not Mapped'), 100, 10 * j + 10);
                }
                this.ctx.fillText('FPS:' + this.fps.toFixed(2).toString(), 10, 10);
            }
            // Post processing
            for (var i = 0; i < this.postProcessors.length; i++) {
                this.postProcessors[i].process(this.ctx.getImageData(0, 0, this.width, this.height), this.ctx);
            }
            this.emit('postdraw', new ex.PostDrawEvent(ctx, delta, this));
        };
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @param loader  Optional [[ILoader]] to use to load resources. The default loader is [[Loader]], override to provide your own
         * custom loader.
         */
        Engine.prototype.start = function (loader) {
            var _this = this;
            if (!this._compatible) {
                var promise = new ex.Promise();
                return promise.reject('Excalibur is incompatible with your browser');
            }
            var loadingComplete;
            if (loader) {
                this._loader = loader;
                this._loader.wireEngine(this);
                loadingComplete = this.load(this._loader);
            }
            else {
                loadingComplete = ex.Promise.resolve();
            }
            loadingComplete.then(function () {
                _this.emit('start', new ex.GameStartEvent(_this));
            });
            if (!this._hasStarted) {
                this._hasStarted = true;
                this._logger.debug('Starting game...');
                Engine.createMainLoop(this, window.requestAnimationFrame, Date.now)();
                this._logger.debug('Game started');
            }
            else {
            }
            return loadingComplete;
        };
        Engine.createMainLoop = function (game, raf, nowFn) {
            var lastTime = nowFn();
            return function mainloop() {
                if (!game._hasStarted) {
                    return;
                }
                try {
                    game._requestId = raf(mainloop);
                    game.emit('preframe', new ex.PreFrameEvent(game, game.stats.prevFrame, game));
                    // Get the time to calculate time-elapsed
                    var now = nowFn();
                    var elapsed = Math.floor(now - lastTime) || 1;
                    // Resolves issue #138 if the game has been paused, or blurred for 
                    // more than a 200 milliseconds, reset elapsed time to 1. This improves reliability 
                    // and provides more expected behavior when the engine comes back
                    // into focus
                    if (elapsed > 200) {
                        elapsed = 1;
                    }
                    var delta = elapsed * game.timescale;
                    // reset frame stats (reuse existing instances)
                    var frameId = game.stats.prevFrame.id + 1;
                    game.stats.prevFrame.reset(game.stats.currFrame);
                    game.stats.currFrame.reset();
                    game.stats.currFrame.id = frameId;
                    game.stats.currFrame.delta = delta;
                    game.stats.currFrame.fps = 1.0 / (delta / 1000);
                    var beforeUpdate = nowFn();
                    game._update(delta);
                    var afterUpdate = nowFn();
                    game._draw(delta);
                    var afterDraw = nowFn();
                    game.stats.currFrame.duration.update = afterUpdate - beforeUpdate;
                    game.stats.currFrame.duration.draw = afterDraw - afterUpdate;
                    lastTime = now;
                    game.emit('postframe', new ex.PostFrameEvent(game, game.stats.currFrame, game));
                }
                catch (e) {
                    window.cancelAnimationFrame(game._requestId);
                    game.stop();
                    game.onFatalException(e);
                }
            };
        };
        /**
         * Stops Excalibur's main loop, useful for pausing the game.
         */
        Engine.prototype.stop = function () {
            if (this._hasStarted) {
                this.emit('stop', new ex.GameStopEvent(this));
                this._hasStarted = false;
                this._logger.debug('Game stopped');
            }
        };
        /**
         * Takes a screen shot of the current viewport and returns it as an
         * HTML Image Element.
         */
        Engine.prototype.screenshot = function () {
            var result = new Image();
            var raw = this.canvas.toDataURL('image/png');
            result.src = raw;
            return result;
        };
        /**
         * Another option available to you to load resources into the game.
         * Immediately after calling this the game will pause and the loading screen
         * will appear.
         * @param loader  Some [[ILoadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
         */
        Engine.prototype.load = function (loader) {
            var _this = this;
            var complete = new ex.Promise();
            this._isLoading = true;
            loader.load().then(function () {
                setTimeout(function () {
                    _this._isLoading = false;
                    complete.resolve();
                }, 500);
            });
            return complete;
        };
        /**
         * Default [[IEngineOptions]]
         */
        Engine._DefaultEngineOptions = {
            width: 0,
            height: 0,
            canvasElementId: '',
            pointerScope: ex.Input.PointerScope.Document,
            suppressConsoleBootMessage: null,
            suppressMinimumBrowserFeatureDetection: null
        };
        return Engine;
    }(ex.Class));
    ex.Engine = Engine;
    /**
     * @internal
     */
    var AnimationNode = (function () {
        function AnimationNode(animation, x, y) {
            this.animation = animation;
            this.x = x;
            this.y = y;
        }
        return AnimationNode;
    }());
})(ex || (ex = {}));
//# sourceMappingURL=excalibur.js.map
;
// Concatenated onto excalibur after build
// Exports the excalibur module so it can be used with browserify
// https://github.com/excaliburjs/Excalibur/issues/312
if (typeof module !== 'undefined') {module.exports = ex;}