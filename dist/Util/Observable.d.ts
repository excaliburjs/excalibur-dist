export interface Message<T> {
    type: string;
    data: T;
}
export interface Observer<T> {
    notify(message: T): void;
}
export declare type MaybeObserver<T> = Partial<Observer<T>>;
export declare class Observable<T> {
    observers: Observer<T>[];
    register(observer: Observer<T>): void;
    unregister(observer: Observer<T>): void;
    notifyAll(message: T): void;
}
