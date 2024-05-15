import { capitalize } from '../../utils/index.js';

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
     **/`,
    getByid: (modelName) =>
      `/**
        * '/api/${modelName}/{id}':
        *  get:
        *     tags:
        *     - ${capitalize(modelName)}
        *     summary: Get all ${modelName}
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
        **/`,
  },
};
