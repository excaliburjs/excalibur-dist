import { Logger } from '../Util/Log';
import { Class } from '../Class';
import * as Events from '../Events';
/**
 * Enum representing input key codes
 */
export var Keys;
(function (Keys) {
    // NUMPAD
    Keys["Num0"] = "Numpad0";
    Keys["Num1"] = "Numpad1";
    Keys["Num2"] = "Numpad2";
    Keys["Num3"] = "Numpad3";
    Keys["Num4"] = "Numpad4";
    Keys["Num5"] = "Numpad5";
    Keys["Num6"] = "Numpad6";
    Keys["Num7"] = "Numpad7";
    Keys["Num8"] = "Numpad8";
    Keys["Num9"] = "Numpad9";
    Keys["NumAdd"] = "NumpadAdd";
    Keys["NumSubtract"] = "NumpadSubtract";
    Keys["NumMultiply"] = "NumpadMultiply";
    Keys["NumDivide"] = "NumpadDivide";
    // NumComma = 'NumpadComma', // not x-browser
    Keys["NumDecimal"] = "NumpadDecimal";
    Keys["Numpad0"] = "Numpad0";
    Keys["Numpad1"] = "Numpad1";
    Keys["Numpad2"] = "Numpad2";
    Keys["Numpad3"] = "Numpad3";
    Keys["Numpad4"] = "Numpad4";
    Keys["Numpad5"] = "Numpad5";
    Keys["Numpad6"] = "Numpad6";
    Keys["Numpad7"] = "Numpad7";
    Keys["Numpad8"] = "Numpad8";
    Keys["Numpad9"] = "Numpad9";
    Keys["NumpadAdd"] = "NumpadAdd";
    Keys["NumpadSubtract"] = "NumpadSubtract";
    Keys["NumpadMultiply"] = "NumpadMultiply";
    Keys["NumpadDivide"] = "NumpadDivide";
    // NumpadComma = 'NumpadComma', // not x-browser
    Keys["NumpadDecimal"] = "NumpadDecimal";
    // MODIFIERS
    Keys["NumLock"] = "NumLock";
    Keys["ShiftLeft"] = "ShiftLeft";
    Keys["ShiftRight"] = "ShiftRight";
    Keys["AltLeft"] = "AltLeft";
    Keys["AltRight"] = "AltRight";
    // NUMBERS
    Keys["Key0"] = "Digit0";
    Keys["Key1"] = "Digit1";
    Keys["Key2"] = "Digit2";
    Keys["Key3"] = "Digit3";
    Keys["Key4"] = "Digit4";
    Keys["Key5"] = "Digit5";
    Keys["Key6"] = "Digit6";
    Keys["Key7"] = "Digit7";
    Keys["Key8"] = "Digit8";
    Keys["Key9"] = "Digit9";
    Keys["Digit0"] = "Digit0";
    Keys["Digit1"] = "Digit1";
    Keys["Digit2"] = "Digit2";
    Keys["Digit3"] = "Digit3";
    Keys["Digit4"] = "Digit4";
    Keys["Digit5"] = "Digit5";
    Keys["Digit6"] = "Digit6";
    Keys["Digit7"] = "Digit7";
    Keys["Digit8"] = "Digit8";
    Keys["Digit9"] = "Digit9";
    // LETTERS
    Keys["A"] = "KeyA";
    Keys["B"] = "KeyB";
    Keys["C"] = "KeyC";
    Keys["D"] = "KeyD";
    Keys["E"] = "KeyE";
    Keys["F"] = "KeyF";
    Keys["G"] = "KeyG";
    Keys["H"] = "KeyH";
    Keys["I"] = "KeyI";
    Keys["J"] = "KeyJ";
    Keys["K"] = "KeyK";
    Keys["L"] = "KeyL";
    Keys["M"] = "KeyM";
    Keys["N"] = "KeyN";
    Keys["O"] = "KeyO";
    Keys["P"] = "KeyP";
    Keys["Q"] = "KeyQ";
    Keys["R"] = "KeyR";
    Keys["S"] = "KeyS";
    Keys["T"] = "KeyT";
    Keys["U"] = "KeyU";
    Keys["V"] = "KeyV";
    Keys["W"] = "KeyW";
    Keys["X"] = "KeyX";
    Keys["Y"] = "KeyY";
    Keys["Z"] = "KeyZ";
    Keys["KeyA"] = "KeyA";
    Keys["KeyB"] = "KeyB";
    Keys["KeyC"] = "KeyC";
    Keys["KeyD"] = "KeyD";
    Keys["KeyE"] = "KeyE";
    Keys["KeyF"] = "KeyF";
    Keys["KeyG"] = "KeyG";
    Keys["KeyH"] = "KeyH";
    Keys["KeyI"] = "KeyI";
    Keys["KeyJ"] = "KeyJ";
    Keys["KeyK"] = "KeyK";
    Keys["KeyL"] = "KeyL";
    Keys["KeyM"] = "KeyM";
    Keys["KeyN"] = "KeyN";
    Keys["KeyO"] = "KeyO";
    Keys["KeyP"] = "KeyP";
    Keys["KeyQ"] = "KeyQ";
    Keys["KeyR"] = "KeyR";
    Keys["KeyS"] = "KeyS";
    Keys["KeyT"] = "KeyT";
    Keys["KeyU"] = "KeyU";
    Keys["KeyV"] = "KeyV";
    Keys["KeyW"] = "KeyW";
    Keys["KeyX"] = "KeyX";
    Keys["KeyY"] = "KeyY";
    Keys["KeyZ"] = "KeyZ";
    // SYMBOLS
    Keys["Semicolon"] = "Semicolon";
    Keys["Quote"] = "Quote";
    Keys["Comma"] = "Comma";
    Keys["Minus"] = "Minus";
    Keys["Period"] = "Period";
    Keys["Slash"] = "Slash";
    Keys["Equal"] = "Equal";
    Keys["BracketLeft"] = "BracketLeft";
    Keys["Backslash"] = "Backslash";
    Keys["BracketRight"] = "BracketRight";
    Keys["Backquote"] = "Backquote";
    // DIRECTIONS
    Keys["Up"] = "ArrowUp";
    Keys["Down"] = "ArrowDown";
    Keys["Left"] = "ArrowLeft";
    Keys["Right"] = "ArrowRight";
    Keys["ArrowUp"] = "ArrowUp";
    Keys["ArrowDown"] = "ArrowDown";
    Keys["ArrowLeft"] = "ArrowLeft";
    Keys["ArrowRight"] = "ArrowRight";
    // OTHER
    Keys["Space"] = "Space";
    Keys["Esc"] = "Escape";
    Keys["Escape"] = "Escape";
})(Keys || (Keys = {}));
/**
 * Event thrown on a game object for a key event
 */
export class KeyEvent extends Events.GameEvent {
    /**
     * @param key  The key responsible for throwing the event
     */
    constructor(key) {
        super();
        this.key = key;
    }
}
/**
 * Provides keyboard support for Excalibur.
 */
export class Keyboard extends Class {
    constructor() {
        super();
        this._keys = [];
        this._keysUp = [];
        this._keysDown = [];
    }
    on(eventName, handler) {
        super.on(eventName, handler);
    }
    /**
     * Initialize Keyboard event listeners
     */
    init(global) {
        if (!global) {
            try {
                // Try and listen to events on top window frame if within an iframe.
                //
                // See https://github.com/excaliburjs/Excalibur/issues/1294
                //
                // Attempt to add an event listener, which triggers a DOMException on
                // cross-origin iframes
                const noop = () => {
                    return;
                };
                window.top.addEventListener('blur', noop);
                window.top.removeEventListener('blur', noop);
                // this will be the same as window if not embedded within an iframe
                global = window.top;
            }
            catch (_a) {
                // fallback to current frame
                global = window;
                Logger.getInstance().warn('Failed to bind to keyboard events to top frame. ' +
                    'If you are trying to embed Excalibur in a cross-origin iframe, keyboard events will not fire.');
            }
        }
        global.addEventListener('blur', () => {
            this._keys.length = 0; // empties array efficiently
        });
        // key up is on window because canvas cannot have focus
        global.addEventListener('keyup', (ev) => {
            const code = ev.code;
            const key = this._keys.indexOf(code);
            this._keys.splice(key, 1);
            this._keysUp.push(code);
            const keyEvent = new KeyEvent(code);
            // alias the old api, we may want to deprecate this in the future
            this.eventDispatcher.emit('up', keyEvent);
            this.eventDispatcher.emit('release', keyEvent);
        });
        // key down is on window because canvas cannot have focus
        global.addEventListener('keydown', (ev) => {
            const code = ev.code;
            if (this._keys.indexOf(code) === -1) {
                this._keys.push(code);
                this._keysDown.push(code);
                const keyEvent = new KeyEvent(code);
                this.eventDispatcher.emit('down', keyEvent);
                this.eventDispatcher.emit('press', keyEvent);
            }
        });
    }
    update() {
        // Reset keysDown and keysUp after update is complete
        this._keysDown.length = 0;
        this._keysUp.length = 0;
        // Emit synthetic "hold" event
        for (let i = 0; i < this._keys.length; i++) {
            this.eventDispatcher.emit('hold', new KeyEvent(this._keys[i]));
        }
    }
    /**
     * Gets list of keys being pressed down
     */
    getKeys() {
        return this._keys;
    }
    /**
     * Tests if a certain key was just pressed this frame. This is cleared at the end of the update frame.
     * @param key Test whether a key was just pressed
     */
    wasPressed(key) {
        return this._keysDown.indexOf(key) > -1;
    }
    /**
     * Tests if a certain key is held down. This is persisted between frames.
     * @param key  Test whether a key is held down
     */
    isHeld(key) {
        return this._keys.indexOf(key) > -1;
    }
    /**
     * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
     * @param key  Test whether a key was just released
     */
    wasReleased(key) {
        return this._keysUp.indexOf(key) > -1;
    }
}
//# sourceMappingURL=Keyboard.js.map