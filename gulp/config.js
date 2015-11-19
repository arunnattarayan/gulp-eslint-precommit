/**
 * @fileoverview Configuration for all the gulp tasks.
 */

const config = {
  paths: {
    allJsFiles: './**/*.js',
    allMinJsFiles: './**/*.min.js',
    nodeModulesFiles: './**/node_modules/**'
  },
  eslintOptions: {
    globals: {
      jQuery: false,
      $: true,
      THREE: true,
      _: true
    },
    rules: {
      // Making jsdoc issue an error instead of a warning
      'require-jsdoc': 2,
      // TODO: Kazaz - 17-Nov-2015 - Delete the valid-jsdoc override / change it to 2 after there
      // will be a fix for https://github.com/eslint/eslint/issues/4443
      'valid-jsdoc': 0,
      'max-len': [2, 100]
    },
    envs: {
      browser: true
    },
    // Shows a warning when eslint ignores a file - which means we are loading a file that shouldn't
    // have been loaded in the first place. Fixing it could result with better performance
    warnFileIgnored: true,
    fix: false
  }
};

config.sources = {
  allJsFilesExcludePackages: ['!' + config.paths.allMinJsFiles, '!' +
    '!' + config.paths.nodeModulesFiles, config.paths.allJsFiles]
};

module.exports = config;
