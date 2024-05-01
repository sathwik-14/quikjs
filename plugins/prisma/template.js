import capitalize from "../../utils/capitalize.js";

export default {
  prismaInitContent: `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    module.exports = prisma;
    `,
  createPrismaContent: (serviceName) => `
    async function create${capitalize(serviceName)}(req, res) {
        try {
          req.body = req.body || {}
            const new${capitalize(
              serviceName
            )} = await prisma.${serviceName}.create({
                data: req.body
            });
            res.status(201).json(new${capitalize(serviceName)});
        } catch (error) {
          res.status(400).json({ error });
        }
    }
    `,
  getAllPrismaContent: (serviceName) => `
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
  getByIdPrismaContent: (serviceName) => `
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
  updatePrismaContent: (serviceName) => `
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
  deletePrismaContent: (serviceName) => `
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
};
