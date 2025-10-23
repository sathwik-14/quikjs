import { capitalize } from '../utils/index.js';
import swaggerTemplates from '../plugins/swagger/templates.js';

export default {
  routesContent: (modelName, modelSchema) => {
    const ModelName = capitalize(modelName);

    return `const router = require('express').Router();
const ${modelName}Controller = require('../controllers/${modelName}');
const validate = require('../validation/validateMiddleware');
const { create${ModelName}Schema, update${ModelName}Schema } = require('../validation/schemas/${modelName}Schema');

// GET all ${modelName}
${swaggerTemplates.paths.getAll(modelName)}
router.get('/', ${modelName}Controller.getAll${ModelName});

// GET ${modelName} by ID
${swaggerTemplates.paths.getById(modelName)}
router.get('/:id', ${modelName}Controller.get${ModelName}ById);

// Create a new ${modelName}
${swaggerTemplates.paths.post(modelName, modelSchema)}
router.post('/', validate(create${ModelName}Schema), ${modelName}Controller.create${ModelName});

// Update ${modelName} by ID
${swaggerTemplates.paths.patch(modelName, modelSchema)}
router.patch('/:id', validate(update${ModelName}Schema), ${modelName}Controller.update${ModelName}ById);

// Delete ${modelName} by ID
${swaggerTemplates.paths.delete(modelName)}
router.delete('/:id', ${modelName}Controller.delete${ModelName}ById);

module.exports = router;`;
  },
};