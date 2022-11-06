import Option, { None, Some } from "./option.js";
export default class Result<T, E> {
    variant0: E | never;
    variant1: T | never;
    discriminant: ResultType;
    constructor(value: T | E, discriminant: ResultType);
    [Symbol.iterator](): Generator<Some<T>, None, unknown>;
    and<U>(result: Result<U, E>): Result<U, E>;
    andThen<U>(callback: (value: T) => Result<U, E>): Result<U, E>;
    contains(value: T): boolean;
    containsErr(value: E): boolean;
    err(): Option<E>;
    expect(msg: string): T;
    expectErr(msg: string): E;
    flatten<U>(this: Result<Result<U, E>, E>): Result<U, E>;
    inspect(callback: (value: T) => void): Result<T, E>;
    inspectErr(callback: (value: E) => void): this;
    isErr(): this is Err<never, E>;
    isErrAnd(predicate: (value: E) => boolean): boolean;
    isOk(): this is Ok<T, never>;
    isOkAnd(predicate: (value: T) => boolean): boolean;
    iter(): Generator<Some<T>, None, Option<T>>;
    map<U>(callback: (value: T) => U): Result<U, E>;
    mapErr<F>(callback: (value: E) => F): Result<T, F>;
    mapOr<U>(defaultValue: U, callback: (value: T) => U): U;
    mapOrElse<U>(defaultCallback: (error: E) => U, callback: (value: T) => U): U;
    ok(): Option<T>;
    or<F>(result: Result<T, F>): Result<T, F>;
    orElse<F>(callback: (value: E) => Result<T, F>): Result<T, F>;
    transpose<U, E>(this: Result<Option<U>, E>): Option<Result<U, E>>;
    unwrap(): T;
    unwrapErr(): E;
    unwrapErrUnchecked(): E;
    unwrapOr(defaultValue: T): T;
    unwrapOrElse(callback: (error: E) => T): T;
    unwrapUnchecked(): T;
}
export declare enum ResultType {
    Err = 0,
    Ok = 1
}
export declare type Err<T, E> = Result<T, E>;
export declare function Err<T, E>(value: E): Err<T, E>;
export declare type Ok<T, E> = Result<T, E>;
export declare function Ok<T, E>(value: T): Ok<T, E>;
