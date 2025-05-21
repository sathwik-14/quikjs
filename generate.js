#!/usr/bin/env node

import template from './templates/content.js';
import { read, saveConfig, write } from './utils/index.js';
import { joi, prisma, sequelize } from './plugins/index.js';
// import sampledata from './sampledata.js';
import chalk from 'chalk';
// uncomment below import to work with custom input
import { schemaPrompts } from './prompt.js';

import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

let state;

const loadState = (input) => {
  try {
    const config = read('config.json');
    if (config.length !== 0) {
      state = JSON.parse(config);
    }
  } catch {
    state = input;
  }
};

const authMiddleware = (roles) => {
  if (state.authentication && roles.length) {
    return `userAuth, checkRole(${JSON.stringify(roles)}), `;
  } else if (state.authentication) {
    return 'userAuth, ';
  }
  return '';
};

const updateRouteInMain = async (routeName, roles = []) => {
  try {
    const mainFileContent = read('routes/index.js');
    if (!mainFileContent) {
      console.error(chalk.red('Error: routes/index.js not found or is empty.'));
      return;
    }

    const ast = parser.parse(mainFileContent, {
      sourceType: 'script', // Assuming CommonJS for routes/index.js
    });

    let importExists = false;
    let routeExists = false;

    const routeIdentifierName = `${routeName}Routes`;
    const importPathString = `./${routeName}`;
    const routePathString = `/${routeName}`;

    // Use default import for traverse if it's ES6 default export
    const traverseDefault =
      typeof traverse === 'function' ? traverse : traverse.default;
    const generateDefault =
      typeof generate === 'function' ? generate : generate.default;

    traverseDefault(ast, {
      VariableDeclarator(path) {
        if (
          path.node.id.type === 'Identifier' &&
          path.node.id.name === routeIdentifierName &&
          path.node.init &&
          path.node.init.type === 'CallExpression' &&
          path.node.init.callee.name === 'require' &&
          path.node.init.arguments.length > 0 &&
          path.node.init.arguments[0].type === 'StringLiteral' &&
          path.node.init.arguments[0].value === importPathString
        ) {
          importExists = true;
        }
      },
      CallExpression(path) {
        if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.object.name === 'router' &&
          path.node.callee.property.name === 'use' &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === 'StringLiteral' &&
          path.node.arguments[0].value === routePathString
        ) {
          const lastArg = path.node.arguments[path.node.arguments.length - 1];
          if (
            lastArg &&
            lastArg.type === 'Identifier' &&
            lastArg.name === routeIdentifierName
          ) {
            routeExists = true;
          }
        }
      },
    });

    let astModified = false;

    if (!importExists) {
      const importDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier(routeIdentifierName),
          t.callExpression(t.identifier('require'), [
            t.stringLiteral(importPathString),
          ]),
        ),
      ]);

      traverseDefault(ast, {
        Program(path) {
          let lastImportIndex = -1;
          let importCommentNodeIndex = -1;

          path.node.body.forEach((node, index) => {
            if (
              node.type === 'VariableDeclaration' &&
              node.declarations.some(
                (d) =>
                  d.init &&
                  d.init.type === 'CallExpression' &&
                  d.init.callee.name === 'require',
              )
            ) {
              lastImportIndex = index;
            }
            (node.trailingComments || []).forEach((comment) => {
              if (comment.value.trim() === 'import routes')
                importCommentNodeIndex = index;
            });
            if (
              importCommentNodeIndex === -1 &&
              (node.leadingComments || []).some(
                (comment) => comment.value.trim() === 'import routes',
              )
            ) {
              importCommentNodeIndex = index;
            }
          });

          if (importCommentNodeIndex !== -1) {
            // Insert after the line with the comment
            // Check if the comment is a standalone line comment (EmptyStatement)
            const commentNode = path.node.body[importCommentNodeIndex];
            if (
              commentNode &&
              commentNode.type === 'EmptyStatement' &&
              (commentNode.leadingComments || []).some(
                (c) => c.value.trim() === 'import routes',
              )
            ) {
              path.node.body.splice(
                importCommentNodeIndex + 1,
                0,
                importDeclaration,
              );
            } else {
              // Comment is likely a trailing comment on a line of code
              path.node.body.splice(
                importCommentNodeIndex + 1,
                0,
                importDeclaration,
              );
            }
          } else if (lastImportIndex !== -1) {
            path.node.body.splice(lastImportIndex + 1, 0, importDeclaration);
          } else {
            const useStrictIndex = path.node.body.findIndex(
              (node) =>
                node.type === 'ExpressionStatement' &&
                node.expression.type === 'StringLiteral' &&
                node.expression.value === 'use strict',
            );
            path.node.body.splice(
              useStrictIndex !== -1 ? useStrictIndex + 1 : 0,
              0,
              importDeclaration,
            );
          }
          astModified = true;
          path.stop(); // Stop traversal once we've made the change
        },
      });
    }

    if (!routeExists) {
      const authArgs = [];
      const currentAuthMiddleware = authMiddleware(roles);

      if (currentAuthMiddleware) {
        const middlewareParts = currentAuthMiddleware
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        middlewareParts.forEach((part) => {
          if (part.startsWith('checkRole')) {
            const roleArgsMatch = part.match(/checkRole\((.*)\)/);
            if (roleArgsMatch && roleArgsMatch[1]) {
              try {
                const rolesArray = JSON.parse(
                  roleArgsMatch[1].replace(/'/g, '"'),
                );
                authArgs.push(
                  t.callExpression(t.identifier('checkRole'), [
                    t.arrayExpression(
                      rolesArray.map((r) => t.stringLiteral(r)),
                    ),
                  ]),
                );
              } catch (parseError) {
                console.warn(
                  chalk.yellow(
                    `Could not parse roles for checkRole from "${roleArgsMatch[1]}": ${parseError.message}`,
                  ),
                );
                authArgs.push(t.identifier('checkRole'));
              }
            } else {
              authArgs.push(t.identifier('checkRole'));
            }
          } else if (part) {
            authArgs.push(t.identifier(part));
          }
        });
      }

      const routeArgs = [
        t.stringLiteral(routePathString),
        ...authArgs,
        t.identifier(routeIdentifierName),
      ];
      const routeExpression = t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier('router'), t.identifier('use')),
          routeArgs,
        ),
      );

      traverseDefault(ast, {
        Program(path) {
          let lastRouteUseIndex = -1;
          let routesCommentNodeIndex = -1;

          path.node.body.forEach((node, index) => {
            if (
              node.type === 'ExpressionStatement' &&
              node.expression.type === 'CallExpression' &&
              node.expression.callee.type === 'MemberExpression' &&
              node.expression.callee.object.name === 'router' &&
              node.expression.callee.property.name === 'use'
            ) {
              lastRouteUseIndex = index;
            }
            (node.trailingComments || []).forEach((comment) => {
              if (comment.value.trim() === 'routes')
                routesCommentNodeIndex = index;
            });
            if (
              routesCommentNodeIndex === -1 &&
              (node.leadingComments || []).some(
                (comment) => comment.value.trim() === 'routes',
              )
            ) {
              routesCommentNodeIndex = index;
            }
          });

          if (routesCommentNodeIndex !== -1) {
            const commentNode = path.node.body[routesCommentNodeIndex];
            if (
              commentNode &&
              commentNode.type === 'EmptyStatement' &&
              (commentNode.leadingComments || []).some(
                (c) => c.value.trim() === 'routes',
              )
            ) {
              path.node.body.splice(
                routesCommentNodeIndex + 1,
                0,
                routeExpression,
              );
            } else {
              path.node.body.splice(
                routesCommentNodeIndex + 1,
                0,
                routeExpression,
              );
            }
          } else if (lastRouteUseIndex !== -1) {
            path.node.body.splice(lastRouteUseIndex + 1, 0, routeExpression);
          } else {
            const moduleExportsIndex = path.node.body.findIndex(
              (node) =>
                node.type === 'ExpressionStatement' &&
                node.expression.type === 'AssignmentExpression' &&
                node.expression.left.type === 'MemberExpression' &&
                node.expression.left.object.name === 'module' &&
                node.expression.left.property.name === 'exports',
            );
            if (moduleExportsIndex !== -1) {
              path.node.body.splice(moduleExportsIndex, 0, routeExpression);
            } else {
              path.node.body.push(routeExpression);
            }
          }
          astModified = true;
          path.stop(); // Stop traversal
        },
      });
    }

    if (astModified) {
      const { code } = generateDefault(ast, {
        retainLines: false, // Let generator decide on lines for cleaner output
        compact: false,
        concise: false,
        jsescOption: { minimal: true }, // Avoids unnecessary escape sequences
      });
      await write('routes/index.js', code);
    } else {
      console.log(
        chalk.blue(
          `Route for ${routeName} already exists in routes/index.js. No changes made.`,
        ),
      );
    }
  } catch (error) {
    console.error(
      chalk.red(`AST Error updating routes/index.js for ${routeName}:`),
      error.message,
      error.stack,
    );
    // Fallback or re-throw: For now, just log. Original file untouched if AST fails.
  }
};

const generateRoutes = async (routeName, roles, model) => {
  await write(
    `routes/${routeName}.js`,
    template.routesContent(routeName, model),
  );
  await updateRouteInMain(routeName, roles);
};

const scaffold = async (input) => {
  try {
    let schemaData;
    loadState(input);
    if (input.schema) {
      schemaData = input.schema;
    } else {
      // uncomment the below code to enter schema manually and uncommer import also for schemaPrompts
      schemaData = await schemaPrompts(input);
      // checkout sampledata.js for predefined schemas - faster development
      // schemaData = sampledata.blogs;
    }
    await joi.setup();
    if (Object.keys(schemaData).length) {
      for (const [key, value] of Object.entries(schemaData)) {
        const modelName = key;
        const model = value;
        const db = state.db;
        const orm = state.orm;
        switch (orm) {
          case 'prisma':
            prisma.model(modelName, model, db);
            prisma.generate();
            prisma.controller(modelName);
            break;
          case 'sequelize':
            await sequelize.model(modelName, model);
            sequelize.controller(modelName);
            break;
        }
        await joi.schema(modelName, model);
        await generateRoutes(modelName, [], model);
      }
    }
    saveConfig({ schema: schemaData });
  } catch (err) {
    console.error(chalk.bgRed`ERROR`, err);
  }
};

export { scaffold, generateRoutes };
