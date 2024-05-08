import { capitalize } from '../utils/index.js';

export default {
  routesContent: (modelName) => `const express = require('express');
const router = express.Router();
const ${modelName}Controller = require('../controllers/${modelName}');

// GET all ${modelName}
router.get('/', ${modelName}Controller.getAll${capitalize(modelName)});
// GET ${modelName} by ID
router.get('/:id', ${modelName}Controller.get${capitalize(modelName)}ById);
// Create a new ${modelName}
router.post('/', ${modelName}Controller.create${capitalize(modelName)});
// Update ${modelName} by ID
router.put('/:id', ${modelName}Controller.update${capitalize(modelName)}ById);
// Delete ${modelName} by ID
router.delete('/:id', ${modelName}Controller.delete${capitalize(
    modelName,
  )}ById);

module.exports = router;`,
};
