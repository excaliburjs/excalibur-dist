// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Promise_1;
import { obsolete } from './Util/Decorators';
/**
 * Valid states for a promise to be in
 * @deprecated Will be removed in v0.26.0
 */
export var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["Resolved"] = 0] = "Resolved";
    PromiseState[PromiseState["Rejected"] = 1] = "Rejected";
    PromiseState[PromiseState["Pending"] = 2] = "Pending";
})(PromiseState || (PromiseState = {}));
/**
 * Promises are used to do asynchronous work and they are useful for
 * creating a chain of actions. In Excalibur they are used for loading,
 * sounds, animation, actions, and more.
 * @deprecated Will be removed in v0.26.0
 */
let Promise = Promise_1 = class Promise {
    constructor() {
        this._state = PromiseState.Pending;
        this._successCallbacks = [];
        this._rejectCallback = () => {
            return;
        };
    }
    /**
     * Create and resolve a Promise with an optional value
     * @param value  An optional value to wrap in a resolved promise
     */
    static resolve(value) {
        const promise = new Promise_1().resolve(value);
        return promise;
    }
    /**
     * Create and reject a Promise with an optional value
     * @param value  An optional value to wrap in a rejected promise
     */
    static reject(value) {
        const promise = new Promise_1().reject(value);
        return promise;
    }
    static join() {
        let promises = [];
        if (arguments.length > 0 && !Array.isArray(arguments[0])) {
            for (let _i = 0; _i < arguments.length; _i++) {
                promises[_i - 0] = arguments[_i];
            }
        }
        else if (arguments.length === 1 && Array.isArray(arguments[0])) {
            promises = arguments[0];
        }
        const joinedPromise = new Promise_1();
        if (!promises || !promises.length) {
            return joinedPromise.resolve();
        }
        const total = promises.length;
        let successes = 0;
        let rejects = 0;
        const errors = [];
        promises.forEach((p) => {
            p.then(() => {
                successes += 1;
                if (successes === total) {
                    joinedPromise.resolve();
                }
                else if (successes + rejects + errors.length === total) {
                    joinedPromise.reject(errors);
                }
            }, () => {
                rejects += 1;
                if (successes + rejects + errors.length === total) {
                    joinedPromise.reject(errors);
                }
            }).error((e) => {
                errors.push(e);
                if (errors.length + successes + rejects === total) {
                    joinedPromise.reject(errors);
                }
            });
        });
        return joinedPromise;
    }
    /**
     * Chain success and reject callbacks after the promise is resolved
     * @param successCallback  Call on resolution of promise
     * @param rejectCallback   Call on rejection of promise
     */
    then(successCallback, rejectCallback) {
        if (successCallback) {
            this._successCallbacks.push(successCallback);
            // If the promise is already resolved call immediately
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
    }
    /**
     * Add an error callback to the promise
     * @param errorCallback  Call if there was an error in a callback
     */
    error(errorCallback) {
        if (errorCallback) {
            this._errorCallback = errorCallback;
        }
        return this;
    }
    /**
     * Resolve the promise and pass an option value to the success callbacks
     * @param value  Value to pass to the success callbacks
     */
    resolve(value) {
        if (this._state === PromiseState.Pending) {
            this._value = value;
            try {
                this._state = PromiseState.Resolved;
                this._successCallbacks.forEach((cb) => {
                    cb.call(this, this._value);
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
    }
    /**
     * Reject the promise and pass an option value to the reject callbacks
     * @param value  Value to pass to the reject callbacks
     */
    reject(value) {
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
    }
    /**
     * Inspect the current state of a promise
     */
    state() {
        return this._state;
    }
    _handleError(e) {
        if (this._errorCallback) {
            this._errorCallback.call(this, e);
        }
        else {
            // rethrow error
            throw e;
        }
    }
};
Promise = Promise_1 = __decorate([
    obsolete({
        message: 'ex.Promises are being replaced by native browser promises in v0.26.0',
        alternateMethod: 'Use browser native promises'
    })
], Promise);
export { Promise };
//# sourceMappingURL=Promises.js.map