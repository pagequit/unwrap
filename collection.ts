import Option, { None, Some } from "./option.ts";
import Result, { Err, Ok } from "./result.ts";

/**
 * An extension of `Map` with additional methods, that works with
 * `Option` and `Result` to avoid `undefined` or `try...catch` statements.
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
   * Returns the number of entires in the `Collection`.
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
   * Removes all entries from the `Collection`.
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
   * Returns `true` if an entry in the `Collection` existed and
   * has been removed, or `false` if the entry does not exist.
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
   * Returns a new `Collection` containing entries where the key is
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
   * Returns `true` if all entries in the `Collection` match the given predicate.
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
   * the entries that match the given predicate.
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
   * Returns the first entry in the `Collection` that
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
   * Performs the specified action for each entry in the `Collection`.
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
   * Returns the entry associated with the specified key, wrapped in a `Option`.
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
   * Returns boolean indicating whether an entry with the specified key exists or not.
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

  /**
   * Performs the specified action for each entry in the `Collection`.
   * Unlike `forEach`, it returns itself.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.inspect((value, key) => {
   *   assertEquals(typeof value, "number");
   *   assertEquals(typeof key, "string");
   * });
   * ```
   */
  inspect(callback: (value: V, key: K, collection: this) => void): this {
    for (const [key, value] of this.entries()) {
      callback(value, key, this);
    }

    return this;
  }

  /**
   * Returns a new `Collection` containing entries where the keys are
   * present in both original `Collection`s.
   * Because it only goes by keys, a resolve function must be specified
   * that decides which of the two entries will be taken.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * const b = new Collection<string, number>();
   * b.set("foo", 3);
   * b.set("duz", 4);
   * assertEquals(a.intersect(b, (v) => v), Collection.from([["foo", 1]]));
   * assertEquals(a.intersect(b, (_, v) => v), Collection.from([["foo", 3]]));
   * ```
   */
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

  /**
   * Returns an iterator over the `Collection`.
   * Other than the `@@iterator`, the values are wrapped in an `Option`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * const x = a.iter();
   * assertEquals(x.next().value, Some(["foo", 1]));
   * assertEquals(x.next().value, None());
   * ```
   */
  *iter(): IterableIterator<Option<[K, V]>> {
    for (const entry of this.entries()) {
      yield Some(entry);
    }

    return None();
  }

  /**
   * Returns an iterable of keys in the `Collection`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * assertEquals(Array.from(a.keys()), ["foo", "bar"]);
   * ```
   */
  keys(): IterableIterator<K> {
    return this.innerMap.keys();
  }

  /**
   * Returns a new `Collection` with the same keys containing entries with the mapped values.
   * @example
   * ```ts
   * const a = new Collection<{ foo: number }, number>();
   * const x = { foo: 1 };
   * a.set(x, x.foo);
   * const b = a.map((v) => v.toString());
   * assertEquals(a.get(x), Some(1));
   * assertEquals(b.get(x), Some("1"));
   * ```
   */
  map<U>(
    callback: (value: V, key: K, collection: this) => U,
  ): Collection<K, U> {
    const result = new Collection<K, U>();
    for (const [key, value] of this.entries()) {
      result.set(key, callback(value, key, this));
    }

    return result;
  }

  /**
   * Executes a user-supplied reducer callback function on each entry of the `Collection`,
   * in order, passing in the return value from the calculation on the preceding entry.
   * The final result of running the reducer across all entries of the `Collection` is a single value.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * assertEquals(a.reduce((acc, [_, cur]) => acc + cur, 0), 3);
   * ```
   */
  reduce<U>(
    reducer: (accumulator: U, current: [K, V], collection: this) => U,
    initialValue: U,
  ): U {
    for (const entry of this.entries()) {
      initialValue = reducer(initialValue, entry, this);
    }

    return initialValue;
  }

  /**
   * Sets a new value for the specified key and returns the old value.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * assertEquals(a.replace("foo", 3), Some(1));
   * ```
   */
  replace(key: K, value: V): Option<V> {
    const oldValue = this.get(key);
    this.set(key, value);

    return oldValue;
  }

  /**
   * Sets a new value for the specified key and returns the `Collection`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * assertEquals(a.get("foo"), Some(1));
   * ```
   */
  set(key: K, value: V): this {
    this.innerMap.set(key, value);
    return this;
  }

  /**
   * Returns `true` if at least one entry in the `Collection` match the given predicate.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * assertEquals(a.some((v) => v % 2 === 0), true);
   * assertEquals(a.some((v) => v % 3 === 0), false);
   * ```
   */
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
   * Returns a new `Collection` containing entries where the key is
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

  /**
   * Returns a JSON representation of the `Collection`, wrapped in a `Result`.
   * @example
   * ```ts
   * const a = Collection.from([["foo", { bar: 1 }]]);
   * assertEquals(a.toJSON().unwrap(), '[["foo",{"bar":1}]]');
   * ```
   */
  toJSON(): Result<string, Error> {
    try {
      return Ok(JSON.stringify(Array.from(this.entries())));
    } catch (error: unknown) {
      return Err(error as Error);
    }
  }

  /**
   * Returns a new `Collection` containing all entries present in both original `Collection`s.
   * Because it only goes by keys, a resolve function must be specified
   * that decides which of the two entries will be taken.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * const b = new Collection<string, number>();
   * b.set("foo", 3);
   * b.set("duz", 4);
   * assertEquals(a.union(b, (v) => v), Collection.from([["foo", 1], ["bar", 2], ["duz", 4]]));
   * assertEquals(a.union(b, (_, v) => v), Collection.from([["foo", 3], ["bar", 2], ["duz", 4]]));
   * ```
   */
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

  /**
   * Returns an iterable of values in the `Collection`.
   * @example
   * ```ts
   * const a = new Collection<string, number>();
   * a.set("foo", 1);
   * a.set("bar", 2);
   * assertEquals(Array.from(a.values()), [1, 2]);
   * ```
   */
  values(): IterableIterator<V> {
    return this.innerMap.values();
  }
}
