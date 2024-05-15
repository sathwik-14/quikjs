import Handlebars from 'handlebars';
import { appTemplate } from '../../templates/app';

describe('Handlebars App Template', () => {
  it('should render the template correctly', () => {
    const template = Handlebars.compile(appTemplate);

    const inputData = {
      name: 'MyApp',
      logging: true,
      production: true,
      authentication: true,
      roles: ['admin', 'user'],
      error_handling: true,
    };

    const renderedTemplate = template({ input: inputData });

    expect(renderedTemplate).toContain('express');
    expect(renderedTemplate).toContain('const cors = require("cors")');
    expect(renderedTemplate).toContain('const dotenv = require("dotenv")');
    expect(renderedTemplate).toContain('const helmet = require("helmet")');
    expect(renderedTemplate).toContain(
      'const compression = require("compression")',
    );
    expect(renderedTemplate).toContain('const morgan = require("morgan")');
    expect(renderedTemplate).toContain('const fs = require("fs")');
    expect(renderedTemplate).toContain('const path = require("path")');
    expect(renderedTemplate).toContain('const passport = require("passport")');
    expect(renderedTemplate).toContain('const winston = require("winston")');
    expect(renderedTemplate).toContain(
      "const rateLimit = require('express-rate-limit')",
    );
    expect(renderedTemplate).toContain('app.use(cors())');
    expect(renderedTemplate).toContain('app.use(express.json())');
    expect(renderedTemplate).toContain(
      'app.use(express.urlencoded({ extended: true }))',
    );
    expect(renderedTemplate).toContain('app.use(helmet())');
    expect(renderedTemplate).toContain('app.use(compression())');
    expect(renderedTemplate).toContain('app.use(passport.initialize())');
    expect(renderedTemplate).toContain("app.get('/',(req,res)=>{");
    expect(renderedTemplate).toContain(
      'res.status(200).send("Welcome ! to MyApp")',
    );
    expect(renderedTemplate).toContain("app.use('/api',routes)");
    expect(renderedTemplate).toContain('app.use((err, req, res, next) => {');
    expect(renderedTemplate).toContain(
      'console.error("Custom error handler - " + err.stack)',
    );
    expect(renderedTemplate).toContain(
      'res.status(500).send("Something went wrong!")',
    );
    expect(renderedTemplate).toContain('app.use((err, req, res, next) => {');
    expect(renderedTemplate).toContain(
      "console.error('Custom error handler - ' + err.stack)",
    );
    expect(renderedTemplate).toContain('logger.error(err.stack)');
    expect(renderedTemplate).toContain(
      "res.status(500).send('Internal Server Error')",
    );
    expect(renderedTemplate).toContain('app.listen(PORT, () => {');
    expect(renderedTemplate).toContain(
      'console.log(`Server running on port ${PORT}`)',
    );
  });
});
