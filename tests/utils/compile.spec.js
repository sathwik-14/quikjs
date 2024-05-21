import compileHandlebarsTemplate from '../../utils/compile';
import Handlebars from 'handlebars';

jest.mock('handlebars', () => ({
  compile: jest.fn(),
}));

describe('compileHandlebarsTemplate function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call Handlebars.compile with the provided preCompiledTemplate', () => {
    const preCompiledTemplate = '<h1>{{title}}</h1>';
    compileHandlebarsTemplate(preCompiledTemplate);
    expect(Handlebars.compile).toHaveBeenCalledWith(preCompiledTemplate);
  });

  it('should return the compiled template function', () => {
    const preCompiledTemplate = '<h1>{{title}}</h1>';
    const compiledTemplateFunction = jest.fn();

    Handlebars.compile.mockReturnValue(compiledTemplateFunction);
    const result = compileHandlebarsTemplate(preCompiledTemplate);
    expect(result).toBe(compiledTemplateFunction);
  });
});
