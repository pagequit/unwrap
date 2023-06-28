import Option, { None, Some } from "./option.ts";
import Result, { Err, Ok } from "./result.ts";

/**
 * An extension of `Map` with additional methods, that works with
 * `Option` and `Result` to avoid `undefined` or throwing errors.
 * @example
 * ```ts
 * const a = new Collection<string, number>();
 * a.set("foo", 1);
 * assertEquals(a.get("foo"), Some(1));
 * ```
 */
export class Collection<K, V> implements Iterable<[K, V]> {
  private innerMap = new Map<K, V>();

  /**
   * Returns the number of elements in the `Collection`.
   * @example
   * ```ts
   * const a = Collection.from([["foo", 1]]);
   * assertEquals(a.size, 1);
   * ```
   */
  get size(): number {
    return this.innerMap.size;
  }

  /** Called by the semantics of the for-of statement. */
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    yield* this.entries();
  }

  /**
   * Returns a new `Collection` from the given iterable.
   * @example
   * ```ts
   * const a = Collection.from([
   *   ["foo", 1],
   *   ["bar", 2],
   * ]);
   * assertEquals(a.get("foo"), Some(1));
   * assertEquals(Collection.from(a), a);
   * ```
   */
  static from<K, V>(iterable: Iterable<[K, V]>): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of iterable) {
      result.set(key, value);
    }

    return result;
  }

  /**
   * Removes all elements from the `Collection`.
   * @example
   * ```ts
   * const a = Collection.from([["foo", 1]]);
   * a.clear();
   * assertEquals(a.size, 0);
   * ```
   */
  clear(): void {
    this.innerMap.clear();
  }

  /**
   * Returns a structured clone of the `Collection`, wrapped in a `Result`.
   * @example
   * ```ts
   * const foo = { bar: 1 };
   * const a = Collection.from([["foo", foo]]);
   * const b = a.clone().unwrap();
   * foo.bar = 2;
   * assertEquals(a.get("foo").unwrap(), { bar: 2 });
   * assertEquals(b.get("foo").unwrap(), { bar: 1 });
   * ```
   */
  clone(): Result<Collection<K, V>, Error> {
    try {
      const result = new Collection<K, V>();
      for (const [key, value] of this.entries()) {
        result.set(key, structuredClone(value));
      }

      return Ok(result);
    } catch (error: unknown) {
      return Err(error as Error);
    }
  }

  /**
   * Returns `true` if an element in the `Collection` existed and
   * has been removed, or `false` if the element does not exist.
   * @example
   * ```ts
   * const a = Collection.from([["foo", 1]]);
   * assertEquals(a.delete("foo"), true);
   * ```
   */
  delete(key: K): boolean {
    return this.innerMap.delete(key);
  }

  /**
   * Returns a new `Collection` containing items where the key is
   * present in the original `Collection`s but not in the other.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * const b = new Collection<string, number>();
   * b.set("foo", 3);
   * b.set("baz", 4);
   * assertEquals(a.diff(b), Collection.from([["bar", 2]]));
   * assertEquals(b.diff(a), Collection.from([["baz", 4]]));
   * ```
   */
  diff(other: Collection<K, V>): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this.entries()) {
      if (!other.has(key)) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the `Collection`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * for (const [key, value] of a.entries()) {
   *   assertEquals(typeof key, "string");
   *   assertEquals(typeof value, "number");
   * }
   * ```
   */
  entries(): IterableIterator<[K, V]> {
    return this.innerMap.entries();
  }

  /**
   * Returns `true` if all elements in the `Collection` match the given predicate.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * assertEquals(a.every((v) => v % 1 === 0), true);
   * assertEquals(a.every((v) => v % 2 === 0), false);
   * ```
   */
  every(
    predicate: (value: V, key: K, collection: this) => boolean,
  ): boolean {
    for (const [key, value] of this.entries()) {
      if (!predicate(value, key, this)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns a new `Collection`, filtered down to just
   * the elements that match the given predicate.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * assertEquals(
   *   a.filter((v) => v % 2 === 0),
   *   Collection.from([["bar", 2]]),
   * );
   * ```
   */
  filter(
    predicate: (value: V, key: K, collection: this) => boolean,
  ): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this.entries()) {
      if (predicate(value, key, this)) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * Returns the first element in the `Collection` that
   * matches the given predicate, wrapped in a `Option`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * assertEquals(a.find((v) => v % 2 === 0), Some(2));
   * ```
   */
  find(
    predicate: (value: V, key: K, collection: this) => boolean,
  ): Option<V> {
    for (const [key, value] of this.entries()) {
      if (predicate(value, key, this)) {
        return Some(value);
      }
    }

    return None();
  }

  /**
   * Performs the specified action for each element in the `Collection`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.forEach((value, key) => {
   *   assertEquals(typeof value, "number");
   *   assertEquals(typeof key, "string");
   * });
   * ```
   */
  forEach(
    callback: (value: V, key: K, collection: this) => void,
  ): void {
    for (const [key, value] of this.entries()) {
      callback(value, key, this);
    }
  }

  /**
   * Returns the element associated with the specified key, wrapped in a `Option`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * assertEquals(a.get("foo"), Some(1));
   * assertEquals(a.get("bar"), None());
   * ```
   */
  get(key: K): Option<V> {
    const value = this.innerMap.get(key);
    return value === undefined ? None() : Some(value);
  }

  /**
   * Returns the value associated with the specified
   * key if exists or sets and returns the given value.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * assertEquals(a.getOrInsert("foo", 3), 1);
   * assertEquals(a.get("foo"), Some(1));
   * assertEquals(a.getOrInsert("bar", 2), 2);
   * assertEquals(a.get("bar"), Some(2));
   * ```
   */
  getOrInsert(key: K, value: V): V {
    if (this.innerMap.has(key)) {
      return this.innerMap.get(key)!;
    }
    this.set(key, value);

    return value;
  }

  /**
   * Returns the value associated with the specified
   * key if exists or sets and returns the value returned by the callback.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * assertEquals(a.getOrInsert("foo", () => 3), 1);
   * assertEquals(a.get("foo"), Some(1));
   * assertEquals(a.getOrInsert("bar", 2), 2);
   * assertEquals(a.get("bar"), Some(2));
   * ```
   */
  getOrInsertWith(
    key: K,
    callback: (key: K, collection: this) => V,
  ): V {
    if (this.innerMap.has(key)) {
      return this.innerMap.get(key)!;
    }

    const defaultValue = callback(key, this);
    this.set(key, defaultValue);

    return defaultValue;
  }

  /**
   * Returns boolean indicating whether an element with the specified key exists or not.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * assertEquals(a.has("foo"), true);
   * ```
   */
  has(key: K): boolean {
    return this.innerMap.has(key);
  }

  /**
   * Inserts and returns the specified value into the `Collection`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * assertEquals(a.insert("foo", 1), 1);
   * ```
   */
  insert(key: K, value: V): V {
    this.set(key, value);
    return value;
  }

  inspect(callback: (value: V, key: K, collection: this) => void): this {
    for (const [key, value] of this.entries()) {
      callback(value, key, this);
    }

    return this;
  }

  intersect(
    other: Collection<K, V>,
    resolve: (value: V, otherValue: V, key: K) => V,
  ): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this.entries()) {
      if (other.has(key)) {
        result.set(key, resolve(value, other.get(key).unwrap(), key));
      }
    }

    return result;
  }

  *iter(): Generator<Option<[K, V]>, Option<never>, Option<[K, V]>> {
    for (const element of this.entries()) {
      yield Some(element);
    }

    return None();
  }

  keys(): IterableIterator<K> {
    return this.innerMap.keys();
  }

  map<U>(
    callback: (value: V, key: K, collection: this) => U,
  ): Collection<K, U> {
    const result = new Collection<K, U>();
    for (const [key, value] of this.entries()) {
      result.set(key, callback(value, key, this));
    }

    return result;
  }

  reduce<U>(
    reducer: (
      accumulator: U,
      currentValue: V,
      key: K,
      collection: this,
    ) => U,
    initialValue: U,
  ): U {
    for (const [key, value] of this.entries()) {
      initialValue = reducer(initialValue, value, key, this);
    }

    return initialValue;
  }

  replace(key: K, value: V): Option<V> {
    const oldValue = this.get(key);
    this.set(key, value);

    return oldValue;
  }

  set(key: K, value: V): this {
    this.innerMap.set(key, value);
    return this;
  }

  some(
    predicate: (value: V, key: K, collection: this) => boolean,
  ): boolean {
    for (const [key, value] of this.entries()) {
      if (predicate(value, key, this)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns a new `Collection` containing items where the key is
   * present in one of the original `Collection`s but not the other.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * const b = new Collection<string, number>();
   * b.set("foo", 3);
   * b.set("baz", 4);
   * assertEquals(a.symDiff(b), Collection.from([["bar", 2], ["baz", 4]]));
   * ```
   */
  symDiff(other: Collection<K, V>): Collection<K, V> {
    const result = new Collection<K, V>();

    for (const [key, value] of this.entries()) {
      if (!other.has(key)) {
        result.set(key, value);
      }
    }

    for (const [key, value] of other.entries()) {
      if (!this.has(key)) {
        result.set(key, value);
      }
    }

    return result;
  }

  toJSON(): Result<string, Error> {
    try {
      return Ok(JSON.stringify(Object.fromEntries(this.entries())));
    } catch (error: unknown) {
      return Err(error as Error);
    }
  }

  union(
    other: Collection<K, V>,
    resolve: (value: V, otherValue: V, key: K) => V,
  ): Collection<K, V> {
    const result = Collection.from(this);
    for (const [key, value] of other.entries()) {
      if (result.has(key) && result.get(key).unwrap() !== value) {
        result.set(key, resolve(result.get(key).unwrap(), value, key));
      } else {
        result.set(key, value);
      }
    }

    return result;
  }

  values(): IterableIterator<V> {
    return this.innerMap.values();
  }
}
