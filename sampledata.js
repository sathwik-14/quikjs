export default {
    p1 : {
    name: 'todos',
    description: '',
    db: 'mysql', // choose among [mysql,postgresql]
    orm: 'sequelize',
    logging: true,
    error_handling: true,
    tools: ['none'],
    authentication: false,
  },

  s1: {
    country: [
      {
        name: 'id',
        type: 'INTEGER',
        defaultValue: '',
        primaryKey: true,
        autoIncrement: true,
        foreignKey: false,
        add_another: true
      },
      {
        name: 'name',
        type: 'STRING',
        size: '',
        defaultValue: '',
        primaryKey: false,
        allowNulls: false,
        unique: false,
        autoIncrement: false,
        foreignKey: false,
        add_another: false
      }
    ],
    employee: [
      {
        name: 'id',
        type: 'INTEGER',
        defaultValue: '',
        primaryKey: true,
        autoIncrement: true,
        foreignKey: false,
        add_another: true
      },
      {
        name: 'name',
        type: 'TEXT',
        primaryKey: false,
        allowNulls: false,
        unique: false,
        autoIncrement: false,
        foreignKey: false,
        add_another: true
      },
      {
        name: 'country_id',
        type: 'INTEGER',
        defaultValue: '',
        primaryKey: false,
        allowNulls: false,
        unique: false,
        autoIncrement: false,
        foreignKey: true,
        refTable: 'country',
        refField: 'id',
        relationshipType: 'Many-to-One',
        add_another: true
      },
      {
        name: 'start_date',
        type: 'DATE',
        defaultValue: '',
        primaryKey: false,
        allowNulls: true,
        unique: false,
        autoIncrement: false,
        foreignKey: false,
        add_another: false
      }
    ]
  }

};