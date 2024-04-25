export function projectQuestions() {
    return [
        {
          type: "input",
          name: "name",
          message: "What is your project name?",
          validate: function (value) {
            if (value.length) {
              return true;
            } else {
              return "Please enter your project name.";
            }
          },
        },
        {
          type: "input",
          name: "description",
          message: "Describe your project (optional) ",
        },
        {
          type: "list",
          name: "db",
          message: "Which database would you like to use?",
          choices: ["mongoDB", "postgresQL", "mySQL"],
        },
        {
          type: "list",
          name: "orm",
          message: "Which ORM would you like to choose?",
          choices: function (answers) {
            if (answers.db === "mongoDB") {
              return ["prisma", "mongoose"];
            } else {
              return ["prisma", "sequelize"];
            }
          },
        },
        {
          type: "confirm",
          name: "logging",
          message: "Do you want access_logging for your application?",
          default: true,
        },
        {
          type: "confirm",
          name: "error_handling",
          message: "Do you want error_logging for your application?",
          default: true,
        },
        {
          type: "checkbox",
          name: "tools",
          message: "Select third-party tools you would like to configure",
          choices: tools,
        },
        {
          type: "confirm",
          name: "authentication",
          message: "Do you want authentication for your project?(passport-jwt)",
          default: true,
        },
        {
          type: "confirm",
          name: "roles",
          message: "Do you want role based authentication?",
          default: true,
          when: (answers) => answers.authentication,
        },
      ];
}