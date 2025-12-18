import { prisma, sequelize, mongoose, typeorm } from './plugins/index.js';

// const drivers = {
//   postgresql: 'pg',
//   mysql: 'mysql2',
//   mariadb: 'mariadb',
//   sqlite: 'sqlite3',
//   mssql: 'tedious',
//   oracledb: 'oracledb',
// };

const packages = [
  'express',
  'cors',
  'dotenv',
  'helmet',
  'winston',
  'compression',
  'joi',
];

const databases = new Map([
  ['postgresql', { supportedORM: ['sequelize'], driver: 'pg' }],
  ['mongodb', { supportedORM: ['mongoose'], driver: 'mongoose' }],
  // ['mysql', { supportedORM: ['sequelize', driver: 'mysql2' ]}],
  // '['mariadb', , { supportedORM: ['sequelize', driver: 'mariadb' ]}]'
]);

const folders = [
  'controllers',
  'models',
  'routes',
  'middlewares',
  'utils',
  'config',
  'validation',
  'validation/schemas',
];

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
    setup: prisma.setup,
    getType: (input) => prisma.type(input),
    allowSizeInput: () => false,
  },
  sequelize: {
    id: 2,
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
    setup: sequelize.setup,
    allowSizeInput: (type) =>
      [
        'STRING',
        'CHAR',
        'INTEGER',
        'FLOAT',
        'BIGINT',
        'DOUBLE',
        'REAL',
        'DECIMAL',
        'DECIMAL(10, 2)',
      ].includes(type),
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
    setup: mongoose.setup,
    getType: (input) => mongoose.type(input),
    allowSizeInput: () => false,
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
    allowSizeInput: () => false,
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

const tools = {
  // { name: 'none' },
  s3: {
    name: 's3',
    env: `AWS_SECRET_ACCESS_KEY=< secret access key >\nAWS_ACCESS_KEY=< aws access key id >\nS3_BUCKET_NAME=< aws s3 bucket name >`,
  },
  sns: {
    name: 'sns',
    env: `AWS_SECRET_ACCESS_KEY=< secret access key >\nAWS_ACCESS_KEY=< aws access key id >`,
  },
  twilio: {
    name: 'twilio',
    env: `TWILIO_ACCOUNT_SID=< twilio account sid >\nTWILIO_AUTH_TOKEN=< twiliio auth token >`,
  },
  msg91: { name: 'msg91', env: `MSG_AUTH_KEY=< msg auth key >` },
  sendgrid: { name: 'sendgrid', env: `SENDGRID_API_KEY=< sendgrid api key >` },
};

export { packages, folders, orms, genericTypes, tools, databases };
