import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "aluminum_industry_news.md");
const publicDir = path.join(rootDir, "public");
const targetPath = path.join(publicDir, "aluminum_industry_news.md");

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

if (!(await fileExists(sourcePath))) {
  console.warn(`News markdown not found at ${sourcePath}; skipping sync.`);
  process.exit(0);
}

await fs.mkdir(publicDir, { recursive: true });
await fs.copyFile(sourcePath, targetPath);
console.log(`Synced news markdown to ${targetPath}.`);
