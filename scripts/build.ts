import { $ } from "bun";
import { rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await $`bunx tsgo`;
console.log("Build complete.");
