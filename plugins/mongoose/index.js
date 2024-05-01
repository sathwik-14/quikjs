import templates from "../../templates/content.js";
import format from "../../utils/format.js";

function type(input) {
  switch (input.toLowerCase()) {
    case "string":
      return "String";
    case "integer":
      return "Number";
    case "float":
      return "Number";
    case "boolean":
      return "Boolean";
    case "date":
      return "Date";
    case "uuid":
      return "String";
    case "text":
      return "String";
    case "json":
      return "Object";
    case "enum":
      return "String";
    case "array":
      return "Array";
    case "binary":
      return "Buffer";
    case "decimal":
      return "Number";
    default:
      return "Unknown";
  }
}

async function clientInit() {
    write("config/db.js", await format(templates.mongooseInit));
  }

async function setup(db) {
  installSync("mongoose");
  await clientInit();
}

export default {
  setup,
  type,
  clientInit
};
