#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import {
  prismaDataType,
  sequelizeDataType,
  typeORMDataType,
  mongooseDataType,
} from "./types.js";
import appTemplate from "./templates/app.js";
import template from "./templates/content.js";
import passport from "./templates/passport.js";
import { exec, execSync } from "child_process";
import genModel from "./model.js";
import { type } from "os";

let userModel;

// Orms object
const orms = {
  prisma: { id: 1, name: "prisma", getType: (input) => prismaDataType(input) },
  sequelize: {
    id: 2,
    name: "sequalize",
    getType: (input) => sequelizeDataType(input),
  },
  mongoose: {
    id: 3,
    name: "mongoose",
    getType: (input) => mongooseDataType(input),
  },
  typeORM: {
    id: 4,
    name: "typeORM",
    getType: (input) => typeORMDataType(input),
  },
};

// Questions for project setup
const questions = [
  {
    type: "input",
    name: "name",
    message: "What is your project name?",
    validate: function (value) {
      if (value.length) {
        return true;
      } else {
        return "Please enter your project name.";
      }
    },
  },
  {
    type: "input",
    name: "description",
    message: "Describe your project (optional) ",
  },
  {
    type: "list",
    name: "db",
    message: "Which database would you like to use?",
    choices: ["mongoDB", "postgresQL", "mySQL"],
  },
  {
    type: "list",
    name: "orm",
    message: "Which ORM would you like to choose?",
    choices: function (answers) {
      if (answers.db === "mongoDB") {
        return ["prisma", "mongoose"];
      } else {
        return ["prisma", "sequelize"];
      }
    },
  },
  {
    type: "confirm",
    name: "authentication",
    message: "Do you want authentication for your project?(passport-jwt)",
    default: true,
  },
];

const askRoleAuth = [
  {
    type: "confirm",
    name: "roles",
    message: "Do you want role based authentication?",
    default: true,
  },
];

// Get the current working directory
const projectRoot = process.cwd();

// Generate prisma client init
function generatePrismaClientInit() {
  fs.writeFileSync(
    path.join(projectRoot, "config", "db.js"),
    template.prismaInitContent
  );
}

// Run npx prisma init
function initializePrisma(db) {
  return new Promise((resolve, reject) => {
    exec("npx prisma init", (err, stdout, stderr) => {
      if (err) {
        console.log("error setting up prisma");
      } else {
        // Read existing schema.prisma file
        const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
        let prismaModelContent = fs.readFileSync(schemaPath, "utf-8");

        if (db == "mongoDB") {
          prismaModelContent = prismaModelContent.replace(
            "postgresql",
            "mongodb"
          );
          prismaModelContent = prismaModelContent.replace(
            'provider = "prisma-client-js"',
            'provider = "prisma-client-js"\n\tpreviewFeatures = ["mongodb"]'
          );
        }
        fs.writeFileSync(schemaPath, prismaModelContent);
        console.log("Prisma initialization completed successfully");
      }
      resolve();
    });
  });
}

// Generate sequalize client init
function generateSequalizeClientInit() {
  fs.writeFileSync(
    path.join(projectRoot, "config", "db.js"),
    template.sequelizeInitContent
  );
}

// Generate mongoose client inti
function generateMongooseClient() {
  fs.writeFileSync(
    path.join(projectRoot, "config", "db.js"),
    template.mongooseInit
  );
}

// Function to run ORM setup
async function runORMSetup(orm, db) {
  console.log(`Setting up ${orm}`);
  switch (orm) {
    case "prisma":
      execSync("npm i prisma @prisma/client");
      await initializePrisma(db);
      generatePrismaClientInit();
      break;
    case "sequelize":
      execSync("npm i sequelize sequelize-cli");
      generateSequalizeClientInit();
      break;
    case "mongoose":
      execSync("npm i mongoose");
      generateMongooseClient();
      break;
  }
}

// Core function to generate project structure
function generateProjectStructure(input) {
  const { name, description, db, orm, authentication, roles } = input;
  const folders = [
    "controllers",
    "models",
    "routes",
    "services",
    "middlewares",
    "utils",
    "config",
    "migrations",
    "tests",
    "public",
  ];

  const files = [
    { path: "app.js", content: appTemplate(authentication,roles) },
    { path: ".env", content: "" }, // Empty .env file
    { path: ".gitignore", content: "node_modules\n.env\n" }, // Default .gitignore content
    {
      path: "README.md",
      content: "# Your Project Name\n\nProject documentation goes here.",
    },
  ];

  if (authentication) {
    files.push({
      path: "middlewares/passport.js",
      content: passport.middleware,
    });
    files.push({ path: "utils/auth.js", content: passport.util(input,userModel) });
  }

  try {
    folders.forEach((folder) => {
      const folderPath = path.join(projectRoot, folder);
      fs.mkdirSync(folderPath, { recursive: true });
    });

    files.forEach((file) => {
      const filePath = path.join(projectRoot, file.path);
      fs.writeFileSync(filePath, file.content);
    });

    //setup ORM
    runORMSetup(orm, db).then(() => {
      let models=[];
      if(userModel)models.push({name:'user',model:userModel})
      const config = {
        name,
        description,
        db,
        orm,
        authentication,
        roles,
        models,
      };
      const folderPath = path.join(projectRoot, "config.json");
      fs.writeFileSync(folderPath, JSON.stringify(config));
      console.log("Project setup successful");
    });
  } catch (error) {
    console.error("Error creating project structure:", error);
  }
}

// Function that takes user input
async function promptModelForm(answers) {
  let types = [
    "string",
    "integer",
    "float",
    "boolean",
    "date",
    "uuid",
    "json",
    "enum",
    "array",
    "binary",
    "decimal",
  ];
  types = types.map((type) => orms[answers.orm].getType(type));
  const formData = await inquirer.prompt([
    {
      type: "confirm",
      name: "add_field",
      message: "Add a field to User model?",
      default: true,
    },
  ]);

  // field data
  const fieldData = [];
  while (formData.add_field) {
    const newFieldData = await inquirer.prompt([
      {
        type: "input",
        name: "field_name",
        message: "Enter field name:",
        validate: (value) => (value ? true : "Field name is required"),
      },
      {
        type: "list",
        name: "field_type",
        message: "Select field type:",
        choices: types,
      },
      {
        type: "confirm",
        name: "add_another_field",
        message: "Do you want to add another field?",
        default: true,
      },
    ]);

    fieldData.push(newFieldData);

    if (newFieldData.add_another_field) {
      formData.add_field = true;
    } else {
      formData.add_field = false;
    }
  }

  formData.fields = fieldData;
  return formData;
}

// Function to install dependencies
function installDependencies(answers) {
  console.log("Installing dependencies");
  execSync("npm i express cors dotenv helmet morgan compression");
  switch (answers.db) {
    case "postgresQL":
      execSync("npm i pg pg-hstore");
    case "mySQL":
      execSync("npm i mysql2");
  }
  if (answers.authentication) {
    console.log("Setting up  passport,passport-jwt");
    execSync("npm i passport passport-jwt jsonwebtoken bcrypt");
  }
}

// Function to transform user input into usable data structure
function transformFields(fields) {
  const transformedFields = {};

  fields.forEach((field) => {
    transformedFields[field.field_name] = field.field_type;
  });

  return transformedFields;
}

async function CheckProjectExist() {
  try {
    const configPath = path.join(projectRoot, "config.json");
    const data = await fs.promises.readFile(configPath, "utf-8");
    if (data) {
      const config = JSON.parse(data);

      if (!config || !config.name) {
        console.log("Config file is empty or missing name property");
      }
      if (answers.name === config.name) {
        console.log("Project already created");
        return;
      }
    }
  } catch (error) {
    console.log("Initializing project setup");
  }
}

async function getRoleInput() {
  try {
    const roleAnswers = [];
    let confirm = true;

    while (confirm) {
      const { addRole } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addRole',
          message: 'Do you want to add a role?',
          default: true,
        },
      ]);

      if (!addRole) {
        confirm = false;
        break;
      }

      const { role } = await inquirer.prompt([
        {
          type: 'input',
          name: 'role',
          message: 'Enter the role:',
        },
      ]);

      roleAnswers.push(role);
    }

    return roleAnswers;
  } catch (error) {
    console.error('Error getting role input:', error);
    throw error;
  }
}


//  Process user input
inquirer.prompt(questions).then(async (answers) => {
  await CheckProjectExist();
  if (answers.authentication) {
    const ans = await inquirer.prompt(askRoleAuth)
    answers.roles = ans.roles;
    if (answers.roles)
    answers.roles = await getRoleInput()
    console.log("Let us create User model with required fields");
    const data = await promptModelForm(answers);
    const name = "user";
    userModel = transformFields(data.fields);
    switch (answers.orm) {
      case "prisma":
        await genModel.generatePrismaModel(name, userModel, answers.db);
        break;
      case "sequelize":
        await genModel.generateSequelizeModel(name, userModel);
        break;
    }
  }
  installDependencies(answers);
  generateProjectStructure(answers);
});
