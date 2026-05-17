import { Buffer } from "node:buffer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = path.join(rootDir, "dist");
const outDir = path.join(rootDir, "portable");
const outFile = path.join(outDir, "gim-workbench.html");

function assetPath(src) {
  return path.join(distDir, src.replace(/^\//, ""));
}

function toDataSvg(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

let html = await readFile(path.join(distDir, "index.html"), "utf8");
const iconSvg = await readFile(path.join(distDir, "app-icon.svg"), "utf8");
const iconHref = toDataSvg(iconSvg);

const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);

if (!scriptMatch || !styleMatch) {
  throw new Error("Could not find Vite script/style assets in dist/index.html.");
}

const js = await readFile(assetPath(scriptMatch[1]), "utf8");
const css = await readFile(assetPath(styleMatch[1]), "utf8");
const safeJs = js.replaceAll("</script", "<\\/script");

html = html
  .replace(/\s*<link rel="manifest" href="\/manifest\.json" \/>\n/, "\n")
  .replaceAll('href="/app-icon.svg"', `href="${iconHref}"`)
  .replace(scriptMatch[0], "")
  .replace(
    styleMatch[0],
    () => `<style>\n${css}\n</style>`,
  )
  .replace(
    "<title>総診ワークベンチ | GIM Workbench</title>",
    '<meta name="portable-build" content="single-file" />\n    <title>総診ワークベンチ | GIM Workbench</title>',
  )
  .replace(
    "  </body>",
    () => `    <script>\n${safeJs}\n</script>\n  </body>`,
  );

await mkdir(outDir, { recursive: true });
await writeFile(outFile, html, "utf8");

console.log(`Portable HTML written: ${path.relative(rootDir, outFile)}`);
