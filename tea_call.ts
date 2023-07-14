import { Err, Ok, Result } from "./mod.ts";

/**
 * Use to call "unsafe" functions, which may throws an error.
 * @example
 * ```ts
 * type User = { name: string; age: number };
 * const charlie: Result<User, Error> = teaCall(
 *   JSON.parse,
 *   '{ "name": "Charlie", "age": 33 }',
 * );
 * assertEquals(charlie.unwrap().name, "Charlie");
 * ```
 */
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
