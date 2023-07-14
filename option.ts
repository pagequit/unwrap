import Result, { Err, Ok } from "./result.ts";

export default class Option<T> implements Iterable<T> {
  private value: T;
  discriminant: OptionType;

  constructor(value: T, type: OptionType) {
    this.value = value;
    this.discriminant = type;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    if (this.isSome()) {
      yield this.unwrap();
    }
  }

  /**
   * @example
   * ```ts
   * ```
   */
  and<U>(option: Option<U>): Option<U> {
    return this.isSome() ? option : None();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  andThen<U>(callback: (value: T) => Option<U>): Option<U> {
    return this.isSome() ? callback(this.value) : None();
  }

  /**
   * @example
   * ```ts
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
   * ```ts
   * ```
   */
  contains(value: T): boolean {
    return this.isSome() && value === this.value;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  expect(msg: string): T {
    if (this.isNone()) {
      throw new Error(msg);
    }

    return this.value;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    return (this.isSome() && predicate(this.value)) ? this : None();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  flatten<U>(this: Option<Option<U>>): Option<U> {
    return this.andThen((value) => value);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  getOrInsert(value: T): T {
    this.value = this.isSome() ? this.value : value;
    this.discriminant = OptionType.Some;

    return this.value;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  getOrInsertWith(callback: () => T): T {
    this.value = this.isSome() ? this.value : callback();
    this.discriminant = OptionType.Some;

    return this.value;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  insert(value: T): T {
    this.value = value;
    this.discriminant = OptionType.Some;

    return this.value;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  inspect(callback: (value: T) => void): Option<T> {
    if (this.isSome()) {
      callback(this.value);
    }

    return this;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  isNone(): this is Option<never> {
    return this.discriminant === OptionType.None;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  isSome(): this is Option<T> {
    return this.discriminant === OptionType.Some;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  isSomeAnd(predicate: (value: T) => boolean): boolean {
    return this.isSome() && predicate(this.value);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  *iter(): IterableIterator<Option<T>> {
    if (this.isSome()) {
      yield this;
    }

    return None();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  map<U>(callback: (value: T) => U): Option<U> {
    return this.isSome() ? Some(callback(this.value)) : this;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  mapOr<U>(defaultValue: U, callback: (value: T) => U): U {
    return this.isSome() ? callback(this.value) : defaultValue;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  mapOrElse<U>(defaultCallback: () => U, callback: (value: T) => U) {
    return this.isSome() ? callback(this.value) : defaultCallback();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  match<U>({ None, Some }: { None: () => U; Some: (value: T) => U }): U {
    return this.isSome() ? Some(this.value) : None();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  okOr<E>(err: E): Result<T, E> {
    return this.isSome() ? Ok(this.value) : Err(err);
  }

  /**
   * @example
   * ```ts
   * ```
   */
  okOrElse<E>(callback: () => E): Result<T, E> {
    return this.isSome() ? Ok(this.value) : Err(callback());
  }

  /**
   * @example
   * ```ts
   * ```
   */
  or(option: Option<T>): Option<T> {
    return this.isSome() ? this : option;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  orElse(callback: () => Option<T>): Option<T> {
    return this.isSome() ? this : callback();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  replace(value: T): Option<T> {
    const old = this.isSome() ? Some(this.value) : None();
    this.value = value;
    this.discriminant = OptionType.Some;

    return old;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  take(): Option<T> {
    const oldValue = this.isSome() ? Some(this.value) : None();
    this.value = undefined as never;
    this.discriminant = OptionType.None;

    return oldValue;
  }

  /**
   * @example
   * ```ts
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
   * @example
   * ```ts
   * ```
   */
  unwrap(): T {
    return this.expect("called `unwrap()` on a `None`");
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapOr(defaultValue: T): T {
    return this.isSome() ? this.value : defaultValue;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapOrElse(callback: () => T): T {
    return this.isSome() ? this.value : callback();
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unwrapUnchecked(): T {
    return this.value as T;
  }

  /**
   * @example
   * ```ts
   * ```
   */
  unzip<U, V>(this: Option<[U, V]>): [Option<U>, Option<V>] {
    return this.isSome()
      ? [Some(this.value[0]), Some(this.value[1])]
      : [None(), None()];
  }

  /**
   * @example
   * ```ts
   * ```
   */
  xor(option: Option<T>): Option<T> {
    return this.isNone() ? option : (option.isNone() ? this : None());
  }

  /**
   * @example
   * ```ts
   * ```
   */
  zip<U>(other: Option<U>): Option<[T, U]> {
    return (this.isSome() && other.isSome())
      ? Some([this.value, other.value])
      : None();
  }

  /**
   * @example
   * ```ts
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

export enum OptionType {
  Some,
  None,
}

export function None(): Option<never> {
  return new Option(undefined as never, OptionType.None);
}

export function Some<T>(value: T): Option<T> {
  return new Option(value, OptionType.Some);
}
