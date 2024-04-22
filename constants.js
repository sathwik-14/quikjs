import prisma from "./plugins/prisma.js";
import sequelize from "./plugins/sequelize.js";
import mongoose from "./plugins/mongoose.js";
import typeorm from "./plugins/typeorm.js";

export const orms = {
  prisma: { id: 1, name: "prisma", getType: (input) => prisma.type(input) },
  id: 2,
  sequelize: {
    name: "sequalize",
    getType: (input) => sequelize.type(input),
  },
  mongoose: {
    id: 3,
    name: "mongoose",
    getType: (input) => mongoose.type(input),
  },
  typeORM: {
    id: 4,
    name: "typeORM",
    getType: (input) => typeorm.type(input),
  },
};

export const types = [
  "string",
  "integer",
  "float",
  "boolean",
  "date",
  "uuid",
  "json",
  "enum",
  "array",
  "binary",
  "decimal",
];

export const tools = [
  { name: "none" },
  { name: "s3" },
  { name: "sns" },
  { name: "twilio" },
  { name: "msg91" },
  { name: "sendgrid" },
];
