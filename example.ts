import { None, Option, Some } from "./mod.ts";
import { Err, Ok, Result } from "./mod.ts";

class OMap<K, V> extends Map<K, V> {
  /**
   * Don't use `get` on an OMap, use `oget` instead!
   * @param this force a compile time error
   * @param key
   */
  get(this: never, key: K): V | undefined {
    throw Error("Don't use `get` on an OMap, use `oget` instead!");
  }

  oget(key: K): Option<V> {
    const value = super.get(key);
    return value === undefined ? None() : Some(value);
  }
}

type User = { name: string; age: number };
const users = new OMap<string, User>([
  ["#123", { name: "Alice", age: 32 }],
  ["#321", { name: "Bob", age: 23 }],
]);

const alice = users.oget("#123");
const bob = users.oget("#321");

const ab = alice.zip(bob);
let i = 0;
for (const value of ab) {
  value.unwrap().forEach(() => {
    i += 1;
  });
}
console.log(i); // 2

const none = bob.zip(None());
let j = 0;
for (const value of none) {
  value.unwrap().forEach(() => {
    j += 1;
  });
}
console.log(j); // 0

abstract class RJSON {
  static parse(
    text: string,
    reviver?: (this: any, key: string, value: any) => any,
  ): Result<any, SyntaxError> {
    try {
      return Ok(JSON.parse(text, reviver));
    } catch (error) {
      return Err(error as SyntaxError);
    }
  }
}

const charlie: Result<User, SyntaxError> = RJSON.parse(
  '{ "name": "Charlie", "age": 33 }',
);
const ci = charlie.iter();
console.log(ci.next().value.unwrap().age); // 33
