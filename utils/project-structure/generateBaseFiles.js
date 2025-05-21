import { compile, write, createDirectory } from '../index.js'; // Assuming utils/index.js exports these
import { appTemplate } from '../../templates/index.js'; // Assuming templates/index.js exports this
import { folders } from '../../constants.js'; // Assuming constants.js exports this

export const generateBaseFiles = async (input) => {
  const files = [
    { path: 'app.js', content: compile(appTemplate)({ input }) },
    {
      path: 'routes/index.js',
      content: `const router = require('express').Router()\n
        ${input.authentication ? "const { userAuth } = require('../utils/auth')" : ''}\n
        // import routes\n\n
        // routes\n\n
        module.exports=router`,
    },
    {
      path: '.env',
      content: `PORT=3000\nDATABASE_URL="${input.db}://<user>:<password>@<host>:5432/<database name>"`,
    },
    { path: '.gitignore', content: 'node_modules\n.env\n' },
    {
      path: 'README.md',
      content: '# Your Project Name\n\nProject documentation goes here.',
    },
  ];

  // Create base folders first - this was originally in generateProjectStructure
  for (const folder of folders) {
    createDirectory(folder);
  }

  for (const file of files) {
    // Conditional formatting was only for .env, README.md, .gitignore
    const format = !['.env', 'README.md', '.gitignore'].includes(file.path);
    await write(file.path, file.content, { format });
  }
};
