import { Class } from '../Class';
import { Logger } from '../Util/Log';
/**
 * The [[Resource]] type allows games built in Excalibur to load generic resources.
 * For any type of remote resource it is recommended to use [[Resource]] for preloading.
 */
export class Resource extends Class {
    /**
     * @param path          Path to the remote resource
     * @param responseType  The type to expect as a response: "" | "arraybuffer" | "blob" | "document" | "json" | "text";
     * @param bustCache     Whether or not to cache-bust requests
     */
    constructor(path, responseType, bustCache = true) {
        super();
        this.path = path;
        this.responseType = responseType;
        this.bustCache = bustCache;
        this.data = null;
        this.logger = Logger.getInstance();
        this.onprogress = () => {
            return;
        };
        this.oncomplete = () => {
            return;
        };
        this.onerror = () => {
            return;
        };
    }
    /**
     * Returns true if the Resource is completely loaded and is ready
     * to be drawn.
     */
    isLoaded() {
        return this.data !== null;
    }
    wireEngine(_engine) {
        // override me
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
    _start() {
        this.logger.debug('Started loading resource ' + this.path);
    }
    /**
     * Begin loading the resource and returns a promise to be resolved on completion
     */
    load() {
        return new Promise((resolve, reject) => {
            // Exit early if we already have data
            if (this.data !== null) {
                this.logger.debug('Already have data for resource', this.path);
                resolve(this.data);
                this.oncomplete();
                return;
            }
            const request = new XMLHttpRequest();
            request.open('GET', this.bustCache ? this._cacheBust(this.path) : this.path, true);
            request.responseType = this.responseType;
            request.onloadstart = () => {
                this._start();
            };
            request.onprogress = this.onprogress;
            request.onerror = this.onerror;
            request.onload = () => {
                // XHR on file:// success status is 0, such as with PhantomJS
                if (request.status !== 0 && request.status !== 200) {
                    this.logger.error('Failed to load resource ', this.path, ' server responded with error code', request.status);
                    this.onerror(request.response);
                    reject(request.response);
                    return;
                }
                this.data = this.processData(request.response);
                this.oncomplete();
                this.logger.debug('Completed loading resource', this.path);
                resolve(this.data);
            };
            request.send();
        });
    }
    /**
     * Returns the loaded data once the resource is loaded
     */
    getData() {
        return this.data;
    }
    /**
     * Sets the data for this resource directly
     */
    setData(data) {
        this.data = this.processData(data);
    }
    /**
     * This method is meant to be overridden to handle any additional
     * processing. Such as decoding downloaded audio bits.
     */
    processData(data) {
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
        // Blob requires an object url
        if (this.responseType === 'blob') {
            return URL.createObjectURL(data);
        }
        return data;
    }
}
//# sourceMappingURL=Resource.js.map