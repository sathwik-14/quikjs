import capitalize from "../../utils/capitalize.js";
import Handlebars from "handlebars";

Handlebars.registerHelper('equals', function(variable, string, options) {
  if (variable === string) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }
});

Handlebars.registerHelper('notequals', function(variable, string, options) {
  if (variable !== string) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }
});

export default {
  createSequelizeContent: (serviceName) => `
    async function create${capitalize(serviceName)}(req, res) {
      try {
        const new${capitalize(serviceName)} = await db.${capitalize(
          serviceName
        )}.create(req.body);
        res.status(201).json(new${capitalize(serviceName)});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,
  getAllSequelizeContent: (serviceName) => `
    async function getAll${capitalize(serviceName)}(req, res) {
      try {
        let { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
        page = parseInt(page);
        limit = parseInt(limit);
    
        if (isNaN(page) || page < 1) {
          page = 1;
        }
        if (isNaN(limit) || limit < 1 || limit > 100) {
          limit = 10;
        }
    
        const options = {
          offset: (page - 1) * limit,  // Offset for pagination
          limit: limit,  // Limit the number of results per page
          order: sortBy ? [[sortBy, sortOrder || 'ASC']] : [] // Sorting order
        };
    
        const ${serviceName}List = await db.${capitalize(
          serviceName
        )}.findAll(options);
    
        // Respond with the retrieved data
        res.status(200).json(${serviceName}List);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,
  getByIdSequelizeContent: (serviceName) => `
    async function get${capitalize(serviceName)}ById(req, res) {
      try {
        const { id } = req.params;
        const ${serviceName} = await db.${capitalize(serviceName)}.findByPk(id);
        if (!${serviceName}) {
          return res.status(404).json({ error: '${capitalize(
            serviceName
          )} not found' });
        }
        res.status(200).json(${serviceName});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,
  updateSequelizeContent: (serviceName) => `
    async function update${capitalize(serviceName)}ById(req, res) {
      try {
        const { id } = req.params;
        const [updatedCount] = await db.${capitalize(
          serviceName
        )}.update(req.body, { where: { id } });
        if (updatedCount === 0) {
          return res.status(404).json({ error: '${capitalize(
            serviceName
          )} not found' });
        }
        res.status(200).json({ message: '${capitalize(
          serviceName
        )} updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }`,
  deleteSequelizeContent: (serviceName) => `
    async function delete${capitalize(serviceName)}ById(req, res) {
      try {
        const { id } = req.params;
        const deletedCount = await db.${capitalize(
          serviceName
        )}.destroy({ where: { id } });
        if (deletedCount === 0) {
          return res.status(404).json({ error: '${capitalize(
            serviceName
          )} not found' });
        }
        res.status(200).json({ message: '${capitalize(
          serviceName
        )} deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }`,
  sequelizeInitContent: `
    const { Sequelize } = require("sequelize");
    require("dotenv").config();
    {{#notequals db "mysql"}}
    const dbUri = process.env['DATABASE_URL']; 
    {{/equals}}
    const sequelize = new Sequelize(
    {{#equals db "mysql"}}
  process.env.DATABASE_NAME, process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD, {
	host: process.env.DATABASE_HOST,
	dialect: 'mysql'}
  {{else}}
    dbUri
    {{/equals}}
    );
    
    const testDbConnection = async () => {
      try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
      } catch (error) {
        console.error("Unable to connect to the database:", error);
      }
    };
    testDbConnection();
    module.exports = {sequelize};
    `,
};
