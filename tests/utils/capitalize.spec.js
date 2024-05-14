import titlecase from '../../utils/capitalize';

describe('Titlecase Utility Function', () => {
  test('Capitalizes the first letter of a single word', () => {
    expect(titlecase('hello')).toBe('Hello');
    expect(titlecase('world')).toBe('World');
  });

  test('Handles empty string', () => {
    expect(titlecase('')).toBe('');
  });

  test('Handles string with all uppercase letters', () => {
    expect(titlecase('EXAMPLE')).toBe('Example');
  });

  test('Handles string with leading whitespace', () => {
    expect(titlecase('  javascript')).toBe('  javascript');
  });

  test('Handles non-string input', () => {
    expect(titlecase(123)).toBe('123');
    expect(titlecase(null)).toBe('null');
    expect(titlecase(undefined)).toBe('undefined');
    expect(titlecase({})).toBe('[object Object]');
  });

  test('Handles special characters and symbols', () => {
    expect(titlecase('@hello')).toBe('@hello');
    expect(titlecase('$test')).toBe('$test');
    expect(titlecase('#123')).toBe('#123');
  });
});
