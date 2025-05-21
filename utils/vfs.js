import fs from 'node:fs';
import path from 'node:path';
import format from './format.js';
import chalk from 'chalk';
import process from 'node:process';

const pathJoin = (relPath) => {
  const projectRoot = process.cwd();
  return path.join(projectRoot, relPath);
};

const read = (relativePath) => {
  if (exists(relativePath)) {
    return fs.readFileSync(pathJoin(relativePath), 'utf-8');
  }
};

const write = async (
  relativePath,
  content,
  options = { format: true, force: false },
) => {
  try {
    const absPath = pathJoin(relativePath);
    if (options.format) {
      content = await format(content, options?.parser);
    }
    // Check if file exists and read its content
    let existingContent = '';
    if (fs.existsSync(absPath)) {
      existingContent = fs.readFileSync(absPath, 'utf8');
    }
    if (content !== existingContent) {
      fs.writeFileSync(absPath, content);
      console.log(chalk.blue`UPDATE `, ' ', '/' + relativePath);
    } else {
      console.log(
        chalk.yellow`SKIP  `,
        ' ',
        '/' + relativePath,
        '(no changes)',
      );
    }
  } catch (error) {
    console.error('FAILED WRITING TO FILE ', relativePath, error);
  }
};

const append = async (relativePath, content, options = { format: true }) => {
  try {
    const absPath = pathJoin(relativePath);
    let existingContent = '';
    if (fs.existsSync(absPath)) {
      existingContent = fs.readFileSync(absPath, 'utf8');
    }
    if (!existingContent.includes(content)) {
      if (options.format) {
        content = await format(content, options?.parser);
      }
      fs.appendFileSync(absPath, '\n' + content);
      console.log(chalk.blue`UPDATE `, ' ', '/' + relativePath);
    } else {
      console.log(
        chalk.yellow`SKIP  `,
        ' ',
        '/' + relativePath,
        '(no changes)',
      );
    }
  } catch {
    console.error('FAILED WRITING TO FILE ', relativePath);
  }
};

const exists = (path) => {
  const absPath = pathJoin(path);
  return fs.existsSync(absPath, { recursive: true });
};

const createDirectory = (path) => {
  if (exists(path)) return;
  fs.mkdirSync(path);
  console.log(chalk.green`CREATE `, ' ', '/' + path);
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
