import templates from "../../templates/content.js";
import format from "../../utils/format.js";
import { write } from "../../utils/fs.js";
import { exec, spawnSync } from "child_process";
import { installSync } from "../../utils/install.js";
import { generateModel } from "./model.js";

function init(db) {
  return new Promise((resolve, reject) => {
    exec(
      `npx prisma init --datasource-provider ${db.toLowerCase()}`,
      async (err, stdout, stderr) => {
        if (err) {
          console.log("error setting up prisma");
          reject(err);
        } else {
          console.log("Prisma initialization completed successfully");
          resolve();
        }
      }
    );
  });
}

async function clientInit() {
  write("config/db.js", await format(templates.prismaInitContent));
}

function type(input, options, db) {
  switch (input.toLowerCase()) {
    case "string":
      return "String";
    case "integer":
      return options.primaryKey && db == "mongodb" ? "String" : "Int";
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

function generate() {
  return new Promise((resolve, reject) => {
    try {
      // const migrateDevProcess = spawnSync("npx", ["prisma", "migrate", "dev"], {
      //   input: "\n",
      //   encoding: "utf-8",
      //   stdio: "inherit",
      // });
      // if (migrateDevProcess.error) {
      //   console.log("Prisma migrate dev failed");
      // } else {
      //   console.log("Prisma migrate dev completed");
      // }
      const generateProcess = spawnSync("npx", ["prisma", "generate"], {
        stdio: "inherit",
      });
      if (generateProcess.error) {
        console.log("Prisma generate failed");
      } else {
        console.log("Prisma generate completed");
      }
      resolve();
    } catch (error) {
      console.error("Prisma migrate or generate failed:", error);
      reject(error);
    }
  });
}

async function setup(db) {
  installSync("prisma", "@prisma/client");
  await init(db);
  await clientInit();
}

export default {
  setup,
  init,
  clientInit,
  type,
  generate,
  model: generateModel,
};
