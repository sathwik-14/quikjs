import capitalize from '../../utils/capitalize.js';
import Handlebars from 'handlebars';

Handlebars.registerHelper('equals', function (variable, string, options) {
  if (variable === string) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('notequals', function (variable, string, options) {
  if (variable != string) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

export default {
  createSequelizeContent: (modelName) => `
    async function create${capitalize(modelName)}(req, res) {
      try {
        const new${capitalize(modelName)} = await db.${capitalize(
          modelName,
        )}.create(req.body);
        res.status(201).json(new${capitalize(modelName)});
      } catch (error) {
        console.error(error.errors[0]);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,
  getAllSequelizeContent: (modelName) => `
    async function getAll${capitalize(modelName)}(req, res) {
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
    
        const ${modelName}List = await db.${capitalize(
          modelName,
        )}.findAll(options);
    
        // Respond with the retrieved data
        res.status(200).json(${modelName}List);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,
  getByIdSequelizeContent: (modelName) => `
    async function get${capitalize(modelName)}ById(req, res) {
      try {
        const { id } = req.params;
        const ${modelName} = await db.${capitalize(modelName)}.findByPk(id);
        if (!${modelName}) {
          return res.status(404).json({ error: '${capitalize(
            modelName,
          )} not found' });
        }
        res.status(200).json(${modelName});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,
  updateSequelizeContent: (modelName) => `
    async function update${capitalize(modelName)}ById(req, res) {
      try {
        const { id } = req.params;
        const [updatedCount] = await db.${capitalize(
          modelName,
        )}.update(req.body, { where: { id } });
        if (updatedCount === 0) {
          return res.status(404).json({ error: '${capitalize(
            modelName,
          )} not found' });
        }
        res.status(200).json({ message: '${capitalize(
          modelName,
        )} updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }`,
  deleteSequelizeContent: (modelName) => `
    async function delete${capitalize(modelName)}ById(req, res) {
      try {
        const { id } = req.params;
        const deletedCount = await db.${capitalize(
          modelName,
        )}.destroy({ where: { id } });
        if (deletedCount === 0) {
          return res.status(404).json({ error: '${capitalize(
            modelName,
          )} not found' });
        }
        res.status(200).json({ message: '${capitalize(
          modelName,
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
    {{/notequals}}
    const sequelize = new Sequelize(
    {{#equals db "mysql"}}
  process.env.DATABASE_NAME, process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD, {
	host: process.env.DATABASE_HOST,
	dialect: 'mysql',
  logging:false
}
  {{else}}
    dbUri,{logging:false}
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
