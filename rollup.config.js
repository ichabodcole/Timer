import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import progress from "rollup-plugin-progress";
import { terser } from "rollup-plugin-terser";
import { eslint } from "rollup-plugin-eslint";
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "@rollup/plugin-commonjs";
import path from "path";

const plugins = [
  resolve({
    rootDir: path.join("."),
  }),
  commonjs(),
  eslint(),
  typescript({
    tsconfig: "./tsconfig.json",
    useTsconfigDeclarationDir: true,
  }),
  progress(),
  sourcemaps(),
];

const outDir = "dist";
const outPath = `${outDir}/timer`;

export default [
  {
    input: "src/index.ts",
    output: {
      name: "Timer",
      file: `${outPath}.umd.js`,
      format: "umd",
      sourcemap: true,
    },
    plugins: [...plugins, terser()],
  },
  {
    input: "src/index.ts",
    plugins,
    output: {
      name: "Timer",
      file: `${outPath}.esm.js`,
      format: "es",
      sourcemap: true,
    },
  },
];
