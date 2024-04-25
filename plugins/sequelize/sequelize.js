import format from "../../utils/format.js";
import { write } from "../../utils/fs.js";
import template from "../../templates/content.js";
import { generateModel } from "./model.js";

async function clientInit() {
  write("config/db.js", await format(template.sequelizeInitContent));
}

function type(input) {
  switch (input.toLowerCase()) {
    case "string":
      return "STRING";
    case "integer":
      return "INTEGER";
    case "float":
      return "FLOAT";
    case "boolean":
      return "BOOLEAN";
    case "date":
      return "DATE";
    case "uuid":
      return "UUID";
    case "text":
      return "TEXT";
    case "json":
      return "JSON";
    case "enum":
      return "ENUM";
    case "array":
      return "ARRAY";
    case "binary":
      return "BLOB";
    case "decimal":
      return "DECIMAL";
    default:
      return "Unknown";
  }
}

async function setup(db) {
  installSync("sequelize", "sequelize-cli");
  await clientInit()
}

export default {
  setup,
  type,
  clientInit,
  model: generateModel
};
