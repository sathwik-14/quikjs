#!/usr/bin/env node

import inquirer from "inquirer";
import template from "./templates/content.js";
import {
  prismaDataType,
  sequelizeDataType,
  typeORMDataType,
  mongooseDataType,
} from "./types.js";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import genModel from "./model.js";
import capitalize from "./utils/capitalize.js";

let state;

const projectRoot = process.cwd();

// get state from config.json
const loadState = async () => {
  try {
    const config = fs.readFileSync(path.join(projectRoot, "config.json"));
    if (config.length !== 0) {
      state = JSON.parse(config);
    }
  } catch (error) {
    console.log("Please run the project setup command first - npx pag-g-p");
  }
};

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

async function promptSchemaModel() {
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
    types = types.map((type) => orms[state.orm].getType(type));

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
        when: (answers)=>Object.keys(state.models).length>=1
      },
      {
        type: "list",
        name: "refTable",
        message: "Select the referenced table:",
        choices: ()=>{
          if(Object.keys(state.models).length){
            return Object.values(state.models).map(value=>value.name)
          }
        },
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

// Function that takes user input
// async function promptModelForm() {
//   let types = [
//     "string",
//     "integer",
//     "float",
//     "boolean",
//     "date",
//     "uuid",
//     "json",
//     "enum",
//     "array",
//     "binary",
//     "decimal",
//   ];
//   const relationTypes = [
//     "One-to-One",
//     "One-to-Many",
//     "Many-to-One",
//     "Many-to-Many",
//   ];
//   if (Object.hasOwn(state, "orm")) {
//     types = types.map((type) => orms[state.orm].getType(type));
//   }
//   const formData = await inquirer.prompt([
//     {
//       type: "input",
//       name: "model_name",
//       message: "Enter model name:",
//       validate: (value) => (value ? true : "Model name is required"),
//     },
//     {
//       type: "input",
//       name: "model_desc",
//       message: "Enter model description:",
//     },
//     {
//       type: "confirm",
//       name: "add_field",
//       message: "Do you want to add a field?",
//       default: true,
//     },
//   ]);

//   // relation data
//   const relationData = [];

//   // field data
//   const fieldData = [];
//   while (formData.add_field) {
//     const newFieldData = await inquirer.prompt([
//       {
//         type: "input",
//         name: "field_name",
//         message: "Enter field name:",
//         validate: (value) => (value ? true : "Field name is required"),
//       },
//       {
//         type: "list",
//         name: "field_type",
//         message: "Select field type:",
//         choices: types,
//       },
//       {
//         type: "confirm",
//         name: "add_another_field",
//         message: "Do you want to add another field?",
//         default: true,
//       },
//     ]);

//     fieldData.push(newFieldData);

//     if (newFieldData.add_another_field) {
//       formData.add_field = true;
//     } else {
//       formData.add_field = false;
//     }
//   }

//   formData.fields = fieldData;

//   // Ask if user wants to add a relation
//   // const addRelation = await inquirer.prompt({
//   //   type: "confirm",
//   //   name: "add_relation",
//   //   message: "Do you want to add a relation?",
//   //   default: true,
//   // });

//   // if (addRelation.add_relation) {
//   //   const newRelationData = await inquirer.prompt([
//   //     {
//   //       type: "input",
//   //       name: "model_name",
//   //       message: "Select relation model name:",
//   //       validate: (value) => (value ? true : "model name is required"),
//   //     },
//   //     {
//   //       type: "list",
//   //       name: "relation_type",
//   //       message: "Select relation type:",
//   //       choices: relationTypes,
//   //     },
//   //     {
//   //       type: "confirm",
//   //       name: "add_another_relation",
//   //       message: "Do you want to add another relation?",
//   //       default: false,
//   //     },
//   //   ]);

//   //   relationData.push(newRelationData);

//   //   while (newRelationData.add_another_relation) {
//   //     const nextRelationData = await inquirer.prompt([
//   //       {
//   //         type: "input",
//   //         name: "model_name",
//   //         message: "Select relation model name:",
//   //         validate: (value) => (value ? true : "model name is required"),
//   //       },
//   //       {
//   //         type: "list",
//   //         name: "relation_type",
//   //         message: "Select relation type:",
//   //         choices: relationTypes,
//   //       },
//   //       {
//   //         type: "confirm",
//   //         name: "add_another_relation",
//   //         message: "Do you want to add another relation?",
//   //         default: false,
//   //       },
//   //     ]);

//   //     relationData.push(nextRelationData);
//   //   }

//   //   formData.relations = relationData;
//   // }

//   if(state.authentication && state.roles.length){
//     let roleOptions = []
//     state.roles.forEach(role=>roleOptions.push({name:role}))
//     const accept = await inquirer.prompt({
//       type:"checkbox",
//       name:"roles",
//       message: "Who can access the generated api? (select one/many)",
//       choices: roleOptions
//     })
//     formData.roles = accept.roles;
//   }

//   return formData;
// }

// Function to transform user input into usable data structure
function transformFields(fields) {
  const transformedFields = {};

  fields.forEach((field) => {
    transformedFields[field.field_name] = field.field_type;
  });

  return transformedFields;
}

// Run npx prisma generate
function migrateAndGeneratePrisma() {
  return new Promise((resolve, reject) => {
    try {
      // Execute 'npx prisma migrate dev' synchronously with '\n' as input
      const migrateDevProcess = spawnSync("npx", ["prisma", "migrate", "dev"], {
        input: "\n",
        encoding: "utf-8",
        stdio: "inherit",
      });

      if (migrateDevProcess.error) {
        console.log("Prisma migrate dev failed");
      } else {
        console.log("Prisma migrate dev completed");
      }
      // Execute 'npx prisma generate' synchronously
      const generateProcess = spawnSync("npx", ["prisma", "generate"], {
        stdio: "inherit",
      });
      if (generateProcess.error) {
        console.log("Prisma generate failed");
      } else {
        console.log("Prisma generate completed");
      }
      resolve(); // Resolve the promise if commands executed successfully
    } catch (error) {
      console.error("Prisma migrate or generate failed:", error);
      reject(error); // Reject the promise if any error occurs
    }
  });
}

// Setup primsa
async function setupPrisma(serviceName, model, db) {
  try {
    console.log("start orm model setup");
    genModel.generatePrismaModel(serviceName, model, db);
    console.log("start migration");
    await migrateAndGeneratePrisma();
  } catch (error) {
    console.log("Error setting up Prisma:", error);
  }
}

// controllers for prisma
function controllersPrisma(serviceName) {
  const controllerContent = `const prisma = require('../config/db');

  ${template.createPrismaContent(serviceName)}
  ${template.getAllPrismaContent(serviceName)}
  ${template.getByIdPrismaContent(serviceName)}
  ${template.updatePrismaContent(serviceName)}
  ${template.deletePrismaContent(serviceName)}
  
  module.exports = {
    create${capitalize(serviceName)},
    getAll${capitalize(serviceName)},
    get${capitalize(serviceName)}ById,
    update${capitalize(serviceName)}ById,
    delete${capitalize(serviceName)}ById
  };
    `;

  fs.writeFileSync(
    path.join(projectRoot, "controllers", `${serviceName}.js`),
    controllerContent
  );
}

// Check if a variable is an array and is not empty
function isArrayNotEmpty(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

// Controllers generation for sequelize models
function controllersSequelize(serviceName) {
  // Write to controller file
  const controllerContent = `
  const db = require('../models/index');

  ${template.createSequelizeContent(serviceName)}
  ${template.getAllSequelizeContent(serviceName)}
  ${template.getByIdSequelizeContent(serviceName)}
  ${template.updateSequelizeContent(serviceName)}
  ${template.deleteSequelizeContent(serviceName)}
  
  module.exports = {
    create${capitalize(serviceName)},
    getAll${capitalize(serviceName)},
    get${capitalize(serviceName)}ById,
    update${capitalize(serviceName)}ById,
    delete${capitalize(serviceName)}ById
  };
  `;
  const controllerFilePath = path.join(
    projectRoot,
    "controllers",
    `${serviceName}.js`
  );
  fs.writeFileSync(controllerFilePath, controllerContent);
}

// Setup Sequalize
async function setupSequalize(serviceName, model, relations) {
  try {
    console.log("generating model");
    genModel.generateSequelizeModel(serviceName, model);
    if (isArrayNotEmpty(relations))
      generateAssociations(serviceName, relations);
    console.log("model generation complete");
  } catch (error) {
    console.log("Error setting up Prisma:", error);
  }
}

// Function to generate associations in Sequelize models
function generateAssociations(modelName, relations) {
  relations.forEach(({ model_name, relation_type }) => {
    // Generate association code
    const associationCode = generateAssociationCode(
      modelName,
      model_name,
      relation_type
    );

    // Append association code to model file
    appendToFile(`${modelName}.js`, associationCode);

    // Append inverse association code to related model file
    appendToFile(
      `${model_name}.js`,
      generateInverseAssociationCode(modelName, model_name, relation_type)
    );
  });
}

// Function to generate association code
function generateAssociationCode(modelName, relatedModelName, type) {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  let associationCode = `// Define association with ${capitalize(
    relatedModelName
  )}\n
  const ${capitalize(
    relatedModelName
  )} = require('./${relatedModelName.toLowerCase()}');\n
  `;

  if (type.toLowerCase() === "one-to-many") {
    associationCode += `${capitalize(modelName)}.hasMany(${capitalize(
      relatedModelName
    )});\n`;
  } else if (type.toLowerCase() === "many-to-one") {
    associationCode += `${capitalize(modelName)}.belongsTo(${capitalize(
      relatedModelName
    )});\n`;
  } else if (type.toLowerCase() === "many-to-many") {
    associationCode += `${capitalize(modelName)}.belongsToMany(${capitalize(
      relatedModelName
    )});\n`;
  } else if (type.toLowerCase() === "one-to-one") {
    associationCode += `${capitalize(modelName)}.hasOne(${capitalize(
      relatedModelName
    )});\n`;
  }

  return associationCode;
}

// Function to generate inverse association code
function generateInverseAssociationCode(modelName, relatedModelName, type) {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  let inverseAssociationCode = `// Define inverse association with ${capitalize(
    modelName
  )}\n
  const ${capitalize(modelName)} = require('./${modelName.toLowerCase()}');\n
  `;

  if (type.toLowerCase() === "one-to-many") {
    inverseAssociationCode += `${capitalize(
      relatedModelName
    )}.belongsTo(${capitalize(modelName)});\n`;
  } else if (type.toLowerCase() === "many-to-one") {
    inverseAssociationCode += `${capitalize(
      relatedModelName
    )}.hasMany(${capitalize(modelName)});\n`;
  } else if (type.toLowerCase() === "many-to-many") {
    inverseAssociationCode += `${capitalize(
      relatedModelName
    )}.belongsToMany(${capitalize(modelName)});\n`;
  } else if (type.toLowerCase() === "one-to-one") {
    inverseAssociationCode += `${capitalize(
      relatedModelName
    )}.hasOne(${capitalize(modelName)});\n`;
  }

  return inverseAssociationCode;
}

// Function to append content to a file
function appendToFile(fileName, content) {
  const filePath = path.join(projectRoot, "models", fileName);
  fs.appendFileSync(filePath, content);
}

// Main function to generate scaffold
async function generateScaffold(serviceName, model, relations, roles) {
  try {
    const db = state.db;
    const orm = state.orm;
    console.log("started generating scaffold...");
    switch (orm) {
      case "prisma":
        await setupPrisma(serviceName, model, db);
        controllersPrisma(serviceName);
        break;
      case "sequelize":
        await setupSequalize(serviceName, model, relations);
        controllersSequelize(serviceName);
        break;
    }
    generateRoutes(serviceName,roles);
    console.log("done generating routes and controllers");
  } catch (error) {
    console.error("Error generating scaffold:", error);
  }
}

// Check auth middleware
function authMiddleware(roles){
if(state.authentication && roles.length){
  return `userAuth, checkRole(${JSON.stringify(roles)}), `
}
else if(state.authentication){
  return 'userAuth, '
}
return ''
}

// Generate routes
function generateRoutes(serviceName, roles) {
  const mainFilePath = path.join(projectRoot, "app.js");
  fs.writeFileSync(
    path.join(projectRoot, "routes", `${serviceName}.js`),
    template.routesContent(serviceName)
  );
  // Append the line to use routes in main file
  const importContent = `const ${serviceName}Routes = require("./routes/${serviceName}");`;
  const routeContent = `app.use("/api/${serviceName}",${authMiddleware(roles)}${serviceName}Routes);`;
  let mainFileContent = fs.readFileSync(mainFilePath, "utf-8");
  let lines = mainFileContent.split("\n");
  const importRoutesIndex = lines.findIndex((line) =>
    line.includes("// Import routes")
  );
  if (
    importRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(importContent))
  ) {
    lines.splice(importRoutesIndex + 1, 0, importContent);
    fs.writeFileSync(mainFilePath, lines.join("\n"));
  }
  mainFileContent = fs.readFileSync(mainFilePath, "utf-8");
  lines = mainFileContent.split("\n");
  const useRoutesIndex = lines.findIndex((line) => line.includes("// Routes"));
  if (
    useRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(routeContent))
  ) {
    lines.splice(useRoutesIndex + 1, 0, routeContent);
    fs.writeFileSync(mainFilePath, lines.join("\n"));
  }
}

// function to update state
function updateState(data) {
  console.log("Updating project state");
  let config = fs.readFileSync(path.join(projectRoot, "config.json"), "utf-8");
  config = JSON.parse(config);
  config.models.push(data);
  console.log(config);
  fs.writeFileSync(
    path.join(projectRoot, "config.json"),
    JSON.stringify(config)
  );
  return config;
}

// Core function
async function main() {
  try {
  const formData = await promptSchemaModel();
  // console.log("Form Data:", formData);
  let { model_name, model_desc, fields, relations, roles } = formData;
    const name = model_name;
    const model = transformFields(fields);
    let modelExists;
    if (Object.hasOwn(state, "models") && state.models.length) {
      const models = state.models;
      models.forEach((i) => {
        if (i.name == name) {
          modelExists = true;
          return;
        }
      });
    }
    if (modelExists) {
      console.log("model/service already exist");
    } else {
      relations = isArrayNotEmpty(relations) ? relations : [];
      await generateScaffold(name, model, relations, roles);
      console.log(
        `API GENERATED/MODIFIED FOR SERVICE '${name}' FOR PROJECT '${state.projectName}' USING DATABASE '${req.body.db}'`
      );
    }
  } catch (err) {
    // console.log("something went wrong");
  }
}

loadState();
main();
