export function prismaDataType(input) {
  switch (input.toLowerCase()) {
    case "string":
      return "String";
    case "integer":
      return "Int";
    case "float":
      return "Float";
    case "boolean":
      return "Boolean";
    case "date":
      return "DateTime";
    case "uuid":
      return "String";
    case "text":
      return "String";
    case "json":
      return "Json";
    case "enum":
      return "Enum";
    case "array":
      return "String[]";
    case "binary":
      return "Bytes";
    case "decimal":
      return "Decimal";
    default:
      return "Unknown";
  }
}

export function sequelizeDataType(input) {
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

export function typeORMDataType(input) {
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
      return "Enum";
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

export function mongooseDataType(input) {
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
