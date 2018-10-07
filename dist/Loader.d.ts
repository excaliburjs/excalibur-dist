import { Promise } from './Promises';
import { Engine } from './Engine';
import { ILoadable } from './Interfaces/ILoadable';
import { ILoader } from './Interfaces/ILoader';
import { Class } from './Class';
/**
 * Pre-loading assets
 *
 * The loader provides a mechanism to preload multiple resources at
 * one time. The loader must be passed to the engine in order to
 * trigger the loading progress bar.
 *
 * The [[Loader]] itself implements [[ILoadable]] so you can load loaders.
 *
 * ## Example: Pre-loading resources for a game
 *
 * ```js
 * // create a loader
 * var loader = new ex.Loader();
 *
 * // create a resource dictionary (best practice is to keep a separate file)
 * var resources = {
 *   TextureGround: new ex.Texture("/images/textures/ground.png"),
 *   SoundDeath: new ex.Sound("/sound/death.wav", "/sound/death.mp3")
 * };
 *
 * // loop through dictionary and add to loader
 * for (var loadable in resources) {
 *   if (resources.hasOwnProperty(loadable)) {
 *     loader.addResource(resources[loadable]);
 *   }
 * }
 *
 * // start game
 * game.start(loader).then(function () {
 *   console.log("Game started!");
 * });
 * ```
 *
 * ## Customize the Loader
 *
 * The loader can be customized to show different, text, logo, background color, and button.
 *
 * ```typescript
 * var loader = new ex.Loader([playerTexture]);
 *
 * // The loaders button text can simply modified using this
 * loader.playButtonText = 'Start the best game ever';
 *
 * // The logo can be changed by inserting a base64 image string here
 *
 * loader.logo = 'data:image/png;base64,iVBORw...';
 * loader.logoWidth = 15;
 * loader.logoHeight = 14;
 *
 * // The background color can be changed like so by supplying a valid CSS color string
 *
 * loader.backgroundColor = 'red'
 * loader.backgroundColor = '#176BAA'
 *
 * // To build a completely new button
 * loader.startButtonFactory = () => {
 *     let myButton = document.createElement('button');
 *     myButton.textContent = 'The best button';
 *     return myButton;
 * };
 *
 * engine.start(loader).then(() => {});
 * ```
 */
export declare class Loader extends Class implements ILoader {
    private _resourceList;
    private _index;
    private _playButtonShown;
    private _resourceCount;
    private _numLoaded;
    private _progressCounts;
    private _totalCounts;
    private _engine;
    logo: string;
    logoWidth: number;
    logoHeight: number;
    backgroundColor: string;
    protected _imageElement: HTMLImageElement;
    protected readonly _image: HTMLImageElement;
    suppressPlayButton: boolean;
    protected _playButtonRootElement: HTMLElement;
    protected _playButtonElement: HTMLButtonElement;
    protected _styleBlock: HTMLStyleElement;
    /** Loads the css from Loader.css */
    protected _playButtonStyles: string;
    protected readonly _playButton: HTMLButtonElement;
    /**
     * Get/set play button text
     */
    playButtonText: string;
    /**
     * Return a html button element for excalibur to use as a play button
     */
    startButtonFactory: () => HTMLButtonElement;
    /**
     * @param loadables  Optionally provide the list of resources you want to load at constructor time
     */
    constructor(loadables?: ILoadable[]);
    wireEngine(engine: Engine): void;
    /**
     * Add a resource to the loader to load
     * @param loadable  Resource to add
     */
    addResource(loadable: ILoadable): void;
    /**
     * Add a list of resources to the loader to load
     * @param loadables  The list of resources to load
     */
    addResources(loadables: ILoadable[]): void;
    /**
     * Returns true if the loader has completely loaded all resources
     */
    isLoaded(): boolean;
    /**
     * Shows the play button and returns a promise that resolves when clicked
     */
    showPlayButton(): Promise<any>;
    hidePlayButton(): void;
    /**
     * Begin loading all of the supplied resources, returning a promise
     * that resolves when loading of all is complete
     */
    load(): Promise<any>;
    /**
     * Loader draw function. Draws the default Excalibur loading screen.
     * Override `logo`, `logoWidth`, `logoHeight` and `backgroundColor` properties
     * to customize the drawing, or just override entire method.
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Perform any calculations or logic in the `update` method. The default `Loader` does not
     * do anything in this method so it is safe to override.
     */
    update(_engine: Engine, _delta: number): void;
    getData: () => any;
    setData: (data: any) => any;
    processData: (data: any) => any;
    onprogress: (e: any) => void;
    oncomplete: () => void;
    onerror: () => void;
}
/**
 * @obsolete Use [[Loader]] instead, this functionality has been made default
 *
 * A [[Loader]] that pauses after loading to allow user
 * to proceed to play the game. Typically you will
 * want to use this loader for iOS to allow sounds
 * to play after loading (Apple Safari requires user
 * interaction to allow sounds, even for games)
 *
 * **Note:** Because Loader is not part of a Scene, you must
 * call `update` and `draw` manually on "child" objects.
 *
 * ## Implementing a Trigger
 *
 * The `PauseAfterLoader` requires an element to act as the trigger button
 * to start the game.
 *
 * For example, let's create an `<a>` tag to be our trigger and call it `tap-to-play`.
 *
 * ```html
 * <div id="wrapper">
 *    <canvas id="game"></canvas>
 *    <a id="tap-to-play" href='javascript:void(0);'>Tap to Play</a>
 * </div>
 * ```
 *
 * We've put it inside a wrapper to position it properly over the game canvas.
 *
 * Now let's add some CSS to style it (insert into `<head>`):
 *
 * ```html
 * <style>
 *     #wrapper {
 *         position: relative;
 *         width: 500px;
 *         height: 500px;
 *     }
 *     #tap-to-play {
 *         display: none;
 *         font-size: 24px;
 *         font-family: sans-serif;
 *         text-align: center;
 *         border: 3px solid white;
 *         position: absolute;
 *         color: white;
 *         width: 200px;
 *         height: 50px;
 *         line-height: 50px;
 *         text-decoration: none;
 *         left: 147px;
 *         top: 80%;
 *     }
 * </style>
 * ```
 *
 * Now we can create a `PauseAfterLoader` with a reference to our trigger button:
 *
 * ```ts
 * var loader = new ex.PauseAfterLoader('tap-to-play', [...]);
 * ```
 *
 * ## Use PauseAfterLoader for iOS
 *
 * The primary use case for pausing before starting the game is to
 * pass Apple's requirement of user interaction. The Web Audio context
 * in Safari is disabled by default until user interaction.
 *
 * Therefore, you can use this snippet to only use PauseAfterLoader when
 * iOS is detected (see [this thread](http://stackoverflow.com/questions/9038625/detect-if-device-is-ios)
 * for more techniques).
 *
 * ```ts
 * var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
 * var loader: ex.Loader = iOS ? new ex.PauseAfterLoader('tap-to-play') : new ex.Loader();
 *
 * loader.addResource(...);
 * ```
 */
export declare class PauseAfterLoader extends Loader {
    private _loadedValue;
    private _waitPromise;
    private _playTrigger;
    constructor(triggerElementId: string, loadables?: ILoadable[]);
    load(): Promise<any>;
    private _handleOnTrigger;
}
