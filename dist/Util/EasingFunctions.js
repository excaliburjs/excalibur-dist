var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Vector } from '../Algebra';
import { obsolete } from '../Util/Decorators';
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
var EasingFunctions = /** @class */ (function () {
    function EasingFunctions() {
    }
    EasingFunctions.CreateReversibleEasingFunction = function (easing) {
        return function (time, start, end, duration) {
            if (end < start) {
                return start - (easing(time, end, start, duration) - end);
            }
            else {
                return easing(time, start, end, duration);
            }
        };
    };
    EasingFunctions.CreateReversableEasingFunction = function (easing) {
        return EasingFunctions.CreateReversibleEasingFunction(easing);
    };
    EasingFunctions.CreateVectorEasingFunction = function (easing) {
        return function (time, start, end, duration) {
            return new Vector(easing(time, start.x, end.x, duration), easing(time, start.y, end.y, duration));
        };
    };
    EasingFunctions.Linear = EasingFunctions.CreateReversibleEasingFunction(function (currentTime, startValue, endValue, duration) {
        endValue = endValue - startValue;
        return (endValue * currentTime) / duration + startValue;
    });
    EasingFunctions.EaseInQuad = EasingFunctions.CreateReversibleEasingFunction(function (currentTime, startValue, endValue, duration) {
        endValue = endValue - startValue;
        currentTime /= duration;
        return endValue * currentTime * currentTime + startValue;
    });
    EasingFunctions.EaseOutQuad = EasingFunctions.CreateReversibleEasingFunction(function (currentTime, startValue, endValue, duration) {
        endValue = endValue - startValue;
        currentTime /= duration;
        return -endValue * currentTime * (currentTime - 2) + startValue;
    });
    EasingFunctions.EaseInOutQuad = EasingFunctions.CreateReversibleEasingFunction(function (currentTime, startValue, endValue, duration) {
        endValue = endValue - startValue;
        currentTime /= duration / 2;
        if (currentTime < 1) {
            return (endValue / 2) * currentTime * currentTime + startValue;
        }
        currentTime--;
        return (-endValue / 2) * (currentTime * (currentTime - 2) - 1) + startValue;
    });
    EasingFunctions.EaseInCubic = EasingFunctions.CreateReversibleEasingFunction(function (currentTime, startValue, endValue, duration) {
        endValue = endValue - startValue;
        currentTime /= duration;
        return endValue * currentTime * currentTime * currentTime + startValue;
    });
    EasingFunctions.EaseOutCubic = EasingFunctions.CreateReversibleEasingFunction(function (currentTime, startValue, endValue, duration) {
        endValue = endValue - startValue;
        currentTime /= duration;
        currentTime--;
        return endValue * (currentTime * currentTime * currentTime + 1) + startValue;
    });
    EasingFunctions.EaseInOutCubic = EasingFunctions.CreateReversibleEasingFunction(function (currentTime, startValue, endValue, duration) {
        endValue = endValue - startValue;
        currentTime /= duration / 2;
        if (currentTime < 1) {
            return (endValue / 2) * currentTime * currentTime * currentTime + startValue;
        }
        currentTime -= 2;
        return (endValue / 2) * (currentTime * currentTime * currentTime + 2) + startValue;
    });
    __decorate([
        obsolete({
            message: 'Alias for incorrect spelling used in older versions, will be removed in v0.25.0',
            alternateMethod: 'CreateReversibleEasingFunction'
        })
    ], EasingFunctions, "CreateReversableEasingFunction", null);
    return EasingFunctions;
}());
export { EasingFunctions };
//# sourceMappingURL=EasingFunctions.js.map