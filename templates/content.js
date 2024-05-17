import { capitalize } from '../utils/index.js';
import swaggerTemplates from '../plugins/swagger/templates.js';

export default {
  routesContent: (
    modelName,
    model,
  ) => `const router = require('express').Router();
const ${modelName}Controller = require('../controllers/${modelName}');
const validate = require('../validation/validateMiddleware');
const { create${capitalize(modelName)}Schema, update${capitalize(modelName)}Schema} = require('../validation/schemas/${modelName}Schema')

// GET all ${modelName}
${swaggerTemplates.paths.getAll(modelName)}
router.get('/', ${modelName}Controller.getAll${capitalize(modelName)});
// GET ${modelName} by ID
${swaggerTemplates.paths.getByid(modelName)}
router.get('/:id', ${modelName}Controller.get${capitalize(modelName)}ById);
// Create a new ${modelName}
${swaggerTemplates.paths.post(modelName, model)}
router.post('/', validate(create${capitalize(modelName)}Schema), ${modelName}Controller.create${capitalize(modelName)});
// Update ${modelName} by ID
${swaggerTemplates.paths.put(modelName, model)}
router.put('/:id', validate(update${capitalize(modelName)}Schema), ${modelName}Controller.update${capitalize(modelName)}ById);
// Delete ${modelName} by ID
${swaggerTemplates.paths.delete(modelName)}
router.delete('/:id', ${modelName}Controller.delete${capitalize(
    modelName,
  )}ById);

module.exports = router;`,
};
