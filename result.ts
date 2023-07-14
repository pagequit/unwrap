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
   * Returns the given `Result` if `this` is `Ok`, otherwise returns the `Err`.
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
   * Calls the given callback if `this` is `Ok`, otherwise returns the `Err`.
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
   * Returns the contained value if `this` is `Ok`, otherwise throws an error with the given message.
   * Because this function may throw, its use is discouraged. Instead, prefer to use pattern matching
   * and handle the `Err` case explicitly, or call `unwrapOr`, `unwrapOrElse`.
   * @throws
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
   * Returns the contained value if `this` is `Err`, otherwise throws an error with the given message.
   * Because this function may throw, its use is discouraged. Instead, prefer to use pattern matching
   * and handle the `Err` case explicitly.
   * @throws
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
   * Calls the given callback if `this` is `Ok`.
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
   * Calls the given callback if `this` is `Err`.
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
   * @example
   * ```ts
   * ```
   */
  isErr(): this is Result<never, E> {
    return this.discriminant === ResultType.Err;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  isErrAnd(predicate: (value: E) => boolean): boolean {
    return this.isErr() && predicate(this.variant0);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  isOk(): this is Result<T, never> {
    return this.discriminant === ResultType.Ok;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  isOkAnd(predicate: (value: T) => boolean): boolean {
    return this.isOk() && predicate(this.variant1);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  *iter(): IterableIterator<Option<T>> {
    if (this.isOk()) {
      yield Some(this.unwrap());
    }

    return None();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  map<U>(callback: (value: T) => U): Result<U, E> {
    return this.isOk()
      ? Ok(callback(this.variant1))
      : Err(this.variant0) as Result<U, E>;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  mapErr<F>(callback: (value: E) => F): Result<T, F> {
    return this.isErr()
      ? Err(callback(this.variant0))
      : Ok(this.variant1) as Result<T, F>;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  mapOr<U>(defaultValue: U, callback: (value: T) => U): U {
    return this.isOk() ? callback(this.variant1) : defaultValue;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  mapOrElse<U>(defaultCallback: (error: E) => U, callback: (value: T) => U): U {
    return this.isOk()
      ? callback(this.variant1)
      : defaultCallback(this.variant0);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  match<U>({ Err, Ok }: { Err: (error: E) => U; Ok: (value: T) => U }): U {
    return this.isOk() ? Ok(this.variant1) : Err(this.variant0);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  ok(): Option<T> {
    return this.isOk() ? Some(this.variant1) : None();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  or<F>(result: Result<T, F>): Result<T, F> {
    return this.isOk() ? this : result;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  orElse<F>(callback: (value: E) => Result<T, F>): Result<T, F> {
    return this.isOk() ? this : callback(this.variant0);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  transpose<U, E>(this: Result<Option<U>, E>): Option<Result<U, E>> {
    return this.isErr()
      ? Some(this)
      : (this.unwrap().isSome() ? Some(Ok(this.unwrap().unwrap())) : None());
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrap(): T {
    return this.expect("called `unwrap()` on an `Err`");
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapErr(): E {
    return this.expectErr("called `unwrapErr()` on an `Ok`");
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapErrUnchecked(): E {
    return this.variant0;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapOr(defaultValue: T): T {
    return this.isOk() ? this.variant1 : defaultValue;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapOrElse(callback: (error: E) => T): T {
    return this.isOk() ? this.variant1 : callback(this.variant0);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapUnchecked(): T {
    return this.variant1;
  }
}

export enum ResultType {
  Err,
  Ok,
}

export function Err<T, E>(value: E): Result<T, E> {
  return new Result<T, E>(value, ResultType.Err);
}

export function Ok<T, E>(value: T): Result<T, E> {
  return new Result<T, E>(value, ResultType.Ok);
}
