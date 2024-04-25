import capitalize from "../../utils/capitalize.js";
import { read, write } from "../../utils/fs.js";
import prisma from "./prisma.js";

function convertOptions(options, db) {
  const directives = [];

  // Handle primaryKey with appropriate default based on database
  if (options.primaryKey) {
    if (db === "postgresql") {
      directives.push("@id @default(autoincrement())"); // Use autoincrement for PostgreSQL
    } else {
      directives.push(`@id @default(auto()) @map("_id") @db.ObjectId`); // Default behavior for other databases
    }
  }

  // Handle unique constraint
  if (options.unique) {
    directives.push("@unique");
  }

  // Handle foreign key constraint
  if (options.foreignKey) {
    directives.push(
      `@db.${db}.foreignKey({ references: { table: "${options.refTable}", field: "${options.refField}" }})`
    );
  }

  // Handle default value
  if (options.defaultValue) {
    directives.push(`@default("${options.defaultValue}")`);
  }

  return directives.join(" ");
}

export function generateModel(modelName, modelData, db) {
  let prismaModelContent = read("prisma/schema.prisma");

  const processedFields = modelData.map((field) => {
    const { name, type, defaultValue = "", ...otherOptions } = field;
    const convertedType = prisma.type(type, otherOptions,db);
    const prismaOptions = convertOptions(otherOptions, db);
    return `${name} ${convertedType}${otherOptions.allowNulls?'?':''} ${prismaOptions}`;
  });

  // Model definition with fields on separate lines
  const modelContent = `
model ${capitalize(modelName)} {
\t${processedFields.join("\n\t")}
}`;

  if (!prismaModelContent.includes(modelContent.trim())) {
    write("prisma/schema.prisma", prismaModelContent + modelContent);
  } else {
    return;
  }
}
