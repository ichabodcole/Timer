import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import progress from "rollup-plugin-progress";
import { eslint } from "rollup-plugin-eslint";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

const plugins = [
  resolve(),
  commonjs(),
  eslint(),
  typescript({
    typescript: require("typescript"),
    tsconfig: "./examples/tsconfig.json",
  }),
  progress(),
];

const outDir = "./examples/dist";

export default [
  {
    input: "./examples/src/index.tsx",
    output: {
      name: "TimerExamples",
      file: `${outDir}/examples.js`,
      format: "iife",
    },
    plugins: [
      ...plugins,
      serve({ contentBase: "examples", port: 1337 }),
      livereload(),
    ],
  },
];
