export interface NativeEventable {
    addEventListener(name: string, handler: (...any: any[]) => any): any;
    removeEventListener(name: string, handler: (...any: any[]) => any): any;
}
export declare class BrowserComponent<T extends NativeEventable> {
    nativeComponet: T;
    private _paused;
    private _nativeHandlers;
    on(eventName: string, handler: (evt: any) => void): void;
    off(eventName: string, handler?: (event: any) => void): void;
    private _decorate;
    pause(): void;
    resume(): void;
    clear(): void;
    constructor(nativeComponet: T);
}
export declare class BrowserEvents {
    private _windowGlobal;
    private _documentGlobal;
    private _windowComponent;
    private _documentComponent;
    constructor(_windowGlobal: Window, _documentGlobal: Document);
    readonly window: BrowserComponent<Window>;
    readonly document: BrowserComponent<Document>;
    pause(): void;
    resume(): void;
    clear(): void;
}
