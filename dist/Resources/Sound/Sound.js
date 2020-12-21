var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ExResponse } from '../../Interfaces/AudioImplementation';
import { Resource } from '../Resource';
import { WebAudioInstance } from './WebAudioInstance';
import { AudioContextFactory } from './AudioContext';
import { NativeSoundEvent, NativeSoundProcessedEvent } from '../../Events/MediaEvents';
import { canPlayFile } from '../../Util/Sound';
import { Logger } from '../../Util/Log';
import { Class } from '../../Class';
/**
 * The [[Sound]] object allows games built in Excalibur to load audio
 * components, from soundtracks to sound effects. [[Sound]] is an [[Loadable]]
 * which means it can be passed to a [[Loader]] to pre-load before a game or level.
 */
export class Sound extends Class {
    /**
     * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
     */
    constructor(...paths) {
        super();
        this.logger = Logger.getInstance();
        this._loop = false;
        this._volume = 1;
        this._duration = undefined;
        this._isStopped = false;
        this._isPaused = false;
        this._tracks = [];
        this._wasPlayingOnHidden = false;
        this._audioContext = AudioContextFactory.create();
        this._resource = new Resource('', ExResponse.type.arraybuffer);
        /** Chrome : MP3, WAV, Ogg
         * Firefox : WAV, Ogg,
         * IE : MP3, WAV coming soon
         * Safari MP3, WAV, Ogg
         */
        for (const path of paths) {
            if (canPlayFile(path)) {
                this.path = path;
                break;
            }
        }
        if (!this.path) {
            this.logger.warn('This browser does not support any of the audio files specified:', paths.join(', '));
            this.logger.warn('Attempting to use', paths[0]);
            this.path = paths[0]; // select the first specified
        }
    }
    /**
     * Indicates whether the clip should loop when complete
     * @param value  Set the looping flag
     */
    set loop(value) {
        this._loop = value;
        for (const track of this._tracks) {
            track.loop = this._loop;
        }
        this.logger.debug('Set loop for all instances of sound', this.path, 'to', this._loop);
    }
    get loop() {
        return this._loop;
    }
    set volume(value) {
        this._volume = value;
        for (const track of this._tracks) {
            track.volume = this._volume;
        }
        this.emit('volumechange', new NativeSoundEvent(this));
        this.logger.debug('Set loop for all instances of sound', this.path, 'to', this._volume);
    }
    get volume() {
        return this._volume;
    }
    get duration() {
        return this._duration;
    }
    /**
     * Return array of Current AudioInstances playing or being paused
     */
    get instances() {
        return this._tracks;
    }
    get path() {
        return this._resource.path;
    }
    set path(val) {
        this._resource.path = val;
    }
    isLoaded() {
        return !!this.data;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data) {
                return this.data;
            }
            const arraybuffer = yield this._resource.load();
            const audiobuffer = yield this.decodeAudio(arraybuffer.slice(0));
            this._duration = typeof audiobuffer === 'object' ? audiobuffer.duration : undefined;
            this.emit('processed', new NativeSoundProcessedEvent(this, audiobuffer));
            return this.data = audiobuffer;
        });
    }
    decodeAudio(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._audioContext.decodeAudioData(data.slice(0));
            }
            catch (e) {
                this.logger.error('Unable to decode ' +
                    ' this browser may not fully support this format, or the file may be corrupt, ' +
                    'if this is an mp3 try removing id3 tags and album art from the file.');
                return yield Promise.reject();
            }
        });
    }
    wireEngine(engine) {
        if (engine) {
            this._engine = engine;
            this._engine.on('hidden', () => {
                if (engine.pauseAudioWhenHidden && this.isPlaying()) {
                    this._wasPlayingOnHidden = true;
                    this.pause();
                }
            });
            this._engine.on('visible', () => {
                if (engine.pauseAudioWhenHidden && this._wasPlayingOnHidden) {
                    this.play();
                    this._wasPlayingOnHidden = false;
                }
            });
            this._engine.on('start', () => {
                this._isStopped = false;
            });
            this._engine.on('stop', () => {
                this.stop();
                this._isStopped = true;
            });
        }
    }
    /**
     * Returns how many instances of the sound are currently playing
     */
    instanceCount() {
        return this._tracks.length;
    }
    /**
     * Whether or not the sound is playing right now
     */
    isPlaying() {
        return this._tracks.some((t) => t.isPlaying());
    }
    /**
     * Play the sound, returns a promise that resolves when the sound is done playing
     * An optional volume argument can be passed in to play the sound. Max volume is 1.0
     */
    play(volume) {
        if (!this.isLoaded()) {
            this.logger.warn('Cannot start playing. Resource', this.path, 'is not loaded yet');
            return Promise.resolve(true);
        }
        if (this._isStopped) {
            this.logger.warn('Cannot start playing. Engine is in a stopped state.');
            return Promise.resolve(false);
        }
        this.volume = volume || this.volume;
        if (this._isPaused) {
            return this._resumePlayback();
        }
        else {
            return this._startPlayback();
        }
    }
    /**
     * Stop the sound, and do not rewind
     */
    pause() {
        if (!this.isPlaying()) {
            return;
        }
        for (const track of this._tracks) {
            track.pause();
        }
        this._isPaused = true;
        this.emit('pause', new NativeSoundEvent(this));
        this.logger.debug('Paused all instances of sound', this.path);
    }
    /**
     * Stop the sound if it is currently playing and rewind the track. If the sound is not playing, rewinds the track.
     */
    stop() {
        for (const track of this._tracks) {
            track.stop();
        }
        this.emit('stop', new NativeSoundEvent(this));
        this._isPaused = false;
        this._tracks.length = 0;
        this.logger.debug('Stopped all instances of sound', this.path);
    }
    /**
     * Get Id of provided AudioInstance in current trackList
     * @param track [[AudioInstance]] which Id is to be given
     */
    getTrackId(track) {
        return this._tracks.indexOf(track);
    }
    _resumePlayback() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isPaused) {
                const resumed = [];
                // ensure we resume *current* tracks (if paused)
                for (const track of this._tracks) {
                    resumed.push(track.play());
                }
                this._isPaused = false;
                this.emit('resume', new NativeSoundEvent(this));
                this.logger.debug('Resuming paused instances for sound', this.path, this._tracks);
                // resolve when resumed tracks are done
                yield Promise.all(resumed);
            }
            return true;
        });
    }
    /**
     * Starts playback, returns a promise that resolves when playback is complete
     */
    _startPlayback() {
        return __awaiter(this, void 0, void 0, function* () {
            const track = yield this._getTrackInstance(this.data);
            const complete = yield track.play(() => {
                this.emit('playbackstart', new NativeSoundEvent(this, track));
                this.logger.debug('Playing new instance for sound', this.path);
            });
            // when done, remove track
            this.emit('playbackend', new NativeSoundEvent(this, track));
            this._tracks.splice(this.getTrackId(track), 1);
            return complete;
        });
    }
    _getTrackInstance(data) {
        const newTrack = new WebAudioInstance(data);
        newTrack.loop = this.loop;
        newTrack.volume = this.volume;
        newTrack.duration = this.duration;
        this._tracks.push(newTrack);
        return newTrack;
    }
}
//# sourceMappingURL=Sound.js.map