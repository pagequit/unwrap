import { None, Some } from "./mod.ts";

const x = Some("foo");

for (const foo of x) {
  console.log(foo);
}

for (const none of None()) {
  console.log(none);
}

const y = Some(2);
const z = Promise.any(x.zip(y));
console.log(z);
