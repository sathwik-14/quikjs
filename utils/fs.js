import fs from 'fs';
import path from 'path';
import format from './format.js';

function pathJoin(relPath) {
  return path.join(process.cwd(), relPath);
}

export function read(relativePath) {
  const absPath = pathJoin(relativePath);
  if (exists(relativePath)) {
    return fs.readFileSync(absPath, 'utf-8');
  } else {
    console.log('Path not found - ', absPath);
  }
}

export async function write(relativePath, content, options = { format: true }) {
  try {
    const absPath = pathJoin(relativePath);
    if (options.format) {
      content = await format(content);
    }
    if (options?.parser) {
      content = await format(content, options.parser);
    }
    fs.writeFileSync(absPath, content);
  } catch {
    console.error('FAILED WRITING TO FILE ', relativePath);
  }
}

export function append(relativePath, content) {
  try {
    const absPath = pathJoin(relativePath);
    fs.appendFileSync(absPath, content);
  } catch {
    console.error('FAILED WRITING TO FILE ', relativePath);
  }
}

export function exists(path) {
  const absPath = pathJoin(path);
  return fs.existsSync(absPath, { recursive: true });
}

export function createDirectory(path) {
  fs.mkdirSync(path);
}
