import { Logger } from './Log';
import * as Util from './Util';
/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
export function obsolete(options) {
    options = Util.extend({}, { message: 'This method will be removed in future versions of Excalibur.', alternateMethod: null }, options);
    return function (target, property, descriptor) {
        if (!(typeof descriptor.value === 'function' || typeof descriptor.get === 'function' || typeof descriptor.set === 'function')) {
            throw new SyntaxError('Only functions/getters/setters can be marked as obsolete');
        }
        var methodSignature = "" + (target.name || '') + (target.name ? '.' : '') + property;
        var message = methodSignature + " is marked obsolete: " + options.message +
            (options.alternateMethod ? " Use " + options.alternateMethod + " instead" : '');
        var method = Util.extend({}, descriptor);
        if (descriptor.value) {
            method.value = function () {
                Logger.getInstance().warn(message);
                return descriptor.value.apply(this, arguments);
            };
            return method;
        }
        if (descriptor.get) {
            method.get = function () {
                Logger.getInstance().warn(message);
                return descriptor.get.apply(this, arguments);
            };
        }
        if (descriptor.set) {
            method.set = function () {
                Logger.getInstance().warn(message);
                return descriptor.set.apply(this, arguments);
            };
        }
        return method;
    };
}
//# sourceMappingURL=Decorators.js.map