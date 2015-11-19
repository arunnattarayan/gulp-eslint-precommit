/**
 * @fileoverview Utils functions for all the gulp tasks.
 */

var gutil = require('gulp-util');

const kazazGulpUtils = {
  /**
   * Prints to the console
   * @param {String} message - the message to print
   * @param {Object} options - Extra option for the printing (like color)
   */
  print: function print(message, options) {
    if (message) {
      message = JSON.stringify(message);
      const color = options && options.color || 'white';
      gutil.log(gutil.colors[color](message));
    } else {
      gutil.log(gutil.colors.red('Warning! Trying to print an undefined message'));
    }
  },
  /**
   * Checks if the current git status row matches the filtering
   * @param {String} statusRow - the row string produced by git status
   * @param {Object} options - Extra filtering options (filter, excludeStatuses)
   *
   * @returns {Boolean} if the row matches or not
   */
  matchWorkspaceFiles: function matchWorkspaceFiles(statusRow, options) {
    var excludeStatuses = options.excludeStatuses;
    var filter = options.filter;
    var isMatched = true;

    if (statusRow && statusRow !== '') {
      var stagedStatus = statusRow[0].toUpperCase();
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
  }
};

module.exports = kazazGulpUtils;
