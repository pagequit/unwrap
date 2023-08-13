import Option, { None, Some } from "./option.ts";

/** `Result` is a type that represents either success `Ok` or failure `Err`. */
export default class Result<T, E> implements Iterable<T> {
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

  /** Called by the semantics of the for-of statement. */
  *[Symbol.iterator](): IterableIterator<T> {
    if (this.isOk()) {
      yield this.unwrap();
    }
  }

  /**
   * Returns the given `Result` if it's is `Ok`, otherwise returns the `Err`.
   * @example
   * ```ts
   * let x: Result<number, string>;
   * let y: Result<string, string>;
   *
   * x = Ok(2);
   * y = Err("late error");
   * assertEquals(x.and(y), Err("late error"));
   *
   * x = Err("early error");
   * y = Ok("foo");
   * assertEquals(x.and(y), Err("early error"));
   *
   * x = Err("not a 2");
   * y = Err("late error");
   * assertEquals(x.and(y), Err("not a 2"));
   *
   * x = Ok(2);
   * y = Ok("other type");
   * assertEquals(x.and(y), Ok("other type"));
   * ```
   */
  and<U>(result: Result<U, E>): Result<U, E> {
    return this.isErr() ? this : result;
  }

  /**
   * Calls the given callback if it's is `Ok`, otherwise returns the `Err`.
   * @example
   * ```ts
   * function sqThenToString(x: number): Result<string, string> {
   *   return Ok((x * x).toString());
   * }
   *
   * const ok: Result<number, string> = Ok(2);
   * const err: Result<number, string> = Err("not a number");
   *
   * assertEquals(ok.andThen((sqThenToString)), Ok("4"));
   * assertEquals(err.andThen(sqThenToString), Err("not a number"));
   * ```
   */
  andThen<U>(callback: (value: T) => Result<U, E>): Result<U, E> {
    return this.isErr() ? this : callback(this.variant1);
  }

  /**
   * Returns a structured clone of the `Result`, wrapped in a `Result`.
   * @example
   * ```ts
   * const x: Result<{ a: number }, Error> = Ok({ a: 1 });
   * const y: Result<{ a: number }, Error> = Err(new Error("error"));
   * const cx = x.clone();
   * const cy = y.clone();
   *
   * x.unwrap().a = 2;
   * cx.unwrap().unwrap().a = 3;
   *
   * y.unwrapErr().message = "new error";
   * cy.unwrap().unwrapErr().message = "cloned error";
   *
   * assertEquals(x, Ok({ a: 2 }));
   * assertEquals(cx, Ok(Ok({ a: 3 })));
   * assertEquals(y, Err(new Error("new error")));
   * assertEquals(cy, Ok(Err(new Error("cloned error"))));
   * ```
   */
  clone(): Result<Result<T, E>, Error> {
    try {
      return Ok(
        new Result(
          structuredClone(
            this.isOk() ? this.unwrap() : this.unwrapErr(),
          ),
          this.discriminant,
        ),
      );
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * Returns `true` if it's `Ok` and contains the given value.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(2);
   * assertEquals(x.contains(2), true);
   *
   * const y: Result<number, string> = Ok(3);
   * assertEquals(y.contains(2), false);
   *
   * const z: Result<number, string> = Err("Some error message");
   * assertEquals(z.contains(2), false);
   * ```
   */
  contains(value: T): boolean {
    return this.isOk() && this.variant1 === value;
  }

  /**
   * Returns `true` if it's `Err` and contains the given value.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(2);
   * assertEquals(x.containsErr("Some error message"), false);
   *
   * const y: Result<number, string> = Err("Some error message");
   * assertEquals(y.containsErr("Some error message"), true);
   *
   * const z: Result<number, string> = Err("foo");
   * assertEquals(z.containsErr("Some error message"), false);
   * ```
   */
  containsErr(value: E): boolean {
    return this.isErr() && this.variant0 === value;
  }

  /**
   * Converts `Result<T, E>` to `Option<E>`.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(2);
   * assertEquals(x.err(), None());
   *
   * const y: Result<number, string> = Err("Error");
   * assertEquals(y.err(), Some("Error"));
   * ```
   */
  err(): Option<E> {
    return this.isErr() ? Some(this.variant0) : None();
  }

  /**
   * Returns the contained value if it's is `Ok`, otherwise throws an error with the given message.
   * Because this function may throw, its use is discouraged. Instead, prefer to use pattern matching
   * and handle the `Err` case explicitly, or call `unwrapOr`, `unwrapOrElse`.
   * @throws `Error`
   * @example
   * ```ts
   * assertThrows(() => Err(1).expect("foo"), Error, "foo");
   * ```
   */
  expect(msg: string): T {
    if (this.isErr()) {
      throw Error(msg);
    }

    return this.variant1;
  }

  /**
   * Returns the contained value if it's is `Err`, otherwise throws an error with the given message.
   * Because this function may throw, its use is discouraged. Instead, prefer to use pattern matching
   * and handle the `Err` case explicitly.
   * @throws `Error`
   * @example
   * ```ts
   * assertThrows(() => Err(1).expect("foo"), Error, "foo");
   * ```
   */
  expectErr(msg: string): E {
    if (this.isOk()) {
      throw Error(msg);
    }

    return this.variant0;
  }

  /**
   * Converts from `Result<Result<T, E>, E>` to `Result<T, E>`
   * @example
   * ```ts
   * const x: Result<Result<number, string>, string> = Ok(Ok(2));
   * assertEquals(Ok(2), x.flatten());
   *
   * const y: Result<Result<number, string>, string> = Err("foo");
   * assertEquals(Err("foo"), y.flatten());
   *
   * const z: Result<Result<Result<number, string>, string>, string> = Ok(
   *   Ok(Ok(3)),
   * );
   * assertEquals(Ok(Ok(3)), z.flatten());
   * assertEquals(Ok(3), z.flatten().flatten());
   * ```
   */
  flatten<T>(this: Result<Result<T, E>, E>): Result<T, E> {
    return this.andThen((value) => value);
  }

  /**
   * Calls the given callback if it's is `Ok`.
   * @example
   * ```ts
   * Ok(2).inspect(console.log);
   * ```
   */
  inspect(callback: (value: T) => void): Result<T, E> {
    if (this.isOk()) {
      callback(this.variant1);
    }

    return this;
  }

  /**
   * Calls the given callback if it's is `Err`.
   * @example
   * ```ts
   * Err("foo").inspect(console.log);
   * ```
   */
  inspectErr(callback: (value: E) => void) {
    this.isErr() && callback(this.variant0);

    return this;
  }

  /**
   * Returns `true` if the `Result` is `Err`.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(-3);
   * assertEquals(x.isErr(), false);
   *
   * const y: Result<number, string> = Err("Some error message");
   * assertEquals(y.isErr(), true);
   * ```
   */
  isErr(): this is Result<never, E> {
    return this.discriminant === ResultType.Err;
  }

  /**
   * Returns `true` if the `Result` is `Err` and the value inside
   * of it matches the given predicate.
   * @example
   * ```ts
   * const x: Result<number, Error> = Err(Error("NotFound"));
   * assertEquals(x.isErrAnd((x) => x.message === "NotFound"), true);
   *
   * const y: Result<number, Error> = Err(Error("OtherError"));
   * assertEquals(y.isErrAnd((y) => y.message === "NotFound"), false);
   *
   * const z: Result<number, Error> = Ok(123);
   * assertEquals(z.isErrAnd((z) => z.message === "NotFound"), false);
   * ```
   */
  isErrAnd(predicate: (value: E) => boolean): boolean {
    return this.isErr() && predicate(this.variant0);
  }

  /**
   * Returns `true` if the `Result` is `Ok`.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(-3);
   * assertEquals(x.isOk(), true);
   *
   * const y: Result<number, string> = Err("Some error message");
   * assertEquals(y.isOk(), false);
   * ```
   */
  isOk(): this is Result<T, never> {
    return this.discriminant === ResultType.Ok;
  }

  /**
   * Returrns `true` if the `Result` is `Ok` and the value inside
   * of it matches a predicate.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(2);
   * assertEquals(x.isOkAnd((x) => x > 1), true);
   *
   * const y: Result<number, string> = Ok(0);
   * assertEquals(y.isOkAnd((y) => y > 1), false);
   *
   * const z: Result<number, string> = Err("foo");
   * assertEquals(z.isOkAnd((z) => z > 1), false);
   * ```
   */
  isOkAnd(predicate: (value: T) => boolean): boolean {
    return this.isOk() && predicate(this.variant1);
  }

  /**
   * Returns an `IIterableIterator` over the possibly contained value.
   * @example
   * ```ts
   * const x = Ok(4);
   * const iterX = x.iter();
   * const x1 = iterX.next();
   *
   * assertEquals(x1.value, Some(4));
   * assertEquals(x1.done, false);
   *
   * const x2 = iterX.next();
   *
   * assertEquals(x2.value, None());
   * assertEquals(x2.done, true);
   * ```
   */
  *iter(): IterableIterator<Option<T>> {
    if (this.isOk()) {
      yield Some(this.unwrap());
    }

    return None();
  }

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a functions
   * to a contained `Ok` value, leaving an `Err` value untouched.
   * @example
   * ```ts
   * function callback(value: number): string {
   *   return value.toString();
   * }
   *
   * const x: Result<number, string> = Ok(2);
   * assertEquals(x.map(callback), Ok("2"));
   *
   * const y: Result<number, string> = Err("foo");
   * assertEquals(y.map(callback), Err("foo"));
   * ```
   */
  map<U>(callback: (value: T) => U): Result<U, E> {
    return this.isOk()
      ? Ok(callback(this.variant1))
      : Err(this.variant0) as Result<U, E>;
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a functions
   * to a contained `Err` value, leaving an `Ok` value untouched.
   * @example
   * ```ts
   * function callback(value: string): number {
   *   return value.length;
   * }
   *
   * const x: Result<number, string> = Err("foo");
   * assertEquals(x.mapErr(callback), Err(3));
   *
   * const y: Result<number, string> = Ok(2);
   * assertEquals(y.mapErr(callback), Ok(2));
   * ```
   */
  mapErr<F>(callback: (value: E) => F): Result<T, F> {
    return this.isErr()
      ? Err(callback(this.variant0))
      : Ok(this.variant1) as Result<T, F>;
  }

  /**
   * Returns the provided default if `Err`, or applies a function to the contained `Ok` value.
   * @example
   * ```ts
   * const x: Result<string, string> = Ok("foo");
   * assertEquals(x.mapOr(42, (x) => x.length), 3);
   *
   * const y: Result<string, string> = Err("some error");
   * assertEquals(y.mapOr(42, (y) => y.length), 42);
   * ```
   */
  mapOr<U>(defaultValue: U, callback: (value: T) => U): U {
    return this.isOk() ? callback(this.variant1) : defaultValue;
  }

  /**
   * Mapps a `Result<T, E>` to `U` by applying a fallback function to a
   * containded `Err` value, or a callback funtion to contained `Ok`.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(2);
   * assertEquals(x.mapOrElse((e) => e.length, (x) => x * 2), 4);
   *
   * const y: Result<number, string> = Err("foo");
   * assertEquals(y.mapOrElse((e) => e.length, (y) => y / 7), 3);
   * ```
   */
  mapOrElse<U>(defaultCallback: (error: E) => U, callback: (value: T) => U): U {
    return this.isOk()
      ? callback(this.variant1)
      : defaultCallback(this.variant0);
  }

  /**
   * Used to handle either `Ok` or `Err` by invoking the appropriate callback.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(2);
   * const y: Result<number, string> = Err("error");
   * const matcher = <{
   *   Ok: (value: number) => string;
   *   Err: (error: string) => string;
   * }> {
   *   Ok: (value) => value.toString(),
   *   Err: (error) => error,
   * };
   *
   * assertEquals(x.match(matcher), "2");
   * assertEquals(y.match(matcher), "error");
   * ```
   */
  match<U>({ Err, Ok }: { Err: (error: E) => U; Ok: (value: T) => U }): U {
    return this.isOk() ? Ok(this.variant1) : Err(this.variant0);
  }

  /**
   * Converts a `Result<T, E>` to an `Option<T>`
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(2);
   * assertEquals(x.ok(), Some(2));
   *
   * const y: Result<number, string> = Err("foo");
   * assertEquals(y.ok(), None());
   * ```
   */
  ok(): Option<T> {
    return this.isOk() ? Some(this.variant1) : None();
  }

  /**
   * Returns the given `Result` if it's `Err`, otherwise returns the `Ok` value.
   * @example
   * ```ts
   * let x: Result<number, string>;
   * let y: Result<number, string>;
   *
   * x = Ok(2);
   * y = Err("late error");
   * assertEquals(x.or(y), Ok(2));
   *
   * x = Err("early error");
   * y = Ok(2);
   * assertEquals(x.or(y), Ok(2));
   *
   * x = Err("early error");
   * y = Err("late error");
   * assertEquals(x.or(y), Err("late error"));
   *
   * x = Ok(2);
   * y = Ok(100);
   * assertEquals(x.or(y), Ok(2));
   * ```
   */
  or<F>(result: Result<T, F>): Result<T, F> {
    return this.isOk() ? this : result;
  }

  /**
   * Calls the given callback if the `Result` is `Err`, otherwise returns the `Ok` value.
   * @example
   * ```ts
   * function squareLength(x: string): Result<number, string> {
   *   return Ok(x.length);
   * }
   *
   * const ok: Result<number, string> = Ok(2);
   * const err: Result<number, string> = Err("foo");
   *
   * assertEquals(ok.orElse(squareLength), Ok(2));
   * assertEquals(err.orElse(squareLength), Ok(3));
   * ```
   */
  orElse<F>(callback: (value: E) => Result<T, F>): Result<T, F> {
    return this.isOk() ? this : callback(this.variant0);
  }

  /**
   * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
   * @example
   * ```ts
   * let x: Result<Option<number>, string>;
   * let y: Option<Result<number, string>>;
   *
   * x = Ok(Some(5));
   * y = Some(Ok(5));
   * assertEquals(x.transpose(), y);
   *
   * x = Err("foo");
   * y = Some(Err("foo"));
   * assertEquals(x.transpose(), y);
   *
   * x = Ok(None());
   * y = None();
   * assertEquals(x.transpose(), y);
   * ```
   */
  transpose<U, E>(this: Result<Option<U>, E>): Option<Result<U, E>> {
    return this.isErr()
      ? Some(this)
      : (this.unwrap().isSome() ? Some(Ok(this.unwrap().unwrap())) : None());
  }

  /**
   * Returns the contained value if it's is `Ok`, otherwise throws an error.
   * @throws `Error`
   * @example
   * ```ts
   * assertEquals(Ok(2).unwrap(), 2);
   * assertThrows(() => Err("foo").unwrap(), Error);
   * ```
   */
  unwrap(): T {
    return this.expect("called `unwrap()` on an `Err`");
  }

  /**
   * Returns the contained error if it's is `Err`, otherwise throws an error.
   * @throws `Error`
   * @example
   * ```ts
   * assertEquals(Err("foo").unwrapErr(), "foo");
   * assertThrows(() => Ok(2).unwrapErr(), Error);
   * ```
   */
  unwrapErr(): E {
    return this.expectErr("called `unwrapErr()` on an `Ok`");
  }

  /**
   * Returns the contained `Err` value, without checking that the value is not an `Ok`.
   * @example
   * ```ts
   * assertEquals(Err("foo").unwrapErrUnchecked(), "foo");
   * assertEquals(Ok(2).unwrapErrUnchecked(), undefined);
   * ```
   */
  unwrapErrUnchecked(): E {
    return this.variant0;
  }

  /**
   * Returns the contained `Ok` value or a provided default.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(9);
   * assertEquals(x.unwrapOr(42), 9);
   *
   * const y: Result<number, string> = Err("foo");
   * assertEquals(y.unwrapOr(42), 42);
   * ```
   */
  unwrapOr(defaultValue: T): T {
    return this.isOk() ? this.variant1 : defaultValue;
  }

  /**
   * Returns the contained `Ok` value or computes it from a closure.
   * @example
   * ```ts
   * const x: Result<number, string> = Ok(9);
   * assertEquals(x.unwrapOrElse((e) => e.length), 9);
   *
   * const y: Result<number, string> = Err("foo");
   * assertEquals(y.unwrapOrElse((e) => e.length), 3);
   * ```
   */
  unwrapOrElse(callback: (error: E) => T): T {
    return this.isOk() ? this.variant1 : callback(this.variant0);
  }

  /**
   * Returns the contained `Ok` value, without checking that the value is not an `Err`.
   * @example
   * ```ts
   * assertEquals(Ok(2).unwrapUnchecked(), 2);
   * assertEquals(Err("foo").unwrapUnchecked(), undefined);
   * ```
   */
  unwrapUnchecked(): T {
    return this.variant1;
  }
}

/** Used as the discriminant for the `Result` type. */
export enum ResultType {
  Err,
  Ok,
}

/**
 * Creates a `Result<T, E>` from a given error.
 * @example
 * ```ts
 * const x: Result<number, string> = Err("foo");
 * ```
 */
export function Err<T, E>(value: E): Result<T, E> {
  return new Result<T, E>(value, ResultType.Err);
}

/**
 * Creates a `Result<T, E>` from the given value.
 * @example
 * ```ts
 * const x: Result<number, string> = Ok(2);
 * ```
 */
export function Ok<T, E>(value: T): Result<T, E> {
  return new Result<T, E>(value, ResultType.Ok);
}
