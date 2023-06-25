import { Err, Ok, Result } from "./mod.ts";

/** @experimental */
export default function teaCall<
  T,
  E,
  A extends unknown[],
  Fn extends (...args: A) => T,
>(
  callback: Fn,
  ...args: A
): Result<T, E> {
  try {
    return Ok(callback(...args));
  } catch (error: unknown) {
    return Err(error as E);
  }
}
