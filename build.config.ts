import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  entries: [
    "src/index",
    {
      builder: "mkdist",
      input: "./src/utils/",
      outDir: "./dist/",
    },
  ],
  rollup: { esbuild: { target: "esnext" } },
})
