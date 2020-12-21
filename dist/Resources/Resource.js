import { Logger } from '../Util/Log';
import { EventDispatcher } from '../EventDispatcher';
/**
 * The [[Resource]] type allows games built in Excalibur to load generic resources.
 * For any type of remote resource it is recommended to use [[Resource]] for preloading.
 */
export class Resource {
    /**
     * @param path          Path to the remote resource
     * @param responseType  The type to expect as a response: "" | "arraybuffer" | "blob" | "document" | "json" | "text";
     * @param bustCache     Whether or not to cache-bust requests
     */
    constructor(path, responseType, bustCache = true) {
        this.path = path;
        this.responseType = responseType;
        this.bustCache = bustCache;
        this.data = null;
        this.logger = Logger.getInstance();
        this.events = new EventDispatcher(this);
    }
    /**
     * Returns true if the Resource is completely loaded and is ready
     * to be drawn.
     */
    isLoaded() {
        return this.data !== null;
    }
    _cacheBust(uri) {
        const query = /\?\w*=\w*/;
        if (query.test(uri)) {
            uri += '&__=' + Date.now();
        }
        else {
            uri += '?__=' + Date.now();
        }
        return uri;
    }
    /**
     * Begin loading the resource and returns a promise to be resolved on completion
     */
    load() {
        return new Promise((resolve, reject) => {
            // Exit early if we already have data
            if (this.data !== null) {
                this.logger.debug('Already have data for resource', this.path);
                this.events.emit('complete', this.data);
                resolve(this.data);
                return;
            }
            const request = new XMLHttpRequest();
            request.open('GET', this.bustCache ? this._cacheBust(this.path) : this.path, true);
            request.responseType = this.responseType;
            request.addEventListener('loadstart', (e) => this.events.emit('loadstart', e));
            request.addEventListener('progress', (e) => this.events.emit('progress', e));
            request.addEventListener('error', (e) => this.events.emit('error', e));
            request.addEventListener('load', (e) => this.events.emit('load', e));
            request.addEventListener('load', () => {
                // XHR on file:// success status is 0, such as with PhantomJS
                if (request.status !== 0 && request.status !== 200) {
                    this.logger.error('Failed to load resource ', this.path, ' server responded with error code', request.status);
                    this.events.emit('error', request.response);
                    reject(request.response);
                    return;
                }
                this.data = request.response;
                this.events.emit('complete', this.data);
                this.logger.debug('Completed loading resource', this.path);
                resolve(this.data);
            });
            request.send();
        });
    }
}
//# sourceMappingURL=Resource.js.map