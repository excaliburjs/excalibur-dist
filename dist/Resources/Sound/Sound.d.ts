import { Audio } from '../../Interfaces/Audio';
import { Engine } from '../../Engine';
import { Loadable } from '../../Interfaces/Index';
import { Logger } from '../../Util/Log';
import { Class } from '../../Class';
/**
 * The [[Sound]] object allows games built in Excalibur to load audio
 * components, from soundtracks to sound effects. [[Sound]] is an [[Loadable]]
 * which means it can be passed to a [[Loader]] to pre-load before a game or level.
 */
export declare class Sound extends Class implements Audio, Loadable<AudioBuffer> {
    logger: Logger;
    data: AudioBuffer;
    private _resource;
    /**
     * Indicates whether the clip should loop when complete
     * @param value  Set the looping flag
     */
    set loop(value: boolean);
    get loop(): boolean;
    set volume(value: number);
    get volume(): number;
    get duration(): number | undefined;
    /**
     * Return array of Current AudioInstances playing or being paused
     */
    get instances(): Audio[];
    get path(): string;
    set path(val: string);
    private _loop;
    private _volume;
    private _duration;
    private _isStopped;
    private _isPaused;
    private _tracks;
    private _engine;
    private _wasPlayingOnHidden;
    private _audioContext;
    /**
     * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
     */
    constructor(...paths: string[]);
    isLoaded(): boolean;
    load(): Promise<AudioBuffer>;
    decodeAudio(data: ArrayBuffer): Promise<AudioBuffer>;
    wireEngine(engine: Engine): void;
    /**
     * Returns how many instances of the sound are currently playing
     */
    instanceCount(): number;
    /**
     * Whether or not the sound is playing right now
     */
    isPlaying(): boolean;
    /**
     * Play the sound, returns a promise that resolves when the sound is done playing
     * An optional volume argument can be passed in to play the sound. Max volume is 1.0
     */
    play(volume?: number): Promise<boolean>;
    /**
     * Stop the sound, and do not rewind
     */
    pause(): void;
    /**
     * Stop the sound if it is currently playing and rewind the track. If the sound is not playing, rewinds the track.
     */
    stop(): void;
    /**
     * Get Id of provided AudioInstance in current trackList
     * @param track [[AudioInstance]] which Id is to be given
     */
    getTrackId(track: Audio): number;
    private _resumePlayback;
    /**
     * Starts playback, returns a promise that resolves when playback is complete
     */
    private _startPlayback;
    private _getTrackInstance;
}
