import { capitalize } from '../../utils/index.js';

const mapTypeToSwagger = (type) => {
  switch (type.toLowerCase()) {
    case 'string':
    case 'text':
    case 'varchar':
    case 'char':
      return 'string';
    case 'number':
    case 'float':
    case 'decimal':
    case 'double':
      return 'number';
    case 'integer':
    case 'int':
    case 'int32':
    case 'int64':
      return 'integer';
    case 'boolean':
    case 'bool':
      return 'boolean';
    case 'json':
    case 'jsonb':
    case 'object':
      return 'object';
    default:
      return 'string';
  }
};

const generateSchemaProperties = (modelFields) => {
  const fields = modelFields
    .map(
      (field) =>
        ` *              ${field.name}:
 *                type: ${mapTypeToSwagger(field.type)}`,
    )
    .join('\n');
  
  return ` *            properties:
${fields}`;
};

export default {
  main: (config) =>
    `const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '${config.name} API',
      description: 'API endpoints for ${config.name} services documented on Swagger',
      contact: {
        name: 'Desmond Obisi',
        email: 'info@miniblog.com',
        url: 'https://github.com/DesmondSanctity/node-js-swagger'
      },
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000/',
        description: 'Local server'
      },
      // {
      //   url: '<your live url here>',
      //   description: 'Live server'
      // },
    ]
  },
  // Looks for configuration in specified directories
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Documentation in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = swaggerDocs;`,

  paths: {
    getAll: (modelName) => {
      const ModelName = capitalize(modelName);
      
      return `/**
 * @openapi
 * '/api/${modelName}':
 *  get:
 *     tags:
 *     - ${ModelName}
 *     summary: Get all ${modelName}
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */`;
    },

    getById: (modelName) => {
      const ModelName = capitalize(modelName);
      
      return `/**
 * @openapi
 * '/api/${modelName}/{id}':
 *  get:
 *     tags:
 *     - ${ModelName}
 *     summary: Get ${modelName} by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the ${modelName}
 *        required: true
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */`;
    },

    post: (modelName, modelFields) => {
      const ModelName = capitalize(modelName);
      
      return `/**
 * @openapi
 * '/api/${modelName}':
 *  post:
 *     tags:
 *     - ${ModelName}
 *     summary: Create new ${modelName} entry
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
${generateSchemaProperties(modelFields)}
 *     responses:
 *      201:
 *        description: Created Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */`;
    },

    patch: (modelName, modelFields) => {
      const ModelName = capitalize(modelName);
      
      return `/**
 * @openapi
 * '/api/${modelName}/{id}':
 *  patch:
 *     tags:
 *     - ${ModelName}
 *     summary: Modify existing ${modelName} entry
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the ${modelName}
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
${generateSchemaProperties(modelFields)}
 *     responses:
 *      200:
 *        description: Modified Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */`;
    },

    delete: (modelName) => {
      const ModelName = capitalize(modelName);
      
      return `/**
 * @openapi
 * '/api/${modelName}/{id}':
 *  delete:
 *     tags:
 *     - ${ModelName}
 *     summary: Delete a ${modelName} entry
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the ${modelName}
 *        required: true
 *     responses:
 *      200:
 *        description: Deleted Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */`;
    },
  },
};