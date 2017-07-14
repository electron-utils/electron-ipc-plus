'use strict';

if ( window.__electron_ipc_plus__ ) {
  console.warn(`A different version of electron-ipc-plus already running in the process: ${window.__electron_ipc_plus__.id}, make sure your dependencies use the same version of electron-ipc-plus.`);
}

/**
 * @module ipcPlus
 */
let ipcPlus = {};
module.exports = ipcPlus;

window.__electron_ipc_plus__ = ipcPlus;

const pkgJson = require('../package.json');
const moduleID = `${pkgJson.name}@${pkgJson.version}`;

// requires
const {remote, ipcRenderer} = require('electron');
const common = require('./common');

// get window id
const winID = remote.getCurrentWindow().id;

let _nextSessionId = 1000;
let _id2sessionInfo = {};
let _debug = false;

let _ErrorTimeout = common.ErrorTimeout;
let _wrapError = common._wrapError;
let _unwrapError = common._unwrapError;
let _popOptions = common._popOptions;
let _popReplyAndTimeout = common._popReplyAndTimeout;
let _ipcOption = common.option;

// ==========================
// exports
// ==========================

/**
 * @property id
 */
ipcPlus.id = moduleID;

// internal uses
ipcPlus.internal = {
  _popReplyAndTimeout,
  _popOptions,
  _wrapError,
  _unwrapError,
  _newSession,
  _closeSession,
};

/**
 * @method option
 * @param {object} opts
 * @param {boolean} opts.excludeSelf - exclude send ipc message to main process when calling `ipcPlusM.sendToAll`.
 * @param {number} [opts.sessionId] - used internally.
 * @param {boolean} [opts.waitForReply] - used internally.
 * @param {number} [opts.timeout] - used internally.
 *
 * Ipc option used in `ipcPlusM.sendToAll` and `ipcPlusM.sendToWins`.
 */
ipcPlus.option = _ipcOption;

/**
 * @method on
 *
 * Same as `ipcRenderer.on`.
 */
ipcPlus.on = ipcRenderer.on.bind(ipcRenderer);

/**
 * @method once
 *
 * Same as `ipcRenderer.once`.
 */
ipcPlus.once = ipcRenderer.once.bind(ipcRenderer);

/**
 * @method removeListener
 *
 * Same as `ipcRenderer.removeListener`.
 */
ipcPlus.removeListener = ipcRenderer.removeListener.bind(ipcRenderer);

/**
 * @method sendToAll
 * @param {string} message - Ipc message.
 * @param {...} [args] - Whatever arguments the message needs.
 * @param {object} [options] - You can indicate the last argument as an IPC option by `ipcPlus.option({...})`.
 *
 * Send `message` with `...args` to all opened window and to main process asynchronously.
 *
 */
ipcPlus.sendToAll = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    console.error('Call to `sendToAll` failed. The message must be a string.');
    return;
  }

  ipcRenderer.send.apply( ipcRenderer, [`${moduleID}:renderer2all`, message, ...args] );
};

/**
 * @method sendToWins
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @param {object} [options] - You can indicate the last argument as an IPC option by `ipcPlus.option({...})`.
 *
 * Send `message` with `...args` to all opened windows asynchronously. The renderer process
 * can handle it by listening to the message through the `ipcRenderer` module.
 */
ipcPlus.sendToWins = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    console.error('Call to `sendToWins` failed. The message must be a string.');
    return;
  }

  ipcRenderer.send.apply( ipcRenderer, [`${moduleID}:renderer2wins`, message, ...args] );
};

/**
 * @method sendToMainSync
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @return {Object} results
 *
 * Send `message` with `...args` to main process synchronized and return a result which is responded from main process
 */
ipcPlus.sendToMainSync = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    console.error('Call to `sendToMainSync` failed. The message must be a string.');
    return;
  }

  return ipcRenderer.sendSync.apply( ipcRenderer, [message, ...args] );
};

/**
 * @method sendToMain
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 *
 * Send `message` with `...args` to main process asynchronously.
 */
ipcPlus.sendToMain = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    console.error('Call to `sendToMain` failed. The message must be a string.');
    return;
  }

  let opts = _popReplyAndTimeout(args);
  let sessionId;

  if ( opts ) {
    sessionId = _newSession(message, `${winID}@renderer`, opts.reply, opts.timeout);

    args = [`${moduleID}:renderer2main`, message, ...args, _ipcOption({
      sessionId: sessionId,
      waitForReply: true,
      timeout: opts.timeout, // this is only used as debug info
    })];
  } else {
    args = [message, ...args];
  }

  ipcRenderer.send.apply( ipcRenderer, args );

  return sessionId;
};

/**
 * @method cancelRequest
 * @param {number} sessionId
 *
 * Cancel request sent to main or renderer process.
 */
ipcPlus.cancelRequest = function (sessionId) {
  _closeSession(sessionId);
};

/**
 * @method _closeAllSessions
 *
 * Force close all sessions.
 * Usually you don't need to call this function. This is for page reload or app relaunch purpose.
 */
ipcPlus._closeAllSessions = function () {
  let ids = Object.keys(_id2sessionInfo);

  for ( let i = 0; i < ids.length; ++i ) {
    let sessionId = ids[i];
    _closeSession (sessionId);
  }
};

/**
 * @property {boolean} debug
 *
 * Turn on/off the debug code in the module.
 */
Object.defineProperty(ipcPlus, 'debug', {
  enumerable: true,
  get () { return _debug; },
  set ( value ) { _debug = value; },
});

// ========================================
// Internal
// ========================================

function _newSession ( message, prefix, fn, timeout ) {
  let sessionId = `${prefix}:${_nextSessionId++}`;
  let timeoutId;

  if ( timeout !== -1 ) {
    timeoutId = setTimeout(() => {
      let info = _id2sessionInfo[sessionId];

      if ( info ) {
        delete _id2sessionInfo[sessionId];

        info.callback(new _ErrorTimeout( message, sessionId, timeout ));
      }

      // DISABLE
      // if ( _debug ) {
      //   console.warn(`ipc timeout. message: ${message}, session: ${sessionId}`);
      // }
    }, timeout);
  }

  _id2sessionInfo[sessionId] = {
    sessionId: sessionId,
    timeoutId: timeoutId,
    callback: fn,
    message: message,
  };

  return sessionId;
}

function _closeSession ( sessionId ) {
  let info = _id2sessionInfo[sessionId];

  if ( info ) {
    delete _id2sessionInfo[sessionId];

    if ( info.timeoutId ) {
      clearTimeout(info.timeoutId);
    }
  }

  return info;
}

function _main2rendererOpts (event, message, ...args) {
  if ( args.length === 0 ) {
    return ipcRenderer.emit( message, event );
  }

  // process waitForReply option
  let opts = _popOptions(args);
  if ( opts && opts.waitForReply ) {
    // NOTE: do not directly use event.sender in event.reply, it will cause Electron devtools crash
    let sender = event.sender;
    let msg = message;
    event.reply = function (...replyArgs) {
      if ( _wrapError(replyArgs) === false ) {
        console.warn(`Invalid argument for event.reply of "${msg}": the first argument must be an instance of Error or null`);
      }

      let replyOpts = _ipcOption({
        sessionId: opts.sessionId
      });
      replyArgs = [`${moduleID}:reply`, ...replyArgs, replyOpts];
      return sender.send.apply( sender, replyArgs );
    };
  }

  // refine the args
  args = [message, event, ...args];
  return ipcRenderer.emit.apply( ipcRenderer, args );
}

// ========================================
// ipcPlus
// ========================================

ipcRenderer.on(`${moduleID}:main2renderer`, (event, message, ...args) => {
  if ( _main2rendererOpts.apply ( null, [event, message, ...args] ) === false ) {
    console.error( `Message "${message}" from main to renderer failed, no response was received.` );
  }
});

ipcRenderer.on(`${moduleID}:reply`, (event, ...args) => {
  let opts = _popOptions(args);

  // create a new Error in current process
  // NOTE: don't do this in _unwrapError, it will make the new Error have wrong stack.
  let err = _unwrapError(args);
  if ( err ) {
    let lines = err.stack.split('\n');
    lines.shift(); // remove the message cause we add it in new Error;

    let newErr = new Error(err.message);
    newErr.stack += '\n\t--------------------\n' + lines.join('\n');
    newErr.code = err.code;
    newErr.code = err.code;
    newErr.errno = err.errno;
    newErr.syscall = err.syscall;

    args[0] = newErr;
  }

  // NOTE: we must close session before it apply, this will prevent window.close() invoked in
  // reply callback will make _closeSession called second times.
  let info = _closeSession(opts.sessionId);
  if (info) {
    info.callback.apply(null, args);
  }
});
