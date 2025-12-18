import { write, install, format, capitalize } from '../../utils/index.js';
import templates from './template.js';
import { generateModel } from './model.js';

const type = (input) => {
  switch (input.toLowerCase()) {
    case 'string':
      return 'String';
    case 'integer':
      return 'Number';
    case 'float':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'Date';
    case 'uuid':
      return 'String';
    case 'text':
      return 'String';
    case 'json':
      return 'Object';
    case 'enum':
      return 'String';
    case 'array':
      return 'Array';
    case 'binary':
      return 'Buffer';
    case 'decimal':
      return 'Number';
    default:
      return 'Unknown';
  }
};

const clientInit = async () =>
  await write('config/db.js', await format(templates.mongooseInit));

const setup = async () => {
  install(['mongoose']);
  await clientInit();
};

const controller = async (modelName) => {
  const controllerContent = `const ${capitalize(modelName)} = require('../models/${modelName.toLowerCase()}');\n\n ${templates.create(modelName)}\n 
 ${templates.getAll(modelName)}\n 
 ${templates.getById(modelName)}\n ${templates.update(modelName)}\n  
 ${templates.delete(modelName)}\n  
     module.exports = {\n  \n          create${capitalize(modelName)}, 
  getAll${capitalize(modelName)}, 
    get${capitalize(modelName)}ById,
      update${capitalize(modelName)}ById,
        delete${capitalize(modelName)}ById};`;
  await write(`controllers/${modelName}.js`, controllerContent);
};

export default { setup, type, clientInit, model: generateModel, controller };