export declare class WebAudio {
    private static _unlocked;
    /**
     * Play an empty sound to unlock Safari WebAudio context. Call this function
     * right after a user interaction event. Typically used by [[PauseAfterLoader]]
     * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     */
    static unlock(): void;
    static isUnlocked(): boolean;
}