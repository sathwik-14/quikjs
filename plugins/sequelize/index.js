import { write, capitalize, install, compile } from '../../utils/index.js';
import templates from './template.js';
import { generateModel } from './model.js';
import { spawnSync } from 'node:child_process';

const clientInit = async (db) => {
  const compiledTemplate = compile(templates.init);
  await write('config/db.js', compiledTemplate({ db }));
};

const type = (input) => {
  switch (input.toLowerCase()) {
    case 'string':
      return 'STRING';
    case 'integer':
      return 'INTEGER';
    case 'float':
      return 'FLOAT';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
      return 'DATE';
    case 'uuid':
      return 'UUID';
    case 'text':
      return 'TEXT';
    case 'json':
      return 'JSON';
    case 'enum':
      return 'ENUM';
    case 'array':
      return 'ARRAY';
    case 'binary':
      return 'BLOB';
    case 'decimal':
      return 'DECIMAL';
    default:
      return 'Unknown';
  }
};

const setup = async (db) => {
  install(['sequelize', 'sequelize-cli']);
  await clientInit(db);
};

const controller = async (modelName) => {
  const controllerContent = `const db = require('../models/index');\n
 ${templates.create(modelName)}\n 
 ${templates.getAll(modelName)}\n 
  ${templates.getById(modelName)}\n
    ${templates.update(modelName)}\n  
    ${templates.delete(modelName)}\n  
     module.exports = {\n  
          create${capitalize(modelName)}, 
  getAll${capitalize(modelName)}, 
    get${capitalize(modelName)}ById,
      update${capitalize(modelName)}ById,
        delete${capitalize(modelName)}ById};`;
  await write(`controllers/${modelName}.js`, controllerContent);
};

const migrate = () => {
  const migrateDevProcess = spawnSync('npx', ['sequelize-cli', 'db:migrate'], {
    input: '\n',
    encoding: 'utf-8',
    stdio: 'inherit',
  });
  if (migrateDevProcess.error) {
    console.log('Sequelize migrate dev failed');
  } else if (migrateDevProcess.status !== 0) {
    console.error(
      `Sequelize migrate failed with status code ${migrateDevProcess.status}`,
    );
  } else {
    console.log('Sequelize migrate dev completed');
  }
};

export default {
  setup,
  type,
  clientInit,
  model: generateModel,
  controller,
  migrate,
};
