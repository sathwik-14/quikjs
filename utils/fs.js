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
