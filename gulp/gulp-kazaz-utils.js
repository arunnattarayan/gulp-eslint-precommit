/**
 * @fileoverview Utils functions for all the gulp tasks.
 */

var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var git = require('gulp-git');

var kazazGulpUtils = {};
kazazGulpUtils.filesDiffRows = {};

/**
 * Prints to the console
 * @param {String} message - the message to print
 * @param {Object} options - Extra option for the printing (like color)
 */
kazazGulpUtils.print = function print(message, options) {
  if (message) {
    message = JSON.stringify(message);
    const color = options && options.color || 'white';
    gutil.log(gutil.colors[color](message));
  } else {
    gutil.log(gutil.colors.red('Warning! Trying to print an undefined message'));
  }
};

/**
 * The git changed row object.
 * @param {Number} startLine - start line number of the changed rows chunk.
 * @param {Number} endLine - end line number of the changed rows chunk.
 * @constructor
 */
var GitChangedRows = function(startLine, endLine){
  this.startLine = startLine;
  this.endLine = endLine;
};

/**
 * The object to hold all the changed rows for a file.
 * @constructor
 */
var GitFileChangedRows = function(){
  var that = this;
  that.rows = [];

  /**
   * Adds a new GitChangedRows object to the array of changed rows.
   * @param {Array} changedRows - the row diff object.
   */
  that.add = function (changedRows){
    that.rows.push(changedRows);
  };

  /**
   * Returns if the current line number is within the lines that changed.
   * @param {Number} lintLineNumber - the line to check.
   * @return {boolean} - if the line is considered to be changed.
   */
  that.shouldReportError = function (lintLineNumber){
    var shouldQuiet = false;
    that.rows.every(function(row){
      if (lintLineNumber >= row.startLine && lintLineNumber <= row.endLine) {
        shouldQuiet = true;
        return false;
      }

      return true;
    });

    return shouldQuiet;
  };
};

/**
 * Parse the git diff command to extract te rows that has been changed.
 * @param {String} filePath - the file that the git diff was performed on.
 * @param {Error} err - error in the git diff command.
 * @param {String} stdout - the output of the git diff command.
 */
function extractGitDiffRows(filePath, err, stdout){
  if (!err) {
    var gitFileChangedRows = kazazGulpUtils.filesDiffRows[filePath] || new GitFileChangedRows();
    var diffLinesRegexp = /@@(.*?)@@/g;
    var match = diffLinesRegexp.exec(stdout);

    // Go over all the matching row changes
    while (match) {
      try {
        var row = match[0];
        var rowsChangedLines = row.split(' ');
        var newRows = rowsChangedLines[2];
        var newRowsData = newRows.split(',');

        // Removes the '+' sign from the start row string
        var newRowsStartLine = newRowsData[0].substring(1);
        newRowsStartLine = parseInt(newRowsStartLine, 10);
        var newRowsCount;

        // Checks the end case that only 1 row was added (the start row), so we don't have any
        // count of added rows beyond the start row
        if (newRowsData.length === 1) {
          newRowsCount = 0;
        } else {
          newRowsCount = parseInt(newRowsData[1], 10);
        }

        var changedRow = new GitChangedRows(newRowsStartLine, newRowsStartLine + newRowsCount);
        gitFileChangedRows.add(changedRow);
      } catch (error) {
      }

      match = diffLinesRegexp.exec(stdout);
    }

    kazazGulpUtils.filesDiffRows[filePath] = gitFileChangedRows;
  }
}

kazazGulpUtils.setDiffRowsPerFile = function (filePaths, cb) {
  kazazGulpUtils.filesDiffRows = {};
  var filesFinished = 0;

  if (filePaths.length === 0){
    cb();
  } else {
    filePaths.forEach(function (filePath) {
      // If we didn't do the git diff yet
      if (kazazGulpUtils.filesDiffRows[filePath] === undefined) {
        var commandDiff = 'diff -U0 ' + filePath;
        var commandDiffStaged = 'diff --staged -U0 ' + filePath;

        // Unstaged files
        git.exec({args: commandDiff, quiet: true}, function (err, stdout) {
          extractGitDiffRows(filePath, err, stdout);

          // Staged Files
          git.exec({args: commandDiffStaged, quiet: true}, function (err, stdout) {
            extractGitDiffRows(filePath, err, stdout);
            filesFinished += 1;

            // Checks if we've finished all the diffs
            if (filesFinished === filePaths.length) {
              cb();
            }
          });
        });
      }
    });
  }
};

/**
 * Gets items within a path directory
 * @param {String} dir - The directory to look inside of
 * @param {Object} options - set the type of items (all / directory)
 *
 * @return {Array} - the array of items found
 */
kazazGulpUtils.getItems = function getItems(dir, options) {
  options = options || {directory: true};
  var items;

  if (options.all) {
    items = fs.readdirSync(dir);
  } else {
    items = fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory() && options.directory;
      });
  }

  return items;
};

/**
 * Matches 'git status --porcelain' with a given filters
 * @param {String} statusRow - the 'git status --porcelain' status row
 * @param {Object} options - Extra option for the filtering (like excludeStatuses, filter)
 *
 * @return {Boolean} - If the file matches the workspace changed file (staged and unstaged)
 */
kazazGulpUtils.matchWorkspaceFiles = function matchWorkspaceFiles(statusRow, options) {
  var excludeStatuses = options.excludeStatuses;
  var filter = options.filter;
  var isMatched = true;

  if (statusRow && statusRow !== '') {
    var stagedStatus = statusRow[0].toUpperCase();

    // Why are we checking also the unstaged status? Didn't we say that the package 'git-pre-commit'
    // (https://www.npmjs.com/package/git-pre-commit) is taking care of it for us by stashing it?
    // Well it does, but just in case someone don't want to use it I kept the handling on the unstaged
    // status here. Just in case :-)
    // (If you are using 'git-pre-commit' then you can remove the unstaged status checks)
    var unStagedStatus = statusRow[1].toUpperCase();

    excludeStatuses.forEach(function(status) {
      status = status.toUpperCase();
      if (stagedStatus === status || unStagedStatus === status) {
        isMatched = false;
        return false;
      }
    });

    if (isMatched && filter) {
      const filterRegex = new RegExp(filter, 'gi');
      isMatched = filterRegex.test(statusRow);
    }
  } else {
    isMatched = false;
  }

  return isMatched;
};

/**
 * Filter all the lines that we haven't worked on in this commit. Used for 'quiet' mode of eslint.
 * @param {Object} message - the message object of the eslint error
 *
 * Could also get index, list parameter (in that order)
 *
 * @return {Boolean} - if the message should be part of the eslint results.
 */
kazazGulpUtils.filterEslintLines = function filterEslintLines(message) {
  var line = message.line;
  var fileChangesRows = kazazGulpUtils.filesDiffRows[this.filePath];

  // 'this' is the eslint instance
  if (fileChangesRows) {
    return fileChangesRows.shouldReportError(line);
  }

  return false;
};

module.exports = kazazGulpUtils;
