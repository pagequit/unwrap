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
  function callback<T>(value: T): void {
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

Deno.test("isOk", () => {
  const x: Result<number, string> = Ok(-3);
  assertEquals(x.isOk(), true);

  const y: Result<number, string> = Err("Some error message");
  assertEquals(y.isOk(), false);
});
