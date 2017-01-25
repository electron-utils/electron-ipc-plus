'use strict';

let common = {};

common._wrapError = function (args) {
  if ( args.length === 0 ) {
    return true;
  }

  let first = args[0];
  if ( first === null ) {
    return true;
  }

  if ( first instanceof Error ) {
    first = {
      __error__: true,
      stack: first.stack,
      message: first.message,
      // if this is a system error
      code: first.code,
      errno: first.errno,
      syscall: first.syscall,
    };

    args[0] = first;
    return true;
  }

  // reply invalid-args error
  let err = new Error();
  args.unshift({
    __error__: true,
    stack: err.stack,
    message: 'Invalid argument for event.reply(), first argument must be null or Error',
    code: 'EINVALIDARGS',
  });

  return false;
};

common._unwrapError = function (args) {
  let err = args[0];

  if ( err && err.__error__ ) {
    return err;
  }

  return null;
};

common._popOptions = function (args) {
  let opts = args[args.length - 1];

  if ( opts && typeof opts === 'object' && opts.__ipc__ ) {
    args.pop(); // args.splice(-1,1);
    return opts;
  }

  return null;
};

common._popReplyAndTimeout = function (args) {
  // arguments check
  let reply, timeout;
  let lastArg = args[args.length - 1];

  if (typeof lastArg === 'number') {
    if ( args.length < 2 ) {
      return null;
    }

    timeout = lastArg;
    lastArg = args[args.length - 2];
    if (typeof lastArg !== 'function') {
      return null;
    }

    reply = lastArg;
    args.splice(-2,2);
  } else {
    if (typeof lastArg !== 'function') {
      return null;
    }

    reply = lastArg;
    timeout = 5000;
    args.pop();
  }

  return {
    reply: reply,
    timeout: timeout,
  };
};

/**
 * @method option
 * @param {object} - opts
 * @param {boolean} - opts.excludeSelf
 * @param {boolean} - opts.waitForReply
 * @param {number} - opts.timeout
 *
 * Ipc option used as last arguments in message.
 */
common.option = function (opts) {
  opts.__ipc__ = true;
  return opts;
};

/**
 * @class ErrorTimeout
 */
class ErrorTimeout extends Error {
  /**
   * @param {string} message
   * @param {string} sessionId
   * @param {number} timeout
   */
  constructor ( message, sessionId, timeout ) {
    super(`ipc timeout. message: ${message}, session: ${sessionId}`);

    this.code = 'ETIMEDOUT';
    this.ipc = message;
    this.sessionId = sessionId;
    this.timeout = timeout;
  }
}

/**
 * @class ErrorWinClosed
 */
class ErrorWinClosed extends Error {
  /**
   * @param {string} message
   * @param {string} winID
   */
  constructor ( message, winID ) {
    super(`ipc failed to reply, window ${winID} closed, message: ${message}`);

    this.code = 'EWINCLOSED';
    this.ipc = message;
    this.winID = winID;
  }
}

common.ErrorTimeout = ErrorTimeout;
common.ErrorWinClosed = ErrorWinClosed;

module.exports = common;
