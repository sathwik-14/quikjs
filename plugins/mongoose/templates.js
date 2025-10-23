export default {
  mongooseInit: `const mongoose = require('mongoose');

const databaseUrl = process.env.DATABASE_URL;

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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