import { appTemplate } from "../templates/app.js";
import format from "../utils/format.js";
import { read, write } from "../utils/fs.js";
import { exec, spawnSync } from "child_process";

function init(db) {
  return new Promise((resolve, reject) => {
    exec("npx prisma init", async (err, stdout, stderr) => {
      if (err) {
        console.log("error setting up prisma");
        reject(err);
      } else {
        let prismaModelContent = read("prisma/schema.prisma");
        if (db == "mongoDB") {
          prismaModelContent = prismaModelContent.replace(
            "postgresql",
            "mongodb"
          );
          prismaModelContent = prismaModelContent.replace(
            'provider = "prisma-client-js"',
            'provider = "prisma-client-js"\n\tpreviewFeatures = ["mongodb"]'
          );
        }
        write("prisma/schema.prisma", prismaModelContent);
        console.log("Prisma initialization completed successfully");
      }
      resolve();
    });
  });
}

async function clientInit() {
  write("config/db.js", await format(appTemplate.prismaInitContent));
}

function type(input) {
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

function migrateAndGenerate() {
    return new Promise((resolve, reject) => {
      try {
        const migrateDevProcess = spawnSync("npx", ["prisma", "migrate", "dev"], {
          input: "\n",
          encoding,
          stdio: "inherit",
        });
        if (migrateDevProcess.error) {
          console.log("Prisma migrate dev failed");
        } else {
          console.log("Prisma migrate dev completed");
        }
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

export default {
  init,
  clientInit,
  type,
  migrateAndGenerate
};
