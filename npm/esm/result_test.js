import * as dntShim from "./_dnt.test_shims.js";
import { assertEquals, assertInstanceOf, assertThrows, } from "./deps/deno.land/std@0.161.0/testing/asserts.js";
import { assertSpyCall, assertSpyCalls, spy, } from "./deps/deno.land/std@0.161.0/testing/mock.js";
import { None, Some } from "./option.js";
import Result, { Err, Ok, ResultType } from "./result.js";
dntShim.Deno.test("Err", () => {
    const err = Err("Error");
    assertEquals(err.discriminant, ResultType.Err);
    assertInstanceOf(err, Result);
});
dntShim.Deno.test("Ok", () => {
    const ok = Ok(1);
    assertEquals(ok.discriminant, ResultType.Ok);
    assertInstanceOf(Ok(1), Result);
});
dntShim.Deno.test("iterator", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = spy(callback);
    for (const ok of Ok(2)) {
        inspectSpy(ok);
    }
    for (const err of Err("foo")) {
        inspectSpy(err);
    }
    assertSpyCalls(inspectSpy, 1);
});
dntShim.Deno.test("and", () => {
    let x;
    let y;
    x = Ok(2);
    y = Err("late error");
    assertEquals(x.and(y), Err("late error"));
    x = Err("early error");
    y = Ok("foo");
    assertEquals(x.and(y), Err("early error"));
    x = Err("not a 2");
    y = Err("late error");
    assertEquals(x.and(y), Err("not a 2"));
    x = Ok(2);
    y = Ok("other type");
    assertEquals(x.and(y), Ok("other type"));
});
dntShim.Deno.test("andThen", () => {
    function sqThenToString(x) {
        return Ok((x * x).toString());
    }
    const ok = Ok(2);
    const err = Err("not a number");
    assertEquals(ok.andThen(sqThenToString), Ok("4"));
    assertEquals(err.andThen(sqThenToString), Err("not a number"));
});
dntShim.Deno.test("contains", () => {
    const x = Ok(2);
    assertEquals(x.contains(2), true);
    const y = Ok(3);
    assertEquals(y.contains(2), false);
    const z = Err("Some error message");
    assertEquals(z.contains(2), false);
});
dntShim.Deno.test("containsErr", () => {
    const x = Ok(2);
    assertEquals(x.containsErr("Some error message"), false);
    const y = Err("Some error message");
    assertEquals(y.containsErr("Some error message"), true);
    const z = Err("foo");
    assertEquals(z.containsErr("Some error message"), false);
});
dntShim.Deno.test("err", () => {
    const x = Ok(2);
    assertEquals(x.err(), None());
    const y = Err("Error");
    assertEquals(y.err(), Some("Error"));
});
dntShim.Deno.test("expect", () => {
    assertEquals(Ok(2).expect("foo"), 2);
    assertThrows(() => Err(1).expect("foo"), Error, "foo");
});
dntShim.Deno.test("expectErr", () => {
    assertEquals(Err(1).expectErr("foo"), 1);
    assertThrows(() => Ok(2).expectErr("foo"), Error, "foo");
});
dntShim.Deno.test("flatten", () => {
    const x = Ok(Ok(2));
    assertEquals(Ok(2), x.flatten());
    const y = Err("foo");
    assertEquals(Err("foo"), y.flatten());
    const z = Ok(Ok(Ok(3)));
    assertEquals(Ok(Ok(3)), z.flatten());
    assertEquals(Ok(3), z.flatten().flatten());
});
dntShim.Deno.test("inspect", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = spy(callback);
    Err("foo").inspect(inspectSpy);
    Ok(2).inspect(inspectSpy);
    assertSpyCall(inspectSpy, 0, {
        args: [2],
        returned: undefined,
    });
    assertSpyCalls(inspectSpy, 1);
});
dntShim.Deno.test("inspectErr", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = spy(callback);
    Ok(2).inspectErr(inspectSpy);
    Err("foo").inspectErr(inspectSpy);
    assertSpyCall(inspectSpy, 0, {
        args: ["foo"],
        returned: undefined,
    });
    assertSpyCalls(inspectSpy, 1);
});
dntShim.Deno.test("isErr", () => {
    const x = Ok(-3);
    assertEquals(x.isErr(), false);
    const y = Err("Some error message");
    assertEquals(y.isErr(), true);
});
dntShim.Deno.test("isErrAnd", () => {
    const x = Err(Error("NotFound"));
    assertEquals(x.isErrAnd((x) => x.message === "NotFound"), true);
    const y = Err(Error("OtherError"));
    assertEquals(y.isErrAnd((y) => y.message === "NotFound"), false);
    const z = Ok(123);
    assertEquals(z.isErrAnd((z) => z.message === "NotFound"), false);
});
dntShim.Deno.test("isOk", () => {
    const x = Ok(-3);
    assertEquals(x.isOk(), true);
    const y = Err("Some error message");
    assertEquals(y.isOk(), false);
});
dntShim.Deno.test("isOkAnd", () => {
    const x = Ok(2);
    assertEquals(x.isOkAnd((x) => x > 1), true);
    const y = Ok(0);
    assertEquals(y.isOkAnd((y) => y > 1), false);
    const z = Err("foo");
    assertEquals(z.isOkAnd((z) => z > 1), false);
});
dntShim.Deno.test("iter", () => {
    const x = Ok(4);
    const iterX = x.iter();
    const x1 = iterX.next();
    assertEquals(x1.value, Some(4));
    assertEquals(x1.done, false);
    const x2 = iterX.next();
    assertEquals(x2.value, None());
    assertEquals(x2.done, true);
    const y = Err("foo");
    const iterY = y.iter();
    const y1 = iterY.next();
    assertEquals(y1.value, None());
    assertEquals(y1.done, true);
});
dntShim.Deno.test("map", () => {
    function callback(value) {
        return value.toString();
    }
    const x = Ok(2);
    assertEquals(x.map(callback), Ok("2"));
    const y = Err("foo");
    assertEquals(y.map(callback), Err("foo"));
});
dntShim.Deno.test("mapErr", () => {
    function callback(value) {
        return value.length;
    }
    const x = Err("foo");
    assertEquals(x.mapErr(callback), Err(3));
    const y = Ok(2);
    assertEquals(y.mapErr(callback), Ok(2));
});
dntShim.Deno.test("mapOr", () => {
    const x = Ok("foo");
    assertEquals(x.mapOr(42, (x) => x.length), 3);
    const y = Err("some error");
    assertEquals(y.mapOr(42, (y) => y.length), 42);
});
dntShim.Deno.test("mapOrElse", () => {
    const x = Ok(2);
    assertEquals(x.mapOrElse((e) => e.length, (x) => x * 2), 4);
    const y = Err("foo");
    assertEquals(y.mapOrElse((e) => e.length, (y) => y / 7), 3);
});
dntShim.Deno.test("ok", () => {
    const x = Ok(2);
    assertEquals(x.ok(), Some(2));
    const y = Err("foo");
    assertEquals(y.ok(), None());
});
dntShim.Deno.test("or", () => {
    let x;
    let y;
    x = Ok(2);
    y = Err("late error");
    assertEquals(x.or(y), Ok(2));
    x = Err("early error");
    y = Ok(2);
    assertEquals(x.or(y), Ok(2));
    x = Err("early error");
    y = Err("late error");
    assertEquals(x.or(y), Err("late error"));
    x = Ok(2);
    y = Ok(100);
    assertEquals(x.or(y), Ok(2));
});
dntShim.Deno.test("orElse", () => {
    function square(x) {
        return Ok(x.length);
    }
    const ok = Ok(2);
    const err = Err("foo");
    assertEquals(ok.orElse(square), Ok(2));
    assertEquals(err.orElse(square), Ok(3));
});
dntShim.Deno.test("transpose", () => {
    let x;
    let y;
    x = Ok(Some(5));
    y = Some(Ok(5));
    assertEquals(x.transpose(), y);
    x = Err("foo");
    y = Some(Err("foo"));
    assertEquals(x.transpose(), y);
    x = Ok(None());
    y = None();
    assertEquals(x.transpose(), y);
});
dntShim.Deno.test("unwrap", () => {
    assertEquals(Ok(2).unwrap(), 2);
    assertThrows(() => Err("foo").unwrap(), Error);
});
dntShim.Deno.test("unwrapErr", () => {
    assertEquals(Err("foo").unwrapErr(), "foo");
    assertThrows(() => Ok(2).unwrapErr(), Error);
});
dntShim.Deno.test("unwrapErrUnchecked", () => {
    assertEquals(Err("foo").unwrapErrUnchecked(), "foo");
    assertEquals(Ok(2).unwrapErrUnchecked(), undefined);
});
dntShim.Deno.test("unwrapOr", () => {
    const x = Ok(9);
    assertEquals(x.unwrapOr(42), 9);
    const y = Err("foo");
    assertEquals(y.unwrapOr(42), 42);
});
dntShim.Deno.test("unwrapOrElse", () => {
    const x = Ok(9);
    assertEquals(x.unwrapOrElse((e) => e.length), 9);
    const y = Err("foo");
    assertEquals(y.unwrapOrElse((e) => e.length), 3);
});
dntShim.Deno.test("unwrapUnchecked", () => {
    assertEquals(Ok(2).unwrapUnchecked(), 2);
    assertEquals(Err("foo").unwrapUnchecked(), undefined);
});
