import capitalize from "./utils/capitalize.js";
import fs from "fs";
import path from "path";
import format from "./utils/format.js";
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
async function generateSequelizeModel(serviceName, model) {
  const modelsDirectory = "./models";
  const capitalizedServiceName = capitalize(serviceName);

  // Convert model fields to Sequelize format
  const customFields = model
    .map(field => {
      let fieldDefinition = `  ${field.name}: { type: DataTypes.${field.type}`;

      // Set default value if field.defaultValue is not null
      if (field.defaultValue !== null && field.defaultValue != '') {
        fieldDefinition += `, defaultValue: ${field.defaultValue}`;
      }

      // Handle foreign key and relationshipType
      if (field.foreignKey) {
        fieldDefinition += `, references: { model: '${field.refTable}', key: '${field.refField}' }`;
      }

      if (field.foreignKey && field.relationshipType) {
        fieldDefinition += `, as: '${field.refTable}', onDelete: 'CASCADE'`;
      }

      fieldDefinition += " }";
      return fieldDefinition;
    })
    .join(",\n");

  // Sequelize model content
  const modelContent = `
    // Sequelize schema for ${serviceName}
    const { sequelize } = require("../config/db");
    const { DataTypes } = require("sequelize");

    const ${capitalizedServiceName} = sequelize.define('${serviceName.toLowerCase()}', {
      ${customFields}
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

  console.log(modelContent);

  // Generate and write model content to the file
  const filePath = `${modelsDirectory}/${serviceName.toLowerCase()}.js`;
  fs.writeFileSync(filePath, await format(modelContent),'babel');

  updateIndex(modelsDirectory, serviceName, capitalizedServiceName);
}


async function updateIndex(modelsDirectory, serviceName, capitalizedServiceName) {
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
  if (!indexContent.includes(await format(newContent,'babel'))) {
    fs.appendFileSync(indexFilePath, await format(newContent,'babel'));
    console.log("New model appended to the models/index file.");
  } else {
    console.log("Index file already contains the new model. No changes made.");
  }
}



export default {
  generatePrismaModel,
  generateSequelizeModel,
};
