#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import appTemplate from "./templates/app.js";
import template from "./templates/content.js";

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

function generateProjectStructure() {
    const projectRoot = path.resolve(new URL('.', import.meta.url).pathname);
    const folders = [
        'controllers',
        'models',
        'routes',
        'services',
        'middlewares',
        'utils',
        'config',
        'migrations',
        'tests',
        'public'
    ];

    const files = [
        { path: 'app.js', content: appTemplate },
        { path: '.env', content: '' }, // Empty .env file
        { path: '.gitignore', content: 'node_modules\n.env\n' }, // Default .gitignore content
        { path: 'README.md', content: '# Your Project Name\n\nProject documentation goes here.' }
    ];

    try {
        folders.forEach(folder => {
            const folderPath = path.join(projectRoot, folder);
            fs.mkdirSync(folderPath, { recursive: true });
        });

        files.forEach(file => {
            const filePath = path.join(projectRoot, file.path);
            fs.writeFileSync(filePath, file.content);
        });

        console.log('Project structure created successfully.');
    } catch (error) {
        console.error('Error creating project structure:', error);
    }
}

inquirer.prompt(questions).then((answers) => {
  console.log(answers.name, answers.description, answers.db, answers.orm)
  generateProjectStructure()
});
