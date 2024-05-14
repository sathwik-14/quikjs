#!/usr/bin/env node

import template from './templates/content.js';
import { read, saveConfig, write } from './utils/index.js';
import { prisma, sequelize } from './plugins/index.js';
import sampledata from './sampledata.js';
import content from './templates/content.js';
// import { schemaPrompts } from './prompt.js';

let state;

const loadState = (input) => {
  try {
    const config = read('config.json');
    if (config.length !== 0) {
      state = JSON.parse(config);
    }
  } catch {
    state = input;
  }
};

const authMiddleware = (roles) => {
  if (state.authentication && roles.length) {
    return `userAuth, checkRole(${JSON.stringify(roles)}), `;
  } else if (state.authentication) {
    return 'userAuth, ';
  }
  return '';
};

const updateRouteInMain = async (routeName, roles = []) => {
  let importContent = `const ${routeName}Routes = require("./${routeName}");`;

  const routeContent = `router.use("/${routeName}",${authMiddleware(roles)}${routeName}Routes);`;
  let mainFileContent = read('routes/index.js');
  let lines = mainFileContent.split('\n');
  const importRoutesIndex = lines.findIndex((line) =>
    line.includes('// import routes'),
  );
  if (
    importRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(importContent))
  ) {
    lines.splice(importRoutesIndex + 1, 0, importContent);
    await write('routes/index.js', lines.join('\n'));
  }

  const useRoutesIndex = lines.findIndex((line) => line.includes('// routes'));
  if (
    useRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(routeContent))
  ) {
    lines.splice(useRoutesIndex + 1, 0, routeContent);
    await write('routes/index.js', lines.join('\n'));
  }
};

const generateRoutes = async (routeName, roles) => {
  await write(`routes/${routeName}.js`, template.routesContent(routeName));
  await updateRouteInMain(routeName, roles);
};

const setupJoiValidation = async () => {
  await write(
    'validation/validateMiddleware.js',
    content.validation.middleware,
  );
  await write(
    'validation/createValidator.js',
    content.validation.createValidator,
  );
};

const generateValidationSchemas = async (modelName, model) => {
  await write(
    `validation/schemas/${modelName}Schema.js`,
    content.validation.schema(modelName, model),
  );
};

const scaffold = async (input) => {
  try {
    loadState(input);
    // uncomment the below code to enter schema manually and uncommer import also for schemaPrompts
    // const schemaData = await schemaPrompts(input);
    // checkout sampledata.js for predefined schemas - faster development
    const schemaData = sampledata.tasks;
    await setupJoiValidation();
    if (Object.keys(schemaData).length) {
      for (const [key, value] of Object.entries(schemaData)) {
        const modelName = key;
        const model = value;
        const db = state.db;
        const orm = state.orm;
        switch (orm) {
          case 'prisma':
            prisma.model(modelName, model, db);
            prisma.generate();
            prisma.controller(modelName);
            break;
          case 'sequelize':
            await sequelize.model(modelName, model);
            sequelize.controller(modelName);
            break;
        }
        await generateValidationSchemas(modelName, model);
        await generateRoutes(modelName, []);
        console.log('Generated routes and controllers for ', modelName);
      }
    }
    saveConfig({ schema: schemaData });
  } catch (err) {
    console.error('something went wrong', err);
  }
};

export { scaffold, generateRoutes };
