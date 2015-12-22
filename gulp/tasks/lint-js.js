/**
 * @fileoverview Initialization the tasks that are related to the js linting
 */

var eslint = require('gulp-eslint');
var kazazGulpUtils = rootRequire('./gulp/gulp-kazaz-utils');
var gulpdebug = require('gulp-debug');
var gulpif = require('gulp-if');
var git = require('gulp-git');
var config = rootRequire('./gulp/config');
var Q = require('q');

/**
 * Runs eslint
 * @param {Object} gulp - the gulp instance
 * @param {Array} files - an array of file paths to lint
 * @param {Q.Defer} deferred - The deferred to finish the task. Used when --all is undefined
 *
 * @return {Stream} - the stream in case we're not using a deffered
 */
function runEslint(gulp, files, deferred) {
  var passedLinting = true;
  var stream = gulp.src(files)
    .pipe(gulpif(args.showProccesedFiles, gulpdebug()))
    .pipe(eslint(config.eslintOptions))
    // Prints to the console each row of an error
    .pipe(eslint.format('stylish'))
    // Reports the task as failed if errors were found (so the git commit will fail)
    .pipe(eslint.failAfterError());

  stream.on('error', function (error) {
    passedLinting = false;

    if (deferred) {
      deferred.reject(error);
    }
  });

  stream.on('finish', function () {
    if (passedLinting && deferred) {
      deferred.resolve();
    }
  });

  if (!deferred) {
    return stream;
  }
}

/**
 * Initialize the gulp tasks regarding the js linting
 * @param {Object} gulp - the gulp instance
 */
var registerTasks = function registerTasks(gulp) {
  if (gulp) {
    // A task for running linting of the js files
    gulp.task('js:lint', function() {
      // Checks if we want to lint all of the file and not just the changed rows according to git diff command
      if (args.entire || args.all) {
        config.eslintOptions.quiet = undefined;
      }

      if (args.all) {
        return runEslint(gulp, config.sources.allJsFilesExcludePackages);
      }

      var deferred = Q.defer();

      // Checks if we want to lint a specific path instead of all the changed files
      if (args.path){
        kazazGulpUtils.setDiffRowsPerFile([args.path], function () {
          runEslint(gulp, [args.path], deferred);
        });
      } else {
        git.status({args: '--porcelain', quiet: true}, function (err, stdout) {
          if (err) {
            throw err;
          } else {
            var gitChangedJsFiles = [];
            const rows = stdout.split('\n');
            const matchWorkspaceFilesOptions = {
              filter: '.+\.js$',
              excludeStatuses: ['d']
            };
            rows.forEach(function (row) {
              if (kazazGulpUtils.matchWorkspaceFiles(row, matchWorkspaceFilesOptions)) {
                var statusParts = row.split(' ');
                var filePath = statusParts[statusParts.length - 1];
                gitChangedJsFiles.push(filePath);
              }
            });

            kazazGulpUtils.setDiffRowsPerFile(gitChangedJsFiles, function () {
              runEslint(gulp, gitChangedJsFiles, deferred);
            });
          }
        });
      }

      return deferred.promise;
    });
  }
};

module.exports = registerTasks;
