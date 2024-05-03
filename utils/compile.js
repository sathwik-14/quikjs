import Handlebars from 'handlebars';

export default (preCompiledTemplate) => {
  return Handlebars.compile(preCompiledTemplate);
};
