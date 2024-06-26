import { prisma, sequelize, mongoose, typeorm } from './plugins/index.js';

const orms = {
  prisma: {
    id: 1,
    name: 'prisma',
    types: [
      'String',
      'Int',
      'Float',
      'Boolean',
      'DateTime',
      'Json',
      'Decimal',
      'BigInt',
      'Bytes',
      'Enum',
    ],
    getType: (input) => prisma.type(input),
  },
  id: 2,
  sequelize: {
    name: 'sequelize',
    types: [
      'STRING',
      'CHAR',
      'TEXT',
      'INTEGER',
      'BIGINT',
      'FLOAT',
      'DOUBLE',
      'REAL',
      'BOOLEAN',
      'DATE',
      'DATEONLY',
      'TIME',
      'UUID',
      'UUIDV1',
      'UUIDV4',
      'NOW',
      'ENUM',
      'ARRAY',
      'JSON',
      'JSONB',
      'BLOB',
      'DECIMAL',
      'DECIMAL(10, 2)',
    ],
    getType: (input) => sequelize.type(input),
  },
  mongoose: {
    id: 3,
    name: 'mongoose',
    types: [
      'String',
      'Number',
      'Date',
      'Buffer',
      'Boolean',
      'Mixed',
      'ObjectId',
      'Array',
      'Decimal128',
      'Map',
      'Schema.Types.ObjectId',
      'Schema.Types.Mixed',
      'Schema.Types.Buffer',
      'Schema.Types.Decimal128',
      'Schema.Types.Map',
    ],
    getType: (input) => mongoose.type(input),
  },
  typeORM: {
    id: 4,
    name: 'typeORM',
    types: [
      'String',
      'Number',
      'Boolean',
      'Date',
      'Buffer',
      'ObjectID',
      'ObjectId',
      'Object',
      'Array',
      'Enum',
      'Json',
      'Number[]',
      'String[]',
      'Boolean[]',
      'Date[]',
      'Buffer[]',
      'ObjectID[]',
      'ObjectId[]',
      'Object[]',
      'Enum[]',
      'Json[]',
    ],
    getType: (input) => typeorm.type(input),
  },
};

const genericTypes = [
  'string',
  'integer',
  'float',
  'boolean',
  'date',
  'uuid',
  'json',
  'enum',
  'array',
  'binary',
  'decimal',
];

const tools = [
  { name: 'none' },
  { name: 's3' },
  { name: 'sns' },
  { name: 'twilio' },
  { name: 'msg91' },
  { name: 'sendgrid' },
];

export { orms, genericTypes, tools };
