#!/usr/bin/env node
import prettier from 'prettier';

export default async (unformattedText, parser = 'babel') => {
  try {
    const prettierOptions = {
      parser: parser, // Specify type of parser to format ex: babel
      semi: true, // Add semicolons at the end of statements
      singleQuote: true, // Use single quotes instead of double quotes for strings
      trailingComma: 'all', // Add trailing commas wherever possible
      printWidth: 80, // Maximum line width before line-wrapping occurs
      tabWidth: 2, // Number of spaces per indentation level
      useTabs: false, // Use spaces instead of tabs for indentation
      bracketSpacing: true, // Add spaces inside object literals { foo: bar }
      arrowParens: 'always', // Include parentheses around a sole arrow function parameter
      endOfLine: 'auto', // Specify line endings (e.g., "lf", "crlf", "auto")
    };
    const formattedText = await prettier.format(
      unformattedText,
      prettierOptions,
    );
    return formattedText;
  } catch {
    return unformattedText;
  }
};
