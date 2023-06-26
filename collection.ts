import Option, { None, Some } from "./option.ts";
import Result, { Err, Ok } from "./result.ts";

export class Collection<K, V> implements Iterable<[K, V]> {
  private innerMap = new Map<K, V>();

  get size(): number {
    return this.innerMap.size;
  }

  *[Symbol.iterator](): IterableIterator<[K, V]> {
    yield* this.entries();
  }

  static from<K, V>(iterable: Iterable<[K, V]>): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of iterable) {
      result.set(key, value);
    }

    return result;
  }

  clear(): void {
    this.innerMap.clear();
  }

  clone(): Result<Collection<K, V>, Error> {
    try {
      const result = new Collection<K, V>();
      for (const [key, value] of this) {
        result.set(key, structuredClone(value));
      }

      return Ok(result);
    } catch (error: unknown) {
      return Err(error as Error);
    }
  }

  delete(key: K): boolean {
    return this.innerMap.delete(key);
  }

  diff(other: Collection<K, V>): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this) {
      if (!other.has(key)) {
        result.set(key, value);
      }
    }

    return result;
  }

  entries(): IterableIterator<[K, V]> {
    return this.innerMap.entries();
  }

  every(
    predicate: (value: V, key: K, collection: this) => boolean,
  ): boolean {
    for (const [key, value] of this) {
      if (!predicate(value, key, this)) {
        return false;
      }
    }

    return true;
  }

  filter(
    predicate: (value: V, key: K, collection: this) => boolean,
  ): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        result.set(key, value);
      }
    }

    return result;
  }

  find(
    predicate: (value: V, key: K, collection: this) => boolean,
  ): Option<V> {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return Some(value);
      }
    }

    return None();
  }

  forEach(
    callback: (value: V, key: K, collection: this) => void,
  ): void {
    for (const [key, value] of this) {
      callback(value, key, this);
    }
  }

  get(key: K): Option<V> {
    const value = this.innerMap.get(key);
    return value === undefined ? None() : Some(value);
  }

  getOrInsert(key: K, value: V): V {
    if (this.innerMap.has(key)) {
      return this.innerMap.get(key)!;
    }

    this.set(key, value);

    return value;
  }

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

  has(key: K): boolean {
    return this.innerMap.has(key);
  }

  insert(key: K, value: V): V {
    this.set(key, value);
    return value;
  }

  inspect(callback: (value: V, key: K, collection: this) => void): this {
    for (const [key, value] of this) {
      callback(value, key, this);
    }

    return this;
  }

  intersect(
    other: Collection<K, V>,
    resolve: (value: V, otherValue: V, key: K) => V,
  ): Collection<K, V> {
    const result = new Collection<K, V>();
    for (const [key, value] of this) {
      if (other.has(key)) {
        result.set(key, resolve(value, other.get(key).unwrap(), key));
      }
    }

    return result;
  }

  *iter(): Generator<Option<[K, V]>, Option<never>, Option<[K, V]>> {
    for (const element of this.innerMap) {
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
    for (const [key, value] of this) {
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
    for (const [key, value] of this) {
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
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return true;
      }
    }

    return false;
  }

  symDiff(other: Collection<K, V>): Collection<K, V> {
    const result = new Collection<K, V>();

    for (const [key, value] of this) {
      if (!other.has(key)) {
        result.set(key, value);
      }
    }

    for (const [key, value] of other) {
      if (!this.has(key)) {
        result.set(key, value);
      }
    }

    return result;
  }

  toJSON(): Result<string, Error> {
    try {
      return Ok(JSON.stringify(Object.fromEntries(this.innerMap.entries())));
    } catch (error: unknown) {
      return Err(error as Error);
    }
  }

  union(
    other: Collection<K, V>,
    resolve: (value: V, otherValue: V, key: K) => V,
  ): Collection<K, V> {
    const result = Collection.from(this);
    for (const [key, value] of other) {
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
