import {format, write, capitalize, installSync, compile } from '../../utils/index.js';
import templates from './template.js';
import { generateModel } from './model.js';

async function clientInit(db) {
  const compiledTemplate = compile(templates.init);
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

function controller(modelName) {
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
  write(`controllers/${modelName}.js`, controllerContent);
}

export default {
  setup,
  type,
  clientInit,
  model: generateModel,
  controller,
};
