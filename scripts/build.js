import fs from "fs";
import path from "path";
import archiver from "archiver";
import { minify as minifyJS } from "terser";
import CleanCSS from "clean-css";

const DIST_DIR = "dist";
const SRC_DIR = "src";
const TMP_DIR = path.join(DIST_DIR, "tmp");
const OUTPUT_FILE = "toolbar-aem.zip";
const outputPath = path.resolve(`${DIST_DIR}/${OUTPUT_FILE}`);

// Recursively copy files and minify .js and .css
async function copyAndMinify(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyAndMinify(srcPath, destPath);
    } else if (entry.name.endsWith(".js")) {
      const code = fs.readFileSync(srcPath, "utf8");
      const result = await minifyJS(code);
      fs.writeFileSync(destPath, result.code, "utf8");
    } else if (entry.name.endsWith(".css")) {
      const css = fs.readFileSync(srcPath, "utf8");
      const result = new CleanCSS({ level: 2 }).minify(css);
      if (result.errors.length) {
        console.warn(`CSS minification errors in ${srcPath}:`, result.errors);
      }
      fs.writeFileSync(destPath, result.styles, "utf8");
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  console.log("Building Chrome extension...");

  // Ensure directories exist and clean previous build
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  // Copy and minify JS & CSS
  await copyAndMinify(SRC_DIR, TMP_DIR);

  // Create output stream and archive
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);

  // Error handling
  output.on("error", (err) => {
    console.error("Error writing archive:", err);
    process.exit(1);
  });
  archive.on("error", (err) => {
    console.error("Archiver error:", err);
    process.exit(1);
  });

  // Add processed files to the archive
  archive.glob("**/*", {
    cwd: TMP_DIR,
    ignore: ["**/.DS_Store", "**/Thumbs.db", "**/.gitkeep"],
  });

  await archive.finalize();

  output.on("close", () => {
    const sizeKB = (archive.pointer() / 1024).toFixed(2);
    console.log(`Extension packaged successfully → ${outputPath}`);
    console.log(`Size: ${sizeKB} KB`);
  });
}

// Run the build
build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
