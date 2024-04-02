function authMiddleware(auth) {
  if (auth) {
    return `app.use(passport.initialize());
require("./middlewares/passport")(passport);`;
  }
  return "";
}

function authRoutes(auth) {
  if (auth) {
    return `app.post("/auth/register", async (req,res) => await userRegister(req.body,res));
app.post("/auth/login", async (req,res) => await userLogin(req.body,res));
app.get("/auth/profile", userAuth, (req,res) => res.status(200).json({ user: serializeUser(req.user) }));`;
  }
  return "";
}

function authImports(auth,roles) {
  if (auth && roles.length) {
    return `const passport = require("passport");
const {userAuth, userRegister, userLogin, checkRole, serializeUser} = require("./utils/auth")`;
  }else if (auth){
    return `const passport = require("passport");
    const {userAuth, userRegister, userLogin, serializeUser} = require("./utils/auth")`;
  }
  return "";
}

export default (auth,roles) => `
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
${authImports(auth,roles)}

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
${authRoutes(auth)}

// Start the server
app.listen(PORT, () => {
console.log(\`Server running on port \${PORT}\`);
});
`;
