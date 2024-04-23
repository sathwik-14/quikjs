import fs from "fs";
import path from "path";

function pathJoin(relPath) {
  return path.join(process.cwd(), relPath);
}

export function read(relativePath) {
  const absPath = pathJoin(relativePath);
  return fs.readFileSync(absPath, "utf-8");
}

export function write(relativePath, content) {
  try {
    const absPath = pathJoin(relativePath);
    fs.writeFileSync(absPath, content);
  } catch {
    console.error("FAILED WRITING TO FILE ", relativePath);
  }
}

export function append(relativePath, content) {
  try {
    const absPath = pathJoin(relativePath);
    fs.appendFileSync(absPath, content);
  } catch {
    console.error("FAILED WRITING TO FILE ", relativePath);
  }
}

export function exists(path) {
  const absPath = pathJoin(path);
  return fs.existsSync(absPath, { recursive: true });
}

export function createDirectory(path) {
  fs.mkdirSync(path);
}
