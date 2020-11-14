export class BrowserComponent {
    constructor(nativeComponent) {
        this.nativeComponent = nativeComponent;
        this._paused = false;
        this._nativeHandlers = {};
    }
    on(eventName, handler) {
        if (this._nativeHandlers[eventName]) {
            this.off(eventName, this._nativeHandlers[eventName]);
        }
        this._nativeHandlers[eventName] = this._decorate(handler);
        this.nativeComponent.addEventListener(eventName, this._nativeHandlers[eventName]);
    }
    off(eventName, handler) {
        if (!handler) {
            handler = this._nativeHandlers[eventName];
        }
        this.nativeComponent.removeEventListener(eventName, handler);
        this._nativeHandlers[eventName] = null;
    }
    _decorate(handler) {
        return (evt) => {
            if (!this._paused) {
                handler(evt);
            }
        };
    }
    pause() {
        this._paused = true;
    }
    resume() {
        this._paused = false;
    }
    clear() {
        for (const event in this._nativeHandlers) {
            this.off(event);
        }
    }
}
export class BrowserEvents {
    constructor(_windowGlobal, _documentGlobal) {
        this._windowGlobal = _windowGlobal;
        this._documentGlobal = _documentGlobal;
        this._windowComponent = new BrowserComponent(this._windowGlobal);
        this._documentComponent = new BrowserComponent(this._documentGlobal);
    }
    get window() {
        return this._windowComponent;
    }
    get document() {
        return this._documentComponent;
    }
    pause() {
        this.window.pause();
        this.document.pause();
    }
    resume() {
        this.window.resume();
        this.document.resume();
    }
    clear() {
        this.window.clear();
        this.document.clear();
    }
}
//# sourceMappingURL=Browser.js.map