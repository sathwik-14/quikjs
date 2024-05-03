# QUICKJS- API Generator

QUICKJS- API Generator is a powerful tool designed to streamline the process of building APIs for Express.js applications. It provides support for PostgreSQL database and Sequelize ORM out of the box, allowing developers to quickly scaffold projects and generate RESTful APIs.

## Features

- Scaffold Express.js projects with ease.
- Automatically generate CRUD APIs for your database models.
- Seamlessly integrate with PostgreSQL database using Sequelize ORM.
- Planned support for other ORMs and databases in future updates.
- Integrating 3rd party services for messaging, mail services, and storage services (e.g., S3).

## Installation

To install QUICKJS- API Generator, simply run:

```bash
npm install -g @waglesathwik/quikjs
```

## Usage

### Generating a New Project

To generate a new project with QUICKJS API Generator, run:

```bash
npx quikjs-g-p
```

## Generating APIs

Once your project is set up, you can generate APIs for your models using the following command:

```bash
npx quikjs-g-m
```

## Configuring Database

QUICKJS API Generator doesn't automatically sets up PostgreSQL database using Sequelize ORM. You have to provide the database connection string to .env file.(ex: DATABASE_URL="postgre.......)

## Planned Features

Support for other ORMs (e.g., Mongoose, TypeORM).
Support for various databases (e.g., MySQL, MongoDB).
Integration with 3rd party services for messaging, mail services, and storage services (e.g., AWS S3).

## Contributing

Contributions are welcome! If you'd like to contribute to QUICKJS API Generator, please fork the repository and submit a pull request.

## License

QUICKJS- API Generator is licensed under the MIT License.
