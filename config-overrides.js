const path = require('path');

module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.(glsl|vs|fs|vert|frag)$/,
    exclude: /node_modules/,
    use: ['raw-loader', 'glslify-loader'],
  });

  return config;
};