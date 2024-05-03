import format from '../../utils/format.js';
import { write } from '../../utils/fs.js';
import templates from './template.js';
import { generateModel } from './model.js';
import capitalize from '../../utils/capitalize.js';
import { installSync } from '../../utils/install.js';
import compile from '../../utils/compile.js';

async function clientInit(db) {
  const compiledTemplate = compile(templates.sequelizeInitContent);
  write('config/db.js', await format(compiledTemplate({ db })));
}

function type(input) {
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
}

async function setup(db) {
  installSync('sequelize', 'sequelize-cli');
  await clientInit(db);
}

function controller(serviceName) {
  const controllerContent = `\n  const db = require('../models/index');
\n  ${templates.createSequelizeContent(serviceName)}\n 
 ${templates.getAllSequelizeContent(serviceName)}\n 
  ${templates.getByIdSequelizeContent(serviceName)}\n
    ${templates.updateSequelizeContent(serviceName)}\n  
    ${templates.deleteSequelizeContent(serviceName)}\n  
    \n module.exports = {\n  
          create${capitalize(serviceName)},\n 
  getAll${capitalize(serviceName)},\n  
    get${capitalize(serviceName)}ById,\n  
      update${capitalize(serviceName)}ById,\n  
        delete${capitalize(serviceName)}ById\n  };`;
  write(`controllers/${serviceName}.js`, controllerContent);
}

export default {
  setup,
  type,
  clientInit,
  model: generateModel,
  controller,
};
