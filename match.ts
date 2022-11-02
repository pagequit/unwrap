import Option, { None, Some } from "./option.ts";
import Result, { Err, Ok } from "./result.ts";

export default function match<
  T,
  E,
  V extends Result<T, E> | Option<T>,
  O extends {
    Err: (error: E) => void;
    Ok: (value: T) => void;
  } | {
    None: () => void;
    Some: (value: T) => void;
  },
>(value: V, options: O) {
  return;
}
