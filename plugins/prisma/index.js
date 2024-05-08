import templates from './template.js';
import { format, write, installSync, capitalize } from '../../utils/index.js';
import { execSync, spawnSync } from 'child_process';
import { generateModel, getType } from './model.js';

function init(db) {
    const initialization = execSync(`npx prisma init --datasource-provider ${db.toLowerCase()}`,);
  if(initialization.error){
    console.log('Error initializing prisma')
  }else {
    console.log('Prisma initialization completed successfully');
  }
  }

async function clientInit() {
  write('config/db.js', await format(templates.prismaInitContent));
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
  } else if (migrateDevProcess.status !== 0) {
    console.error(
      `Prisma migrate failed with status code ${migrateDevProcess.status}`,
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
  init(db);
  await clientInit();
}

function controller(modelName) {
  const controllerContent = `const prisma = require('../config/db');
\n\n  ${templates.createPrismaContent(modelName)}\n
${templates.getAllPrismaContent(modelName)}\n
${templates.getByIdPrismaContent(modelName)}\n
${templates.updatePrismaContent(modelName)}\n
${templates.deletePrismaContent(modelName)}\n
\n
module.exports = {\n
create${capitalize(modelName)},\n
getAll${capitalize(modelName)},\n
get${capitalize(modelName)}ById,\n
update${capitalize(modelName)}ById,\n
delete${capitalize(modelName)}ById\n
};`;
  write(`controllers/${modelName}.js`, controllerContent);
}

export default {
  setup,
  init,
  clientInit,
  type: getType,
  generate,
  migrate,
  model:generateModel,
  controller,
};
