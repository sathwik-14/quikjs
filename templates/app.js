function authMiddleware(auth) {
  if (auth) {
    return `app.use(passport.initialize());
require("./middlewares/passport")(passport);`;
  }
  return ''
}

export default (auth) => `
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
${auth ? 'const passport = require("passport")' : ""}

const PORT = process.env.PORT || "3000";

// Import routes

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middlewarechat
app.use(cors());
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data
app.use(helmet()); // Set security HTTP headers
app.use(morgan("combined")); // Logging
app.use(compression()); // Gzip compression
${authMiddleware(auth)}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Custom error handler - " + err.stack);
  res.status(500).send("Something went wrong!");
});

// Routes

// Start the server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
