/**
 * @fileoverview Initialization for all the general gulp tasks.
 */

var gulp = require('gulp');
var yargs = require('yargs');
var path = require('path');
var runSequence = require('run-sequence');

const args = {
  showProccesedFiles: yargs.argv.show || false,
  all: yargs.argv.all,
  path: yargs.argv.path,
  entire: yargs.argv.entire
};

global.args = args;

global.rootRequire = function(name) {
  return require(path.join(__dirname, name));
};

// Register other tasks from separate files
var gulpLintJsTasksRegister = rootRequire('./gulp/tasks/lint-js');
gulpLintJsTasksRegister(gulp);

// Lint our code
gulp.task('lint', function(callback) {
  // We run the lints using the run-sequence so we won't get all the errors all mixed up with
  // each other in case we'll have more lint tasks in the future
  runSequence(['js:lint'], function() {
    callback();
  });
});

// Runs every time we'll git commit. Requires the 'guppy-pre-commit' package to be installed
gulp.task('pre-commit', ['lint']);
