var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Color } from './Drawing/Color';
import { WebAudio } from './Util/WebAudio';
import { Class } from './Class';
import * as DrawUtil from './Util/DrawUtil';
import logoImg from './Loader.logo.png';
import loaderCss from './Loader.css';
import { clamp, delay } from './Util/Util';
/**
 * Pre-loading assets
 *
 * The loader provides a mechanism to preload multiple resources at
 * one time. The loader must be passed to the engine in order to
 * trigger the loading progress bar.
 *
 * The [[Loader]] itself implements [[Loadable]] so you can load loaders.
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
 * const loader = new ex.Loader([playerTexture]);
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
export class Loader extends Class {
    /**
     * @param loadables  Optionally provide the list of resources you want to load at constructor time
     */
    constructor(loadables) {
        super();
        this._resourceList = [];
        this._index = 0;
        this._playButtonShown = false;
        this._resourceCount = 0;
        this._numLoaded = 0;
        this._progressCounts = {};
        this._totalCounts = {};
        // logo drawing stuff
        // base64 string encoding of the excalibur logo (logo-white.png)
        this.logo = logoImg;
        this.logoWidth = 468;
        this.logoHeight = 118;
        /**
         * Gets or sets the color of the loading bar, default is [[Color.White]]
         */
        this.loadingBarColor = Color.White;
        /**
         * Gets or sets the background color of the loader as a hex string
         */
        this.backgroundColor = '#176BAA';
        this.suppressPlayButton = false;
        /** Loads the css from Loader.css */
        this._playButtonStyles = loaderCss.toString();
        /**
         * Get/set play button text
         */
        this.playButtonText = 'Play game';
        /**
         * Return a html button element for excalibur to use as a play button
         */
        this.startButtonFactory = () => {
            const buttonElement = document.createElement('button');
            buttonElement.id = 'excalibur-play';
            buttonElement.textContent = this.playButtonText;
            buttonElement.style.display = 'none';
            return buttonElement;
        };
        if (loadables) {
            this.addResources(loadables);
        }
    }
    get _image() {
        if (!this._imageElement) {
            this._imageElement = new Image();
            this._imageElement.src = this.logo;
        }
        return this._imageElement;
    }
    get playButtonRootElement() {
        return this._playButtonRootElement;
    }
    get playButtonElement() {
        return this._playButtonElement;
    }
    get _playButton() {
        if (!this._playButtonRootElement) {
            this._playButtonRootElement = document.createElement('div');
            this._playButtonRootElement.id = 'excalibur-play-root';
            this._playButtonRootElement.style.position = 'absolute';
            document.body.appendChild(this._playButtonRootElement);
        }
        if (!this._styleBlock) {
            this._styleBlock = document.createElement('style');
            this._styleBlock.textContent = this._playButtonStyles;
            document.head.appendChild(this._styleBlock);
        }
        if (!this._playButtonElement) {
            this._playButtonElement = this.startButtonFactory();
            this._playButtonRootElement.appendChild(this._playButtonElement);
        }
        return this._playButtonElement;
    }
    wireEngine(engine) {
        this._engine = engine;
    }
    /**
     * Add a resource to the loader to load
     * @param loadable  Resource to add
     */
    addResource(loadable) {
        const key = this._index++;
        this._resourceList.push(loadable);
        this._progressCounts[key] = 0;
        this._totalCounts[key] = 1;
        this._resourceCount++;
    }
    /**
     * Add a list of resources to the loader to load
     * @param loadables  The list of resources to load
     */
    addResources(loadables) {
        let i = 0;
        const len = loadables.length;
        for (i; i < len; i++) {
            this.addResource(loadables[i]);
        }
    }
    /**
     * Returns true if the loader has completely loaded all resources
     */
    isLoaded() {
        return this._numLoaded === this._resourceCount;
    }
    /**
     * Shows the play button and returns a promise that resolves when clicked
     */
    showPlayButton() {
        if (this.suppressPlayButton) {
            return Promise.resolve();
        }
        else {
            this._playButtonShown = true;
            this._playButton.style.display = 'block';
            const promise = new Promise((resolve) => {
                this._playButton.addEventListener('click', () => resolve());
                this._playButton.addEventListener('touchend', () => resolve());
                this._playButton.addEventListener('pointerup', () => resolve());
            });
            return promise;
        }
    }
    hidePlayButton() {
        this._playButtonShown = false;
        this._playButton.style.display = 'none';
    }
    /**
     * Clean up generated elements for the loader
     */
    dispose() {
        if (this._playButtonRootElement.parentElement) {
            this._playButtonRootElement.removeChild(this._playButtonElement);
            document.body.removeChild(this._playButtonRootElement);
            document.head.removeChild(this._styleBlock);
            this._playButtonRootElement = null;
            this._playButtonElement = null;
            this._styleBlock = null;
        }
    }
    update(_engine, _delta) {
        // override me
    }
    /**
     * Begin loading all of the supplied resources, returning a promise
     * that resolves when loading of all is complete
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this._resourceList.map(r => r.load().finally(() => {
                // capture progress
                this._numLoaded++;
            })));
            // short delay in showing the button for aesthetics
            yield delay(200);
            yield this.showPlayButton();
            // Unlock browser AudioContext in after user gesture
            // See: https://github.com/excaliburjs/Excalibur/issues/262
            // See: https://github.com/excaliburjs/Excalibur/issues/1031
            yield WebAudio.unlock();
            this.hidePlayButton();
            return this.data = this._resourceList;
        });
    }
    markResourceComplete() {
        this._numLoaded++;
    }
    /**
     * Returns the progess of the loader as a number between [0, 1] inclusive.
     */
    get progress() {
        return this._resourceCount > 0 ? clamp(this._numLoaded, 0, this._resourceCount) / this._resourceCount : 1;
    }
    /**
     * Loader draw function. Draws the default Excalibur loading screen.
     * Override `logo`, `logoWidth`, `logoHeight` and `backgroundColor` properties
     * to customize the drawing, or just override entire method.
     */
    draw(ctx) {
        const canvasHeight = this._engine.canvasHeight / this._engine.pixelRatio;
        const canvasWidth = this._engine.canvasWidth / this._engine.pixelRatio;
        if (this._playButtonRootElement) {
            const left = ctx.canvas.offsetLeft;
            const top = ctx.canvas.offsetTop;
            const buttonWidth = this._playButton.clientWidth;
            const buttonHeight = this._playButton.clientHeight;
            if (this.playButtonPosition) {
                this._playButtonRootElement.style.left = `${this.playButtonPosition.x}px`;
                this._playButtonRootElement.style.top = `${this.playButtonPosition.y}px`;
            }
            else {
                this._playButtonRootElement.style.left = `${left + canvasWidth / 2 - buttonWidth / 2}px`;
                this._playButtonRootElement.style.top = `${top + canvasHeight / 2 - buttonHeight / 2 + 100}px`;
            }
        }
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        let logoY = canvasHeight / 2;
        const width = Math.min(this.logoWidth, canvasWidth * 0.75);
        let logoX = canvasWidth / 2 - width / 2;
        if (this.logoPosition) {
            logoX = this.logoPosition.x;
            logoY = this.logoPosition.y;
        }
        const imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor
        const oldAntialias = this._engine.getAntialiasing();
        this._engine.setAntialiasing(true);
        if (!this.logoPosition) {
            ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, logoX, logoY - imageHeight - 20, width, imageHeight);
        }
        else {
            ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, logoX, logoY, width, imageHeight);
        }
        // loading box
        if (!this.suppressPlayButton && this._playButtonShown) {
            this._engine.setAntialiasing(oldAntialias);
            return;
        }
        let loadingX = logoX;
        let loadingY = logoY;
        if (this.loadingBarPosition) {
            loadingX = this.loadingBarPosition.x;
            loadingY = this.loadingBarPosition.y;
        }
        ctx.lineWidth = 2;
        DrawUtil.roundRect(ctx, loadingX, loadingY, width, 20, 10, this.loadingBarColor);
        const progress = width * this.progress;
        const margin = 5;
        const progressWidth = progress - margin * 2;
        const height = 20 - margin * 2;
        DrawUtil.roundRect(ctx, loadingX + margin, loadingY + margin, progressWidth > 10 ? progressWidth : 10, height, 5, null, this.loadingBarColor);
        this._engine.setAntialiasing(oldAntialias);
    }
}
//# sourceMappingURL=Loader.js.map