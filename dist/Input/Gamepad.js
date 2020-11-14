import { Class } from './../Class';
import { GamepadConnectEvent, GamepadDisconnectEvent, GamepadButtonEvent, GamepadAxisEvent } from '../Events';
/**
 * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
 * to provide controller support for your games.
 */
export class Gamepads extends Class {
    constructor() {
        super();
        /**
         * Whether or not to poll for Gamepad input (default: `false`)
         */
        this.enabled = false;
        /**
         * Whether or not Gamepad API is supported
         */
        this.supported = !!navigator.getGamepads;
        this._gamePadTimeStamps = [0, 0, 0, 0];
        this._oldPads = [];
        this._pads = [];
        this._initSuccess = false;
        this._navigator = navigator;
        this._minimumConfiguration = null;
    }
    init() {
        if (!this.supported) {
            return;
        }
        if (this._initSuccess) {
            return;
        }
        // In Chrome, this will return 4 undefined items until a button is pressed
        // In FF, this will not return any items until a button is pressed
        this._oldPads = this._clonePads(this._navigator.getGamepads());
        if (this._oldPads.length && this._oldPads[0]) {
            this._initSuccess = true;
        }
    }
    /**
     * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
     * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
     * all other controllers with more axis or buttons are valid as well. If no minimum
     * configuration is set all pads are valid.
     */
    setMinimumGamepadConfiguration(config) {
        this._enableAndUpdate(); // if config is used, implicitly enable
        this._minimumConfiguration = config;
    }
    /**
     * When implicitly enabled, set the enabled flag and run an update so information is updated
     */
    _enableAndUpdate() {
        if (!this.enabled) {
            this.enabled = true;
            this.update();
        }
    }
    /**
     * Checks a navigator gamepad against the minimum configuration if present.
     */
    _isGamepadValid(pad) {
        if (!this._minimumConfiguration) {
            return true;
        }
        if (!pad) {
            return false;
        }
        const axesLength = pad.axes.filter((value) => {
            return typeof value !== undefined;
        }).length;
        const buttonLength = pad.buttons.filter((value) => {
            return typeof value !== undefined;
        }).length;
        return axesLength >= this._minimumConfiguration.axis && buttonLength >= this._minimumConfiguration.buttons && pad.connected;
    }
    on(eventName, handler) {
        this._enableAndUpdate(); // implicitly enable
        super.on(eventName, handler);
    }
    off(eventName, handler) {
        this._enableAndUpdate(); // implicitly enable
        super.off(eventName, handler);
    }
    /**
     * Updates Gamepad state and publishes Gamepad events
     */
    update() {
        if (!this.enabled || !this.supported) {
            return;
        }
        this.init();
        const gamepads = this._navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (!gamepads[i]) {
                const gamepad = this.at(i);
                // If was connected, but now isn't emit the disconnect event
                if (gamepad.connected) {
                    this.eventDispatcher.emit('disconnect', new GamepadDisconnectEvent(i, gamepad));
                }
                // Reset connection status
                gamepad.connected = false;
                continue;
            }
            else {
                if (!this.at(i).connected && this._isGamepadValid(gamepads[i])) {
                    this.eventDispatcher.emit('connect', new GamepadConnectEvent(i, this.at(i)));
                }
                // Set connection status
                this.at(i).connected = true;
            }
            // Only supported in Chrome
            if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
                continue;
            }
            this._gamePadTimeStamps[i] = gamepads[i].timestamp;
            // Add reference to navigator gamepad
            this.at(i).navigatorGamepad = gamepads[i];
            // Buttons
            let b, bi, a, ai, value;
            for (b in Buttons) {
                bi = Buttons[b];
                if (typeof bi === 'number') {
                    if (gamepads[i].buttons[bi]) {
                        value = gamepads[i].buttons[bi].value;
                        if (value !== this._oldPads[i].getButton(bi)) {
                            if (gamepads[i].buttons[bi].pressed) {
                                this.at(i).updateButton(bi, value);
                                this.at(i).eventDispatcher.emit('button', new GamepadButtonEvent(bi, value, this.at(i)));
                            }
                            else {
                                this.at(i).updateButton(bi, 0);
                            }
                        }
                    }
                }
            }
            // Axes
            for (a in Axes) {
                ai = Axes[a];
                if (typeof ai === 'number') {
                    value = gamepads[i].axes[ai];
                    if (value !== this._oldPads[i].getAxes(ai)) {
                        this.at(i).updateAxes(ai, value);
                        this.at(i).eventDispatcher.emit('axis', new GamepadAxisEvent(ai, value, this.at(i)));
                    }
                }
            }
            this._oldPads[i] = this._clonePad(gamepads[i]);
        }
    }
    /**
     * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
     */
    at(index) {
        this._enableAndUpdate(); // implicitly enable gamepads when at() is called
        if (index >= this._pads.length) {
            // Ensure there is a pad to retrieve
            for (let i = this._pads.length - 1, max = index; i < max; i++) {
                this._pads.push(new Gamepad());
                this._oldPads.push(new Gamepad());
            }
        }
        return this._pads[index];
    }
    /**
     * Returns a list of all valid gamepads that meet the minimum configuration requirement.
     */
    getValidGamepads() {
        this._enableAndUpdate();
        const result = [];
        for (let i = 0; i < this._pads.length; i++) {
            if (this._isGamepadValid(this.at(i).navigatorGamepad) && this.at(i).connected) {
                result.push(this.at(i));
            }
        }
        return result;
    }
    /**
     * Gets the number of connected gamepads
     */
    count() {
        return this._pads.filter((p) => p.connected).length;
    }
    _clonePads(pads) {
        const arr = [];
        for (let i = 0, len = pads.length; i < len; i++) {
            arr.push(this._clonePad(pads[i]));
        }
        return arr;
    }
    /**
     * Fastest way to clone a known object is to do it yourself
     */
    _clonePad(pad) {
        let i, len;
        const clonedPad = new Gamepad();
        if (!pad) {
            return clonedPad;
        }
        for (i = 0, len = pad.buttons.length; i < len; i++) {
            if (pad.buttons[i]) {
                clonedPad.updateButton(i, pad.buttons[i].value);
            }
        }
        for (i = 0, len = pad.axes.length; i < len; i++) {
            clonedPad.updateAxes(i, pad.axes[i]);
        }
        return clonedPad;
    }
}
/**
 * The minimum value an axis has to move before considering it a change
 */
Gamepads.MinAxisMoveThreshold = 0.05;
/**
 * Gamepad holds state information for a connected controller. See [[Gamepads]]
 * for more information on handling controller input.
 */
export class Gamepad extends Class {
    constructor() {
        super();
        this.connected = false;
        this._buttons = new Array(16);
        this._axes = new Array(4);
        for (let i = 0; i < this._buttons.length; i++) {
            this._buttons[i] = 0;
        }
        for (let i = 0; i < this._axes.length; i++) {
            this._axes[i] = 0;
        }
    }
    /**
     * Whether or not the given button is pressed
     * @param button     The button to query
     * @param threshold  The threshold over which the button is considered to be pressed
     */
    isButtonPressed(button, threshold = 1) {
        return this._buttons[button] >= threshold;
    }
    /**
     * Gets the given button value between 0 and 1
     */
    getButton(button) {
        return this._buttons[button];
    }
    /**
     * Gets the given axis value between -1 and 1. Values below
     * [[MinAxisMoveThreshold]] are considered 0.
     */
    getAxes(axes) {
        const value = this._axes[axes];
        if (Math.abs(value) < Gamepads.MinAxisMoveThreshold) {
            return 0;
        }
        else {
            return value;
        }
    }
    updateButton(buttonIndex, value) {
        this._buttons[buttonIndex] = value;
    }
    updateAxes(axesIndex, value) {
        this._axes[axesIndex] = value;
    }
}
/**
 * Gamepad Buttons enumeration
 */
export var Buttons;
(function (Buttons) {
    /**
     * Face 1 button (e.g. A)
     */
    Buttons[Buttons["Face1"] = 0] = "Face1";
    /**
     * Face 2 button (e.g. B)
     */
    Buttons[Buttons["Face2"] = 1] = "Face2";
    /**
     * Face 3 button (e.g. X)
     */
    Buttons[Buttons["Face3"] = 2] = "Face3";
    /**
     * Face 4 button (e.g. Y)
     */
    Buttons[Buttons["Face4"] = 3] = "Face4";
    /**
     * Left bumper button
     */
    Buttons[Buttons["LeftBumper"] = 4] = "LeftBumper";
    /**
     * Right bumper button
     */
    Buttons[Buttons["RightBumper"] = 5] = "RightBumper";
    /**
     * Left trigger button
     */
    Buttons[Buttons["LeftTrigger"] = 6] = "LeftTrigger";
    /**
     * Right trigger button
     */
    Buttons[Buttons["RightTrigger"] = 7] = "RightTrigger";
    /**
     * Select button
     */
    Buttons[Buttons["Select"] = 8] = "Select";
    /**
     * Start button
     */
    Buttons[Buttons["Start"] = 9] = "Start";
    /**
     * Left analog stick press (e.g. L3)
     */
    Buttons[Buttons["LeftStick"] = 10] = "LeftStick";
    /**
     * Right analog stick press (e.g. R3)
     */
    Buttons[Buttons["RightStick"] = 11] = "RightStick";
    /**
     * D-pad up
     */
    Buttons[Buttons["DpadUp"] = 12] = "DpadUp";
    /**
     * D-pad down
     */
    Buttons[Buttons["DpadDown"] = 13] = "DpadDown";
    /**
     * D-pad left
     */
    Buttons[Buttons["DpadLeft"] = 14] = "DpadLeft";
    /**
     * D-pad right
     */
    Buttons[Buttons["DpadRight"] = 15] = "DpadRight";
})(Buttons || (Buttons = {}));
/**
 * Gamepad Axes enumeration
 */
export var Axes;
(function (Axes) {
    /**
     * Left analogue stick X direction
     */
    Axes[Axes["LeftStickX"] = 0] = "LeftStickX";
    /**
     * Left analogue stick Y direction
     */
    Axes[Axes["LeftStickY"] = 1] = "LeftStickY";
    /**
     * Right analogue stick X direction
     */
    Axes[Axes["RightStickX"] = 2] = "RightStickX";
    /**
     * Right analogue stick Y direction
     */
    Axes[Axes["RightStickY"] = 3] = "RightStickY";
})(Axes || (Axes = {}));
//# sourceMappingURL=Gamepad.js.map