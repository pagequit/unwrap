import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { Err, Ok } from "./result.ts";
import teaCall from "./tea_call.ts";

Deno.test("teaCall should return Ok with the result of the callback function", () => {
  function callback(a: number, b: number): number {
    return a + b;
  }

  const result = teaCall<number, never, [number, number], typeof callback>(
    callback,
    1,
    2,
  );

  assertEquals(result, Ok(3));
});

Deno.test("teaCall should return Err with the error thrown by the callback function", () => {
  function callback(): never {
    throw new Error("Something went wrong");
  }

  const result = teaCall<never, never, never, typeof callback>(callback);

  assertEquals(result, Err(new Error("Something went wrong")));
});
