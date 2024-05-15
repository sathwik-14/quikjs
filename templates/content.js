import { capitalize } from '../utils/index.js';

export default {
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
