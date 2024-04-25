#!/usr/bin/env node

import template from "./templates/content.js";
import capitalize from "./utils/capitalize.js";
import { append, read, write } from "./utils/fs.js";
import { orms } from "./constants.js";
import prisma from "./plugins/prisma/prisma.js";
import format from "./utils/format.js";
import { ask } from "./utils/prompt.js";

let state;
let tables = [];

const loadState = async (input) => {
  try {
    const config = read("config.json");
    if (config.length !== 0) {
      state = JSON.parse(config);
    }
  } catch (error) {
    state = input;
  }
};

async function promptSchemaModel(input, name = "") {
  try {
    let schemaData = {};
    let mappedTypes = orms[input.orm].types;

    const schemaQuestions = [
      {
        type: "input",
        name: "name",
        message: "Enter the name of the attribute:",
        when: name === "",
        validate: function (value) {
          return /^[a-zA-Z_]\w*$/.test(value)
            ? true
            : "Please enter a valid attribute name (alphanumeric characters and underscores only, and must start with a letter or underscore).";
        },
      },
      {
        type: "list",
        name: "type",
        message: "Select the data type:",
        choices: mappedTypes,
      },
      {
        type: "input",
        name: "size",
        message: "Enter the size (if applicable):",
        when: (answers) =>
          ["string", "binary"].includes(answers.type.toLowerCase()),
        default: "",
      },
      {
        type: "input",
        name: "defaultValue",
        message: "Enter the default value (if any):",
        when: (answers) =>
          ["string", "integer", "float", "boolean", "date", "decimal"].includes(
            answers.type.toLowerCase()
          ),
        default: "",
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
        default: true,
      },
      {
        type: "confirm",
        name: "autoIncrement",
        message: "Should this attribute auto-increment?",
        default: true,
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

    while (true) {
      const ans = await ask([
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
        break;
      }
      schemaData[ans.table_name] = [];
      tables.push(ans.table_name);
      while (true) {
        const model = await ask(schemaQuestions);
        if (!model.add_another) {
          schemaData[ans.table_name].push(model);
          break;
        }
        schemaData[ans.table_name].push(model);
      }
    }
    return schemaData;
  } catch (e) {
    console.log(e);
    console.log("error getting schema details\n" + e);
  }
}

async function setupPrisma(serviceName, model, db) {
  try {
    console.log("start orm model setup");
    prisma.model(serviceName, model, db);
    console.log("start migration");
    await prisma.generate();
  } catch (error) {
    console.log("Error setting up Prisma:", error);
  }
}

function controllersPrisma(serviceName) {
  const controllerContent = `const prisma = require('../config/db');
\n\n  ${template.createPrismaContent(serviceName)}\n  ${template.getAllPrismaContent(serviceName)}\n  ${template.getByIdPrismaContent(serviceName)}\n  ${template.updatePrismaContent(serviceName)}\n  ${template.deletePrismaContent(serviceName)}\n  \n  module.exports = {\n    create${capitalize(serviceName)},\n    getAll${capitalize(serviceName)},\n    get${capitalize(serviceName)}ById,\n    update${capitalize(serviceName)}ById,\n    delete${capitalize(serviceName)}ById\n  };
\n    `;
  write(`controllers/${serviceName}.js`, controllerContent);
}

function isArrayNotEmpty(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

function controllersSequelize(serviceName) {
  const controllerContent = `\n  const db = require('../models/index');
\n  ${template.createSequelizeContent(serviceName)}\n 
 ${template.getAllSequelizeContent(serviceName)}\n 
  ${template.getByIdSequelizeContent(serviceName)}\n
    ${template.updateSequelizeContent(serviceName)}\n  
    ${template.deleteSequelizeContent(serviceName)}\n  
    \n module.exports = {\n  
          create${capitalize(serviceName)},\n 
  getAll${capitalize(serviceName)},\n  
    get${capitalize(serviceName)}ById,\n  
      update${capitalize(serviceName)}ById,\n  
        delete${capitalize(serviceName)}ById\n  };`;
  write(`controllers/${serviceName}.js`, controllerContent);
}

async function setupSequalize(serviceName, model, relations = []) {
  try {
    await genModel.generateSequelizeModel(serviceName, model);
    if (isArrayNotEmpty(relations))
      generateAssociations(serviceName, relations);
    console.log("Model generation complete - "+serviceName);
  } catch (error) {
    console.log("Error setting up Prisma:", error);
  }
}

function generateAssociations(modelName, relations = []) {
  relations.forEach(({ model_name, relation_type }) => {
    const associationCode = generateAssociationCode(
      modelName,
      model_name,
      relation_type
    );
    appendToFile(`${modelName}.js`, associationCode);
    appendToFile(
      `${model_name}.js`,
      generateInverseAssociationCode(modelName, model_name, relation_type)
    );
  });
}

function generateAssociationCode(modelName, relatedModelName, type) {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  let associationCode = `// Define association with ${capitalize(relatedModelName)}\n\n  const ${capitalize(relatedModelName)} = require('./${relatedModelName.toLowerCase()}');
\n\n  `;
  if (type.toLowerCase() === "one-to-many") {
    associationCode += `${capitalize(modelName)}.hasMany(${capitalize(relatedModelName)});
\n`;
  } else if (type.toLowerCase() === "many-to-one") {
    associationCode += `${capitalize(modelName)}.belongsTo(${capitalize(relatedModelName)});
\n`;
  } else if (type.toLowerCase() === "many-to-many") {
    associationCode += `${capitalize(modelName)}.belongsToMany(${capitalize(relatedModelName)});
\n`;
  } else if (type.toLowerCase() === "one-to-one") {
    associationCode += `${capitalize(modelName)}.hasOne(${capitalize(relatedModelName)});
\n`;
  }
  return associationCode;
}

function generateInverseAssociationCode(modelName, relatedModelName, type) {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  let inverseAssociationCode = `// Define inverse association with ${capitalize(modelName)}\n\n  const ${capitalize(modelName)} = require('./${modelName.toLowerCase()}');
\n\n  `;
  if (type.toLowerCase() === "one-to-many") {
    inverseAssociationCode += `${capitalize(relatedModelName)}.belongsTo(${capitalize(modelName)});
\n`;
  } else if (type.toLowerCase() === "many-to-one") {
    inverseAssociationCode += `${capitalize(relatedModelName)}.hasMany(${capitalize(modelName)});
\n`;
  } else if (type.toLowerCase() === "many-to-many") {
    inverseAssociationCode += `${capitalize(relatedModelName)}.belongsToMany(${capitalize(modelName)});
\n`;
  } else if (type.toLowerCase() === "one-to-one") {
    inverseAssociationCode += `${capitalize(relatedModelName)}.hasOne(${capitalize(modelName)});
\n`;
  }
  return inverseAssociationCode;
}

function appendToFile(fileName, content) {
  append(`models/${fileName}`, content);
}

function authMiddleware(roles) {
  if (state.authentication && roles.length) {
    return `userAuth, checkRole(${JSON.stringify(roles)}), `;
  } else if (state.authentication) {
    return "userAuth, ";
  }
  return "";
}

function generateRoutes(serviceName, roles) {
  write(`routes/${serviceName}.js`, template.routesContent(serviceName));
  const importContent = `const ${serviceName}Routes = require("./routes/${serviceName}");
`;
  const routeContent = `app.use("/api/${serviceName}",${authMiddleware(roles)}${serviceName}Routes);
`;
  let mainFileContent = read("app.js");
  let lines = mainFileContent.split("\n");
  const importRoutesIndex = lines.findIndex((line) =>
    line.includes("// Import routes")
  );
  if (
    importRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(importContent))
  ) {
    lines.splice(importRoutesIndex + 1, 0, importContent);
    write("app.js", lines.join("\n"));
  }
  mainFileContent = read("app.js");
  lines = mainFileContent.split("\n");
  const useRoutesIndex = lines.findIndex((line) => line.includes("// Routes"));
  if (
    useRoutesIndex !== -1 &&
    !lines.some((line) => line.includes(routeContent))
  ) {
    lines.splice(useRoutesIndex + 1, 0, routeContent);
    write("app.js", lines.join("\n"));
  }
}

function updateState(data) {
  console.log("Updating project state");
  let config = read("config.json");
  config = JSON.parse(config);
  config.models.push(data);
  console.log(config);
  write("config.json", JSON.stringify(config));
  return config;
}

async function generateScaffold(
  serviceName,
  model,
  relations = [],
  roles = []
) {
  try {
    const db = state.db;
    const orm = state.orm;
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
    generateRoutes(serviceName, roles);
    console.log("Generated routes and controllers for ",serviceName);
  } catch (error) {
    console.error("Error generating scaffold:", error);
  }
}

async function scaffold(input) {
  try {
    await loadState(input);
    // const schemaData = await promptSchemaModel(input);
    const schemaData = {
      country: [
        {
          name: "id",
          type: "INTEGER",
          defaultValue: "",
          primaryKey: true,
          autoIncrement: true,
          foreignKey: false,
          add_another: true,
        },
        {
          name: "name",
          type: "STRING",
          size: "",
          defaultValue: "",
          primaryKey: false,
          allowNulls: false,
          unique: false,
          autoIncrement: false,
          foreignKey: false,
          add_another: false,
        },
      ],
      employee: [
        {
          name: "id",
          type: "INTEGER",
          defaultValue: "",
          primaryKey: true,
          autoIncrement: true,
          foreignKey: false,
          add_another: true,
        },
        {
          name: "name",
          type: "TEXT",
          primaryKey: false,
          allowNulls: false,
          unique: false,
          autoIncrement: false,
          foreignKey: false,
          add_another: true,
        },
        {
          name: "country_id",
          type: "INTEGER",
          defaultValue: "",
          primaryKey: false,
          allowNulls: false,
          unique: false,
          autoIncrement: false,
          // foreignKey: false,
          // refTable: "country",
          // refField: "id",
          // relationshipType: "Many-to-One",
          add_another: true,
        },
        {
          name: "start_date",
          type: "DATE",
          defaultValue: "",
          primaryKey: false,
          allowNulls: true,
          unique: false,
          autoIncrement: false,
          foreignKey: false,
          add_another: false,
        },
      ],
    };
    if (Object.keys(schemaData).length) {
      for (const [key, value] of Object.entries(schemaData)) {
        await generateScaffold(key, value);
      }
    }
    // let relations = isArrayNotEmpty(relations) ? relations : [];
    const { name, description, db, orm, authentication, roles } = input;
    const config = {
      name,
      description,
      db,
      orm,
      authentication,
      roles,
      schemaData,
    };
    write("config.json", await format(JSON.stringify(config), "json"));
  } catch (err) {
    console.error(err);
    console.error("something went wrong");
  }
}

export { scaffold, promptSchemaModel };
