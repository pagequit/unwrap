import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.192.0/testing/mock.ts";
import { Collection } from "./collection.ts";
import { None, Some } from "./option.ts";

Deno.test("size", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.size, 1);
});

Deno.test("iterator", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  function callback(
    v: number,
    k: string,
  ) {
    assertEquals(typeof v, "number");
    assertEquals(typeof k, "string");
  }

  const inspectSpy = spy(callback);

  for (const [k, v] of a) {
    inspectSpy(v, k);
  }

  assertSpyCalls(inspectSpy, 2);
});

Deno.test("from", () => {
  const a = Collection.from([
    ["foo", 1],
    ["bar", 2],
  ]);

  assertEquals(a.size, 2);
  assertEquals(Collection.from(a), a);
});

Deno.test("clear", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.clear();

  assertEquals(a.size, 0);
});

Deno.test("clone", () => {
  const foo = { bar: 1 };
  const a = Collection.from([
    ["foo", foo],
  ]);

  const b = a.clone().unwrap();
  foo.bar = 2;

  assertEquals(a.get("foo").unwrap(), { bar: 2 });
  assertEquals(b.get("foo").unwrap(), { bar: 1 });

  a.insert("foo", b.replace("foo", { bar: 3 }).unwrap());

  assertEquals(a.get("foo").unwrap(), { bar: 1 });
  assertEquals(b.get("foo").unwrap(), { bar: 3 });
});

Deno.test("delete", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.get("foo"), Some(1));

  assertEquals(a.delete("foo"), true);
  assertEquals(a.delete("foo"), false);
  assertEquals(a.get("foo"), None());
});

Deno.test("diff", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  const b = new Collection<string, number>();
  b.set("foo", 3);
  b.set("baz", 4);

  assertEquals(a.diff(b), Collection.from([["bar", 2]]));
  assertEquals(b.diff(a), Collection.from([["baz", 4]]));
});

Deno.test("entries", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  for (const [key, value] of a.entries()) {
    assertEquals(typeof key, "string");
    assertEquals(typeof value, "number");
  }
});

Deno.test("every", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  assertEquals(a.every((v) => v % 1 === 0), true);
  assertEquals(a.every((v) => v % 2 === 0), false);
});

Deno.test("filter", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  assertEquals(
    a.filter((v) => v % 2 === 0),
    Collection.from([["bar", 2]]),
  );
});

Deno.test("find", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  assertEquals(a.find((v) => v % 2 === 0), Some(2));
});

Deno.test("forEach", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  function callback(
    v: number,
    k: string,
    collection: Collection<string, number>,
  ) {
    assertEquals(typeof v, "number");
    assertEquals(typeof k, "string");
    assertInstanceOf(collection, Collection);
  }

  const inspectSpy = spy(callback);

  a.forEach(inspectSpy);

  assertSpyCalls(inspectSpy, 2);
});

Deno.test("get", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.get("foo"), Some(1));
  assertEquals(a.get("bar"), None());
});

Deno.test("getOrInsert", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.getOrInsert("foo", 3), 1);
  assertEquals(a.get("foo"), Some(1));
  assertEquals(a.getOrInsert("bar", 2), 2);
  assertEquals(a.get("bar"), Some(2));
});

Deno.test("getOrInsertWith", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.getOrInsertWith("foo", () => 3), 1);
  assertEquals(a.get("foo"), Some(1));
  assertEquals(a.getOrInsertWith("bar", () => 2), 2);
  assertEquals(a.get("bar"), Some(2));
});

Deno.test("has", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.has("foo"), true);
  assertEquals(a.has("bar"), false);
});

Deno.test("insert", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.insert("bar", 2), 2);
  assertEquals(a.insert("foo", 3), 3);
  assertEquals(a.get("bar"), Some(2));
  assertEquals(a.get("foo"), Some(3));
});

Deno.test("inspect", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  function callback(
    v: number,
    k: string,
    collection: Collection<string, number>,
  ) {
    assertEquals(typeof v, "number");
    assertEquals(typeof k, "string");
    assertInstanceOf(collection, Collection);
  }

  const inspectSpy = spy(callback);

  const b = a.inspect(inspectSpy);

  assertSpyCalls(inspectSpy, 2);
  assertEquals(a, b);
});

Deno.test("intersect", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  const b = new Collection<string, number>();
  b.set("foo", 3);
  b.set("baz", 4);

  function resolveA(
    value: number,
    otherValue: number,
    key: string,
  ) {
    assertEquals(typeof value, "number");
    assertEquals(typeof otherValue, "number");
    assertEquals(typeof key, "string");

    return value;
  }

  function resolveB(_: number, otherValue: number) {
    return otherValue;
  }

  assertEquals(
    a.intersect(b, resolveA),
    Collection.from([["foo", 1]]),
  );
  assertEquals(
    a.intersect(b, resolveB),
    Collection.from([["foo", 3]]),
  );
});

Deno.test("iter", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  const y = a.iter();

  assertEquals(y.next().value, Some(["foo", 1]));
  assertEquals(y.next().value, None());
});

Deno.test("keys", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  assertEquals(Array.from(a.keys()), ["foo", "bar"]);
});

Deno.test("map", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  assertEquals(
    a.map((v) => v * 2),
    Collection.from([["foo", 2], ["bar", 4]]),
  );
});

Deno.test("reduce", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  function reducer(
    acc: string,
    cur: number,
    key: string,
    collection: Collection<string, number>,
  ): string {
    assertEquals(typeof acc, "string");
    assertEquals(typeof cur, "number");
    assertEquals(typeof key, "string");
    assertInstanceOf(collection, Collection);

    return acc + cur.toString();
  }

  assertEquals(a.reduce(reducer, ""), "12");
});

Deno.test("replace", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.replace("foo", 3), Some(1));
  assertEquals(a.get("foo"), Some(3));
  assertEquals(a.replace("bar", 2), None());
  assertEquals(a.get("bar"), Some(2));
});

Deno.test("set", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);

  assertEquals(a.set("foo", 2), a);
  assertEquals(a.size, 1);
  assertEquals(a.get("foo"), Some(2));
});

Deno.test("some", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  assertEquals(a.some((v) => v % 2 === 0), true);
  assertEquals(a.some((v) => v % 3 === 0), false);
});

Deno.test("symDiff", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  const b = new Collection<string, number>();
  b.set("foo", 3);
  b.set("baz", 4);

  assertEquals(
    a.symDiff(b),
    Collection.from([["bar", 2], ["baz", 4]]),
  );
});

Deno.test("toJSON", () => {
  const foo = { bar: 1 };
  const a = Collection.from([
    ["foo", foo],
  ]);

  assertEquals(a.toJSON().unwrap(), '{"foo":{"bar":1}}');
});

Deno.test("union", () => {
  const x = { a: 1, b: 2, c: 3 };

  const y = new Collection<string, number>();
  y.set("a", 0);

  const z = Collection.from(Object.entries(x));

  function resolveX(
    value: number,
    otherValue: number,
    key: string,
  ) {
    assertEquals(typeof value, "number");
    assertEquals(typeof otherValue, "number");
    assertEquals(typeof key, "string");

    return value;
  }

  function resolveY(_: number, otherValue: number) {
    return otherValue;
  }

  assertEquals(
    z.union(y, resolveX),
    Collection.from(Object.entries(x)),
  );
  assertEquals(
    z.union(y, resolveY),
    Collection.from(Object.entries({ ...x, a: 0 })),
  );
  assertEquals(
    z.union(y, (v, ov, k) => k === "a" ? ov : v),
    Collection.from(Object.entries({ ...x, a: 0 })),
  );
});

Deno.test("values", () => {
  const a = new Collection<string, number>();
  a.set("foo", 1);
  a.set("bar", 2);

  assertEquals(Array.from(a.values()), [1, 2]);
});
