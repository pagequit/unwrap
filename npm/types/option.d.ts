import Result from "./result.js";
export default class Option<T> {
    private value;
    discriminant: OptionType;
    constructor(value: T, type: OptionType);
    [Symbol.iterator](): Generator<this, None, unknown>;
    and<U>(option: Option<U>): Option<U>;
    andThen<U>(callback: (value: T) => Option<U>): Option<U>;
    contains(value: T): boolean;
    expect(msg: string): T;
    filter(predicate: (value: T) => boolean): Option<T>;
    flatten<U>(this: Option<Option<U>>): Option<U>;
    getOrInsert(value: T): T;
    getOrInsertWith(callback: () => T): T;
    insert(value: T): T;
    inspect(callback: (value: T) => void): Option<T>;
    isNone(): this is None;
    isSome(): this is Some<T>;
    isSomeAnd(predicate: (value: T) => boolean): boolean;
    iter(): Generator<this, None, Option<T>>;
    map<U>(callback: (value: T) => U): Option<U>;
    mapOr<U>(defaultValue: U, callback: (value: T) => U): U;
    mapOrElse<U>(defaultCallback: () => U, callback: (value: T) => U): U;
    okOr<E>(err: E): Result<T, E>;
    okOrElse<E>(callback: () => E): Result<T, E>;
    or(option: Option<T>): Option<T>;
    orElse(callback: () => Option<T>): Option<T>;
    replace(value: T): Option<T>;
    take(): Option<T>;
    transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E>;
    unwrap(): T;
    unwrapOr(defaultValue: T): T;
    unwrapOrElse(callback: () => T): T;
    unwrapUnchecked(): T;
    unzip<U, V>(this: Option<[U, V]>): [Option<U>, Option<V>];
    xor(option: Option<T>): Option<T>;
    zip<U>(other: Option<U>): Option<[T, U]>;
    zipWith<U, R>(other: Option<U>, callback: (value: T, otherValue: U) => R): Option<R>;
}
export declare enum OptionType {
    Some = 0,
    None = 1
}
export declare type None = Option<never>;
export declare function None(): None;
export declare type Some<T> = Option<T>;
export declare function Some<T>(value: T): Some<T>;
