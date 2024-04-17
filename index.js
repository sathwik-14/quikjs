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
import aws from "./templates/aws.js";
import twilio from "./templates/twilio.js"
import { exec } from "child_process";
import genModel from "./model.js";
import format from "./utils/format.js";
import install from "./utils/install.js";
import Handlebars from "handlebars";

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

const tools = [
  { name: "none" },
  { name: "s3" },
  { name: "sns" },
  { name: "twilio" },
  { name: "msg91" },
  { name: "sendgrid" },
];

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
    name: "logging",
    message: "Do you want logging for your application?",
    default: true,
  },
  {
    type: "confirm",
    name: "error_handling",
    message: "Do you want error_handling for your application?",
    default: true,
  },
  {
    type: "checkbox",
    name: "tools",
    message: "Select third-party tools you would like to configure",
    choices: tools,
  },
  {
    type: "confirm",
    name: "authentication",
    message: "Do you want authentication for your project?(passport-jwt)",
    default: true,
  },
  {
    type: "confirm",
    name: "roles",
    message: "Do you want role based authentication?",
    default: true,
    when: (answers) => answers.authentication,
  },
];

let tables = [];

// Get database schema information
async function promptSchemaModel(input) {
  try {
    let schemaData = {};
    let confirm = true;

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
    types = types.map((type) => orms[input.orm].getType(type));

    const schemaQuestions = [
      {
        type: "input",
        name: "name",
        message: "Enter the name of the attribute:",
        validate: function (value) {
          return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)
            ? true
            : "Please enter a valid attribute name (alphanumeric characters and underscores only, and must start with a letter or underscore).";
        },
      },
      {
        type: "list",
        name: "type",
        message: "Select the data type:",
        choices: types,
      },
      {
        type: "input",
        name: "size",
        message: "Enter the size (if applicable):",
        when: (answers) => !["BOOLEAN", "DATE"].includes(answers.type),
        validate: function (value) {
          return /^\d+$/.test(value)
            ? true
            : "Please enter a valid size (a positive integer).";
        },
      },
      {
        type: "input",
        name: "defaultValue",
        message: "Enter the default value (if any):",
        default: null,
        validate: function (value) {
          return value.trim().length === 0 || /^[a-zA-Z0-9_]+$/.test(value)
            ? true
            : "Please enter a valid default value (alphanumeric characters and underscores only).";
        },
      },
      {
        type: "confirm",
        name: "primaryKey",
        message: "Is this attribute a primary key?",
        default: true,
      },
      {
        type: "confirm",
        name: "allowNulls",
        message: "Allow NULL values for this attribute?",
        when: (answers) => !answers.primaryKey,
        default: true,
      },
      {
        type: "confirm",
        name: "unique",
        message: "Should this attribute have unique values?",
        when: (answers) => !answers.primaryKey,
        default: false,
      },
      {
        type: "confirm",
        name: "autoIncrement",
        message: "Should this attribute auto-increment?",
        default: false,
      },
      {
        type: "confirm",
        name: "foreignKey",
        message: "Is this attribute a foreign key?",
        default: true,
      },
      {
        type: "list",
        name: "refTable",
        message: "Select the referenced table:",
        choices: tables,
        when: (answers) => answers.foreignKey,
      },
      {
        type: "list",
        name: "refField",
        message: "Enter the referenced field:",
        when: (answers) => answers.foreignKey,
        choices: function (answers) {
          const refTable = answers.refTable;
          const fields = schemaData[refTable].map((field) => field.name);
          return fields;
        },
      },
      {
        type: "list",
        name: "relationshipType",
        message: "Select the relationship type:",
        choices: ["One-to-One", "One-to-Many", "Many-to-One", "Many-to-Many"],
        when: (answers) => answers.foreignKey,
      },
      {
        type: "confirm",
        name: "add_another",
        message: "Do you want to add another attribute?",
        default: true,
      },
    ];

    while (confirm) {
      let add_attributes = true;

      const ans = await inquirer.prompt([
        {
          type: "confirm",
          name: "add_table",
          message: "Do you want to add a table?",
          default: true,
        },
        {
          type: "input",
          name: "table_name",
          message: "Enter the table name?",
          when: (answers) => answers.add_table,
        },
      ]);
      if (!ans.add_table) {
        confirm = false;
        break;
      }

      schemaData[ans.table_name] = [];
      tables.push(ans.table_name);

      while (add_attributes) {
        const model = await inquirer.prompt(schemaQuestions);

        if (!model.add_another) {
          schemaData[ans.table_name].push(model);
          add_attributes = false;
          break;
        }
        schemaData[ans.table_name].push(model);
      }
    }

    return schemaData;
  } catch (e) {
    console.log("error getting schema details");
  }
}

// Get the current working directory
const projectRoot = process.cwd();

// Generate prisma client init
async function generatePrismaClientInit() {
  fs.writeFileSync(
    path.join(projectRoot, "config", "db.js"),
    await format(template.prismaInitContent,'babel')
  );
}

// Run npx prisma init
function initializePrisma(db) {
  return new Promise((resolve, reject) => {
    exec("npx prisma init", async (err, stdout, stderr) => {
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
        fs.writeFileSync(schemaPath, await format(prismaModelContent,'babel'));
        console.log("Prisma initialization completed successfully");
      }
      resolve();
    });
  });
}

// Generate sequalize client init
async function generateSequalizeClientInit() {
  fs.writeFileSync(
    path.join(projectRoot, "config", "db.js"),
    await format(template.sequelizeInitContent,'babel')
  );
}

// Generate mongoose client inti
async function generateMongooseClient() {
  fs.writeFileSync(
    path.join(projectRoot, "config", "db.js"),
    await format(template.mongooseInit,'babel')
  );
}

// Function to run ORM setup
async function runORMSetup(orm, db) {
  console.log(`Setting up ${orm}`);
  switch (orm) {
    case "prisma":
      install("prisma","@prisma/client");
      await initializePrisma(db);
      generatePrismaClientInit();
      break;
    case "sequelize":
      install("sequelize","sequelize-cli");
      generateSequalizeClientInit();
      break;
    case "mongoose":
      install("mongoose");
      generateMongooseClient();
      break;
  }
}

// Core function to generate project structure
async function generateProjectStructure(input) {
  try {
    const {
      name,
      description,
      db,
      orm,
      tools,
      authentication,
      roles,
      logging,
      error_handling,
    } = input;
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


Handlebars.registerHelper('errorHandlingMiddleware', () => {
  return `
  app.use((err, req, res, next) => {
    console.error("Custom error handler - " + err.stack);
  
    // Log the error to a file
    const logStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
    logStream.write(new Date().toISOString() + ': ' + err.stack + '\\n');
    logStream.end();
  
    res.status(500).send("Something went wrong!");
  });`;
});

Handlebars.registerHelper('defaultErrorHandlingMiddleware', () => {
  return `
  app.use((err, req, res, next) => {
    console.error("Custom error handler - " + err.stack);
    res.status(500).send("Something went wrong!");
  });`;
});

Handlebars.registerHelper('logMiddleware', () => {
  return `
  app.use(morgan("combined", { stream: fs.createWriteStream(path.join(process.pwd(), 'access.log'), { flags: 'a' }) })); // Logging to file
  `;
});

Handlebars.registerHelper('authRoutes', (authentication) => {
  if (authentication) {
    return `
app.post("/auth/register", async (req,res) => await userRegister(req.body,res));
app.post("/auth/login", async (req,res) => await userLogin(req.body,res));
app.get("/auth/profile", userAuth, (req,res) => res.status(200).json({ user: serializeUser(req.user) }));
    `;
  }
  return '';
});

Handlebars.registerHelper('authImports', (authentication, roles) => {
  if (authentication && roles.length) {
    return `const passport = require("passport");
const {userAuth, userRegister, userLogin, checkRole, serializeUser} = require("./utils/auth")`;
  } else if (authentication) {
    return `const passport = require("passport");
const {userAuth, userRegister, userLogin, serializeUser} = require("./utils/auth")`;
  }
  return '';
});


    const appJsTemplate = Handlebars.compile(appTemplate)

    let files = [
      {
        path: "app.js",
        content: await format(appJsTemplate({input}),'babel'),
      },
      { path: ".env", content: "" }, // Empty .env file
      { path: ".gitignore", content: "node_modules\n.env\n" }, // Default .gitignore content
      {
        path: "README.md",
        content: "# Your Project Name\n\nProject documentation goes here.",
      },
    ];

    if (tools.length) {
      for (const item of tools) {
        switch (item) {
          case "s3":
            files.push({
              path: "config/aws.js",
              content: await format(aws.s3.config(input),'babel')
            });
            files.push({
              path: "utils/s3.js",
              content: await format(aws.s3.utils(input),'babel'),
            });
            break;
        case "sns":
            files.push({
                path:"utils/sns.js",
                content: await format(aws.sns(input),'babel')
            })
            break;
        case "twilio":
            files.push({
                path:"utils/twilio.js",
                content: await format(twilio(input),'babel') 
            })
            break;
        }
      }
    }

    if (authentication) {
      files.push({
        path: "middlewares/passport.js",
        content: await format(passport.middleware,'babel'),
      });
      files.push({
        path: "utils/auth.js",
        content: await format(passport.util(input, userModel),'babel'),
      });
    }

    if (logging) {
      files.push({ path: "access.log", content: "" });
    }

    if (error_handling) {
      files.push({ path: "error.log", content: "" });
    }

    folders.forEach((folder) => {
      const folderPath = path.join(projectRoot, folder);
      fs.mkdirSync(folderPath, { recursive: true });
    });

    files.forEach((file) => {
      const filePath = path.join(projectRoot, file.path);
      fs.writeFileSync(filePath, file.content);
    });

    //setup ORM
    await runORMSetup(orm, db);
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
  install("express","cors","dotenv","helmet","morgan","compression");
  switch (answers.db) {
    case "postgresQL":
      install("pg","pg-hstore");
      break;
    case "mySQL":
      install("mysql2");
      break;
  }
  if (answers.authentication) {
    console.log("Setting up  passport,passport-jwt");
    install("passport","passport-jwt","jsonwebtoken","bcrypt");
  }
  if (answers.tools.length) {
    for (const item of answers.tools) {
      switch (item) {
        case "s3":
        case "sns":
            install("aws-sdk");
            break;
        case "twilio":
            install("twilio")
      }
    }
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
          type: "confirm",
          name: "addRole",
          message: "Do you want to add a role?",
          default: true,
        },
      ]);

      if (!addRole) {
        confirm = false;
        break;
      }

      const { role } = await inquirer.prompt([
        {
          type: "input",
          name: "role",
          message: "Enter the role:",
        },
      ]);

      roleAnswers.push(role);
    }

    return roleAnswers;
  } catch (error) {
    console.error("Error getting role input:", error);
    throw error;
  }
}

//  Process user input
async function main() {
  try {
    const answers = await inquirer.prompt(questions);
    await CheckProjectExist();
    if (answers.authentication) {
      if (answers.roles) answers.roles = await getRoleInput();
      console.log("Let us create User model with required fields");
      const data = await promptModelForm(answers);
      const name = "user";
      userModel = transformFields(data.fields);
      switch (answers.orm) {
        case "prisma":
          genModel.generatePrismaModel(name, userModel, answers.db);
          break;
        case "sequelize":
          genModel.generateSequelizeModel(name, userModel);
          break;
      }
    }
    installDependencies(answers);
    await generateProjectStructure(answers);
    const schemaData = await promptSchemaModel(answers);
    if (Object.keys(schemaData).length) {
      for (const [key, value] of Object.entries(schemaData)) {
        switch (answers.orm) {
          case "prisma":
            genModel.generatePrismaModel(key, value, answers.db);
            break;
          case "sequelize":
            genModel.generateSequelizeModel(key, value);
            break;
        }
      }
    }
    let models = [];
    if (userModel) models.push({ name: "user", model: userModel });
    const { name, description, db, orm, authentication, roles } = answers;
    const config = {
      name,
      description,
      db,
      orm,
      authentication,
      roles,
      models: schemaData,
    };
    const folderPath = path.join(projectRoot, "config.json");
    fs.writeFileSync(folderPath, await format(JSON.stringify(config),'json'));
    console.log("Project setup successful\n");
  } catch (error) {
    console.log("Unable to generate project.");
  }
}

main();
