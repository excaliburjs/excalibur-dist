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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { Logger } from './Log';
import * as Util from './Util';
export var maxMessages = 5;
var obsoleteMessage = {};
export var resetObsoleteCounter = function () {
    for (var message in obsoleteMessage) {
        obsoleteMessage[message] = 0;
    }
};
var logMessage = function (message, options) {
    if (obsoleteMessage[message] < maxMessages) {
        Logger.getInstance().warn(message);
        // tslint:disable-next-line: no-console
        if (console.trace && options.showStackTrace) {
            // tslint:disable-next-line: no-console
            console.trace();
        }
    }
    obsoleteMessage[message]++;
};
/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
export function obsolete(options) {
    options = Util.extend({}, {
        message: 'This feature will be removed in future versions of Excalibur.',
        alternateMethod: null,
        showStackTrack: false
    }, options);
    return function (target, property, descriptor) {
        if (descriptor &&
            !(typeof descriptor.value === 'function' || typeof descriptor.get === 'function' || typeof descriptor.set === 'function')) {
            throw new SyntaxError('Only classes/functions/getters/setters can be marked as obsolete');
        }
        var methodSignature = "" + (target.name || '') + (target.name && property ? '.' : '') + (property ? property : '');
        var message = methodSignature + " is marked obsolete: " + options.message +
            (options.alternateMethod ? " Use " + options.alternateMethod + " instead" : '');
        if (!obsoleteMessage[message]) {
            obsoleteMessage[message] = 0;
        }
        // If descriptor is null it is a class
        var method = descriptor ? __assign({}, descriptor) : target;
        if (!descriptor) {
            var constructor = function () {
                var args = Array.prototype.slice.call(arguments);
                logMessage(message, options);
                return new (method.bind.apply(method, __spreadArrays([void 0], args)))();
            };
            constructor.prototype = method.prototype;
            return constructor;
        }
        if (descriptor && descriptor.value) {
            method.value = function () {
                logMessage(message, options);
                return descriptor.value.apply(this, arguments);
            };
            return method;
        }
        if (descriptor && descriptor.get) {
            method.get = function () {
                logMessage(message, options);
                return descriptor.get.apply(this, arguments);
            };
        }
        if (descriptor && descriptor.set) {
            method.set = function () {
                logMessage(message, options);
                return descriptor.set.apply(this, arguments);
            };
        }
        return method;
    };
}
//# sourceMappingURL=Decorators.js.map