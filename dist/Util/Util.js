import { Vector } from '../Algebra';
import { Random } from '../Math/Random';
import { Side } from '../Collision/Side';
/**
 * Two PI constant
 */
export const TwoPI = Math.PI * 2;
/**
 * Merges one or more objects into a single target object
 *
 * @returns Merged object with properties from other objects
 * @credit https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
 */
export function extend() {
    const extended = {};
    let deep = false;
    let i = 0;
    const length = arguments.length;
    // Check if a deep merge
    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
        deep = arguments[0];
        i++;
    }
    // Merge the object into the extended object
    const assignExists = typeof Object.assign === 'function';
    let merge = null;
    if (!assignExists) {
        merge = function (obj) {
            for (const prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    // If deep merge and property is an object, merge properties
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = extend(true, extended[prop], obj[prop]);
                    }
                    else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };
    }
    else {
        merge = Object.assign;
    }
    // Loop through each object and conduct a merge
    for (; i < length; i++) {
        const obj = arguments[i];
        if (!assignExists) {
            merge(obj);
        }
        else {
            merge(extended, obj);
        }
    }
    return extended;
}
/**
 * Encode a string in base64
 * @deprecated This method is marked for removal
 */
export function base64Encode(inputStr) {
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let outputStr = '';
    let i = 0;
    while (i < inputStr.length) {
        //all three "& 0xff" added below are there to fix a known bug
        //with bytes returned by xhr.responseText
        const byte1 = inputStr.charCodeAt(i++) & 0xff;
        const byte2 = inputStr.charCodeAt(i++) & 0xff;
        const byte3 = inputStr.charCodeAt(i++) & 0xff;
        const enc1 = byte1 >> 2;
        const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
        let enc3, enc4;
        if (isNaN(byte2)) {
            enc3 = enc4 = 64;
        }
        else {
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            if (isNaN(byte3)) {
                enc4 = 64;
            }
            else {
                enc4 = byte3 & 63;
            }
        }
        outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
    }
    return outputStr;
}
/**
 * Sugar that will use `nullishVal` if it's not null or undefined. Simulates the `??` operator
 * @param nullishVal
 * @param defaultVal
 */
export function nullish(nullishVal, defaultVal) {
    return nullishVal !== null && nullishVal !== undefined ? nullishVal : defaultVal;
}
/**
 * Clamps a value between a min and max inclusive
 */
export function clamp(val, min, max) {
    return Math.min(Math.max(min, val), max);
}
/**
 * Find a random floating point number in range
 */
export function randomInRange(min, max, random = new Random()) {
    return random ? random.floating(min, max) : min + Math.random() * (max - min);
}
/**
 * Find a random integer in a range
 */
export function randomIntInRange(min, max, random = new Random()) {
    return random ? random.integer(min, max) : Math.round(randomInRange(min, max));
}
/**
 * Convert an angle to be the equivalent in the range [0, 2PI]
 */
export function canonicalizeAngle(angle) {
    let tmpAngle = angle;
    if (angle > TwoPI) {
        while (tmpAngle > TwoPI) {
            tmpAngle -= TwoPI;
        }
    }
    if (angle < 0) {
        while (tmpAngle < 0) {
            tmpAngle += TwoPI;
        }
    }
    return tmpAngle;
}
/**
 * Convert radians to degrees
 */
export function toDegrees(radians) {
    return (180 / Math.PI) * radians;
}
/**
 * Convert degrees to radians
 */
export function toRadians(degrees) {
    return (degrees / 180) * Math.PI;
}
/**
 * Find the screen position of an HTML element
 */
export function getPosition(el) {
    let oLeft = 0, oTop = 0;
    const calcOffsetLeft = (parent) => {
        oLeft += parent.offsetLeft;
        if (parent.offsetParent) {
            calcOffsetLeft(parent.offsetParent);
        }
    };
    const calcOffsetTop = (parent) => {
        oTop += parent.offsetTop;
        if (parent.offsetParent) {
            calcOffsetTop(parent.offsetParent);
        }
    };
    calcOffsetLeft(el);
    calcOffsetTop(el);
    return new Vector(oLeft, oTop);
}
/**
 * Add an item to an array list if it doesn't already exist. Returns true if added, false if not and already exists in the array.
 * @deprecated
 */
export function addItemToArray(item, array) {
    if (array.indexOf(item) === -1) {
        array.push(item);
        return true;
    }
    return false;
}
/**
 * Remove an item from an list
 */
export function removeItemFromArray(item, array) {
    let index = -1;
    if ((index = array.indexOf(item)) > -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}
/**
 * See if an array contains something
 */
export function contains(array, obj) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}
/**
 * Get the opposit side
 * TODO: Move to Side type
 * @deprecated
 */
export function getOppositeSide(side) {
    if (side === Side.Top) {
        return Side.Bottom;
    }
    if (side === Side.Bottom) {
        return Side.Top;
    }
    if (side === Side.Left) {
        return Side.Right;
    }
    if (side === Side.Right) {
        return Side.Left;
    }
    return Side.None;
}
/**
 * Returns the side in the direction of the vector supplied
 * @param direction Vector to check
 * TODO: Move to Side type
 */
export function getSideFromDirection(direction) {
    const directions = [Vector.Left, Vector.Right, Vector.Up, Vector.Down];
    const directionEnum = [Side.Left, Side.Right, Side.Top, Side.Bottom];
    let max = -Number.MAX_VALUE;
    let maxIndex = -1;
    for (let i = 0; i < directions.length; i++) {
        if (directions[i].dot(direction) > max) {
            max = directions[i].dot(direction);
            maxIndex = i;
        }
    }
    return directionEnum[maxIndex];
}
/**
 * Excalibur's dynamically resizing collection
 * @deprecated Will be removed in future releases
 */
export class Collection {
    /**
     * @param initialSize  Initial size of the internal backing array
     */
    constructor(initialSize = Collection.DefaultSize) {
        this._internalArray = null;
        this._endPointer = 0;
        this._internalArray = new Array(initialSize);
    }
    _resize() {
        const newSize = this._internalArray.length * 2;
        const newArray = new Array(newSize);
        const count = this.count();
        for (let i = 0; i < count; i++) {
            newArray[i] = this._internalArray[i];
        }
        delete this._internalArray;
        this._internalArray = newArray;
    }
    /**
     * Push elements to the end of the collection
     */
    push(element) {
        if (this._endPointer === this._internalArray.length) {
            this._resize();
        }
        return (this._internalArray[this._endPointer++] = element);
    }
    /**
     * Removes elements from the end of the collection
     */
    pop() {
        this._endPointer = this._endPointer - 1 < 0 ? 0 : this._endPointer - 1;
        return this._internalArray[this._endPointer];
    }
    /**
     * Returns the count of the collection
     */
    count() {
        return this._endPointer;
    }
    /**
     * Empties the collection
     */
    clear() {
        this._endPointer = 0;
    }
    /**
     * Returns the size of the internal backing array
     */
    internalSize() {
        return this._internalArray.length;
    }
    /**
     * Returns an element at a specific index
     * @param index  Index of element to retrieve
     */
    elementAt(index) {
        if (index >= this.count()) {
            //Logger.getInstance().error('Invalid parameter: ' + index);
            throw new Error('Invalid index ' + index);
        }
        return this._internalArray[index];
    }
    /**
     * Inserts an element at a specific index
     * @param index  Index to insert the element
     * @param value  Element to insert
     */
    insert(index, value) {
        if (index >= this.count()) {
            this._resize();
        }
        return (this._internalArray[index] = value);
    }
    /**
     * Removes an element at a specific index
     * @param index  Index of element to remove
     */
    remove(index) {
        const count = this.count();
        if (count === 0) {
            //Logger.getInstance().error('Invalid parameter: ' + index);
            throw new Error('Invalid parameter ' + index);
        }
        // O(n) Shift
        const removed = this._internalArray[index];
        for (let i = index; i < count; i++) {
            this._internalArray[i] = this._internalArray[i + 1];
        }
        this._endPointer--;
        return removed;
    }
    /**
     * Removes an element by reference
     * @param element  Element to retrieve
     */
    removeElement(element) {
        const index = this._internalArray.indexOf(element);
        this.remove(index);
    }
    /**
     * Returns a array representing the collection
     */
    toArray() {
        return this._internalArray.slice(0, this._endPointer);
    }
    /**
     * Iterate over every element in the collection
     * @param func  Callback to call for each element passing a reference to the element and its index, returned values are ignored
     */
    forEach(func) {
        let i = 0;
        const count = this.count();
        for (i; i < count; i++) {
            func.call(this, this._internalArray[i], i);
        }
    }
    /**
     * Mutate every element in the collection
     * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate
     * the collection
     */
    map(func) {
        const count = this.count();
        for (let i = 0; i < count; i++) {
            this._internalArray[i] = func.call(this, this._internalArray[i], i);
        }
    }
}
/**
 * Default collection size
 */
Collection.DefaultSize = 200;
/**
 * Used for exhaustive checks at compile time
 */
export function fail(message) {
    throw new Error(message);
}
//# sourceMappingURL=Util.js.map