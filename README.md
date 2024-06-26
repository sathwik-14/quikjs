# QUIKJS- API Generator

QUIKJS- API Generator is a powerful tool designed to streamline the process of building APIs for Express.js applications. It provides support for PostgreSQL database and Sequelize ORM out of the box, allowing developers to quickly scaffold projects and generate RESTful APIs.

## Features

- Scaffold Express.js projects with ease.
- Automatically generate CRUD APIs with validation(joi) and documentation(swaggerUI) for your database models.
- Seamlessly integrate with PostgreSQL database using Sequelize ORM.
- Planned support for other ORMs and databases in future updates.
- Integrating 3rd party services for messaging, mail services, and storage services (e.g., S3).

## Installation

To install QUIKJS- API Generator, simply run:

```bash
npm install -D quikjs
```

## Usage

### Generating a New Project

To generate a new project with QUIKJS API Generator, run:

```bash
npx quik-g-p
```

<!-- ## Generating APIs -

Once your project is set up, you can generate APIs for your models using the following command:

```bash
npx quikjs-g-m
``` -->

## Test cases & Code Coverage

To run unit tests:

```sh
npm test
```

To run the coverage:

```
npm run coverage
```

After running the command, you will find `coverage/lcov-report` generated within the project directory. This is served via simple-http-server, which would be available via `coverage.js`, hence run the following command:

```sh
node coverage.js
```

You will find the coverage report served at `localhost:8000`.

## Configuring Database

QUIKJS API Generator doesn't automatically sets up PostgreSQL database using Sequelize ORM. You have to provide the database connection string to .env file.(ex: DATABASE_URL="postgre.......)

## Planned Features

Support for other ORMs (e.g., Mongoose, TypeORM).
Support for various databases (e.g., MySQL, MongoDB).
Integration with 3rd party services for messaging, mail services, and storage services (e.g., AWS S3).

## Contributing

Contributions are welcome! If you'd like to contribute to QUIKJS API Generator, please fork the repository and submit a pull request.

## License

QUIKJS- API Generator is licensed under the MIT License.
