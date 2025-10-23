import { capitalize } from '../../utils/index.js';

const mapSequelizeTypeToJoi = (sequelizeType) => {
  switch (sequelizeType) {
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

const generateSchemaFields = (schemaType, modelFields) => {
  const fields = [];
  
  for (const field of modelFields) {
    const joiType = mapSequelizeTypeToJoi(field.type);
    
    switch (schemaType) {
      case 'create':
        fields.push(
          `${field.name}: Joi.${joiType}()${field.allowNulls ? '' : '.required()'}`,
        );
        break;
      case 'update':
        fields.push(`${field.name}: Joi.${joiType}()`);
        break;
    }
  }
  
  return fields.join(',\n  ');
};

export default {
  validation: {
    createValidator: `const createValidator = async (payload, schema) => {
  const { error, value } = await schema.validate(payload, {
    // Shows all error messages instead of first error message
    abortEarly: false,
  });
  
  if (error) {
    throw error;
  }
  
  return value;
};

module.exports = createValidator;`,

    middleware: `const createValidator = require('./createValidator');

const validateMiddleware = (schema) => (req, res, next) => {
  const payload = req.body;
  const validate = createValidator(payload, schema);
  
  // Proceed next if validated, otherwise catch error and pass to express error handler
  validate
    .then((validated) => {
      req.body = validated;
      next();
    })
    .catch((error) => {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.details,
        success: false,
      });
    });
};

module.exports = validateMiddleware;`,

    schema: (modelName, modelFields) => {
      const ModelName = capitalize(modelName);
      
      return `const Joi = require('joi');

// Schema for creating a ${modelName}, all fields are required
const create${ModelName}Schema = Joi.object().keys({
  ${generateSchemaFields('create', modelFields)}
});

// Schema for updating a ${modelName}, all fields are optional
const update${ModelName}Schema = Joi.object().keys({
  ${generateSchemaFields('update', modelFields)}
});

module.exports = {
  create${ModelName}Schema,
  update${ModelName}Schema,
};`;
    },
  },
};