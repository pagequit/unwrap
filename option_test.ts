import {
  assertEquals,
  assertInstanceOf,
  assertThrows,
} from "https://deno.land/std@0.157.0/testing/asserts.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.157.0/testing/mock.ts";
import Option, { None, OptionType, Some } from "./option.ts";
import Result, { Err, Ok } from "./result.ts";

Deno.test("None", () => {
  const none = None();

  assertEquals(none.discriminant, OptionType.None);
  assertInstanceOf(none, Option);
});

Deno.test("Some", () => {
  const some = Some(1);

  assertEquals(some.discriminant, OptionType.Some);
  assertInstanceOf(Some(1), Option);
});

Deno.test("iterator", () => {
  function callback<T>(value: T): void {
    console.log(value);
  }

  const inspectSpy = spy(callback);

  for (const some of Some("foo")) {
    inspectSpy(some);
  }

  for (const none of None()) {
    inspectSpy(none);
  }

  assertSpyCalls(inspectSpy, 1);
});

Deno.test("and", () => {
  let x: Option<number>;
  let y: Option<string>;

  x = Some(2);
  y = None();
  assertEquals(x.and(y), None());

  x = None();
  y = Some("foo");
  assertEquals(x.and(y), None());

  x = Some(2);
  y = Some("foo");
  assertEquals(x.and(y), Some("foo"));

  x = None();
  y = None();
  assertEquals(x.and(y), None());
});

Deno.test("andThen", () => {
  function sqThenToString(x: number): Option<string> {
    return Some((x * x).toString());
  }

  const some: Option<number> = Some(2);
  const none: Option<number> = None();

  assertEquals(some.andThen(sqThenToString), Some("4"));
  assertEquals(none.andThen(sqThenToString), None());
});

Deno.test("contains", () => {
  const x: Option<number> = Some(2);
  assertEquals(x.contains(2), true);

  const y: Option<number> = Some(3);
  assertEquals(y.contains(2), false);

  const z: Option<number> = None();
  assertEquals(z.contains(2), false);
});

Deno.test("expect", () => {
  assertEquals(Some(2).expect("foo"), 2);
  assertThrows(() => None().expect("foo"), Error, "foo");
});

Deno.test("filter", () => {
  function isEven(n: number): boolean {
    return n % 2 === 0;
  }

  assertEquals(None().filter(isEven), None());
  assertEquals(Some(3).filter(isEven), None());
  assertEquals(Some(4).filter(isEven), Some(4));
});

Deno.test("flatten", () => {
  const x: Option<Option<string>> = Some(Some("foo"));
  assertEquals(Some("foo"), x.flatten());

  const y: Option<Option<string>> = None();
  assertEquals(None(), y.flatten());

  const z: Option<Option<Option<number>>> = Some(Some(Some(6)));
  assertEquals(Some(Some(6)), z.flatten());
  assertEquals(Some(6), z.flatten().flatten());
});

Deno.test("getOrInsert", () => {
  const x: Option<number> = None();
  const y = x.getOrInsert(7);

  assertEquals(x, Some(7));
  assertEquals(y, 7);
  assertEquals(Some("foo").getOrInsert("bar"), "foo");
});

Deno.test("getOrInsertWith", () => {
  const x: Option<number> = None();
  const y = x.getOrInsertWith(() => 8);

  assertEquals(x, Some(8));
  assertEquals(y, 8);
  assertEquals(Some("foo").getOrInsertWith(() => "bar"), "foo");
});

Deno.test("insert", () => {
  const opt: Option<number[]> = None();
  const val = opt.insert([1]);
  val[0] = 2;

  assertEquals(opt, Some([2]));
  assertEquals(val, [2]);
});

Deno.test("inspect", () => {
  function callback<T>(value: T): void {
    console.log(value);
  }

  const inspectSpy = spy(callback);

  None().inspect(inspectSpy);
  Some("foo").inspect(inspectSpy);

  assertSpyCall(inspectSpy, 0, {
    args: ["foo"],
    returned: undefined as void,
  });
  assertSpyCalls(inspectSpy, 1);
});

Deno.test("isNone", () => {
  const x = Some(2);
  assertEquals(x.isNone(), false);

  const y = None();
  assertEquals(y.isNone(), true);
});

Deno.test("isSome", () => {
  const x = Some(2);
  assertEquals(x.isSome(), true);

  const y = None();
  assertEquals(y.isSome(), false);
});

Deno.test("isSomeAnd", () => {
  function predicate(value: number): boolean {
    return value > 1;
  }

  assertEquals(Some(2).isSomeAnd(predicate), true);
  assertEquals(Some(0).isSomeAnd(predicate), false);
  assertEquals(None().isSomeAnd(predicate), false);
});

Deno.test("map", () => {
  function callback(value: string): number {
    return value.length;
  }

  const x: Option<string> = Some("foo");
  assertEquals(x.map(callback), Some(3));

  const y: Option<string> = None();
  assertEquals(y.map(callback), None());
});

Deno.test("mapOr", () => {
  function callback(value: string): number {
    return value.length;
  }

  const x: Option<string> = Some("foo");
  assertEquals(x.mapOr(12, callback), 3);

  const y: Option<string> = None();
  assertEquals(y.mapOr(12, callback), 12);
});

Deno.test("mapOrElse", () => {
  function callback(value: string): number {
    return value.length;
  }

  const x: Option<string> = Some("foo");
  assertEquals(x.mapOrElse(() => 12, callback), 3);

  const y: Option<string> = None();
  assertEquals(y.mapOrElse(() => 12, callback), 12);
});

Deno.test("okOr", () => {
  const x: Option<string> = Some("foo");
  assertEquals(x.okOr(0), Ok("foo"));

  const y: Option<string> = None();
  assertEquals(y.okOr(0), Err(0));
});

Deno.test("okOrElse", () => {
  const x: Option<string> = Some("foo");
  assertEquals(x.okOrElse(() => 0), Ok("foo"));

  const y: Option<string> = None();
  assertEquals(y.okOrElse(() => 0), Err(0));
});

Deno.test("or", () => {
  let x: Option<number>;
  let y: Option<number>;

  x = Some(2);
  y = None();
  assertEquals(x.or(y), Some(2));

  x = None();
  y = Some(100);
  assertEquals(x.or(y), Some(100));

  x = Some(2);
  y = Some(100);
  assertEquals(x.or(y), Some(2));

  x = None();
  y = None();
  assertEquals(x.or(y), None());
});

Deno.test("orElse", () => {
  function nobody(): Option<string> {
    return None();
  }

  function vikings(): Option<string> {
    return Some("vikings");
  }

  const none: Option<string> = None();

  assertEquals(Some("barbarians").orElse(vikings), Some("barbarians"));
  assertEquals(none.orElse(vikings), Some("vikings"));
  assertEquals(none.orElse(nobody), None());
});

Deno.test("replace", () => {
  let x = Some(2);
  let old = x.replace(5);

  assertEquals(x, Some(5));
  assertEquals(old, Some(2));

  x = None();
  old = x.replace(3);

  assertEquals(x, Some(3));
  assertEquals(old, None());
});

Deno.test("take", () => {
  let x = Some(2);
  let y = x.take();

  assertEquals(x, None());
  assertEquals(y, Some(2));

  x = None();
  y = x.take();

  assertEquals(x, None());
  assertEquals(y, None());
});

Deno.test("transpose", () => {
  let x: Result<Option<number>, string>;
  let y: Option<Result<number, string>>;

  x = Ok(Some(5));
  y = Some(Ok(5));
  assertEquals(x, y.transpose());

  x = Err("foo");
  y = Some(Err("foo"));
  assertEquals(x, y.transpose());

  x = Ok(None());
  y = None();
  assertEquals(x, y.transpose());
});

Deno.test("unwrap", () => {
  assertEquals(Some(2).unwrap(), 2);
  assertThrows(() => None().unwrap(), Error);
});

Deno.test("unwrapOr", () => {
  assertEquals(Some("foo").unwrapOr("bar"), "foo");

  const none: Option<string> = None();
  assertEquals(none.unwrapOr("bar"), "bar");
});

Deno.test("unwrapOrElse", () => {
  const k = 10;
  assertEquals(Some(4).unwrapOrElse(() => 2 * k), 4);

  const none: Option<number> = None();
  assertEquals(none.unwrapOrElse(() => 2 * k), 20);
});

Deno.test("unwrapUnchecked", () => {
  assertEquals(Some("foo").unwrapUnchecked(), "foo");
  assertEquals(None().unwrapUnchecked(), undefined);
});

Deno.test("unzip", () => {
  const x: Option<[number, string]> = Some([2, "foo"]);
  const y: Option<[number, string]> = None();

  assertEquals(x.unzip(), [Some(2), Some("foo")]);
  assertEquals(y.unzip(), [None(), None()]);
});

Deno.test("xor", () => {
  let x: Option<number>;
  let y: Option<number>;

  x = Some(2);
  y = None();
  assertEquals(x.xor(y), Some(2));

  x = None();
  y = Some(3);
  assertEquals(x.xor(y), Some(3));

  x = Some(4);
  y = Some(5);
  assertEquals(x.xor(y), None());

  x = None();
  y = None();
  assertEquals(x.xor(y), None());
});

Deno.test("zip", () => {
  const x = Some(2);
  const y = Some("foo");
  const z = None();

  assertEquals(x.zip(y), Some([2, "foo"]));
  assertEquals(x.zip(z), None());
});

Deno.test("zipWith", () => {
  function Point(x: number, y: number) {
    return Object.create({ x, y });
  }

  const x = Some(1);
  const y = Some(2);

  assertEquals(x.zipWith(y, Point), Some(Point(1, 2)));
  assertEquals(x.zipWith(None(), Point), None());
});
