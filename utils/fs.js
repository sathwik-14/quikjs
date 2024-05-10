import fs from 'fs';
import path from 'path';
import format from './format.js';

const pathJoin = (relPath) => {
  /* eslint-disable no-undef */
  const projectRoot = process.cwd();
  return path.join(projectRoot, relPath);
};

const read = (relativePath) => {
  const absPath = pathJoin(relativePath);
  if (exists(relativePath)) {
    return fs.readFileSync(absPath, 'utf-8');
  }
};

const write = async (relativePath, content, options = { format: true }) => {
  try {
    const absPath = pathJoin(relativePath);
    if (options.format) {
      content = await format(content, options?.parser);
    }
    fs.writeFileSync(absPath, content);
  } catch {
    console.error('FAILED WRITING TO FILE ', relativePath);
  }
};

const append = (relativePath, content) => {
  try {
    const absPath = pathJoin(relativePath);
    fs.appendFileSync(absPath, content);
  } catch {
    console.error('FAILED WRITING TO FILE ', relativePath);
  }
};

const exists = (path) => {
  const absPath = pathJoin(path);
  return fs.existsSync(absPath, { recursive: true });
};

const createDirectory = (path) => {
  fs.mkdirSync(path);
};

const saveConfig = (data) => {
  const path = 'config.json';
  if (exists(path)) {
    let configData = JSON.parse(read(path));
    configData = { ...configData, ...data };
    write(path, JSON.stringify(configData), { parser: 'json' });
  } else {
    write(path, JSON.stringify(data), { parser: 'json' });
  }
};

export { read, write, append, exists, createDirectory, saveConfig };
