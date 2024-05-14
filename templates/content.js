import { capitalize } from '../utils/index.js';

const schemaFields = (type, model) => {
  const getType = (type) => {
    switch (type) {
      case 'STRING':
      case 'TEXT':
        return 'string';
      case 'INTEGER':
      case 'FLOAT':
        return 'number';
      case 'BOOLEAN':
        return 'boolean';
      case 'DATE':
        return 'date';
      case 'JSON':
        return 'object';
      case 'ARRAY':
        return 'array';
      default:
        return 'any';
    }
  };
  let content = [];
  model.forEach((item) => {
    switch (type) {
      case 'create':
        content.push(
          `${item.name}:Joi.${getType(item.type)}()${item.allowNulls ? '' : '.required()'}`,
        );
        break;
      case 'update':
        content.push(`${item.name}:Joi.${getType(item.type)}()`);
        break;
    }
  });
  return content.join(',\n');
};

export default {
  validation: {
    createValidator: `const createValidator = async (payload, schema) => {
      const { error, value } = await schema.validate(payload, {
        // shows all error messages instead of first error message
        abortEarly: false,
      });
      if (error) {
        throw error;
      }
      return value;
      }
    
    module.exports = createValidator`,
    middleware: `const createValidator = require('./createValidator')

    const validateMiddleware = (schema) =>
      (req, res, next) => {
        const payload = req.body
        const validate = createValidator(payload, schema)
    
        // proceed next if validated otherwise catch error and pass onto express error handler
        validate
          .then(validated => {
            req.body = validated
            next()
          })
          .catch(error => {
            res.status(400).send(error.details)
          })
      }
    
    module.exports = validateMiddleware`,
    schema: (modelName, model) =>
      `let Joi = require('joi')
    
    // Schema for creating a product, all fields are required
    let create${capitalize(modelName)}Schema = Joi.object().keys({
      ${schemaFields('create', model)}
    })
    
    // Schema for editing a product, all fields are optional and we can have a custom error message
    let update${capitalize(modelName)}Schema = Joi.object().keys({
      ${schemaFields('update', model)}  
    })
    
    module.exports = { 
      create${capitalize(modelName)}Schema, 
      update${capitalize(modelName)}Schema
    }`,
  },

  routesContent: (modelName) => `const router = require('express').Router();
const ${modelName}Controller = require('../controllers/${modelName}');
const validate = require('../validation/validateMiddleware');
const { create${capitalize(modelName)}Schema, update${capitalize(modelName)}Schema} = require('../validation/schemas/${modelName}Schema')

// GET all ${modelName}
router.get('/', ${modelName}Controller.getAll${capitalize(modelName)});
// GET ${modelName} by ID
router.get('/:id', ${modelName}Controller.get${capitalize(modelName)}ById);
// Create a new ${modelName}
router.post('/', validate(create${capitalize(modelName)}Schema), ${modelName}Controller.create${capitalize(modelName)});
// Update ${modelName} by ID
router.put('/:id', validate(update${capitalize(modelName)}Schema), ${modelName}Controller.update${capitalize(modelName)}ById);
// Delete ${modelName} by ID
router.delete('/:id', ${modelName}Controller.delete${capitalize(
    modelName,
  )}ById);

module.exports = router;`,
};
