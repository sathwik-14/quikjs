import { write } from '../index.js'; // Assuming utils/index.js exports these
import { passport } from '../../templates/index.js'; // Assuming templates/index.js exports this

export const generateAuthFiles = async (input, userModel) => {
  if (!input.authentication) {
    return;
  }

  const files = [
    { path: 'middlewares/passport.js', content: passport.middleware },
    { path: 'utils/auth.js', content: passport.util(input, userModel) },
  ];

  for (const file of files) {
    await write(file.path, file.content); // Assuming default formatting
  }
};
