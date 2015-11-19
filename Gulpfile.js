/**
 * @fileoverview Initialization for all the gulp tasks.
 */

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var config = require('./gulp/config');
var kazazGulpUtils = require('./gulp/gulp-kazaz-utils');
var git = require('gulp-git');
var yargs = require('yargs');
var gulpdebug = require('gulp-debug');
var gulpif = require('gulp-if');

const args = yargs.argv;
const showProccesedFiles = args.show || false;

/**
 * Runs eslint
 * @param {Array} files - an array of file paths to lint
 * @param {Function} callback - the callback for the finish of the task
 */
function runEslint(files, callback) {
  var passedLinting = true;
  var stream = gulp.src(files)
    .pipe(gulpif(showProccesedFiles, gulpdebug()))
    .pipe(eslint(config.eslintOptions))
    // Prints to the console each row of an error
    .pipe(eslint.format('stylish'))
    // Reports the task as failed if errors were found (so the git commit will fail)
    .pipe(eslint.failAfterError());

  stream.on('error', function(error) {
    passedLinting = false;
    callback(error);
  });

  stream.on('finish', function() {
    if (passedLinting) {
      callback();
    }
  });

  return stream;
}

// A task for running linting of the js files
gulp.task('lint:js', function(callback) {
  if (args.all) {
    return runEslint(config.sources.allJsFilesExcludePackages, callback);
  }

  git.status({args: '--porcelain', quiet: true}, function(err, stdout) {
    if (err) {
      throw err;
    } else {
      var gitChangedJsFiles = [];
      const rows = stdout.split('\n');
      const matchWorkspaceFilesOptions = {
        filter: '.+\.js$',
        excludeStatuses: ['d']
      };
      rows.forEach(function(row) {
        if (kazazGulpUtils.matchWorkspaceFiles(row, matchWorkspaceFilesOptions)) {
          var statusParts = row.split(' ');
          var filePath = statusParts[statusParts.length - 1];
          gitChangedJsFiles.push(filePath);
        }
      });

      runEslint(gitChangedJsFiles, callback);
    }
  });
});

// Creates a 'lint' task in case we'll want other stuff than lint:js in the linting process in
// the future
gulp.task('lint', ['lint:js']);

// Runs every time we'll git commit. Requires the 'guppy-pre-commit' package to be installed
gulp.task('pre-commit', ['lint']);
