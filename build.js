import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/cli.js"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/cli.js",
  external: ["node-notifier"],
  banner: {
    js: `#!/usr/bin/env node
import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);`,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  plugins: [
    {
      name: "suppress-devtools",
      setup(build) {
        build.onResolve({ filter: /^react-devtools-core$/ }, () => {
          return {
            path: "react-devtools-core",
            namespace: "suppress-devtools",
          };
        });
        build.onLoad({ filter: /.*/, namespace: "suppress-devtools" }, () => {
          return { contents: "export default {}" };
        });
      },
    },
  ],
});

console.log("Build complete! ⚡");
