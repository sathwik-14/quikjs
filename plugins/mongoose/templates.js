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
};
