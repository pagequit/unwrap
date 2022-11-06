import * as dntShim from "./_dnt.test_shims.js";
import { assertEquals, assertInstanceOf, assertThrows, } from "./deps/deno.land/std@0.161.0/testing/asserts.js";
import { assertSpyCall, assertSpyCalls, spy, } from "./deps/deno.land/std@0.161.0/testing/mock.js";
import Option, { None, OptionType, Some } from "./option.js";
import { Err, Ok } from "./result.js";
dntShim.Deno.test("None", () => {
    const none = None();
    assertEquals(none.discriminant, OptionType.None);
    assertInstanceOf(none, Option);
});
dntShim.Deno.test("Some", () => {
    const some = Some(1);
    assertEquals(some.discriminant, OptionType.Some);
    assertInstanceOf(Some(1), Option);
});
dntShim.Deno.test("iterator", () => {
    function callback(value) {
        return value;
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
dntShim.Deno.test("and", () => {
    let x;
    let y;
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
dntShim.Deno.test("andThen", () => {
    function sqThenToString(x) {
        return Some((x * x).toString());
    }
    const some = Some(2);
    const none = None();
    assertEquals(some.andThen(sqThenToString), Some("4"));
    assertEquals(none.andThen(sqThenToString), None());
});
dntShim.Deno.test("contains", () => {
    const x = Some(2);
    assertEquals(x.contains(2), true);
    const y = Some(3);
    assertEquals(y.contains(2), false);
    const z = None();
    assertEquals(z.contains(2), false);
});
dntShim.Deno.test("expect", () => {
    assertEquals(Some(2).expect("foo"), 2);
    assertThrows(() => None().expect("foo"), Error, "foo");
});
dntShim.Deno.test("filter", () => {
    function isEven(n) {
        return n % 2 === 0;
    }
    assertEquals(None().filter(isEven), None());
    assertEquals(Some(3).filter(isEven), None());
    assertEquals(Some(4).filter(isEven), Some(4));
});
dntShim.Deno.test("flatten", () => {
    const x = Some(Some("foo"));
    assertEquals(Some("foo"), x.flatten());
    const y = None();
    assertEquals(None(), y.flatten());
    const z = Some(Some(Some(6)));
    assertEquals(Some(Some(6)), z.flatten());
    assertEquals(Some(6), z.flatten().flatten());
});
dntShim.Deno.test("getOrInsert", () => {
    const x = None();
    const y = x.getOrInsert(7);
    assertEquals(x, Some(7));
    assertEquals(y, 7);
    assertEquals(Some("foo").getOrInsert("bar"), "foo");
});
dntShim.Deno.test("getOrInsertWith", () => {
    const x = None();
    const y = x.getOrInsertWith(() => 8);
    assertEquals(x, Some(8));
    assertEquals(y, 8);
    assertEquals(Some("foo").getOrInsertWith(() => "bar"), "foo");
});
dntShim.Deno.test("insert", () => {
    const opt = None();
    const val = opt.insert([1]);
    val[0] = 2;
    assertEquals(opt, Some([2]));
    assertEquals(val, [2]);
});
dntShim.Deno.test("inspect", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = spy(callback);
    None().inspect(inspectSpy);
    Some("foo").inspect(inspectSpy);
    assertSpyCall(inspectSpy, 0, {
        args: ["foo"],
        returned: undefined,
    });
    assertSpyCalls(inspectSpy, 1);
});
dntShim.Deno.test("isNone", () => {
    const x = Some(2);
    assertEquals(x.isNone(), false);
    const y = None();
    assertEquals(y.isNone(), true);
});
dntShim.Deno.test("isSome", () => {
    const x = Some(2);
    assertEquals(x.isSome(), true);
    const y = None();
    assertEquals(y.isSome(), false);
});
dntShim.Deno.test("isSomeAnd", () => {
    function predicate(value) {
        return value > 1;
    }
    assertEquals(Some(2).isSomeAnd(predicate), true);
    assertEquals(Some(0).isSomeAnd(predicate), false);
    assertEquals(None().isSomeAnd(predicate), false);
});
dntShim.Deno.test("iter", () => {
    const x = Some(4);
    const iterX = x.iter();
    const x1 = iterX.next();
    assertEquals(x1.value, Some(4));
    assertEquals(x1.done, false);
    const x2 = iterX.next();
    assertEquals(x2.value, None());
    assertEquals(x2.done, true);
    const y = None();
    const iterY = y.iter();
    const y1 = iterY.next();
    assertEquals(y1.value, None());
    assertEquals(y1.done, true);
});
dntShim.Deno.test("map", () => {
    function callback(value) {
        return value.length;
    }
    const x = Some("foo");
    assertEquals(x.map(callback), Some(3));
    const y = None();
    assertEquals(y.map(callback), None());
});
dntShim.Deno.test("mapOr", () => {
    function callback(value) {
        return value.length;
    }
    const x = Some("foo");
    assertEquals(x.mapOr(12, callback), 3);
    const y = None();
    assertEquals(y.mapOr(12, callback), 12);
});
dntShim.Deno.test("mapOrElse", () => {
    function callback(value) {
        return value.length;
    }
    const x = Some("foo");
    assertEquals(x.mapOrElse(() => 12, callback), 3);
    const y = None();
    assertEquals(y.mapOrElse(() => 12, callback), 12);
});
dntShim.Deno.test("okOr", () => {
    const x = Some("foo");
    assertEquals(x.okOr(0), Ok("foo"));
    const y = None();
    assertEquals(y.okOr(0), Err(0));
});
dntShim.Deno.test("okOrElse", () => {
    const x = Some("foo");
    assertEquals(x.okOrElse(() => 0), Ok("foo"));
    const y = None();
    assertEquals(y.okOrElse(() => 0), Err(0));
});
dntShim.Deno.test("or", () => {
    let x;
    let y;
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
dntShim.Deno.test("orElse", () => {
    function nobody() {
        return None();
    }
    function vikings() {
        return Some("vikings");
    }
    const none = None();
    assertEquals(Some("barbarians").orElse(vikings), Some("barbarians"));
    assertEquals(none.orElse(vikings), Some("vikings"));
    assertEquals(none.orElse(nobody), None());
});
dntShim.Deno.test("replace", () => {
    let x = Some(2);
    let old = x.replace(5);
    assertEquals(x, Some(5));
    assertEquals(old, Some(2));
    x = None();
    old = x.replace(3);
    assertEquals(x, Some(3));
    assertEquals(old, None());
});
dntShim.Deno.test("take", () => {
    let x = Some(2);
    let y = x.take();
    assertEquals(x, None());
    assertEquals(y, Some(2));
    x = None();
    y = x.take();
    assertEquals(x, None());
    assertEquals(y, None());
});
dntShim.Deno.test("transpose", () => {
    let x;
    let y;
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
dntShim.Deno.test("unwrap", () => {
    assertEquals(Some(2).unwrap(), 2);
    assertThrows(() => None().unwrap(), Error);
});
dntShim.Deno.test("unwrapOr", () => {
    assertEquals(Some("foo").unwrapOr("bar"), "foo");
    const none = None();
    assertEquals(none.unwrapOr("bar"), "bar");
});
dntShim.Deno.test("unwrapOrElse", () => {
    const k = 10;
    assertEquals(Some(4).unwrapOrElse(() => 2 * k), 4);
    const none = None();
    assertEquals(none.unwrapOrElse(() => 2 * k), 20);
});
dntShim.Deno.test("unwrapUnchecked", () => {
    assertEquals(Some("foo").unwrapUnchecked(), "foo");
    assertEquals(None().unwrapUnchecked(), undefined);
});
dntShim.Deno.test("unzip", () => {
    const x = Some([2, "foo"]);
    const y = None();
    assertEquals(x.unzip(), [Some(2), Some("foo")]);
    assertEquals(y.unzip(), [None(), None()]);
});
dntShim.Deno.test("xor", () => {
    let x;
    let y;
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
dntShim.Deno.test("zip", () => {
    const x = Some(2);
    const y = Some("foo");
    const z = None();
    assertEquals(x.zip(y), Some([2, "foo"]));
    assertEquals(x.zip(z), None());
});
dntShim.Deno.test("zipWith", () => {
    function Point(x, y) {
        return Object.create({ x, y });
    }
    const x = Some(1);
    const y = Some(2);
    assertEquals(x.zipWith(y, Point), Some(Point(1, 2)));
    assertEquals(x.zipWith(None(), Point), None());
});
