# unwrap

Yet another TypeScript `Option<T>` and `Result<T, E>` implementation.

## Examples

```ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Collection, None, Some } from "https://deno.land/x/unwrap/mod.ts";

type User = { name: string; age: number };
const users = Collection.from<string, User>([
  ["#123", { name: "Alice", age: 32 }],
  ["#321", { name: "Bob", age: 23 }],
]);

const alice = users.get("#123");
assertEquals(alice, Some({ name: "Alice", age: 32 }));

const charlie = users.get("#000");
assertEquals(charlie, None());

const conditionalMappedValue = users.get("#123").and(users.get("#321")).match({
  Some: (user) => user.name + " is " + user.age.toString(),
  None: () => "never",
});
assertEquals(conditionalMappedValue, "Bob is 23");
```

```ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Result, teaCall } from "https://deno.land/x/unwrap/mod.ts";

type User = { name: string; age: number };
const charlie: Result<User, Error> = teaCall(
  JSON.parse,
  '{ "name": "Charlie", "age": 33 }',
);
assertEquals(charlie.unwrap().name, "Charlie");
```
