import { AudioContextFactory } from '../Resources/Sound/AudioContext';
import { Logger } from './Log';
/**
 * Patch for detecting legacy web audio in browsers
 * @internal
 * @param source
 */
function isLegacyWebAudioSource(source) {
    return !!source.playbackState;
}
export class WebAudio {
    /**
     * Play an empty sound to unlock Safari WebAudio context. Call this function
     * right after a user interaction event.
     * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     */
    static unlock() {
        const promise = new Promise((resolve, reject) => {
            if (WebAudio._UNLOCKED || !AudioContextFactory.create()) {
                return resolve(true);
            }
            const unlockTimeoutTimer = setTimeout(() => {
                Logger.getInstance().warn('Excalibur was unable to unlock the audio context, audio probably will not play in this browser.');
                resolve();
            }, 200);
            const audioContext = AudioContextFactory.create();
            audioContext.resume().then(() => {
                // create empty buffer and play it
                const buffer = audioContext.createBuffer(1, 1, 22050);
                const source = audioContext.createBufferSource();
                let ended = false;
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.onended = () => (ended = true);
                source.start(0);
                // by checking the play state after some time, we know if we're really unlocked
                setTimeout(() => {
                    if (isLegacyWebAudioSource(source)) {
                        if (source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE) {
                            WebAudio._UNLOCKED = true;
                        }
                    }
                    else {
                        if (audioContext.currentTime > 0 || ended) {
                            WebAudio._UNLOCKED = true;
                        }
                    }
                }, 0);
                clearTimeout(unlockTimeoutTimer);
                resolve();
            }, () => {
                reject();
            });
        });
        return promise;
    }
    static isUnlocked() {
        return this._UNLOCKED;
    }
}
WebAudio._UNLOCKED = false;
//# sourceMappingURL=WebAudio.js.map