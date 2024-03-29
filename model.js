
import capitalize from "./utils/capitalize";
import fs from "fs";
import path from "path";
// Get the current working directory
const projectRoot = process.cwd();

// Function to generate prisma model
function generatePrismaModel(serviceName, model, db) {
  // Read existing schema.prisma file
  const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
  let prismaModelContent = fs.readFileSync(schemaPath, "utf-8");

  // Append model content
  const modelContent = `
  // Prisma schema for ${serviceName}
  model ${capitalize(serviceName)} {
    id   String @id @default(uuid()) @map("_id") ${
      db == "mongoDB" ? "@db.ObjectId" : ""
    }
    createdAt DateTime @default(now())
    updatedAt DateTime @default(now())
  ${Object.entries(model)
    .map(([fieldName, fieldType]) => `${fieldName} ${fieldType}`)
    .join("\n")}
  }
  `;
  if (!prismaModelContent.includes(modelContent.trim())) {
    fs.writeFileSync(schemaPath, prismaModelContent + modelContent);
  } else {
    return;
  }
}

// Generate sequelize model
function generateSequelizeModel(serviceName, model) {
  console.log("model----- ", serviceName, model);
  const modelsDirectory = "./models";

  const capitalizedServiceName = capitalize(serviceName);

  // Fixed fields for all Sequelize models
  const fixedFields = [
    "id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }",
  ];

  // Convert model fields to Sequelize format
  const customFields = Object.entries(model)
    .map(
      ([fieldName, fieldType]) =>
        `  ${fieldName}: { type: DataTypes.${fieldType.toUpperCase()} },`
    )
    .join("\n");

  // Combine fixed fields and custom fields
  const modelFields = [...fixedFields, customFields].join(",\n");

  // Sequelize model content
  const modelContent = `
      // Imports
  
      // Sequelize schema for ${serviceName}
      const { sequelize } = require("../config/db");
      const { DataTypes } = require("sequelize");
  
      const ${capitalizedServiceName} = sequelize.define('${serviceName.toLowerCase()}', {
        ${modelFields}
      });
  
      ${capitalizedServiceName}.sync()
        .then(() => console.log('${serviceName} model synced successfully'))
        .catch(err => console.log('${serviceName} model sync failed'));
  
      module.exports = ${capitalizedServiceName};
    `;

  // Ensure the models directory exists
  if (!fs.existsSync(modelsDirectory)) {
    fs.mkdirSync(modelsDirectory);
  }

  // Generate and write model content to the file
  const filePath = `${modelsDirectory}/${serviceName.toLowerCase()}.js`;
  fs.writeFileSync(filePath, modelContent);

  // Update index.js file to export all models
  const indexFilePath = `${modelsDirectory}/index.js`;
  let indexContent = "";

  // Read existing content of index.js file
  if (fs.existsSync(indexFilePath)) {
    indexContent = fs.readFileSync(indexFilePath, "utf-8");
  }

  // Append the new export statement
  const newContent = `
      const ${capitalizedServiceName} = require('./${serviceName.toLowerCase()}');
      module.exports.${capitalizedServiceName} = ${capitalizedServiceName};
    `;

  // Check if index file content already includes the new content
  if (!indexContent.includes(newContent)) {
    fs.appendFileSync(indexFilePath, newContent);
    console.log("New content appended to the index file.");
  } else {
    console.log(
      "Index file already contains the new content. No changes made."
    );
  }
}

export default {
  generatePrismaModel,
  generateSequelizeModel,
};
