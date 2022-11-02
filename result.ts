import Option, { None, Some } from "./option.ts";

export default class Result<T, E> {
  variant0: E | never;
  variant1: T | never;
  discriminant: ResultType;

  constructor(value: T | E, discriminant: ResultType) {
    if (discriminant === ResultType.Err) {
      this.variant0 = value as E;
      this.variant1 = undefined as never;
    } else {
      this.variant0 = undefined as never;
      this.variant1 = value as T;
    }
    this.discriminant = discriminant;
  }

  *[Symbol.iterator]() {
    if (this.isOk()) {
      yield Some(this.unwrap());
    }

    return None();
  }

  and<U>(result: Result<U, E>): Result<U, E> {
    return this.isErr() ? this : result;
  }

  andThen<U>(callback: (value: T) => Result<U, E>): Result<U, E> {
    return this.isErr() ? this : callback(this.variant1);
  }

  contains(value: T): boolean {
    return this.isOk() && this.variant1 === value;
  }

  containsErr(value: E): boolean {
    return this.isErr() && this.variant0 === value;
  }

  err(): Option<E> {
    return this.isErr() ? Some(this.variant0) : None();
  }

  expect(msg: string): T {
    if (this.isErr()) {
      throw Error(msg);
    }

    return this.variant1;
  }

  expectErr(msg: string): E {
    if (this.isOk()) {
      throw Error(msg);
    }

    return this.variant0;
  }

  flatten<U>(this: Result<Result<U, E>, E>): Result<U, E> {
    return this.andThen((value) => value);
  }

  inspect(callback: (value: T) => void): Result<T, E> {
    this.isOk() && callback(this.variant1);

    return this;
  }

  inspectErr(callback: (value: E) => void) {
    this.isErr() && callback(this.variant0);

    return this;
  }

  // intoErr() {
  //   // TODO
  // }

  // intoOk() {
  //   // TODO
  // }

  // intoErrOrOk() {
  //   // TODO
  // }

  isErr(): this is Err<never, E> {
    return this.discriminant === ResultType.Err;
  }

  isErrAnd(predicate: (value: E) => boolean): boolean {
    return this.isErr() && predicate(this.variant0);
  }

  isOk(): this is Ok<T, never> {
    return this.discriminant === ResultType.Ok;
  }

  isOkAnd(predicate: (value: T) => boolean): boolean {
    return this.isOk() && predicate(this.variant1);
  }

  iter(): Generator<Some<T>, None, Option<T>> {
    return this[Symbol.iterator]();
  }

  map<U>(callback: (value: T) => U): Result<U, E> {
    return this.isOk()
      ? Ok(callback(this.variant1))
      : Err(this.variant0) as Result<U, E>;
  }

  mapErr<F>(callback: (value: E) => F): Result<T, F> {
    return this.isErr()
      ? Err(callback(this.variant0))
      : Ok(this.variant1) as Result<T, F>;
  }

  mapOr<U>(defaultValue: U, callback: (value: T) => U): U {
    return this.isOk() ? callback(this.variant1) : defaultValue;
  }

  mapOrElse<U>(defaultCallback: (error: E) => U, callback: (value: T) => U): U {
    return this.isOk() ? callback(this.variant1) : defaultCallback(this.variant0);
  }

  ok(): Option<T> {
    return this.isOk() ? Some(this.variant1) : None();
  }

  or<F>(result: Result<T, F>): Result<T, F> {
    return this.isOk() ? this : result;
  }

  orElse<F>(callback: (value: E) => Result<T, F>): Result<T, F> {
    return this.isOk() ? this : callback(this.variant0);
  }

  transpose<U, E>(this: Result<Option<U>, E>): Option<Result<U, E>> {
    return this.isErr()
      ? Some(this)
      : (this.unwrap().isSome() ? Some(Ok(this.unwrap().unwrap())) : None());
  }

  unwrap(): T {
    return this.expect(`${this.variant1}`);
  }

  unwrapErr(): E {
    return this.expectErr(`${this.variant0}`);
  }

  unwrapErrUnchecked(): E {
    return this.variant0;
  }

  unwrapOr(defaultValue: T): T {
    return this.isOk() ? this.variant1 : defaultValue;
  }

  unwrapOrElse(callback: () => T): T {
    return this.isOk() ? this.variant1 : callback();
  }

  unwrapUnchecked(): T {
    return this.variant1;
  }
}

export enum ResultType {
  Err,
  Ok,
}

export type Err<T, E> = Result<T, E>;

export function Err<T, E>(value: E): Err<T, E> {
  return new Result<T, E>(value, ResultType.Err);
}

export type Ok<T, E> = Result<T, E>;

export function Ok<T, E>(value: T): Ok<T, E> {
  return new Result<T, E>(value, ResultType.Ok);
}
