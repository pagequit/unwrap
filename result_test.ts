import {
  assertEquals,
  assertInstanceOf,
  assertThrows,
} from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.192.0/testing/mock.ts";
import Option, { None, Some } from "./option.ts";
import Result, { Err, Ok, ResultType } from "./result.ts";

Deno.test("Err", () => {
  const err = Err("Error");

  assertEquals(err.discriminant, ResultType.Err);
  assertInstanceOf(err, Result);
});

Deno.test("Ok", () => {
  const ok = Ok(1);

  assertEquals(ok.discriminant, ResultType.Ok);
  assertInstanceOf(Ok(1), Result);
});

Deno.test("iterator", () => {
  let x = 1;
  for (const ok of Ok(2)) {
    x = x + ok;
  }

  for (const err of <Result<number, number>> Err(1)) {
    x = x + err;
  }

  assertEquals(x, 3);
});

Deno.test("and", () => {
  let x: Result<number, string>;
  let y: Result<string, string>;

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

Deno.test("andThen", () => {
  function sqThenToString(x: number): Result<string, string> {
    return Ok((x * x).toString());
  }

  const ok: Result<number, string> = Ok(2);
  const err: Result<number, string> = Err("not a number");

  assertEquals(ok.andThen(sqThenToString), Ok("4"));
  assertEquals(err.andThen(sqThenToString), Err("not a number"));
});

Deno.test("clone", () => {
  const x: Result<{ a: number }, Error> = Ok({ a: 1 });
  const y: Result<{ a: number }, Error> = Err(new Error("error"));
  const cx = x.clone();
  const cy = y.clone();

  x.unwrap().a = 2;
  cx.unwrap().unwrap().a = 3;

  y.unwrapErr().message = "new error";
  cy.unwrap().unwrapErr().message = "cloned error";

  assertEquals(x, Ok({ a: 2 }));
  assertEquals(cx, Ok(Ok({ a: 3 })));
  assertEquals(y, Err(new Error("new error")));
  assertEquals(cy, Ok(Err(new Error("cloned error"))));
});

Deno.test("contains", () => {
  const x: Result<number, string> = Ok(2);
  assertEquals(x.contains(2), true);

  const y: Result<number, string> = Ok(3);
  assertEquals(y.contains(2), false);

  const z: Result<number, string> = Err("Some error message");
  assertEquals(z.contains(2), false);
});

Deno.test("containsErr", () => {
  const x: Result<number, string> = Ok(2);
  assertEquals(x.containsErr("Some error message"), false);

  const y: Result<number, string> = Err("Some error message");
  assertEquals(y.containsErr("Some error message"), true);

  const z: Result<number, string> = Err("foo");
  assertEquals(z.containsErr("Some error message"), false);
});

Deno.test("err", () => {
  const x: Result<number, string> = Ok(2);
  assertEquals(x.err(), None());

  const y: Result<number, string> = Err("Error");
  assertEquals(y.err(), Some("Error"));
});

Deno.test("expect", () => {
  assertEquals(Ok(2).expect("foo"), 2);
  assertThrows(() => Err(1).expect("foo"), Error, "foo");
});

Deno.test("expectErr", () => {
  assertEquals(Err(1).expectErr("foo"), 1);
  assertThrows(() => Ok(2).expectErr("foo"), Error, "foo");
});

Deno.test("flatten", () => {
  const x: Result<Result<number, string>, string> = Ok(Ok(2));
  assertEquals(Ok(2), x.flatten());

  const y: Result<Result<number, string>, string> = Err("foo");
  assertEquals(Err("foo"), y.flatten());

  const z: Result<Result<Result<number, string>, string>, string> = Ok(
    Ok(Ok(3)),
  );
  assertEquals(Ok(Ok(3)), z.flatten());
  assertEquals(Ok(3), z.flatten().flatten());
});

Deno.test("inspect", () => {
  function callback<T>(value: T): void {
    console.log(value);
  }

  const inspectSpy = spy(callback);

  Err("foo").inspect(inspectSpy);
  Ok(2).inspect(inspectSpy);

  assertSpyCall(inspectSpy, 0, {
    args: [2],
    returned: undefined as void,
  });
  assertSpyCalls(inspectSpy, 1);
});

Deno.test("inspectErr", () => {
  function callback<T>(value: T): void {
    console.log(value);
  }

  const inspectSpy = spy(callback);

  Ok(2).inspectErr(inspectSpy);
  Err("foo").inspectErr(inspectSpy);

  assertSpyCall(inspectSpy, 0, {
    args: ["foo"],
    returned: undefined as void,
  });
  assertSpyCalls(inspectSpy, 1);
});

Deno.test("isErr", () => {
  const x: Result<number, string> = Ok(-3);
  assertEquals(x.isErr(), false);

  const y: Result<number, string> = Err("Some error message");
  assertEquals(y.isErr(), true);
});

Deno.test("isErrAnd", () => {
  const x: Result<number, Error> = Err(Error("NotFound"));
  assertEquals(x.isErrAnd((x) => x.message === "NotFound"), true);

  const y: Result<number, Error> = Err(Error("OtherError"));
  assertEquals(y.isErrAnd((y) => y.message === "NotFound"), false);

  const z: Result<number, Error> = Ok(123);
  assertEquals(z.isErrAnd((z) => z.message === "NotFound"), false);
});

Deno.test("isOk", () => {
  const x: Result<number, string> = Ok(-3);
  assertEquals(x.isOk(), true);

  const y: Result<number, string> = Err("Some error message");
  assertEquals(y.isOk(), false);
});

Deno.test("isOkAnd", () => {
  const x: Result<number, string> = Ok(2);
  assertEquals(x.isOkAnd((x) => x > 1), true);

  const y: Result<number, string> = Ok(0);
  assertEquals(y.isOkAnd((y) => y > 1), false);

  const z: Result<number, string> = Err("foo");
  assertEquals(z.isOkAnd((z) => z > 1), false);
});

Deno.test("iter", () => {
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

Deno.test("map", () => {
  function callback(value: number): string {
    return value.toString();
  }

  const x: Result<number, string> = Ok(2);
  assertEquals(x.map(callback), Ok("2"));

  const y: Result<number, string> = Err("foo");
  assertEquals(y.map(callback), Err("foo"));
});

Deno.test("mapErr", () => {
  function callback(value: string): number {
    return value.length;
  }

  const x: Result<number, string> = Err("foo");
  assertEquals(x.mapErr(callback), Err(3));

  const y: Result<number, string> = Ok(2);
  assertEquals(y.mapErr(callback), Ok(2));
});

Deno.test("mapOr", () => {
  const x: Result<string, string> = Ok("foo");
  assertEquals(x.mapOr(42, (x) => x.length), 3);

  const y: Result<string, string> = Err("some error");
  assertEquals(y.mapOr(42, (y) => y.length), 42);
});

Deno.test("mapOrElse", () => {
  const x: Result<number, string> = Ok(2);
  assertEquals(x.mapOrElse((e) => e.length, (x) => x * 2), 4);

  const y: Result<number, string> = Err("foo");
  assertEquals(y.mapOrElse((e) => e.length, (y) => y / 7), 3);
});

Deno.test("match", () => {
  const x: Result<number, string> = Ok(2);
  const y: Result<number, string> = Err("error");
  const matcher = <{
    Ok: (value: number) => string;
    Err: (error: string) => string;
  }> {
    Ok: (value) => value.toString(),
    Err: (error) => error,
  };

  assertEquals(x.match(matcher), "2");
  assertEquals(y.match(matcher), "error");
});

Deno.test("ok", () => {
  const x: Result<number, string> = Ok(2);
  assertEquals(x.ok(), Some(2));

  const y: Result<number, string> = Err("foo");
  assertEquals(y.ok(), None());
});

Deno.test("or", () => {
  let x: Result<number, string>;
  let y: Result<number, string>;

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

Deno.test("orElse", () => {
  function square(x: string): Result<number, string> {
    return Ok(x.length);
  }

  const ok: Result<number, string> = Ok(2);
  const err: Result<number, string> = Err("foo");

  assertEquals(ok.orElse(square), Ok(2));
  assertEquals(err.orElse(square), Ok(3));
});

Deno.test("transpose", () => {
  let x: Result<Option<number>, string>;
  let y: Option<Result<number, string>>;

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

Deno.test("unwrap", () => {
  assertEquals(Ok(2).unwrap(), 2);
  assertThrows(() => Err("foo").unwrap(), Error);
});

Deno.test("unwrapErr", () => {
  assertEquals(Err("foo").unwrapErr(), "foo");
  assertThrows(() => Ok(2).unwrapErr(), Error);
});

Deno.test("unwrapErrUnchecked", () => {
  assertEquals(Err("foo").unwrapErrUnchecked(), "foo");
  assertEquals(Ok(2).unwrapErrUnchecked(), undefined);
});

Deno.test("unwrapOr", () => {
  const x: Result<number, string> = Ok(9);
  assertEquals(x.unwrapOr(42), 9);

  const y: Result<number, string> = Err("foo");
  assertEquals(y.unwrapOr(42), 42);
});

Deno.test("unwrapOrElse", () => {
  const x: Result<number, string> = Ok(9);
  assertEquals(x.unwrapOrElse((e) => e.length), 9);

  const y: Result<number, string> = Err("foo");
  assertEquals(y.unwrapOrElse((e) => e.length), 3);
});

Deno.test("unwrapUnchecked", () => {
  assertEquals(Ok(2).unwrapUnchecked(), 2);
  assertEquals(Err("foo").unwrapUnchecked(), undefined);
});
