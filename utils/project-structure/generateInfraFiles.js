import { write } from '../index.js'; // Assuming utils/index.js exports this
import { swagger } from '../../plugins/index.js'; // Assuming plugins/index.js exports swagger

export const generateInfraFiles = async (input) => {
  const {
    logging = false,
    error_handling = true,
    api_documentation = true,
  } = input;
  const files = [];

  if (logging) {
    files.push({ path: 'access.log', content: '' });
  }

  if (error_handling) {
    files.push({ path: 'error.log', content: '' });
  }

  for (const file of files) {
    // These are simple log files, no special formatting needed.
    await write(file.path, file.content, { format: false });
  }

  if (api_documentation) {
    // Call swagger setup directly here.
    // This assumes swagger.setup might perform operations beyond simple file writing,
    // such as modifying other files or structures, which is fine.
    await swagger.setup(input);
  }
};
