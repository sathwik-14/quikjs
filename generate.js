#!/usr/bin/env node

import template from './templates/content.js';
import { read, saveConfig, write } from './utils/index.js';
import { prisma, sequelize} from './plugins/index.js';
import sampledata from './sampledata.js';
import { schemaPrompts } from './prompt.js';

let state;

const loadState = async (input) => {
  try {
    const config = read('config.json');
    if (config.length !== 0) {
      state = JSON.parse(config);
    }
  } catch (error) {
    state = input;
  }
};

function authMiddleware(roles) {
  if (state.authentication && roles.length) {
    return `userAuth, checkRole(${JSON.stringify(roles)}), `;
  } else if (state.authentication) {
    return 'userAuth, ';
  }
  return '';
}

function generateRoutes(routeName, roles) {
  write(`routes/${routeName}.js`, template.routesContent(routeName));
  const importContent = `const ${routeName}Routes = require("./routes/${routeName}");`;
  const routeContent = `app.use("/api/${routeName}",${authMiddleware(roles)}${routeName}Routes);`;
  let mainFileContent = read('app.js');
  let lines = mainFileContent.split('\n');
  const importRoutesIndex = lines.findIndex((line) =>
    line.includes('// Import routes'),
  );
  if (
    importRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(importContent))
  ) {
    lines.splice(importRoutesIndex + 1, 0, importContent);
    write('app.js', lines.join('\n'));
  }

  const useRoutesIndex = lines.findIndex((line) => line.includes('// Routes'));
  if (
    useRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(routeContent))
  ) {
    lines.splice(useRoutesIndex + 1, 0, routeContent);
    write('app.js', lines.join('\n'));
  }
}

async function scaffold(input) {
  try {
    await loadState(input);
    // uncomment the below code to enter schema manually
    // const schemaData = await schemaPrompts(input);
    // DEFAULT - predefined schemas - faster development
    const schemaData = sampledata.ecommerce;
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
        generateRoutes(modelName, []);
        console.log('Generated routes and controllers for ', modelName);
      }
    }
    saveConfig({schema:schemaData});
  } catch (err) {
    console.error('something went wrong',err);
  }
}

export { scaffold, generateRoutes };
