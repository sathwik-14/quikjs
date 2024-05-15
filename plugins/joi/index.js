import { write } from '../../utils/index.js';
import content from './templates.js';

const setup = async () => {
  await write(
    'validation/validateMiddleware.js',
    content.validation.middleware,
  );
  await write(
    'validation/createValidator.js',
    content.validation.createValidator,
  );
};

const schema = async (modelName, model) => {
  await write(
    `validation/schemas/${modelName}Schema.js`,
    content.validation.schema(modelName, model),
  );
};

export default { setup, schema };
