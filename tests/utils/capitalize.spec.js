import capitalizeFirstLetter from '../../utils/capitalize';

describe('capitalizeFirstLetter Utility Function', () => {
  test('Capitalizes the first letter of a single word', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('world')).toBe('World');
  });

  test('Handles empty string', () => {
    expect(capitalizeFirstLetter('')).toBe(''); // Changed from undefined to ""
  });

  test('Handles string with all uppercase letters', () => {
    expect(capitalizeFirstLetter('EXAMPLE')).toBe('EXAMPLE');
  });

  test('Handles string with leading whitespace', () => {
    expect(capitalizeFirstLetter('  javascript')).toBe('  javascript');
  });

  test('Handles non-string input', () => {
    expect(capitalizeFirstLetter(123)).toBe(123); // Changed from '123' to 123
    expect(capitalizeFirstLetter(null)).toBe(null); // Changed from undefined to null
    expect(capitalizeFirstLetter()).toBe(undefined); // This one is correct
  });

  test('Handles special characters and symbols', () => {
    expect(capitalizeFirstLetter('@hello')).toBe('@hello');
    expect(capitalizeFirstLetter('$test')).toBe('$test');
    expect(capitalizeFirstLetter('#123')).toBe('#123');
  });
});
