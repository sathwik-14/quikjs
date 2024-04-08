function authMiddleware(auth) {
  if (auth) {
    return `//Auth middleware
app.use(passport.initialize());
require("./middlewares/passport")(passport);`;
  }
  return "";
}

function error_handling(isErr) {
  if (isErr)
    return `// Error handling middleware
app.use((err, req, res, next) => {
console.error("Custom error handler - " + err.stack);

// Log the error to a file
const logStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
logStream.write(new Date().toISOString() + ': ' + err.stack + '\\n');
logStream.end();

res.status(500).send("Something went wrong!");
});`;
  return `// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Custom error handler - " + err.stack);
  res.status(500).send("Something went wrong!");
});`;
}

function logImport(isLogging) {
  return isLogging
    ? `const morgan = require("morgan")
const fs = require("fs")
const path = require("path")`
    : "";
}

function logMiddleware(isLogging) {
  return isLogging
    ? `app.use(morgan("combined", { stream: fs.createWriteStream(path.join(process.pwd(), 'access.log'), { flags: 'a' }) })); // Logging to file
  `
    : "";
}

function authRoutes(auth) {
  if (auth) {
    return `app.post("/auth/register", async (req,res) => await userRegister(req.body,res));
app.post("/auth/login", async (req,res) => await userLogin(req.body,res));
app.get("/auth/profile", userAuth, (req,res) => res.status(200).json({ user: serializeUser(req.user) }));`;
  }
  return "";
}

function authImports(auth, roles) {
  if (auth && roles.length) {
    return `const passport = require("passport");
const {userAuth, userRegister, userLogin, checkRole, serializeUser} = require("./utils/auth")`;
  } else if (auth) {
    return `const passport = require("passport");
    const {userAuth, userRegister, userLogin, serializeUser} = require("./utils/auth")`;
  }
  return "";
}

export default (input) => `
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
${logImport(input.logging)};
const compression = require("compression");
${authImports(input.authentication, input.roles)}

const PORT = process.env.PORT || "3000";

// Import routes

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data
app.use(helmet()); // Set security HTTP headers
${logMiddleware(input.logging)}
app.use(compression()); // Gzip compression
${authMiddleware(input.authentication)}

${error_handling(input.error_handling)}

// Routes
${authRoutes(input.authentication)}

// Start the server
app.listen(PORT, () => {
console.log(\`Server running on port \${PORT}\`);
});
`;
