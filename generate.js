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

let state;

const projectRoot = path.resolve(
  new URL("../../../", import.meta.url).pathname
);

(() => {
  const config = fs.readFileSync(path.join(projectRoot, "config.json"));
  if (config != "") {
    state = JSON.parse(config);
  }
})();

// Capitalize string function
function capitalize(str) {
  if (str) return str.charAt(0).toUpperCase() + str.slice(1);
}

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

async function promptModelForm() {
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
  if (Object.hasOwn(state, "orm")) {
    types = types.map((type) => orms[state.orm].getType(type));
  }
  const formData = await inquirer.prompt([
    {
      type: "input",
      name: "model_name",
      message: "Enter model name:",
      validate: (value) => (value ? true : "Model name is required"),
    },
    {
      type: "input",
      name: "model_desc",
      message: "Enter model description:",
    },
    {
      type: "confirm",
      name: "add_field",
      message: "Do you want to add a field?",
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

function transformFields(fields) {
  const transformedFields = {};

  fields.forEach((field) => {
    transformedFields[field.field_name] = field.field_type;
  });

  return transformedFields;
}

function generatePrismaModel(serviceName, model, db) {
  // Read existing schema.prisma file
  const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
  let prismaModelContent = fs.readFileSync(schemaPath, "utf-8");

  // Append model content
  const modelContent = `
// Prisma schema for ${serviceName}
model ${capitalize(serviceName)} {
  id   String @id @default(dbgenerated()) @map("_id") ${
    db == "mongoDB" ? "@db.ObjectId" : ""
  }
  created_at DateTime @default(now())
  updated_at DateTime @default(now())
${Object.entries(model)
  .map(([fieldName, fieldType]) => `  ${fieldName} ${fieldType}`)
  .join("\n")}
}
`;
  if (!prismaModelContent.includes(modelContent.trim())) {
    fs.writeFileSync(schemaPath, prismaModelContent + modelContent);
  } else {
    return;
  }
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
        throw migrateDevProcess.error;
      }

      console.log("Prisma migrate dev completed.");

      // Execute 'npx prisma generate' synchronously
      const generateProcess = spawnSync("npx", ["prisma", "generate"], {
        stdio: "inherit",
      });

      if (generateProcess.error) {
        throw generateProcess.error;
      }

      console.log("Prisma generate completed.");

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
    generatePrismaModel(serviceName, model, db);
    console.log("end orm model setup");
    console.log("start migration");
    await migrateAndGeneratePrisma();
    console.log("done migration");
    console.log("done prisma model setup");
  } catch (error) {
    console.error("Error setting up Prisma:", error);
    throw error;
  }
}

// controllers for prisma
function controllersPrisma(serviceName) {
  const controllerContent = `const prisma = require('../config/db');

  
  ${template.createFunctionContent(serviceName)}
  ${template.getAllFunctionContent(serviceName)}
  ${template.getByIdFunctionContent(serviceName)}
  ${template.updateFunctionContent(serviceName)}
  ${template.deleteFunctionContent(serviceName)}
  
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

// Main function to generate scaffold
async function generateScaffold(serviceName, model, relations) {
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
    generateRoutes(serviceName);
    console.log("done generating routes and controllers");
  } catch (error) {
    console.error("Error generating scaffold:", error);
  }
}

// Generate routes
function generateRoutes(serviceName) {
  const mainFilePath = path.join(projectRoot, "app.js");
  fs.writeFileSync(
    path.join(projectRoot, "routes", `${serviceName}.js`),
    template.routesContent(serviceName)
  );
  // Append the line to use routes in main file
  const importContent = `const ${serviceName}Routes = require("./routes/${serviceName}");`;
  const routeContent = `app.use("/api/${serviceName}", ${serviceName}Routes);`;
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

async function main() {
  const formData = await promptModelForm();
  console.log("Form Data:", formData);
  try {
    const { model_name, model_desc, fields, relations } = formData;
    const name = model_name;

    const model = transformFields(fields);
    console.log(model);
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
      await generateScaffold(name, model, relations);
      updateState({ name, model, relations });
      console.log(
        `API GENERATED/MODIFIED FOR SERVICE '${name}' FOR PROJECT '${state.projectName}' USING DATABASE '${req.body.db}'`
      );
    }
  } catch (err) {
    console.log("something went wrong");
  }
}

main();
