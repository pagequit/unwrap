import Result, { Err, Ok } from "./result.ts";

/** `Option` is a type that represents either a `Some` or `None`. */
export default class Option<T> implements Iterable<T> {
  private value: T;
  discriminant: OptionType;

  constructor(value: T, type: OptionType) {
    this.value = value;
    this.discriminant = type;
  }

  /** Called by the semantics of the for-of statement. */
  *[Symbol.iterator](): IterableIterator<T> {
    if (this.isSome()) {
      yield this.unwrap();
    }
  }

  /**
   * Returns the given `Option` if it's is `Some`, otherwise returns the `None`.
   * @example
   * ```ts
   * let x: Option<number>;
   * let y: Option<string>;
   *
   * x = Some(2);
   * y = None();
   * assertEquals(x.and(y), None());
   *
   * x = None();
   * y = Some("foo");
   * assertEquals(x.and(y), None());
   *
   * x = Some(2);
   * y = Some("foo");
   * assertEquals(x.and(y), Some("foo"));
   *
   * x = None();
   * y = None();
   * assertEquals(x.and(y), None());
   * ```
   */
  and<U>(option: Option<U>): Option<U> {
    return this.isSome() ? option : None();
  }

  /**
   * Calls the given callback if it's is `Some`, otherwise returns the `None`.
   * @example
   * ```ts
   * function sqThenToString(x: number): Option<string> {
   *   return Some((x * x).toString());
   * }
   *
   * const some: Option<number> = Some(2);
   * const none: Option<number> = None();
   *
   * assertEquals(some.andThen(sqThenToString), Some("4"));
   * assertEquals(none.andThen(sqThenToString), None());
   * ```
   */
  andThen<U>(callback: (value: T) => Option<U>): Option<U> {
    return this.isSome() ? callback(this.value) : None();
  }

  /**
   * Returns a structured clone of the `Option`, wrapped in a `Result`.
   * @example
   * ```ts
   * const x: Option<{ a: number }> = Some({ a: 1 });
   * const y: Result<Option<{ a: number }>, Error> = x.clone();
   * x.unwrap().a = 2;
   * y.unwrap().unwrap().a = 3;
   *
   * assertEquals(x, Some({ a: 2 }));
   * assertEquals(y.unwrap(), Some({ a: 3 }));
   * ```
   */
  clone(): Result<Option<T>, Error> {
    try {
      return Ok(Some(structuredClone(this.value)));
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * @example
   * Returns `true` if it's `Some` and contains the given value.
   * ```ts
   * const x: Option<number> = Some(2);
   * assertEquals(x.contains(2), true);
   *
   * const y: Option<number> = Some(3);
   * assertEquals(y.contains(2), false);
   *
   * const z: Option<number> = None();
   * assertEquals(z.contains(2), false);
   * ```
   */
  contains(value: T): boolean {
    return this.isSome() && value === this.value;
  }

  /**
   * Returns the contained value if it's is `Some`, otherwise throws an error with the given message.
   * Because this function may throw, its use is discouraged. Instead, prefer to use pattern matching
   * and handle the `Err` case explicitly, or call `unwrapOr`, `unwrapOrElse`.
   * @throws `Error`
   * @example
   * ```ts
   * assertEquals(Some(2).expect("foo"), 2);
   * assertThrows(() => None().expect("foo"), Error, "foo");
   * ```
   */
  expect(msg: string): T {
    if (this.isNone()) {
      throw new Error(msg);
    }

    return this.value;
  }

  /**
   * Returns `None` if the `Option` is `None`, otherwise calls the given
   * predicate function and returns also `None` if the predicate returns `false`.
   * Otherwise returns an `Option` containing the wrapped value.
   * @example
   * ```ts
   * function isEven(n: number): boolean {
   *   return n % 2 === 0;
   * }
   *
   * assertEquals(None().filter(isEven), None());
   * assertEquals(Some(3).filter(isEven), None());
   * assertEquals(Some(4).filter(isEven), Some(4));
   * ```
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    return (this.isSome() && predicate(this.value)) ? Some(this.value) : None();
  }

  /**
   * Converts from `Option<Option<T>>` to `Option<T>`.
   * Flattening only removes one level of nesting at a time.
   * @example
   * ```ts
   * const x: Option<Option<string>> = Some(Some("foo"));
   * assertEquals(Some("foo"), x.flatten());
   *
   * const y: Option<Option<string>> = None();
   * assertEquals(None(), y.flatten());
   *
   * const z: Option<Option<Option<number>>> = Some(Some(Some(6)));
   * assertEquals(Some(Some(6)), z.flatten());
   * assertEquals(Some(6), z.flatten().flatten());
   * ```
   */
  flatten<U>(this: Option<Option<U>>): Option<U> {
    return this.andThen((value) => value);
  }

  /**
   * Inserts the given value into the `Option` if it's a `None`, then returns the contained value.
   * @example
   * ```ts
   * const x: Option<number> = None();
   * const y = x.getOrInsertWith(() => 8);
   *
   * assertEquals(x, Some(8));
   * assertEquals(y, 8);
   * assertEquals(Some("foo").getOrInsertWith(() => "bar"), "foo");
   * ```
   */
  getOrInsert(value: T): T {
    this.value = this.isSome() ? this.value : value;
    this.discriminant = OptionType.Some;

    return this.value;
  }

  /**
   * Inserts a value computed from the given callback into the `Option`
   * if it's a `None`, then returns the contained value.
   * @example
   * ```ts
   * const x: Option<number> = None();
   * const y = x.getOrInsertWith(() => 8);
   *
   * assertEquals(x, Some(8));
   * assertEquals(y, 8);
   * assertEquals(Some("foo").getOrInsertWith(() => "bar"), "foo");
   * ```
   */
  getOrInsertWith(callback: () => T): T {
    this.value = this.isSome() ? this.value : callback();
    this.discriminant = OptionType.Some;

    return this.value;
  }

  /**
   * Inserts the given value into the `Option`, then returns the contained value.
   * If the `Option` alrady contains avalue, the old value is dropped.
   * @example
   * ```ts
   * const opt: Option<number[]> = None();
   * const val = opt.insert([1]);
   * val[0] = 2;
   *
   * assertEquals(opt, Some([2]));
   * assertEquals(val, [2]);
   * ```
   */
  insert(value: T): T {
    this.value = value;
    this.discriminant = OptionType.Some;

    return this.value;
  }

  /**
   * Calls the given callback if the `Option` is `Some`.
   * @example
   * ```ts
   * function callback<T>(value: T): void {
   *   console.log(value);
   * }
   *
   * const inspectSpy = spy(callback);
   *
   * None().inspect(inspectSpy);
   * Some("foo").inspect(inspectSpy);
   *
   * assertSpyCall(inspectSpy, 0, {
   *   args: ["foo"],
   *   returned: undefined as void,
   * });
   * assertSpyCalls(inspectSpy, 1);
   * ```
   */
  inspect(callback: (value: T) => void): Option<T> {
    if (this.isSome()) {
      callback(this.value);
    }

    return this;
  }

  /**
   * A type guard that returns `true` if the `Option` is `None`, otherwise returns `false`.
   * @example
   * ```ts
   * const x = Some(2);
   * assertEquals(x.isNone(), false);
   *
   * const y = None();
   * assertEquals(y.isNone(), true);
   * ```
   */
  isNone(): this is Option<never> {
    return this.discriminant === OptionType.None;
  }

  /**
   * A type guard that returns `true` if the `Option` is `Some`, otherwise returns `false`.
   * @example
   * ```ts
   * const x = Some(2);
   * assertEquals(x.isSome(), true);
   *
   * const y = None();
   * assertEquals(y.isSome(), false);
   * ```
   */
  isSome(): this is Option<T> {
    return this.discriminant === OptionType.Some;
  }

  /**
   * Returns `true` if the `Option` is `Some` and the wrapped value satisfies the given predicate.
   * @example
   * ```ts
   * function predicate(value: number): boolean {
   *   return value > 1;
   * }
   *
   * assertEquals(Some(2).isSomeAnd(predicate), true);
   * assertEquals(Some(0).isSomeAnd(predicate), false);
   * assertEquals(None().isSomeAnd(predicate), false);
   * ```
   */
  isSomeAnd(predicate: (value: T) => boolean): boolean {
    return this.isSome() && predicate(this.value);
  }

  /**
   * Returns an `IIterableIterator` over the possibly contained value.
   * @example
   * ```ts
   * const x = Some(4);
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
   *
   * const y = None();
   * const iterY = y.iter();
   * const y1 = iterY.next();
   *
   * assertEquals(y1.value, None());
   * assertEquals(y1.done, true);
   *
   * let z = 1;
   * for (const value of x.iter()) {
   *   z += value.unwrap();
   * }
   *
   * assertEquals(z, 5);
   * ```
   */
  *iter(): IterableIterator<Option<T>> {
    if (this.isSome()) {
      yield this;
    }

    return None();
  }

  /**
   * Maps an `Option<T>` to an `Option<U>` by applying a functions to the contained value.
   * @example
   * ```ts
   * function callback(value: string): number {
   *   return value.length;
   * }
   *
   * const x: Option<string> = Some("foo");
   * assertEquals(x.map(callback), Some(3));
   *
   * const y: Option<string> = None();
   * assertEquals(y.map(callback), None());
   * ```
   */
  map<U>(callback: (value: T) => U): Option<U> {
    return this.isSome() ? Some(callback(this.value)) : this;
  }

  /**
   * Returns the provided default value if it's a `None`, or applies the given callback to the contained value.
   * @example
   * ```ts
   * function callback(value: string): number {
   *   return value.length;
   * }
   *
   * const x: Option<string> = Some("foo");
   * assertEquals(x.mapOr(12, callback), 3);
   *
   * const y: Option<string> = None();
   * assertEquals(y.mapOr(12, callback), 12);
   * ```
   */
  mapOr<U>(defaultValue: U, callback: (value: T) => U): U {
    return this.isSome() ? callback(this.value) : defaultValue;
  }

  /**
   * Mapps an `Option<T>` to `U` by applying a fallback function
   * to a `None`, or a callback funtion to a `Some`.
   * @example
   * ```ts
   * function callback(value: string): number {
   *   return value.length;
   * }
   *
   * const x: Option<string> = Some("foo");
   * assertEquals(x.mapOrElse(() => 12, callback), 3);
   *
   * const y: Option<string> = None();
   * assertEquals(y.mapOrElse(() => 12, callback), 12);
   * ```
   */
  mapOrElse<U>(defaultCallback: () => U, callback: (value: T) => U) {
    return this.isSome() ? callback(this.value) : defaultCallback();
  }

  /**
   * Used to handle either `Some` or `None` by invoking the appropriate callback.
   * @example
   * ```ts
   * const x = Some("value");
   * const y = None();
   * const matcher = <{ Some: (value: string) => string; None: () => string }> {
   *   Some: (value) => "Some" + value,
   *   None: () => "None",
   * };
   *
   * assertEquals(x.match(matcher), "Somevalue");
   * assertEquals(y.match(matcher), "None");
   * ```
   */
  match<U>({ None, Some }: { None: () => U; Some: (value: T) => U }): U {
    return this.isSome() ? Some(this.value) : None();
  }

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some` to `Ok` and `None` to `Err`.
   * @example
   * ```ts
   * const x: Option<string> = Some("foo");
   * assertEquals(x.okOr(0), Ok("foo"));
   *
   * const y: Option<string> = None();
   * assertEquals(y.okOr(0), Err(0));
   * ```
   */
  okOr<E>(err: E): Result<T, E> {
    return this.isSome() ? Ok(this.value) : Err(err);
  }

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`,
   * mapping `Some` to `Ok` and `None` to `Err`, provided by a callback.
   * @example
   * ```ts
   * const x: Option<string> = Some("foo");
   * assertEquals(x.okOrElse(() => 0), Ok("foo"));
   *
   * const y: Option<string> = None();
   * assertEquals(y.okOrElse(() => 0), Err(0));
   * ```
   */
  okOrElse<E>(callback: () => E): Result<T, E> {
    return this.isSome() ? Ok(this.value) : Err(callback());
  }

  /**
   * Returns the given `Option` if it's `None`, otherwise returns the `Some`.
   * @example
   * ```ts
   * let x: Option<number>;
   * let y: Option<number>;
   *
   * x = Some(2);
   * y = None();
   * assertEquals(x.or(y), Some(2));
   *
   * x = None();
   * y = Some(100);
   * assertEquals(x.or(y), Some(100));
   *
   * x = Some(2);
   * y = Some(100);
   * assertEquals(x.or(y), Some(2));
   *
   * x = None();
   * y = None();
   * assertEquals(x.or(y), None());
   * ```
   */
  or(option: Option<T>): Option<T> {
    return this.isSome() ? this : option;
  }

  /**
   * Calls the given callback if the `Option` is `None`, otherwise returns the `Some`.
   * @example
   * ```ts
   * function nobody(): Option<string> {
   *   return None();
   * }
   *
   * function vikings(): Option<string> {
   *   return Some("vikings");
   * }
   *
   * const none: Option<string> = None();
   *
   * assertEquals(Some("barbarians").orElse(vikings), Some("barbarians"));
   * assertEquals(none.orElse(vikings), Some("vikings"));
   * assertEquals(none.orElse(nobody), None());
   * ```
   */
  orElse(callback: () => Option<T>): Option<T> {
    return this.isSome() ? this : callback();
  }

  /**
   * Replaces the actual value in the `Option` with the value given, returning the old value.
   * @example
   * ```ts
   * let x = Some(2);
   * let old = x.replace(5);
   *
   * assertEquals(x, Some(5));
   * assertEquals(old, Some(2));
   *
   * x = None();
   * old = x.replace(3);
   *
   * assertEquals(x, Some(3));
   * assertEquals(old, None());
   * ```
   */
  replace(value: T): Option<T> {
    const old = this.isSome() ? Some(this.value) : None();
    this.value = value;
    this.discriminant = OptionType.Some;

    return old;
  }

  /**
   * Takes the value out the `Option`, leaving a `None` in its place.
   * @example
   * ```ts
   * let x = Some(2);
   * let y = x.take();
   *
   * assertEquals(x, None());
   * assertEquals(y, Some(2));
   *
   * x = None();
   * y = x.take();
   *
   * assertEquals(x, None());
   * assertEquals(y, None());
   * ```
   */
  take(): Option<T> {
    const oldValue = this.isSome() ? Some(this.value) : None();
    this.value = undefined as never;
    this.discriminant = OptionType.None;

    return oldValue;
  }

  /**
   * Transposes an `Option` of `Result` into a `Result` of `Option`.
   * @example
   * ```ts
   * let x: Result<Option<number>, string>;
   * let y: Option<Result<number, string>>;
   *
   * x = Ok(Some(5));
   * y = Some(Ok(5));
   * assertEquals(x, y.transpose());
   *
   * x = Err("foo");
   * y = Some(Err("foo"));
   * assertEquals(x, y.transpose());
   *
   * x = Ok(None());
   * y = None();
   * assertEquals(x, y.transpose());
   * ```
   */
  transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E> {
    return this.isNone()
      ? Ok(this)
      : (this.value.isOk()
        ? Ok(Some(this.value.unwrap()))
        : Err(this.value.unwrapErr()));
  }

  /**
   * Returns the contained value if it's `Some`, otherwise throws an error.
   * @throws `Error`
   * @example
   * ```ts
   * assertEquals(Some(2).unwrap(), 2);
   * assertThrows(() => None().unwrap(), Error);
   * ```
   */
  unwrap(): T {
    return this.expect("called `unwrap()` on a `None`");
  }

  /**
   * Returns the contained value if it's `Some`, otherwise returns the provided default value.
   * @example
   * ```ts
   * assertEquals(Some("foo").unwrapOr("bar"), "foo");
   *
   * const none: Option<string> = None();
   * assertEquals(none.unwrapOr("bar"), "bar");
   * ```
   */
  unwrapOr(defaultValue: T): T {
    return this.isSome() ? this.value : defaultValue;
  }

  /**
   * Returns the contained value or computes a default value from a callback.
   * @example
   * ```ts
   * const k = 10;
   * assertEquals(Some(4).unwrapOrElse(() => 2 * k), 4);
   *
   * const none: Option<number> = None();
   * assertEquals(none.unwrapOrElse(() => 2 * k), 20);
   * ```
   */
  unwrapOrElse(callback: () => T): T {
    return this.isSome() ? this.value : callback();
  }

  /**
   * Returns the contained value, without checking that the value is a `Some`.
   * @example
   * ```ts
   * assertEquals(Some("foo").unwrapUnchecked(), "foo");
   * assertEquals(None().unwrapUnchecked(), undefined);
   * ```
   */
  unwrapUnchecked(): T {
    return this.value as T;
  }

  /**
   * Unzips the `Option<[U, V]>` into an array of `Option<U>` and `Option<V>`.
   * @example
   * ```ts
   * const x: Option<[number, string]> = Some([2, "foo"]);
   * const y: Option<[number, string]> = None();
   *
   * assertEquals(x.unzip(), [Some(2), Some("foo")]);
   * assertEquals(y.unzip(), [None(), None()]);
   * ```
   */
  unzip<U, V>(this: Option<[U, V]>): [Option<U>, Option<V>] {
    return this.isSome()
      ? [Some(this.value[0]), Some(this.value[1])]
      : [None(), None()];
  }

  /**
   * Returns `Some` if exactly one is `Some`, otherwise returns `None`.
   * @example
   * ```ts
   * let x: Option<number>;
   * let y: Option<number>;
   *
   * x = Some(2);
   * y = None();
   * assertEquals(x.xor(y), Some(2));
   *
   * x = None();
   * y = Some(3);
   * assertEquals(x.xor(y), Some(3));
   *
   * x = Some(4);
   * y = Some(5);
   * assertEquals(x.xor(y), None());
   *
   * x = None();
   * y = None();
   * assertEquals(x.xor(y), None());
   * ```
   */
  xor(option: Option<T>): Option<T> {
    return this.isNone() ? option : (option.isNone() ? this : None());
  }

  /**
   * Zips the `Option<T>` with another `Option<U>` into an `Option<[T, U]>`.
   * @example
   * ```ts
   * const x = Some(2);
   * const y = Some("foo");
   * const z = None();
   *
   * assertEquals(x.zip(y), Some([2, "foo"]));
   * assertEquals(x.zip(z), None());
   * ```
   */
  zip<U>(other: Option<U>): Option<[T, U]> {
    return (this.isSome() && other.isSome())
      ? Some([this.value, other.value])
      : None();
  }

  /**
   * Zips the `Option<T>` with another `Option` evaluated by a callback.
   * @example
   * ```ts
   * function Point(x: number, y: number) {
   *   return Object.create({ x, y });
   * }
   *
   * const x = Some(1);
   * const y = Some(2);
   *
   * assertEquals(x.zipWith(y, Point), Some(Point(1, 2)));
   * assertEquals(x.zipWith(None(), Point), None());
   * ```
   */
  zipWith<U, R>(
    other: Option<U>,
    callback: (value: T, otherValue: U) => R,
  ): Option<R> {
    return (this.isSome() && other.isSome())
      ? Some(callback(this.value, other.value))
      : None();
  }
}

/** Used as the discriminant for the `Option` type. */
export enum OptionType {
  Some,
  None,
}

/**
 * Creates an `Option<T>` that represents `None`.
 * @example
 * ```ts
 * const none: Option<number> = None();
 * ```
 */
export function None(): Option<never> {
  return new Option(undefined as never, OptionType.None);
}

/**
 * Creates an `Option<T>` from the given value.
 * @example
 * ```ts
 * const x: Option<number> = Some(2);
 * ```
 */
export function Some<T>(value: T): Option<T> {
  return new Option(value, OptionType.Some);
}
