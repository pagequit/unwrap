import { Collection } from "./mod.ts";
import { None, Option, Some } from "./mod.ts";
import { Err, Ok, Result } from "./mod.ts";
import { teaCall } from "./mod.ts";

type User = { name: string; age: number };
const users = Collection.from<string, User>([
  ["#123", { name: "Alice", age: 32 }],
  ["#321", { name: "Bob", age: 23 }],
]);

const alice = users.get("#123");
const bob = users.get("#321");

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

const charlie: Result<User, Error> = teaCall(
  JSON.parse,
  '{ "name": "Charlie", "age": 33 }',
);
const ci = charlie.iter();
console.log(ci.next().value.unwrap().age); // 33
