import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { Err, Ok } from "./result.ts";
import teaCall from "./tea_call.ts";

Deno.test("teaCall should return Ok with the result of the callback function", () => {
  const callbackFn = (a: number, b: number) => a + b;
  const args = [1, 2];
  const result = teaCall(callbackFn, ...args);

  assertEquals(result, Ok(3));
});

Deno.test("teaCall should return Err with the error thrown by the callback function", () => {
  const callbackFn = () => {
    throw new Error("Something went wrong");
  };

  const result = teaCall(callbackFn);

  assertEquals(result, Err(new Error("Something went wrong")));
});
