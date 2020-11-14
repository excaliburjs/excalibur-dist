import { Flags } from '../Flags';
import { Logger } from './Log';
import { extend } from './Util';
export const maxMessages = 5;
const obsoleteMessage = {};
export const resetObsoleteCounter = () => {
    for (const message in obsoleteMessage) {
        obsoleteMessage[message] = 0;
    }
};
const logMessage = (message, options) => {
    const suppressObsoleteMessages = Flags.isEnabled('suppress-obsolete-message');
    if (obsoleteMessage[message] < maxMessages && !suppressObsoleteMessages) {
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
    options = extend({}, {
        message: 'This feature will be removed in future versions of Excalibur.',
        alternateMethod: null,
        showStackTrack: false
    }, options);
    return function (target, property, descriptor) {
        if (descriptor &&
            !(typeof descriptor.value === 'function' || typeof descriptor.get === 'function' || typeof descriptor.set === 'function')) {
            throw new SyntaxError('Only classes/functions/getters/setters can be marked as obsolete');
        }
        const methodSignature = `${target.name || ''}${target.name && property ? '.' : ''}${property ? property : ''}`;
        const message = `${methodSignature} is marked obsolete: ${options.message}` +
            (options.alternateMethod ? ` Use ${options.alternateMethod} instead` : '');
        if (!obsoleteMessage[message]) {
            obsoleteMessage[message] = 0;
        }
        // If descriptor is null it is a class
        const method = descriptor ? Object.assign({}, descriptor) : target;
        if (!descriptor) {
            // with es2015 classes we need to change our decoration tactic
            class DecoratedClass extends method {
                constructor(...args) {
                    logMessage(message, options);
                    super(...args);
                }
            }
            return DecoratedClass;
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