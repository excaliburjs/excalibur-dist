export class Observable {
    constructor() {
        this.observers = [];
    }
    register(observer) {
        this.observers.push(observer);
    }
    unregister(observer) {
        const i = this.observers.indexOf(observer);
        if (i !== -1) {
            this.observers.splice(i, 1);
        }
    }
    notifyAll(message) {
        this.observers.forEach((o) => o.notify(message));
    }
}
//# sourceMappingURL=Observable.js.map