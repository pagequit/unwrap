import Option, { None, Some } from "./option.ts";

export default class Result<T, E> {
  value: T | E;
  discriminant: ResultType;

  constructor(value: T | E, discriminant: ResultType) {
    this.value = value;
    this.discriminant = discriminant;
  }

  *[Symbol.iterator]() {
    if (this.isOk()) {
      yield Some(this.value);
    }
  }

  and<U>(result: Result<U, E>): Result<U, E> {
    return this.isErr() ? this : result;
  }

  andThen<U>(callback: (value: T) => Result<U, E>): Result<U, E> {
    return this.isErr() ? this : callback(this.value as T);
  }

  contains(value: T): boolean {
    return this.isOk() && this.value === value;
  }

  containsErr(value: E): boolean {
    return this.isErr() && this.value === value;
  }

  err(): Option<E> {
    return this.isErr() ? Some(this.value) : None();
  }

  expect(msg: string): T {
    if (this.isErr()) {
      throw Error(msg);
    }

    return this.value as T;
  }

  expectErr(msg: string): E {
    if (this.isOk()) {
      throw Error(msg);
    }

    return this.value as E;
  }

  flatten<U>(this: Result<Result<U, E>, E>): Result<U, E> {
    return this.andThen((value) => value);
  }

  inspect(callback: (value: T) => void): Result<T, E> {
    this.isOk() && callback(this.value);

    return this;
  }

  inspectErr(callback: (value: E) => void) {
    this.isErr() && callback(this.value);

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
    return this.isErr() && predicate(this.value);
  }

  isOk(): this is Ok<T, never> {
    return this.discriminant === ResultType.Ok;
  }

  isOkAnd(predicate: (value: T) => boolean): boolean {
    return this.isOk() && predicate(this.value);
  }

  // iter() {
  //   // TODO
  // }

  map<U>(callback: (value: T) => U): Result<U, E> {
    return this.isOk()
      ? Ok(callback(this.value))
      : Err(this.value) as Result<U, E>;
  }

  mapErr<F>(callback: (value: E) => F): Result<T, F> {
    return this.isErr()
      ? Err(callback(this.value))
      : Ok(this.value) as Result<T, F>;
  }

  mapOr<U>(defaultValue: U, callback: (value: T) => U): U {
    return this.isOk() ? callback(this.value) : defaultValue;
  }

  mapOrElse<U>(defaultCallback: () => U, callback: (value: T) => U): U {
    return this.isOk() ? callback(this.value) : defaultCallback();
  }

  // ok(): Option<T> {
  //   // TODO
  // }

  or<F>(result: Result<T, F>): Result<T, F> {
    return this.isOk() ? this : result;
  }

  // FIXME
  // orElse<F>(callback: () => Result<T, F>): Result<T, F> {
  //   return this.isOk() ? this : result;
  // }

  // transpose<E>(): Result<Option<T>, E> {
  //   // TODO: :thinking:
  // }

  // FIXME
  unwrap(): T {
    return this.expect(this.value);
  }

  // FIXME
  unwrapErr(): E {
    return this.expectErr(this.value);
  }

  unwrapErrUnchecked(): E {
    return this.value as E;
  }

  unwrapOr(defaultValue: T): T {
    return this.isOk() ? this.value : defaultValue;
  }

  unwrapOrElse(callback: () => T): T {
    return this.isOk() ? this.value : callback();
  }

  unwrapUnchecked(): T {
    return this.value as T;
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
