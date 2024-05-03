import templates from './template.js';
import format from '../../utils/format.js';
import { write } from '../../utils/fs.js';
import { exec, execSync, spawnSync } from 'child_process';
import { installSync } from '../../utils/install.js';
import { generateModel } from './model.js';
import capitalize from '../../utils/capitalize.js';

function init(db) {
  return new Promise((resolve, reject) => {
    exec(
      `npx prisma init --datasource-provider ${db.toLowerCase()}`,
      async (err, stdout, stderr) => {
        if (err) {
          console.log('error setting up prisma');
          reject(err);
        } else {
          console.log('Prisma initialization completed successfully');
          resolve();
        }
      },
    );
  });
}

async function clientInit() {
  write('config/db.js', await format(templates.prismaInitContent));
}

function type(input, options, db) {
  switch (input.toLowerCase()) {
    case 'string':
      return 'String';
    case 'integer':
      return (options.primaryKey || options.foreignKey) && db == 'mongodb'
        ? 'String'
        : 'Int';
    case 'float':
      return 'Float';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'DateTime';
    case 'uuid':
      return 'String';
    case 'text':
      return 'String';
    case 'json':
      return 'Json';
    case 'enum':
      return 'Enum';
    case 'array':
      return 'String[]';
    case 'binary':
      return 'Bytes';
    case 'decimal':
      return 'Decimal';
    default:
      return 'Unknown';
  }
}

function formatPrisma() {
  execSync('npx prisma format');
}

function migrate() {
  formatPrisma();
  const migrateDevProcess = spawnSync('npx', ['prisma', 'migrate', 'dev'], {
    input: '\n',
    encoding: 'utf-8',
    stdio: 'inherit',
  });
  if (migrateDevProcess.error) {
    console.log('Prisma migrate dev failed');
  } else if (generateProcess.status !== 0) {
    console.error(
      `Prisma migrate failed with status code ${generateProcess.status}`,
    );
  } else {
    console.log('Prisma migrate dev completed');
  }
}

function generate() {
  formatPrisma();
  const generateProcess = spawnSync('npx', ['prisma', 'generate'], {
    stdio: 'inherit',
  });
  if (generateProcess.error) {
    console.error('Prisma generate failed:', generateProcess.error);
  } else if (generateProcess.status !== 0) {
    console.error(
      `Prisma generate failed with status code ${generateProcess.status}`,
    );
  } else {
    console.log('Prisma generate completed');
  }
}

async function setup(db) {
  installSync('prisma', '@prisma/client');
  await init(db);
  await clientInit();
}

function controller(serviceName) {
  const controllerContent = `const prisma = require('../config/db');
\n\n  ${templates.createPrismaContent(serviceName)}\n
${templates.getAllPrismaContent(serviceName)}\n
${templates.getByIdPrismaContent(serviceName)}\n
${templates.updatePrismaContent(serviceName)}\n
${templates.deletePrismaContent(serviceName)}\n
\n
module.exports = {\n
create${capitalize(serviceName)},\n
getAll${capitalize(serviceName)},\n
get${capitalize(serviceName)}ById,\n
update${capitalize(serviceName)}ById,\n
delete${capitalize(serviceName)}ById\n
};`;
  write(`controllers/${serviceName}.js`, controllerContent);
}

export default {
  setup,
  init,
  clientInit,
  type,
  generate,
  migrate,
  model: generateModel,
  controller,
};
