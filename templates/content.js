import capitalize from "../utils/capitalize.js";

export default {
  mongooseInit: `
const mongoose = require('mongoose');

const dbURI = process.env.DATABASE_URL 

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log("Mongoose connected to db");
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

module.exports = mongoose;`,
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
};
