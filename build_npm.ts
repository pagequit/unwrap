import { build, emptyDir } from "https://deno.land/x/dnt@0.31.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "unwrap",
    version: Deno.args[0],
    description: "Yet another Option<T> and Result<T, E>, implemented for TypeScript.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/pagequit/unwrap.git",
    },
    bugs: {
      url: "https://github.com/pagequit/unwrap/issues",
    },
  },
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
