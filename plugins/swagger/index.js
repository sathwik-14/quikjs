import { write } from '../../utils/index.js';
import template from './templates.js';

const setup = (config) => {
  write('swagger.js', template.main(config));
};

export default {
  setup,
};
