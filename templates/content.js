function capitalize(str) {
  if (str) return str.charAt(0).toUpperCase() + str.slice(1);
}

let content = ''

export default content = {
  prismaInitContent: `
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  module.exports = prisma;
  `,
    routesContent: (serviceName) => `const express = require('express');
const router = express.Router();
const ${serviceName}Controller = require('../controllers/${serviceName}');

// GET all ${serviceName}
router.get('/', ${serviceName}Controller.getAll${capitalize(serviceName)});
// GET ${serviceName} by ID
router.get('/:id', ${serviceName}Controller.get${capitalize(serviceName)}ById);
// Create a new ${serviceName}
router.post('/', ${serviceName}Controller.create${capitalize(serviceName)});
// Update ${serviceName} by ID
router.put('/:id', ${serviceName}Controller.update${capitalize(
    serviceName
  )}ById);
// Delete ${serviceName} by ID
router.delete('/:id', ${serviceName}Controller.delete${capitalize(
    serviceName
  )}ById);

module.exports = router;`,
  createFunctionContent: (serviceName) => `
async function create${capitalize(serviceName)}(req, res) {
try {
    const new${capitalize(serviceName)} = await prisma.${serviceName}.create({
        data: req.body
    });
    res.status(201).json(new${capitalize(serviceName)});
} catch (error) {
    console.error(error);
    res.status(500).json({ error: error.meta.message });
}
}
  `,

  getAllFunctionContent: (serviceName) => `
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
              take: limit,  // Limit the number of results per page
              skip: (page - 1) * limit,  // Skip results for pagination
              orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : undefined, // Sort results
          };
  
          const ${serviceName.toLowerCase()} = await prisma.${serviceName}.findMany(options);
  
          res.json(${serviceName.toLowerCase()});
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: error.meta.message });
      }
  }
  `,
  getByIdFunctionContent: (serviceName) => `
async function get${capitalize(serviceName)}ById(req, res) {
try {
    const ${serviceName.toLowerCase()} = await prisma.${serviceName}.findFirst({
        where: {
            id: req.params.id
        }
    });
    if (!${serviceName.toLowerCase()}) {
        return res.status(404).json({ error: '${capitalize(
          serviceName
        )} not found' });
    }
    res.json(${serviceName.toLowerCase()});
} catch (error) {
    console.error(error);
    res.status(500).json({ error: error.meta.message });
}
}
  `,
  updateFunctionContent: (serviceName) => `
async function update${capitalize(serviceName)}ById(req, res) {
try {
    const updated${capitalize(
      serviceName
    )} = await prisma.${serviceName}.update({
        where: {
            id: req.params.id
        },
        data: req.body
    });
    if (!updated${capitalize(serviceName)}) {
        return res.status(404).json({ error: '${capitalize(
          serviceName
        )} not found' });
    }
    res.json(updated${capitalize(serviceName)});
} catch (error) {
    console.error(error);
    res.status(500).json({ error: error.meta.message });
}
}
  `,
  deleteFunctionContent: (serviceName) => `
async function delete${capitalize(serviceName)}ById(req, res) {
try {
    const deleted${capitalize(
      serviceName
    )} = await prisma.${serviceName}.delete({
        where: {
            id: req.params.id
        }
    });
    if (!deleted${capitalize(serviceName)}) {
        return res.status(404).json({ error: '${capitalize(
          serviceName
        )} not found' });
    }
    res.json({ message: '${capitalize(serviceName)} deleted successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: error.meta.message });
}
}
  `,
  controllerContent: (serviceName) => `
  const db = require('../models/index');
  
  async function create${capitalize(serviceName)}(req, res) {
    try {
      const new${capitalize(serviceName)} = await db.${capitalize(serviceName)}.create(req.body);
      res.status(201).json(new${capitalize(serviceName)});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
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
  
      const ${serviceName}List = await db.${capitalize(serviceName)}.findAll(options);
  
      // Respond with the retrieved data
      res.status(200).json(${serviceName}List);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async function get${capitalize(serviceName)}ById(req, res) {
    try {
      const { id } = req.params;
      const ${serviceName} = await db.${capitalize(serviceName)}.findByPk(id);
      if (!${serviceName}) {
        return res.status(404).json({ error: '${capitalize(serviceName)} not found' });
      }
      res.status(200).json(${serviceName});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async function update${capitalize(serviceName)}ById(req, res) {
    try {
      const { id } = req.params;
      const [updatedCount] = await db.${capitalize(serviceName)}.update(req.body, { where: { id } });
      if (updatedCount === 0) {
        return res.status(404).json({ error: '${capitalize(serviceName)} not found' });
      }
      res.status(200).json({ message: '${capitalize(serviceName)} updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async function delete${capitalize(serviceName)}ById(req, res) {
    try {
      const { id } = req.params;
      const deletedCount = await db.${capitalize(serviceName)}.destroy({ where: { id } });
      if (deletedCount === 0) {
        return res.status(404).json({ error: '${capitalize(serviceName)} not found' });
      }
      res.status(200).json({ message: '${capitalize(serviceName)} deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  module.exports = {
    create${capitalize(serviceName)},
    getAll${capitalize(serviceName)},
    get${capitalize(serviceName)}ById,
    update${capitalize(serviceName)}ById,
    delete${capitalize(serviceName)}ById
  };
  `,
  
    sequelizeInitContent : `
  const { Sequelize } = require("sequelize");
  require("dotenv").config();
  const dbUri = process.env['DATABASE_URL'];
  
  const sequelize = new Sequelize(dbUri);
  
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
  `
};
