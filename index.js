#!/usr/bin/env node

import inquirer from "inquirer";
import { appTemplate } from "./templates/app.js";
import passport from "./templates/passport.js";
import aws from "./templates/aws.js";
import twilio from "./templates/twilio.js";
import { createDirectory, read, write } from "./utils/fs.js";
import genModel from "./model.js";
import format from "./utils/format.js";
import install from "./utils/install.js";
import Handlebars from "handlebars";
import { scaffold } from "./generate.js";
// import { ask } from "./utils/prompt.js";
import prisma from "./plugins/prisma.js";
import sequelize from "./plugins/sequelize.js";
import { tools, orms } from "./constants.js";

const projectRoot = process.cwd();

let userModel;
let models = [];

const projectQuestions = [
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
    message: "Do you want access_logging for your application?",
    default: true,
  },
  {
    type: "confirm",
    name: "error_handling",
    message: "Do you want error_logging for your application?",
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

async function runORMSetup(orm, db) {
  console.log(`Setting up ${orm}`);
  switch (orm) {
    case "prisma":
      install("prisma", "@prisma/client");
      await prisma.init(db);
      prisma.clientInit();
      break;
    case "sequelize":
      install("sequelize", "sequelize-cli");
      sequelize.clientInit();
      break;
    case "mongoose":
      install("mongoose");
      generateMongooseClient();
      break;
  }
}

async function generateProjectStructure(input) {
  try {
    const { db, orm, tools, authentication, logging, error_handling } = input;

    const folders = [
      "controllers",
      "models",
      "routes",
      "middlewares",
      "utils",
      "config",
    ];

    const appJsTemplate = Handlebars.compile(appTemplate);

    let files = [
      {
        path: "app.js",
        content: await format(appJsTemplate({ input: input })),
      },
      { path: ".env", content: "" },
      { path: ".gitignore", content: "node_modules\n.env\n" },
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
              content: await format(aws.s3.config(input)),
            });
            files.push({
              path: "utils/s3.js",
              content: await format(aws.s3.utils(input)),
            });
            break;
          case "sns":
            files.push({
              path: "utils/sns.js",
              content: await format(aws.sns(input)),
            });
            break;
          case "twilio":
            files.push({
              path: "utils/twilio.js",
              content: await format(twilio(input)),
            });
            break;
        }
      }
    }
    if (authentication) {
      files.push({
        path: "middlewares/passport.js",
        content: await format(passport.middleware),
      });
      files.push({
        path: "utils/auth.js",
        content: await format(passport.util(input, userModel)),
      });
    }
    if (logging) {
      files.push({ path: "access.log", content: "" });
    }
    if (error_handling) {
      files.push({ path: "error.log", content: "" });
    }
    folders.forEach((folder) => {
      createDirectory(folder);
    });
    files.forEach((file) => {
      write(file.path, file.content);
    });
    await runORMSetup(orm, db);
  } catch (error) {
    console.error("Error creating project structure:", error);
  }
}

async function promptModelForm(answers) {
  let mappedTypes = orms[answers.orm].types;
  const formData = await inquirer.prompt([
    {
      type: "confirm",
      name: "add_field",
      message: "Add a field to User model?",
      default: true,
    },
  ]);
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
        choices: mappedTypes,
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

function installDependencies(answers) {
  console.log("Installing dependencies");
  install("express", "cors", "dotenv", "helmet", "morgan", "compression");
  switch (answers.db) {
    case "postgresQL":
      install("pg", "pg-hstore");
      break;
    case "mySQL":
      install("mysql2");
      break;
  }
  if (answers.authentication) {
    console.log("Setting up  passport,passport-jwt");
    install("passport", "passport-jwt", "jsonwebtoken", "bcrypt");
  }
  if (answers.tools.length) {
    for (const item of answers.tools) {
      switch (item) {
        case "s3":
        case "sns":
          install("aws-sdk");
          break;
        case "twilio":
          install("twilio");
      }
    }
  }
}

async function CheckProjectExist() {
  try {
    const data = await read("config.json");
    if (data) {
      const config = JSON.parse(data);
      if (!config?.name) {
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
      }
      const { role } = await inquirer.prompt([
        { type: "input", name: "role", message: "Enter the role:" },
      ]);
      roleAnswers.push(role);
    }
    return roleAnswers;
  } catch (error) {
    console.error("Error getting role input:", error);
    throw error;
  }
}

async function main() {
  try {
    // const answers = await ask(projectQuestions);
    const answers = {
      name: "todos",
      description: "",
      db: "postgresQL",
      orm: "sequelize",
      logging: true,
      error_handling: true,
      tools: ["none"],
      authentication: false,
    };
    await CheckProjectExist();
    if (answers.authentication) {
      if (answers.roles) answers.roles = await getRoleInput();
      console.log("Let us create User model with required fields");
      const userModel = await promptModelForm(answers);
      const name = "user";
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
    console.log("Started generating scaffold...");
    await scaffold(answers);
    if (userModel) models.push({ name: "user", model: userModel });
    console.log("Project setup successful\n");
  } catch (error) {
    console.log(error);
    console.log("Unable to generate project.");
  }
}

main();
