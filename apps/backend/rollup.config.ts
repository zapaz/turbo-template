import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import builtins from "rollup-plugin-node-builtins";
import postcss from "rollup-plugin-postcss";

import autoPreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
        stdio: ["ignore", "inherit", "inherit"],
        shell: true
      });

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    }
  };
}

const toRollupConfig = (component) => {
  return {
    input: `./svelte/${component}.svelte`,
    output: {
      sourcemap: !production,
      format: "iife",
      name: "app",
      file: `docs/build/${component}.js`
    },
    plugins: [
      svelte({
        preprocess: autoPreprocess(),
        compilerOptions: {
          customElement: false,
          // enable run-time checks when not in production
          dev: !production
        }
        // we'll extract any component CSS out into
        // a separate file - better for performance
      }),
      postcss({
        extract: true
      }),
      typescript({ sourceMap: !production }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      builtins(),
      resolve({
        browser: true,
        dedupe: ["svelte"]
      }),
      commonjs(),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production && livereload("docs"),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),

      json()
    ],
    watch: {
      clearScreen: false
    },
    onwarn: function (warning) {
      if (warning.code === "THIS_IS_UNDEFINED" || warning.code === "CIRCULAR_DEPENDENCY") {
        return;
      }
      console.warn(warning.message);
    }
  };
};

export default [toRollupConfig("App")];
