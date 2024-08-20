import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false, // Generate .d.ts files
  minify: true, // Minify the output
  outDir: "dist", // Output directory
});
