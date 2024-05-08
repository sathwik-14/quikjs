import {capitalize} from '../../utils/index.js';

export default {
  prismaInitContent: `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    module.exports = prisma;
    `,
  createPrismaContent: (modelName) => `
    async function create${capitalize(modelName)}(req, res) {
        try {
          req.body = req.body || {}
            const new${capitalize(
              modelName,
            )} = await prisma.${modelName}.create({
                data: req.body
            });
            res.status(201).json(new${capitalize(modelName)});
        } catch (error) {
          res.status(400).json({ error });
        }
    }
    `,
  getAllPrismaContent: (modelName) => `
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
                  take: limit,  // Limit the number of results per page
                  skip: (page - 1) * limit,  // Skip results for pagination
                  orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : undefined, // Sort results
              };
      
              const ${modelName.toLowerCase()} = await prisma.${modelName}.findMany(options);
      
              res.json(${modelName.toLowerCase()});
          } catch (error) {
              console.error(error);
              res.status(500).json({ error: error.meta.message });
          }
      }
      `,
  getByIdPrismaContent: (modelName) => `
    async function get${capitalize(modelName)}ById(req, res) {
    try {
        const ${modelName.toLowerCase()} = await prisma.${modelName}.findFirst({
            where: {
                id: req.params.id
            }
        });
        if (!${modelName.toLowerCase()}) {
            return res.status(404).json({ error: '${capitalize(
              modelName,
            )} not found' });
        }
        res.json(${modelName.toLowerCase()});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.meta.message });
    }
    }
      `,
  updatePrismaContent: (modelName) => `
    async function update${capitalize(modelName)}ById(req, res) {
    try {
        const updated${capitalize(
          modelName,
        )} = await prisma.${modelName}.update({
            where: {
                id: req.params.id
            },
            data: req.body
        });
        if (!updated${capitalize(modelName)}) {
            return res.status(404).json({ error: '${capitalize(
              modelName,
            )} not found' });
        }
        res.json(updated${capitalize(modelName)});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.meta.message });
    }
    }
      `,
  deletePrismaContent: (modelName) => `
    async function delete${capitalize(modelName)}ById(req, res) {
    try {
        const deleted${capitalize(
          modelName,
        )} = await prisma.${modelName}.delete({
            where: {
                id: req.params.id
            }
        });
        if (!deleted${capitalize(modelName)}) {
            return res.status(404).json({ error: '${capitalize(
              modelName,
            )} not found' });
        }
        res.json({ message: '${capitalize(modelName)} deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.meta.message });
    }
    }
      `,
};
