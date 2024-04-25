import capitalize from "../../utils/capitalize.js";
import format from "../../utils/format.js";
import { createDirectory, exists, write } from "../../utils/fs.js";

async function updateIndex(
  modelsDirectory,
  serviceName,
  capitalizedServiceName
) {
  const indexFilePath = `${modelsDirectory}/index.js`;
  let indexContent = "";
  if (exists(indexFilePath)) {
    indexContent = read(indexFilePath);
  }
  const newContent = `\n    const ${capitalizedServiceName} = require('./${serviceName.toLowerCase()}');
  \n    module.exports.${capitalizedServiceName} = ${capitalizedServiceName};
  \n  `;
  if (!indexContent.includes(await format(newContent))) {
    append(indexFilePath, await format(newContent));
    console.log(`${serviceName} model appended to the models/index file.`);
  } else {
    console.log(
      `Index file already contains the ${serviceName} model. No changes made.`
    );
  }
}

export async function generateModel(serviceName, model) {
  const modelsDirectory = "./models";
  const capitalizedServiceName = capitalize(serviceName);
  if (!model.length) return;
  const customFields = model
    .map((field) => {
      let fieldDefinition = `  ${field.name}: { type: DataTypes.${field.type}`;
      if (field.defaultValue !== null && field.defaultValue != "") {
        fieldDefinition += `, defaultValue: ${field.defaultValue}`;
      }
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
  const modelContent = `\n    // Sequelize schema for ${serviceName}\n    const { sequelize } = require("../config/db");
\n    const { DataTypes } = require("sequelize");
\n\n    const ${capitalizedServiceName} = sequelize.define('${serviceName.toLowerCase()}', {\n      ${customFields}\n    });
\n\n    ${capitalizedServiceName}.sync()\n      .then(() => console.log('${serviceName} model synced successfully'))\n      .catch(err => console.log('${serviceName} model sync failed'));
\n\n    module.exports = ${capitalizedServiceName};
\n  `;
  if (!exists(modelsDirectory)) {
    createDirectory(modelsDirectory);
  }
  write(
    `${modelsDirectory}/${serviceName.toLowerCase()}.js`,
    await format(modelContent)
  );
  await updateIndex(modelsDirectory, serviceName, capitalizedServiceName);
}