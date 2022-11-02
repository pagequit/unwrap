import { Ok } from "./mod.ts";
import Result from "./result.ts";
import match from "./match.ts";

function pseudoFetch(): Promise<Result<{ data: unknown }, string>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve(Ok({ data: 42 }));
    }, 300);
  });
}

match<{ data: unknown }, string>(Ok({ data: 42 }), {
  Ok: ({ data }) => console.log(data),
  Err: (error) => console.error(error),
});
