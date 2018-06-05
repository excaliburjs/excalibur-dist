/**
 * Obsolete decorator options
 */
export interface IObsoleteOptions {
    message?: string;
    alternateMethod?: string;
}
/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
export declare function obsolete(options?: IObsoleteOptions): (target: any, property: string, descriptor: PropertyDescriptor) => any;
