import {
  createDirectory,
  exists,
  read,
  write,
  capitalize,
} from '../../utils/index.js';

const mapType = (type) => {
  switch (type.toLowerCase()) {
    case 'string':
      return 'String';
    case 'integer':
      return 'Number';
    case 'float':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'Date';
    case 'uuid':
      return 'String';
    case 'text':
      return 'String';
    case 'json':
      return 'Object'; // or mongoose.Schema.Types.Mixed
    case 'enum':
      return 'String';
    case 'array':
      return 'Array';
    case 'binary':
      return 'Buffer';
    case 'decimal':
      return 'Number';
    default:
      return 'String';
  }
};

const getExportedNames = (content) => {
  try {
    const exportRegex = /module\.exports\s*=\s*{([^}]*)}/;
    const match = content.match(exportRegex);
    if (match && match[1]) {
      const namesString = match[1].trim();
      return namesString
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name !== '')
        .join(',');
    }
    return [].join(',');
  } catch {
    return [].join(',');
  }
};

const updateIndex = async (
  modelsDirectory,
  modelName,
  capitalizedServiceName,
) => {
  const indexFilePath = `${modelsDirectory}/index.js`;
  let indexContent = `// imports

// exports
module.exports = {
}`;

  if (exists(indexFilePath)) {
    let tempContent = read(indexFilePath);
    if (tempContent.length) {
      indexContent = tempContent;
    }
  }

  const importLine = `const ${capitalizedServiceName} = require('./${modelName.toLowerCase()}');`;
  const exportLine = `${capitalizedServiceName},`;

  const importsCommentIndex = indexContent.indexOf('// imports');
  if (importsCommentIndex != -1 && !indexContent.includes(importLine)) {
    const nextLineIndex = indexContent.indexOf(
      '\n',
      importsCommentIndex + '// imports'.length,
    );
    const importLines = `\n${importLine}`;
    indexContent =
      indexContent.slice(0, nextLineIndex) +
      importLines +
      indexContent.slice(nextLineIndex);
  }

  const moduleExportsIndex = indexContent.indexOf('module.exports = {');
  const exports = getExportedNames(indexContent);

  if (
    moduleExportsIndex !== -1 &&
    !exports.includes(exportLine.replace(',', ''))
  ) {
    const nextLineIndex = indexContent.indexOf(
      '\n',
      moduleExportsIndex + 'module.exports = {'.length,
    );
    const exportLines = `\n${exportLine}`;
    indexContent =
      indexContent.slice(0, nextLineIndex) +
      exportLines +
      indexContent.slice(nextLineIndex);
  }

  await write(indexFilePath, indexContent, { force: true });
};

const generateModel = async (modelName, model) => {
  const modelsDirectory = 'models';
  const capitalizedServiceName = capitalize(modelName);
  if (!model.length) return;

  const schemaFields = model
    .map((field) => {
      let fieldDefinition = `  ${field.name}: { type: ${mapType(field.type)}`;

      if (field.primaryKey) {
        // Mongoose uses _id by default, but if they want a custom PK, it's tricky.
        // Usually validation or just unique index.
        // For now, let's ignore primaryKey as _id covers it, or treat as unique.
      }

      if (
        field.defaultValue !== null &&
        field.defaultValue !== undefined &&
        field.defaultValue !== ''
      ) {
        // handle strings needing quotes
        const defVal =
          mapType(field.type) === 'String' &&
          !field.defaultValue.startsWith("'")
            ? `'${field.defaultValue}'`
            : field.defaultValue;
        fieldDefinition += `, default: ${defVal}`;
      }

      if (!field.allowNulls && field.required !== false) {
        // Assuming !allowNulls means required
        fieldDefinition += `, required: true`;
      }

      if (field.unique) {
        fieldDefinition += `, unique: true`;
      }

      if (field.foreignKey) {
        // Override type to ObjectId for relations
        fieldDefinition = `  ${field.name}: { type: mongoose.Schema.Types.ObjectId, ref: '${capitalize(field.refTable)}'`;
        if (!field.allowNulls) fieldDefinition += `, required: true`;
      }

      fieldDefinition += ' }';
      return fieldDefinition;
    })
    .join(',\n');

  const modelContent = `const mongoose = require('mongoose');

const ${modelName.toLowerCase()}Schema = new mongoose.Schema({
${schemaFields}
}, { timestamps: true });

const ${capitalizedServiceName} = mongoose.model('${capitalize(modelName)}', ${modelName.toLowerCase()}Schema);

module.exports = ${capitalizedServiceName};
`;

  if (!exists(modelsDirectory)) {
    createDirectory(modelsDirectory);
  }
  await write(`${modelsDirectory}/${modelName.toLowerCase()}.js`, modelContent);
  await updateIndex(modelsDirectory, modelName, capitalizedServiceName);
};

export { generateModel };
