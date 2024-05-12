import { capitalize } from '../utils/index.js';

const schemaFields = (model) => {
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
    content.push(
      `${item.name}:Joi.${getType(item.type)}()${item.allowNulls ? '' : '.required()'}`,
    );
  });
  return content.join(',\n');
};

export default {
  validation: {
    createValidator: `const createValidator = (schema) => 
      async (payload) => {
        return await schema.validate(payload, {
          // shows all error messages instead of first error message
          abortEarly: false
        })
      }
    
    module.exports = createValidator`,
    middleware: `let createValidator = require('./createValidator')

    let validateMiddleware = (schema) =>
      (req, res, next) => {
        let payload = req.body
        let validate = createValidator(schema)
    
        // proceed next if validated otherwise catch error and pass onto express error handler
        validate(payload)
          .then(validated => {
            req.body = validated
            next()
          })
          .catch(next)
      }
    
    module.exports = validateMiddleware`,
    schema: (modelName, model) =>
      `let Joi = require('joi')
    
    // Schema for creating a product, all fields are required
    let create${capitalize(modelName)}Schema = Joi.object().keys({
      ${schemaFields(model)}
    })
    
    // Schema for editing a product, all fields are optional and we can have a custom error message
    let edit${capitalize(modelName)}Schema = Joi.object().keys({
      ${schemaFields(model)}  
    })
    
    module.exports = { 
      create${capitalize(modelName)}Schema, 
      edit${capitalize(modelName)}Schema
    }`,
  },
  routesContent: (modelName) => `const express = require('express');
const router = express.Router();
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
