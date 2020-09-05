var Observable = /** @class */ (function () {
    function Observable() {
        this.observers = [];
    }
    Observable.prototype.register = function (observer) {
        this.observers.push(observer);
    };
    Observable.prototype.unregister = function (observer) {
        var i = this.observers.indexOf(observer);
        if (i !== -1) {
            this.observers.splice(i, 1);
        }
    };
    Observable.prototype.notifyAll = function (message) {
        this.observers.forEach(function (o) { return o.notify(message); });
    };
    return Observable;
}());
export { Observable };
//# sourceMappingURL=Observable.js.map