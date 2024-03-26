#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import appTemplate from "./templates/app.js";
import template from "./templates/content.js";
import { exec, execSync } from "child_process";

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
    choices: ["mongoDB", "postgresQL", "mySQL"]
  },
  {
    type: "list",
    name: "orm",
    message: "Which ORM are you using?",
    choices: function(answers) {
      if (answers.db === "mongoDB") {
        return ["prisma", "mongoose"];
      } else {
        return ["prisma", "sequelize"];
      }
    }
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

// Function to run ORM setup
async function runORMSetup(orm, db) {
  console.log("starting orm setup..", orm);
  switch (orm) {
    case "prisma":
      execSync("npm i prisma @prisma/client");
      await initializePrisma(db);
      generatePrismaClientInit();
      break;
    case "sequelize":
      execSync("npm i sequelize sequelize-cli");
      break;
  }
}

// Core function to generate project structure
function generateProjectStructure(input) {
  const { name, description, db, orm } = input;
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
    { path: "app.js", content: appTemplate },
    { path: ".env", content: "" }, // Empty .env file
    { path: ".gitignore", content: "node_modules\n.env\n" }, // Default .gitignore content
    {
      path: "README.md",
      content: "# Your Project Name\n\nProject documentation goes here.",
    },
  ];

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
      console.log("Project setup successful.");
    });
  } catch (error) {
    console.error("Error creating project structure:", error);
  }
}

//  Process user input
inquirer.prompt(questions).then(async(answers) => {
  const configPath = path.join(projectRoot, 'config.json');
  try {
    // Read config.json file
    const data = await fs.promises.readFile(configPath, 'utf-8');
    if(data){
    // Parse JSON data
    const config = JSON.parse(data);
    
    // Check if config object has name property
    if (!config || !config.name) {
      console.log('Config file is empty or missing name property');
    }

    // Compare answers.name with config.name
    if (answers.name === config.name) {
      console.log('Project already created');
      return
    }
  }
  } catch (error) {
    console.log('Initializing project setup\n');
  }
  console.log("Installing dependencies...");
    execSync("npm i express cors dotenv helmet morgan compression");
    switch (answers.db) {
      case "postgresQL":
        execSync("npm i pg pg-hstore");
    }
    generateProjectStructure(answers);
});
