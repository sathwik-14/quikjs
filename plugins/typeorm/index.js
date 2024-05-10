const type = (input) => {
  switch (input.toLowerCase()) {
    case 'string':
      return 'String';
    case 'integer':
      return 'Number';
    case 'float':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'Date';
    case 'uuid':
      return 'String';
    case 'text':
      return 'String';
    case 'json':
      return 'Object';
    case 'enum':
      return 'Enum';
    case 'array':
      return 'Array';
    case 'binary':
      return 'Buffer';
    case 'decimal':
      return 'Number';
    default:
      return 'Unknown';
  }
};

export default {
  type,
};
