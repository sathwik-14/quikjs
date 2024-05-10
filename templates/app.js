import Handlebars from 'handlebars';

Handlebars.registerHelper('errorHandlingMiddleware', () => {
  return `
  app.use((err, req, res, next) => {
    console.error("Custom error handler - " + err.stack);
    // Log the error to a file
    const logStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
    logStream.write(new Date().toISOString() + ': ' + err.stack + '\\n');
    logStream.end();
    res.status(500).send("Something went wrong!");
  });`;
});

Handlebars.registerHelper('defaultErrorHandlingMiddleware', () => {
  return `
  app.use((err, req, res, next) => {
    console.error("Custom error handler - " + err.stack);
    res.status(500).send("Something went wrong!");
  });`;
});

Handlebars.registerHelper('logMiddleware', () => {
  return `
  // write access log to file
  app.use(morgan("combined", { stream: fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' }) }));
  `;
});

Handlebars.registerHelper('authRoutes', (authentication) => {
  if (authentication) {
    return `
app.post("/auth/register", async (req,res) => await userRegister(req.body,res));
app.post("/auth/login", async (req,res) => await userLogin(req.body,res));
app.get("/auth/profile", userAuth, (req,res) => res.status(200).json({ user: serializeUser(req.user) }));
    `;
  }
  return '';
});

Handlebars.registerHelper('authImports', (authentication, roles) => {
  if (authentication && roles.length) {
    return `const passport = require("passport");
const {userAuth, userRegister, userLogin, checkRole, serializeUser} = require("./utils/auth")`;
  } else if (authentication) {
    return `const passport = require("passport");
const {userAuth, userRegister, userLogin, serializeUser} = require("./utils/auth")`;
  }
  return '';
});

export const appTemplate = `
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const helmet = require("helmet")
const compression = require("compression")
{{#if input.logging}}
const morgan = require("morgan")
const fs = require("fs")
const path = require("path")
{{/if}}
{{#if input.production}}
const winston = require("winston")
const rateLimit = require('express-rate-limit');
{{/if}}
{{!-- Auth imports --}}
{{{authImports input.authentication input.roles}}}

// Import routes


const PORT = process.env.PORT || "3000";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data
app.use(helmet()); // Set security HTTP headers
{{#if input.production}}
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window (adjust based on your needs)
  max: 100, // Limit each IP to 100 requests per window
  message: {
    code: 'TOO_MANY_REQUESTS',
    message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
  },
  // Consider enabling these for production (comment out for development)
  skipFailedRequests: true, // Don't count failed requests towards the limit
  xfwd: true, // Use the X-Forwarded-For header to identify the client IP (if behind a proxy)
});

// Apply the rate limiter to all routes (or specific routes as needed)
app.use(apiLimiter);
{{/if}}
{{!-- Log middleware --}}
{{#if input.logging}}
app.use(morgan("combined", { stream: fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' }) })); // Logging to file
{{/if}}
app.use(compression()); // Gzip compression
{{!-- Auth middleware --}}
{{#if input.authentication}}
app.use(passport.initialize());
require("./middlewares/passport")(passport);
{{/if}}

// Routes
{{{authRoutes input.authentication}}}

app.get('/',(req,res)=>{
  res.status(200).send("Welcome ! to {{input.name}}")
})

{{!-- Error handling middleware --}}
{{#if input.error_handling}}
app.use((err, req, res, next) => {
  console.error("Custom error handler - " + err.stack);

  // Log the error to a file
  const logStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
  logStream.write(new Date().toISOString() + ': ' + err.stack + '\\n');
  logStream.end();

  res.status(500).send("Something went wrong!");
});
{{/if}}
{{#if input.production}}
app.use((err, req, res, next) => {
  console.error('Custom error handler - ' + err.stack);

  // Configure Winston logger for production
  const logger = winston.createLogger({
    level: 'error', // Only log errors in production
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'error.log' }), // Log to file
    ]
  });

  // Log the error using Winston
  logger.error(err.stack);

  res.status(500).send('Internal Server Error');
});
{{/if}}

// Start the server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
