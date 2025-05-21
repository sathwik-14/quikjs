// __mocks__/handlebars.js
export const compile = jest.fn((template) => {
  // Return a mock compiled template function
  return jest.fn((context) => {
    // Basic mock: just return the template string with context (if any)
    // For more advanced scenarios, you might try to simulate simple replacements.
    if (context) {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return context[key] !== undefined ? String(context[key]) : match;
      });
    }
    return template;
  });
});

export default { compile };
