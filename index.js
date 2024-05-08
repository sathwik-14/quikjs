#!/usr/bin/env node

import { appTemplate, passport, aws, twilio } from './templates/index.js';
import { scaffold } from './generate.js';
// import { projectPrompts } from './prompt.js';
import { schemaPrompts } from './prompt.js';
import { prisma, sequelize, mongoose } from './plugins/index.js';
import {
  compile,
  createDirectory,
  read,
  write,
  installSync,
  saveConfig,
  prompt,
} from './utils/index.js';
import sampledata from './sampledata.js';

let userModel;
let models = [];

async function runORMSetup(orm, db) {
  console.log(`Setting up ${orm}`);
  const ormSetupFunctions = {
    prisma: prisma.setup,
    sequelize: sequelize.setup,
    mongoose: mongoose.setup,
  };
  if (!ormSetupFunctions[orm]) {
    throw new Error(`Unsupported ORM: ${orm}`);
  }
  await ormSetupFunctions[orm](db);
}

async function generateProjectStructure(input) {
  try {
    const { tools, authentication, logging, error_handling } = input;
    const folders = [
      'controllers',
      'models',
      'routes',
      'middlewares',
      'utils',
      'config',
    ];
    const files = [
      { path: 'app.js', content: compile(appTemplate)({ input }) },
      { path: '.env', content: 'DATABASE_URL=""' },
      { path: '.gitignore', content: 'node_modules\n.env\n' },
      {
        path: 'README.md',
        content: '# Your Project Name\n\nProject documentation goes here.',
      },
    ];

    if (tools.length) {
      const toolFiles = {
        s3: [
          { path: 'config/aws.js', content: aws.s3.config() },
          { path: 'utils/s3.js', content: aws.s3.utils() },
        ],
        sns: [{ path: 'utils/sns.js', content: aws.sns() }],
        twilio: [{ path: 'utils/twilio.js', content: twilio() }],
      };
      tools.forEach((tool) => {
        files.push(...(toolFiles[tool] || []));
      });
    }

    if (authentication) {
      files.push(
        { path: 'middlewares/passport.js', content: passport.middleware },
        { path: 'utils/auth.js', content: passport.util(input, userModel) },
      );
    }

    if (logging) {
      files.push({ path: 'access.log', content: '' });
    }

    if (error_handling) {
      files.push({ path: 'error.log', content: '' });
    }

    folders.forEach(createDirectory);

    files.map(async (file) => {
      ['.env', 'README.md', '.gitignore'].includes(file.path)
        ? await write(file.path, file.content, { format: false })
        : await write(file.path, file.content);
    });
  } catch {
    console.error('Unable to create project structure');
  }
}

function installDbDriver(db) {
  const drivers = {
    postgresql: ['pg', 'pg-hstore'],
    mysql: ['mysql2'],
    mariadb: ['mariadb'],
    sqlite: ['sqlite3'],
    mssql: ['tedious'],
    oracledb: ['oracledb'],
  };

  const driver = drivers[db.toLowerCase()];
  if (driver) {
    installSync(...driver);
  }
}

async function installDependencies(answers) {
  console.log('Installing dependencies');
  installSync('express', 'cors', 'dotenv', 'helmet', 'morgan', 'compression');
  installDbDriver(answers.db);
  if (answers.authentication) {
    console.log('Setting up  passport,passport-jwt');
    installSync('passport', 'passport-jwt', 'jsonwebtoken', 'bcrypt');
  }
  if (answers.tools.length) {
    for (const item of answers.tools) {
      switch (item) {
        case 's3':
        case 'sns':
          installSync('aws-sdk');
          break;
        case 'twilio':
          installSync('twilio');
      }
    }
  }
  await runORMSetup(answers.orm, answers.db);
}

async function CheckProjectExist(answers) {
  try {
    const data = read('config.json');
    if (data) {
      const config = JSON.parse(data);
      if (!config?.name) {
        console.log('Config file is empty or missing name property');
      }
      if (answers.name === config.name) {
        console.log('Project already created');
        return;
      }
    }
  } catch {
    console.log('Initializing project setup');
  }
}

async function getRoleInput() {
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
}

async function main() {
  try {
    // uncomment below line if you want to provide custom input
    // const answers = await projectPrompts();
    // DEFAULT - below line to choose from preset inputs - faster development
    const answers = sampledata.p1;
    await CheckProjectExist(answers);
    if (answers.authentication) {
      if (answers.roles) answers.roles = await getRoleInput();
      console.log('Let us create User model with required fields');
      const userModel = await schemaPrompts(answers, 'user');
      const name = 'user';
      switch (answers.orm) {
        case 'prisma':
          prisma.model(name, userModel, answers.db);
          break;
        case 'sequelize':
          sequelize.model(name, userModel);
          break;
      }
    }
    await generateProjectStructure(answers);
    saveConfig(answers);
    console.log('Started generating scaffold...');
    await scaffold(answers);
    if (userModel) models.push({ name: 'user', model: userModel });
    await installDependencies(answers);
    console.log('Project setup successful');
  } catch (error) {
    console.log('Unable to generate project due to .', error);
  }
}

console.time('Time taken');
await main();
console.timeEnd('Time taken');
