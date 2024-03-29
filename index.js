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
    message: "Describe your project:",
  },
  {
    type: "list",
    name: "db",
    message: "Which database are you using?",
    choices: ["mongoDB", "postgresQL", "mySQL"],
  },
  {
    type: "list",
    name: "orm",
    message: "Which ORM are you using?",
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
  const { name, description, db, orm, authentication } = input;
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
    { path: "app.js", content: appTemplate(authentication) },
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
    files.push({ path: "utils/auth.js", content: passport.util });
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
      const config = {
        name,
        description,
        db,
        orm,
        models: [],
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
  const relationTypes = [
    "One-to-One",
    "One-to-Many",
    "Many-to-One",
    "Many-to-Many",
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

  // relation data
  const relationData = [];

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

  // Ask if user wants to add a relation
  const addRelation = await inquirer.prompt({
    type: "confirm",
    name: "add_relation",
    message: "Do you want to add a relation?",
    default: true,
  });

  if (addRelation.add_relation) {
    const newRelationData = await inquirer.prompt([
      {
        type: "input",
        name: "model_name",
        message: "Select relation model name:",
        validate: (value) => (value ? true : "model name is required"),
      },
      {
        type: "list",
        name: "relation_type",
        message: "Select relation type:",
        choices: relationTypes,
      },
      {
        type: "confirm",
        name: "add_another_relation",
        message: "Do you want to add another relation?",
        default: false,
      },
    ]);

    relationData.push(newRelationData);

    while (newRelationData.add_another_relation) {
      const nextRelationData = await inquirer.prompt([
        {
          type: "input",
          name: "model_name",
          message: "Select relation model name:",
          validate: (value) => (value ? true : "model name is required"),
        },
        {
          type: "list",
          name: "relation_type",
          message: "Select relation type:",
          choices: relationTypes,
        },
        {
          type: "confirm",
          name: "add_another_relation",
          message: "Do you want to add another relation?",
          default: false,
        },
      ]);

      relationData.push(nextRelationData);
    }

    formData.relations = relationData;
  }

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
    execSync("npm i passport passport-jwt");
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

//  Process user input
inquirer.prompt(questions).then(async (answers) => {
  const configPath = path.join(projectRoot, "config.json");

  try {
    // Read config.json file
    const data = await fs.promises.readFile(configPath, "utf-8");
    if (data) {
      // Parse JSON data
      const config = JSON.parse(data);

      // Check if config object has name property
      if (!config || !config.name) {
        console.log("Config file is empty or missing name property");
      }

      // Compare answers.name with config.name
      if (answers.name === config.name) {
        console.log("Project already created");
        return;
      }
    }
  } catch (error) {
    console.log("Initializing project setup");
  }
  installDependencies(answers);
  if (answers.authentication) {
    console.log("Let us create User model with required fields");
    const data = await promptModelForm(answers);
    const name = "user";
    const model = transformFields(data.fields);
    switch (answers.orm) {
      case "prisma":
        await genModel.generatePrismaModel(name,model,answers.db);
        break;
      case "sequelize":
        await genModel.generateSequelizeModel(name, model);
        break;
    }
  }
  generateProjectStructure(answers);
});
