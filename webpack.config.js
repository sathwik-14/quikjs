const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          helperDirs: [path.resolve(__dirname, 'src/helpers')],
          partialDirs: [path.resolve(__dirname, 'src/partials')]
        }
      }
    ]
  }
};
