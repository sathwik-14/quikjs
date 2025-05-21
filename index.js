#!/usr/bin/env node

import { scaffold } from './generate.js';
// uncomment below lines to take manual user inputs
import {
  projectPrompts,
  // , schemaPrompts
} from './prompt.js';
import { prisma, sequelize } from './plugins/index.js'; // swagger removed, compile, createDirectory, write removed
import {
  read, // compile, createDirectory, write are no longer used directly here
  install,
  saveConfig,
  prompt,
  append,
} from './utils/index.js';
import {
  generateBaseFiles,
  generateToolFiles,
  generateAuthFiles,
  generateInfraFiles,
} from './utils/project-structure/index.js';
import sampledata from './sampledata.js';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';
import { databases, orms, packages, tools } from './constants.js'; // folders removed

let userModel;
let models = [];

const runORMSetup = async (orm, db) => {
  orms[orm]?.setup && (await orms[orm].setup(db));
};

const preFillEnv = async (input) => {
  input.authentication && append('.env', 'SECRET="mysecret"\nSALT_ROUNDS=10');
  if (input.tools.length) {
    for (const tool of input.tools) {
      const envContent = tools[tool]?.env || '';
      await append('.env', envContent);
    }
  }
};

const generateProjectStructure = async (input) => {
  try {
    // The new helper functions will handle directory creation internally where needed.
    // For example, generateBaseFiles creates the main 'folders'.
    await generateBaseFiles(input);
    await generateToolFiles(input.tools);
    await generateAuthFiles(input, userModel);
    await generateInfraFiles(input); // This now handles swagger.setup internally

    // preFillEnv needs to be called after .env is created by generateBaseFiles
    await preFillEnv(input);
  } catch (err) {
    console.error(chalk.bgRed`Unable to create project structure`, err);
    // Propagate the error to be caught by the main function's catch block
    throw err;
  }
};

const getDbDriver = (db) => {
  return databases.get(db).driver;
};

const installDependencies = async (answers) => {
  const {
    error_handling,
    production,
    authentication,
    api_documentation,
    tools: selectedTools = [], // Ensure tools is an array
    db,
  } = answers;

  // Base packages (already in constants.js, but we might want to manage them here or ensure they are added)
  // For now, assuming `packages` from constants.js is the initial list.
  // If `packages` from constants.js is meant to be mutable and added to,
  // we should ensure it's either passed in or handled consistently.
  // Let's assume `packages` from constants.js is a base list and we add to it.
  // To avoid modifying the imported `packages` array directly if it's not desired,
  // let's create a new list.
  let packagesToInstall = [...packages]; // Start with base packages from constants.js

  const featurePackages = {
    api_documentation: ['swagger-jsdoc', 'swagger-ui-express'],
    error_handling: ['morgan'],
    production: ['winston', 'pm2', 'express-rate-limit'],
    authentication: ['passport', 'passport-jwt', 'jsonwebtoken', 'bcrypt'],
  };

  const toolPackages = {
    s3: ['aws-sdk'],
    sns: ['aws-sdk'], // aws-sdk is shared for s3 and sns
    twilio: ['twilio'],
    // msg91 and sendgrid might have SDKs, add them here if so.
    // e.g., msg91: ['sendotp'], sendgrid: ['@sendgrid/mail']
  };

  if (api_documentation) {
    packagesToInstall.push(...featurePackages.api_documentation);
  }
  if (error_handling) {
    packagesToInstall.push(...featurePackages.error_handling);
  }
  if (production) {
    packagesToInstall.push(...featurePackages.production);
  }
  if (authentication) {
    packagesToInstall.push(...featurePackages.authentication);
  }

  for (const tool of selectedTools) {
    if (toolPackages[tool]) {
      packagesToInstall.push(...toolPackages[tool]);
    }
  }

  // Add database driver
  const dbDriver = getDbDriver(db);
  if (dbDriver) {
    packagesToInstall.push(dbDriver);
  }

  // Remove duplicates before installing
  packagesToInstall = [...new Set(packagesToInstall)];

  install(packagesToInstall);
};

const CheckProjectExist = (answers) => {
  try {
    const data = read('config.json');
    if (data) {
      const config = JSON.parse(data);
      if (!config?.name) {
        console.log('Config file is empty or missing name property');
      }
      if (answers.name === config.name) {
        console.log(chalk.green`Project config file found`);
        return;
      }
    }
  } catch {
    console.log('Initializing project setup');
  }
};

// uncomment to work on RBAC
const getRoleInput = async () => {
  try {
    const roleAnswers = [];
    let confirm = true;
    while (confirm) {
      const { addRole } = await prompt([
        {
          type: 'confirm',
          name: 'addRole',
          message: 'Do you want to add a role?',
          default: true,
        },
      ]);
      if (!addRole) {
        confirm = false;
      }
      const { role } = await prompt([
        { type: 'input', name: 'role', message: 'Enter the role:' },
      ]);
      roleAnswers.push(role);
    }
    return roleAnswers;
  } catch {
    console.error('Unable to get roles');
  }
};

// Function to get the value associated with a specific flag
const getFlagValue = (args, flag) => {
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
};

const handleAuthentication = async (answer) => {
  console.log('Let us create User model with required fields');
  //uncomment the below line to take manual schema input
  //userModel = await schemaPrompts(answers, 'user');
  userModel = sampledata.auth.noRoles.user;
  const name = 'user';
  const orm = answer.orm;
  orm == 'prisma' && (await prisma.model(name, userModel, answer.db));
  orm == 'sequelize' && (await sequelize.model(name, userModel));
};

const main = async () => {
  try {
    let answers;
    // eslint-disable-next-line no-undef
    const args = process.argv.slice(2);
    const configFilePath = getFlagValue(args, '-c');
    if (configFilePath) {
      const absolutePath = path.resolve(configFilePath);
      // Read the JSON config file
      try {
        const config = fs.readFileSync(absolutePath, 'utf8');
        answers = JSON.parse(config);
      } catch {
        console.error(
          chalk.red`Invalid file name or content - ${configFilePath}`,
        );
      }
    } else {
      // uncomment below line and import line on top if you want to provide custom input
      answers = await projectPrompts();
      // checkout sampledata.js for preset inputs - faster development
      // answers = sampledata.p1;
      // uncomment to auth feature
    }
    let { authentication, roles, orm, db } = answers;
    CheckProjectExist(answers);
    // uncomment to auth feature
    authentication && (await handleAuthentication(answers));
    answers.roles = (roles && (await getRoleInput())) || [];
    await generateProjectStructure(answers);
    saveConfig(answers);
    await runORMSetup(orm, db);
    await scaffold(answers);
    userModel && models.push({ name: 'user', model: userModel });
    await installDependencies(answers);
    console.log(chalk.bgGreenBright`Project setup successful`);
  } catch (error) {
    console.log(chalk.bgRed`Error`, error);
  }
};

console.time('Time taken');
await main();
console.timeEnd('Time taken');
