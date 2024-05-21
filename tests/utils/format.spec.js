import formatCode from '../../utils/format';
import prettier from 'prettier';

jest.mock('prettier', () => ({
  format: jest.fn(),
}));

describe('formatCode function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should format unformatted text using specified parser', async () => {
    const unformattedText = 'function add(a,b){return a+b}';
    const parser = 'babel';
    const formattedText = 'function add(a, b) {\n  return a + b;\n}';

    prettier.format.mockResolvedValue(formattedText);

    const result = await formatCode(unformattedText);

    expect(prettier.format).toHaveBeenCalledWith(unformattedText, {
      parser: parser,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,
      arrowParens: 'always',
      endOfLine: 'auto',
    });

    expect(result).toBe(formattedText);
  });

  it('should return unformatted text if formatting fails', async () => {
    const unformattedText = 'function add(a,b){return a+b}';
    const parser = 'babel';

    prettier.format.mockRejectedValue(new Error('Formatting error'));

    const result = await formatCode(unformattedText, parser);

    expect(result).toBe(unformattedText);
  });
});
