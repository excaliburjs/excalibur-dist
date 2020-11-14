/**
 * Internal class used to build instances of AudioContext
 */
/* istanbul ignore next */
export class AudioContextFactory {
    static create() {
        if (!this._INSTANCE) {
            if (window.AudioContext || window.webkitAudioContext) {
                this._INSTANCE = new window.AudioContext();
            }
        }
        return this._INSTANCE;
    }
}
AudioContextFactory._INSTANCE = null;
//# sourceMappingURL=AudioContext.js.map