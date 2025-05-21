#!/usr/bin/env node

import {
  appTemplate,
  passport,
  aws,
  twilio,
  sendgrid,
  msg91,
} from './templates/index.js';
import { scaffold } from './generate.js';
// uncomment below lines to take manual user inputs
import {
  projectPrompts,
  // , schemaPrompts
} from './prompt.js';
import { prisma, sequelize, swagger } from './plugins/index.js';
import {
  compile,
  createDirectory,
  read,
  write,
  install,
  saveConfig,
  prompt,
  append,
  // uncomment to work on RBAC
  // prompt,
} from './utils/index.js';
import sampledata from './sampledata.js';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';
import { databases, folders, orms, packages, tools } from './constants.js';

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
    const {
      tools = [],
      authentication = false,
      logging = false,
      error_handling = true,
      api_documentation = true,
    } = input;
    const files = [
      { path: 'app.js', content: compile(appTemplate)({ input }) },
      {
        path: 'routes/index.js',
        content: `const router = require('express').Router()\n
        ${authentication ? "const { userAuth } = require('../utils/auth')" : ''}\n
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

    const toolFiles = {
      s3: [
        { path: 'config/aws.js', content: aws.s3.config() },
        { path: 'utils/s3.js', content: aws.s3.utils() },
      ],
      sns: [{ path: 'utils/sns.js', content: aws.sns() }],
      twilio: [{ path: 'utils/twilio.js', content: twilio() }],
      msg91: [{ path: 'utils/msg91.js', content: msg91() }],
      sendgrid: [{ path: 'utils/sendgrid.js', content: sendgrid() }],
    };

    for (const tool of tools) {
      files.push(...(toolFiles[tool] || []));
    }

    authentication &&
      files.push(
        { path: 'middlewares/passport.js', content: passport.middleware },
        { path: 'utils/auth.js', content: passport.util(input, userModel) },
      );

    logging && files.push({ path: 'access.log', content: '' });

    error_handling && files.push({ path: 'error.log', content: '' });

    api_documentation && swagger.setup(input);

    for (const folder of folders) {
      createDirectory(folder);
    }

    files.map(async (file) => {
      ['.env', 'README.md', '.gitignore'].includes(file.path)
        ? await write(file.path, file.content, { format: false })
        : await write(file.path, file.content);
    });

    await preFillEnv(input);
  } catch (err) {
    console.error(chalk.bgRed`Unable to create project structure`, err);
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
    tools,
    db,
  } = answers;
  api_documentation && packages.push('swagger-jsdoc', 'swagger-ui-express');
  error_handling && packages.push('morgan');
  production && packages.push('winston', 'pm2', 'express-rate-limit');
  authentication &&
    packages.push('passport', 'passport-jwt', 'jsonwebtoken', 'bcrypt');
  if (tools.length) {
    for (const item of tools) {
      switch (item) {
        case 's3':
        case 'sns':
          packages.push('aws-sdk');
          break;
        case 'twilio':
          packages.push('twilio');
      }
    }
  }
  packages.push(getDbDriver(db));
  install(packages);
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
