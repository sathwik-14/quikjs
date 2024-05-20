import { capitalize } from '../../utils/index.js';

const convertType = (type) => {
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

const getProperties = (model) => {
  let fields = model
    .map(
      (item) =>
        ` *              ${item.name}:
 *                type: ${convertType(item.type)}`,
    )
    .join('\n');
  return ` *            properties:
${fields}`;
};

export default {
  main: (config) =>
    `const swaggerJsdoc = require('swagger-jsdoc')
    const swaggerUi = require('swagger-ui-express')

    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: '${config.name} API',
          description: "API endpoints for a ${config.name} services documented on swagger",
          contact: {
            name: "Desmond Obisi",
            email: "info@miniblog.com",
            url: "https://github.com/DesmondSanctity/node-js-swagger"
          },
          version: '1.0.0',
        },
        servers: [
          {
            url: "http://localhost:3000/",
            description: "Local server"
          },
        //   {
        //     url: "<your live url here>",
        //     description: "Live server"
        //   },
        ]
      },
      // looks for configuration in specified directories
      apis: ['./routes/*.js'],
    }
    const swaggerSpec = swaggerJsdoc(options)
    function swaggerDocs(app, port) {
      // Swagger Page
      app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
      // Documentation in JSON format
      app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
      })
    }
    module.exports = swaggerDocs   
    `,
  paths: {
    getAll: (modelName) =>
      `/**
 * @openapi
 * '/api/${modelName}':
 *  get:
 *     tags:
 *     - ${capitalize(modelName)}
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
 */`,
    getByid: (modelName) =>
      `/**
        * @openapi
        * '/api/${modelName}/{id}':
        *  get:
        *     tags:
        *     - ${capitalize(modelName)}
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
        */`,
    post: (modelName, model) =>
      `/**
 * @openapi
 * '/api/${modelName}':
 *  post:
 *     tags:
 *     - ${capitalize(modelName)}
 *     summary: Create new ${modelName} entry
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
${getProperties(model)}
 *     responses:
 *      201:
 *        description: Created Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */`,
    patch: (modelName, model) =>
      `/**
 * @openapi
 * '/api/${modelName}/{id}':
 *  patch:
 *     tags:
 *     - ${capitalize(modelName)}
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
${getProperties(model)}
 *     responses:
 *      201:
 *        description: Modified Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */`,
    delete: (modelName) =>
      `/**
 * @openapi
 * '/api/${modelName}/{id}':
 *  delete:
 *     tags:
 *     - ${capitalize(modelName)}
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
 */`,
  },
};
