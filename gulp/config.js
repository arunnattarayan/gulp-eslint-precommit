/**
* @fileoverview Configuration for all the gulp tasks.
*/

var kazazGulpUtils = rootRequire('./gulp/gulp-kazaz-utils');

const config = {};
config.paths = {
  allJsFiles: './**/*.js',
  allMinJsFiles: './**/*.min.js',
  nodeModulesFiles: './**/node_modules/**'
};

config.eslintOptions = {};
config.eslintOptions.globals = {
  jQuery: false,
  $: true,
  THREE: true,
  _: true,
  require: true,
  rootRequire: true,
  args: true
};

config.eslintOptions.rules = {
  // Making jsdoc issue an error instead of a warning
  'require-jsdoc': 2,
  'max-len': [2, 120],
  'space-before-function-paren': 0,
  'space-before-blocks': 0,
  'indent': [2, 2],
  'quotes': 0
};

config.eslintOptions.envs = {
  browser: true
};

// Shows a warning when eslint ignores a file - which means we are loading a file that shouldn't
// have been loaded in the first place. Fixing it could result with better performance
config.eslintOptions.warnFileIgnored = true;
config.eslintOptions.fix = false;

config.eslintOptions.quiet = kazazGulpUtils.filterEslintLines;

config.sources = {
  allJsFilesExcludePackages: ['!' + config.paths.allMinJsFiles, '!' + config.paths.nodeModulesFiles,
  config.paths.allJsFiles]
};

module.exports = config;
