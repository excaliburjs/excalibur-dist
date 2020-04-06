import 'core-js/es/array';
import 'core-js/es/function';
export function polyfill() {
    /* istanbul ignore next */
    if (typeof window === 'undefined') {
        window = {
            audioContext: function () {
                return;
            }
        };
    }
    /* istanbul ignore next */
    if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
        window.requestAnimationFrame =
            window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setInterval(callback, 1000 / 60);
                };
    }
    /* istanbul ignore next */
    if (typeof window !== 'undefined' && !window.cancelAnimationFrame) {
        window.cancelAnimationFrame =
            window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                function () {
                    return;
                };
    }
    /* istanbul ignore next */
    if (typeof window !== 'undefined' && !window.AudioContext) {
        window.AudioContext =
            window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext ||
                window.msAudioContext ||
                window.oAudioContext;
    }
    /* istanbul ignore next */
    if (typeof window !== 'undefined' && !window.devicePixelRatio) {
        window.devicePixelRatio = window.devicePixelRatio || 1;
    }
}
//# sourceMappingURL=Polyfill.js.map