/**
 * Flags is a feature flag implementation for Excalibur. They can only be operated **before [[Engine]] construction**
 * after which they are frozen and are read-only.
 *
 * Flags are used to enable experimental or preview features in Excalibur.
 */
export class Flags {
    /**
     * Freeze all flag modifications making them readonly
     */
    static freeze() {
        Flags._FROZEN = true;
    }
    /**
     * Resets internal flag state, not meant to be called by users. Only used for testing.
     *
     * Calling this in your game is UNSUPPORTED
     * @internal
     */
    static _reset() {
        Flags._FROZEN = false;
        Flags._FLAGS = {};
    }
    /**
     * Enable a specific feature flag by name. **Note: can only be set before [[Engine]] constructor time**
     * @param flagName
     */
    static enable(flagName) {
        if (this._FROZEN) {
            throw Error('Feature flags can only be enabled before Engine constructor time');
        }
        Flags._FLAGS[flagName] = true;
    }
    /**
     * Disable a specific feature flag by name. **Note: can only be set before [[Engine]] constructor time**
     * @param flagName
     */
    static disable(flagName) {
        if (this._FROZEN) {
            throw Error('Feature flags can only be disabled before Engine constructor time');
        }
        Flags._FLAGS[flagName] = false;
    }
    /**
     * Check if a flag is enabled. If the flag is disabled or does not exist `false` is returned
     * @param flagName
     */
    static isEnabled(flagName) {
        return !!Flags._FLAGS[flagName];
    }
    /**
     * Show a list of currently known flags
     */
    static show() {
        return Object.keys(Flags._FLAGS);
    }
}
Flags._FROZEN = false;
Flags._FLAGS = {};
//# sourceMappingURL=Flags.js.map