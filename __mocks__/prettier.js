// __mocks__/prettier.js
export const format = jest.fn(async (text) => {
  // Removed unused 'options' argument
  // Default mock: return text as is, or a slightly modified version for differentiation
  return Promise.resolve(text);
});

// If other functions from prettier are used, mock them here too.
export default { format };
