#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import appTemplate from "./templates/app.js";
import template from "./templates/content.js";
import { exec, execSync } from "child_process";
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
    filter: function (val) {
      return val.toLowerCase();
    },
  },
  {
    type: "list",
    name: "orm",
    message: "Which ORM are you using?",
    choices: ["prisma", "sequelize", "mongoose"],
    filter: function (val) {
      return val.toLowerCase();
    },
  },
];

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

async function runORMSetup(orm, db) {
  console.log("starting orm setup..", orm);
  switch (orm) {
    case "prisma":
      await initializePrisma(db);
      generatePrismaClientInit();
      break;
  }
}

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

inquirer.prompt(questions).then((answers) => {
  console.log('Installing dependencies...');
  exec('npm i express cors dotenv helmet morgan compression',(err,stdout,stderr)=>{
    if(err)console.log("error installing packages")
    else
    {
      switch(answers.db){
        case "postgresQL":
          execSync('npm i pg pg-hstore')
      }
      switch(answers.orm){
        case "prisma":
          execSync('npm i prisma @prisma/client');
          break;
        case "sequelize":
          execSync('npm i sequelize sequelize-cli')
          break;
      }
      generateProjectStructure(answers);
      }
  })
});