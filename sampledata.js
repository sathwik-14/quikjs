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

  employee: {
    "employees": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "name",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "employee_details": [
      {
        "name": "employee_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "allowNulls": false,
        "unique": true,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "employees",
        "refField": "id",
        "relationshipType": "One-to-One",
        "add_another": false
      },
      {
        "name": "salary",
        "type": "DECIMAL",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "start_date",
        "type": "DATE",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ]
  } ,

  blogs: {
    "users": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "username",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "email",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": true,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "password",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "posts": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "title",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "content",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "user_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "users",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "defaultValue": "CURRENT_TIMESTAMP",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "updated_at",
        "type": "DATETIME",
        "defaultValue": "CURRENT_TIMESTAMP",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "comments": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "content",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "post_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "posts",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "user_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "users",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "defaultValue": "CURRENT_TIMESTAMP",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ]
  },

  ecommerce: {
    "products": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "name",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "description",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "price",
        "type": "DECIMAL",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "stock_quantity",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "categories": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "name",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "customers": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "name",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "email",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": true,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "address",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "orders": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "customer_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "customers",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "order_date",
        "type": "DATETIME",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "status",
        "type": "STRING",
        "size": "",
        "defaultValue": "pending",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "order_items": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "order_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "orders",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "product_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "products",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "quantity",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "unit_price",
        "type": "DECIMAL",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ]
  },
  
  sociamedia: {
    "users": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "username",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "email",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": true,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "password",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "posts": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "content",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "user_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "users",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "defaultValue": "CURRENT_TIMESTAMP",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "comments": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "content",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "post_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "posts",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "user_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "users",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "defaultValue": "CURRENT_TIMESTAMP",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ]
  },
  
  tasks: {
    "users": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "username",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "email",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": true,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "password",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "tasks": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "title",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "description",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "status",
        "type": "STRING",
        "size": "",
        "defaultValue": "pending",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "priority",
        "type": "STRING",
        "size": "",
        "defaultValue": "medium",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "due_date",
        "type": "DATE",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "user_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "users",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      },
      {
        "name": "project_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "projects",
        "refField": "id",
        "relationshipType": "Many-to-One",
        "add_another": false
      }
    ],
    "projects": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "name",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "description",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "status",
        "type": "STRING",
        "size": "",
        "defaultValue": "active",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ]
  },
   
  alltypes: {
    "users": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "username",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "profiles": [
      {
        "name": "user_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "allowNulls": false,
        "unique": true,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "users",
        "refField": "id",
        "relationshipType": "One-to-One",
        "add_another": false
      },
      {
        "name": "bio",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "posts": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "content",
        "type": "TEXT",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "user_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "users",
        "refField": "id",
        "relationshipType": "One-to-Many",
        "add_another": false
      }
    ],
    "tags": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "name",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": true,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      }
    ],
    "post_tags": [
      {
        "name": "post_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "posts",
        "refField": "id",
        "relationshipType": "Many-to-Many",
        "add_another": false
      },
      {
        "name": "tag_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "tags",
        "refField": "id",
        "relationshipType": "Many-to-Many",
        "add_another": false
      }
    ],
    "employees": [
      {
        "name": "id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": true,
        "autoIncrement": true,
        "foreignKey": false,
        "add_another": true
      },
      {
        "name": "name",
        "type": "STRING",
        "size": "",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": false,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": false,
        "add_another": false
      },
      {
        "name": "manager_id",
        "type": "INTEGER",
        "defaultValue": "",
        "primaryKey": false,
        "allowNulls": true,
        "unique": false,
        "autoIncrement": false,
        "foreignKey": true,
        "refTable": "employees",
        "refField": "id",
        "relationshipType": "One-to-One",
        "add_another": false
      }
    ]
  }
  

};