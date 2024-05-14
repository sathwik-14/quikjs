import { orms, tools } from './constants.js';
import { prompt, saveConfig } from './utils/index.js';

const projectPrompts = async () => {
  return await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your project name?',
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your project name.';
        }
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Describe your project (optional) ',
    },
    {
      type: 'list',
      name: 'db',
      message: 'Which database would you like to use?',
      choices: ['postgresql', 'mysql'],
    },
    {
      type: 'list',
      name: 'orm',
      message: 'Which ORM would you like to choose?',
      choices: function (answers) {
        if (answers.db === 'mongoDB') {
          return ['prisma', 'mongoose'];
        } else {
          return ['sequelize'];
        }
      },
    },
    {
      type: 'confirm',
      name: 'logging',
      message: 'Do you want access_logging for your application?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'error_handling',
      message: 'Do you want error_logging for your application?',
      default: true,
    },
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Select third-party tools you would like to configure',
      choices: tools,
    },
    // {
    //   type: 'confirm',
    //   name: 'authentication',
    //   message: 'Do you want authentication for your project?(passport-jwt)',
    //   default: true,
    // },
    {
      type: 'confirm',
      name: 'roles',
      message: 'Do you want role based authentication?',
      default: true,
      when: (answers) => answers.authentication,
    },
  ]);
};

const schemaPrompts = async (input, name = '') => {
  try {
    let tables = [];
    let schemaData = {};
    let mappedTypes = orms[input.orm].types;

    const schemaQuestions = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of the attribute:',
        validate: function (value) {
          return /^[a-zA-Z_]\w*$/.test(value)
            ? true
            : 'Please enter a valid attribute name (alphanumeric characters and underscores only, and must start with a letter or underscore).';
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Select the data type:',
        choices: mappedTypes,
      },
      {
        type: 'input',
        name: 'size',
        message: 'Enter the size (if applicable):',
        when: (answers) =>
          ['string', 'binary'].includes(answers.type.toLowerCase()),
        default: '',
      },
      {
        type: 'input',
        name: 'defaultValue',
        message: 'Enter the default value (if any):',
        when: (answers) =>
          ['string', 'integer', 'float', 'boolean', 'date', 'decimal'].includes(
            answers.type.toLowerCase(),
          ),
        default: '',
      },
      {
        type: 'confirm',
        name: 'primaryKey',
        message: 'Is this attribute a primary key?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'allowNulls',
        message: 'Allow NULL values for this attribute?',
        when: (answers) => !answers.primaryKey,
        default: true,
      },
      {
        type: 'confirm',
        name: 'unique',
        message: 'Should this attribute have unique values?',
        when: (answers) => !answers.primaryKey,
        default: true,
      },
      {
        type: 'confirm',
        name: 'autoIncrement',
        message: 'Should this attribute auto-increment?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'foreignKey',
        message: 'Is this attribute a foreign key?',
        default: true,
      },
      {
        type: 'list',
        name: 'refTable',
        message: 'Select the referenced table:',
        choices: tables,
        when: (answers) => answers.foreignKey,
      },
      {
        type: 'list',
        name: 'refField',
        message: 'Enter the referenced field:',
        when: (answers) => answers.foreignKey,
        choices: function (answers) {
          const refTable = answers.refTable;
          const fields = schemaData[refTable].map((field) => field.name);
          return fields;
        },
      },
      {
        type: 'list',
        name: 'relationshipType',
        message: 'Select the relationship type:',
        choices: ['One-to-One', 'One-to-Many', 'Many-to-One', 'Many-to-Many'],
        when: (answers) => answers.foreignKey,
      },
      {
        type: 'confirm',
        name: 'add_another',
        message: 'Do you want to add another attribute?',
        default: true,
      },
    ];

    if (name === '') {
      while (true) {
        const ans = await prompt([
          {
            type: 'confirm',
            name: 'add_table',
            message: 'Do you want to add a table?',
            default: true,
          },
          {
            type: 'input',
            name: 'table_name',
            message: 'Enter the table name?',
            when: (answers) => answers.add_table,
          },
        ]);
        if (!ans.add_table) {
          break;
        }
        schemaData[ans.table_name] = [];
        tables.push(ans.table_name);
        while (true) {
          const model = await prompt(schemaQuestions);
          if (!model.add_another) {
            schemaData[ans.table_name].push(model);
            break;
          }
          schemaData[ans.table_name].push(model);
        }
      }
    } else {
      schemaData[name] = [];
      while (true) {
        const userModel = await prompt(schemaQuestions);
        if (!userModel.add_another) {
          schemaData[name].push(userModel);
          break;
        }
        schemaData[name].push(userModel);
      }
      saveConfig({ schema: schemaData });
      return schemaData;
    }
    return schemaData;
  } catch (e) {
    console.log(e);
    console.log('error getting schema details\n' + e);
  }
};

export { schemaPrompts, projectPrompts };
