import { capitalize } from '../../utils/index.js';

export default {
  create: (modelName) => `
    const create${capitalize(modelName)} = async (req, res) => {
      try {
        const new${capitalize(modelName)} = new ${capitalize(modelName)}(req.body);
        const saved${capitalize(modelName)} = await new${capitalize(
    modelName,
  )}.save();
        res.status(201).json(saved${capitalize(modelName)});
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,

  getAll: (modelName) => `
    const getAll${capitalize(modelName)} = async (req, res) => {
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

        const skip = (page - 1) * limit;
        const sortOptions = {};
        
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'DESC' ? -1 : 1;
        }

        const ${modelName}List = await ${capitalize(
    modelName,
  )}.find().sort(sortOptions).skip(skip).limit(limit);
        
        res.status(200).json(${modelName}List);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    `,

  getById: (modelName) => `
    const get${capitalize(modelName)}ById = async (req, res) => {
      try {
        const { id } = req.params;
        const ${modelName} = await ${capitalize(modelName)}.findById(id);
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

  update: (modelName) => `
    const update${capitalize(modelName)}ById = async (req, res) => {
      try {
        const { id } = req.params;
        const updated${capitalize(modelName)} = await ${capitalize(
    modelName,
  )}.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated${capitalize(modelName)}) {
          return res.status(404).json({ error: '${capitalize(
            modelName,
          )} not found' });
        }
        res.status(200).json({ message: '${capitalize(
          modelName,
        )} updated successfully', data: updated${capitalize(modelName)} });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }`,

  delete: (modelName) => `
    const delete${capitalize(modelName)}ById = async (req, res) => {
      try {
        const { id } = req.params;
        const deleted${capitalize(modelName)} = await ${capitalize(
    modelName,
  )}.findByIdAndDelete(id);

        if (!deleted${capitalize(modelName)}) {
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

  mongooseInit: `const mongoose = require('mongoose');

const databaseUrl = process.env.DATABASE_URL;

mongoose.connect(databaseUrl);

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from database');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected due to application termination');
    process.exit(0);
  });
});

module.exports = mongoose;`,
};