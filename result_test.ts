import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.157.0/testing/asserts.ts";
import {
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.157.0/testing/mock.ts";
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
