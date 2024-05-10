import { read, write, capitalize } from '../../utils/index.js';

const convertOptions = (options, db) => {
  const directives = [];

  // Handle primaryKey with appropriate default based on database
  if (options.primaryKey) {
    if (db === 'postgresql') {
      directives.push('@id @default(autoincrement())'); // Use autoincrement for PostgreSQL
    } else {
      directives.push(`@id @default(auto()) @map("_id") @db.ObjectId`); // Default behavior for other databases
    }
  }

  // Handle unique constraint
  if (options.unique) {
    directives.push('@unique');
  }

  // Handle foreign key constraint
  if (options.foreignKey && db == 'mongodb') {
    directives.push(`@db.ObjectId`);
  }

  // Handle default value
  if (options.defaultValue) {
    directives.push(`@default("${options.defaultValue}")`);
  }

  return directives.join(' ');
};

const getType = (input, options, db) => {
  switch (input.toLowerCase()) {
    case 'string':
      return 'String';
    case 'integer':
      return (options.primaryKey || options.foreignKey) && db == 'mongodb'
        ? 'String'
        : 'Int';
    case 'float':
      return 'Float';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'DateTime';
    case 'uuid':
      return 'String';
    case 'text':
      return 'String';
    case 'json':
      return 'Json';
    case 'enum':
      return 'Enum';
    case 'array':
      return 'String[]';
    case 'binary':
      return 'Bytes';
    case 'decimal':
      return 'Decimal';
    default:
      return 'Unknown';
  }
};

const generateModel = async (modelName, modelData, db) => {
  let prismaModelContent = read('prisma/schema.prisma');

  const processedFields = modelData.map((field) => {
    const { name, type, ...otherOptions } = field;
    const convertedType = getType(type, otherOptions, db);
    const prismaOptions = convertOptions(otherOptions, db);
    if (otherOptions.foreignKey) {
      return `${otherOptions.refTable} ${capitalize(otherOptions.refTable)}${otherOptions.relationshipType == 'One-to-Many' ? '[]' : ''}\n
      ${name} ${convertedType}${otherOptions.allowNulls ? '?' : ''} ${prismaOptions}`;
    }
    return `${name} ${convertedType}${otherOptions.allowNulls ? '?' : ''} ${prismaOptions}`;
  });

  // Model definition with fields on separate lines
  const modelContent = `
model ${capitalize(modelName)} {
\t${processedFields.join('\n\t')}
}`;

  if (!prismaModelContent.includes(modelContent.trim())) {
    await write('prisma/schema.prisma', prismaModelContent + modelContent);
  } else {
    return;
  }
};

export { getType, generateModel };
