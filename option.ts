import Result, { Err, Ok } from "./result.ts";

export default class Option<T> implements Iterable<Option<T>> {
  private value: T;
  discriminant: OptionType;

  constructor(value: T, type: OptionType) {
    this.value = value;
    this.discriminant = type;
  }

  *[Symbol.iterator](): Generator<this> {
    if (this.isSome()) {
      yield this;
    }

    return None();
  }

  /**
   * Returns the given Option if this is Some.
   * Otherwise returns None.
   * @example
   * ```ts
   * const x = Some(1);
   * x.and(Some(2)); // Some(2)
   *
   * const y = None();
   * y.and(Some(2)); // None
   * ```
   */
  and<U>(option: Option<U>): Option<U> {
    return this.isSome() ? option : None();
  }

  /**
   * Returns the result of the given callback with the value of this if this is Some.
   * Otherwise returns None.
   * @example
   * ```ts
   * const x = Some(1);
   * x.andThen((value) => Some(value + 1)); // Some(2)
   *
   * const y = None();
   * y.andThen((value) => Some(value + 1)); // None
   * ```
   */
  andThen<U>(callback: (value: T) => Option<U>): Option<U> {
    return this.isSome() ? callback(this.value) : None();
  }

  /**
   * Returns true if this is Some and it's value equals the given value.
   * Otherwise returns false.
   * @example
   * ```ts
   * const x = Some(1);
   * x.contains(1); // true
   * x.contains(2); // false
   *
   * const y = None();
   * y.contains(1); // false
   * ```
   */
  contains(value: T): boolean {
    return this.isSome() && value === this.value;
  }

  expect(msg: string): T {
    if (this.isNone()) {
      throw new Error(msg);
    }

    return this.value;
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    return (this.isSome() && predicate(this.value)) ? this : None();
  }

  flatten<U>(this: Option<Option<U>>): Option<U> {
    return this.andThen((value) => value);
  }

  getOrInsert(value: T): T {
    this.value = this.isSome() ? this.value : value;
    this.discriminant = OptionType.Some;

    return this.value;
  }

  getOrInsertWith(callback: () => T): T {
    this.value = this.isSome() ? this.value : callback();
    this.discriminant = OptionType.Some;

    return this.value;
  }

  insert(value: T): T {
    this.value = value;
    this.discriminant = OptionType.Some;

    return this.value;
  }

  inspect(callback: (value: T) => void): Option<T> {
    if (this.isSome()) {
      callback(this.value);
    }

    return this;
  }

  isNone(): this is None {
    return this.discriminant === OptionType.None;
  }

  isSome(): this is Some<T> {
    return this.discriminant === OptionType.Some;
  }

  isSomeAnd(predicate: (value: T) => boolean): boolean {
    return this.isSome() && predicate(this.value);
  }

  iter(): Generator<this, None, Option<T>> {
    return this[Symbol.iterator]();
  }

  map<U>(callback: (value: T) => U): Option<U> {
    return this.isSome() ? Some(callback(this.value)) : this;
  }

  mapOr<U>(defaultValue: U, callback: (value: T) => U): U {
    return this.isSome() ? callback(this.value) : defaultValue;
  }

  mapOrElse<U>(defaultCallback: () => U, callback: (value: T) => U) {
    return this.isSome() ? callback(this.value) : defaultCallback();
  }

  okOr<E>(err: E): Result<T, E> {
    return this.isSome() ? Ok(this.value) : Err(err);
  }

  okOrElse<E>(callback: () => E): Result<T, E> {
    return this.isSome() ? Ok(this.value) : Err(callback());
  }

  or(option: Option<T>): Option<T> {
    return this.isSome() ? this : option;
  }

  orElse(callback: () => Option<T>): Option<T> {
    return this.isSome() ? this : callback();
  }

  replace(value: T): Option<T> {
    const old = this.isSome() ? Some(this.value) : None();
    this.value = value;
    this.discriminant = OptionType.Some;

    return old;
  }

  take(): Option<T> {
    const oldValue = this.isSome() ? Some(this.value) : None();
    this.value = undefined as never;
    this.discriminant = OptionType.None;

    return oldValue;
  }

  transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E> {
    return this.isNone()
      ? Ok(this)
      : (this.value.isOk()
        ? Ok(Some(this.value.unwrap()))
        : Err(this.value.unwrapErr()));
  }

  unwrap(): T {
    return this.expect("called 'unwrap()' on a 'None' value");
  }

  unwrapOr(defaultValue: T): T {
    return this.isSome() ? this.value : defaultValue;
  }

  unwrapOrElse(callback: () => T): T {
    return this.isSome() ? this.value : callback();
  }

  unwrapUnchecked(): T {
    return this.value as T;
  }

  unzip<U, V>(this: Option<[U, V]>): [Option<U>, Option<V>] {
    return this.isSome()
      ? [Some(this.value[0]), Some(this.value[1])]
      : [None(), None()];
  }

  xor(option: Option<T>): Option<T> {
    return this.isNone() ? option : (option.isNone() ? this : None());
  }

  zip<U>(other: Option<U>): Option<[T, U]> {
    return (this.isSome() && other.isSome())
      ? Some([this.value, other.value])
      : None();
  }

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

export type None = Option<never>;

export function None(): None {
  return new Option(undefined as never, OptionType.None);
}

export type Some<T> = Option<T>;

export function Some<T>(value: T): Some<T> {
  return new Option(value, OptionType.Some);
}
