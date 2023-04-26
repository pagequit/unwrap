import { Err, Ok, Result } from "./mod.ts";

export default function teaCall<
  T,
  E,
  A extends unknown[],
  Fn extends (...args: A) => T,
>(
  callbackFn: Fn,
  ...args: A
): Result<T, E> {
  try {
    const result = callbackFn(...args);
    return Ok(result);
  } catch (error) {
    return Err(error as E);
  }
}
