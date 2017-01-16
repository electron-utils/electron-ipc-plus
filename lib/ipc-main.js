'use strict';

/**
 * @module ipcPlus
 */
let ipcPlus = {};
module.exports = ipcPlus;

// requires
const {ipcMain, BrowserWindow} = require('electron');
const ipcBase = require('./ipc-base');

let _nextSessionId = 1000;
let _id2sessionInfo = {};
let _debug = false;

let _ErrorTimeout = ipcBase.ErrorTimeout;
let _wrapError = ipcBase._wrapError;
let _unwrapError = ipcBase._unwrapError;
let _popOptions = ipcBase._popOptions;
let _popReplyAndTimeout = ipcBase._popReplyAndTimeout;
let _ipcOption = ipcBase.option;

// ========================================
// exports
// ========================================

/**
 * @method option
 * @param {object} opts
 * @param {boolean} opts.excludeSelf
 * @param {number} [opts.sessionId] - used internally
 * @param {boolean} [opts.waitForReply] - used internally
 * @param {number} [opts.timeout] - used internally
 *
 * Ipc option used as last arguments in message.
 */
ipcPlus.option = _ipcOption;

/**
 * @method on
 *
 * Same as ipcMain.on
 */
ipcPlus.on = ipcMain.on.bind(ipcMain);

/**
 * @method once
 *
 * Same as ipcMain.once
 */
ipcPlus.once = ipcMain.once.bind(ipcMain);

/**
 * @method sendToAll
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options by ipcPlus.option({ excludeSelf: true })
 *
 * Send `message` with `...args` to all opened window and to main process asynchronously.
 */
ipcPlus.sendToAll = function (message, ...args) {
  if (args.length) {
    let excludeSelf = false;
    let opts = _popOptions(args);

    // check options
    if (opts && opts.excludeSelf) {
      excludeSelf = true;
    }

    args = [message, ...args];

    // send
    if (!excludeSelf) {
      _main2main.apply(null, args);
    }
    _send2wins.apply(null, args);

    return;
  }

  _main2main(message);
  _send2wins(message);
};

/**
 * @method sendToWins
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 *
 * Send `message` with `...args` to all opened windows asynchronously. The renderer process
 * can handle it by listening to the message through the `electron.ipcRenderer` or `ipcPlus` module.
 *
 * @example
 * **Send IPC message (main process)**
 *
 * ```js
 * const ipcPlus = require('electron-ipc-plus');
 *
 * ipcPlus.sendToWins('foo:bar', 'Hello World!');
 * ```
 *
 * **Receive IPC message (renderer process)**
 *
 * ```html
 * <html>
 * <body>
 *   <script>
 *     const {ipcRenderer} = require('electron');
 *
 *     ipcRenderer.on('foo:bar', (event, text) => {
 *       console.log(text);  // Prints "Hello World!"
 *     });
 *   </script>
 * </body>
 * </html>
 * ```
 */
ipcPlus.sendToWins = _send2wins;

/**
 * @method sendToMain
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @param {function} [callback] - You can specify a callback function to receive IPC reply at the last or the 2nd last argument.
 * @param {number} [timeout] - You can specify a timeout for the callback at the last argument. If no timeout specified, it will be 5000ms.
 * @return {number} sessionID
 *
 * Send `message` with `...args` to main process asynchronously. It is possible to add a callback as the last or the 2nd last argument
 * to receive replies from the IPC receiver.
 *
 * Example:
 *
 * **Send IPC message (main process)**
 *
 * ```js
 * const ipcPlus = require('electron-ipc-plus');
 *
 * ipcPlus.sendToMain('foobar:say-hello', (err, msg) => {
 *   if ( err.code === 'ETIMEDOUT' ) {
 *     console.error('Timeout for ipc message foobar:say-hello');
 *     return;
 *   }
 *
 *   console.log(`foobar replied: ${msg}`);
 * });
 * ```
 *
 * **Receive and Reply IPC message (main process)**
 *
 * ```js
 * const {ipcMain} = require('electron');
 *
 * ipcMain.on('foobar:say-hello', event => {
 *   event.reply(null, 'Hi');
 * });
 * ```
 */
ipcPlus.sendToMain = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    console.error('Call to `sendToMain` failed. The message must be a string.');
    return;
  }

  let opts = _popReplyAndTimeout(args);
  if ( !opts ) {
    args = [message, ...args];
    if ( _main2main.apply ( null, args ) === false ) {
      console.error( `sendToMain "${message}" failed, no response received.` );
    }
    return;
  }

  let sessionId = _newSession(message, 'main', opts.reply, opts.timeout);

  args = [message, ...args, _ipcOption({
    sessionId: sessionId,
    waitForReply: true,
    timeout: opts.timeout, // this is only used as debug info
  })];

  if ( _main2mainOpts.apply ( null, args ) === false ) {
    console.error( `sendToMain "${message}" failed, no response received.` );
  }

  return sessionId;
};

/**
 * @method sendToWin
 * @param {BrowserWindow} win
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options by ipcPlus.option({ excludeSelf: true })
 *
 * Send `message` with `...args` to specific window.
 */
ipcPlus.sendToWin = function (win, message, ...args) {
  // NOTE: it is possible the webContents is destroyed
  if ( win.webContents.isDestroyed() ) {
    return;
  }

  // TODO: what is win.webContents.isLoading()?
  // should we setInterval to recheck/retry for several times?

  if ( typeof message !== 'string' ) {
    console.error(`Send message failed for '${message}'. The message must be a string`);
    return;
  }

  let opts = _popReplyAndTimeout(args);
  if ( !opts ) {
    args = [win, message, ...args];
    if ( _send2win.apply(null, args) === false ) {
      console.error( `send message "${message}" to window failed. No response was received.` );
    }
    return;
  }

  let sessionId = _newSession(message, `${win.id}@main`, opts.reply, opts.timeout, win);

  //
  args = [win, 'ipc-plus:main2renderer', message, ...args, _ipcOption({
    sessionId: sessionId,
    waitForReply: true,
    timeout: opts.timeout, // this is only used as debug info
  })];
  _send2win.apply(null, args);

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

/**
 * @param {string} message
 * @param {string} prefix - can be 'main', '${winID}@renderer' and so on...
 * @param {function} fn - callback function
 * @param {number} timeout
 * @param {BrowserWindow} [win]
 */
function _newSession ( message, prefix, fn, timeout, win ) {
  // TODO: save win to cachedWins and add closed event for closeSessions relate with the window

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
    win: win,
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

function _send2win (win, ...args) {
  // NOTE: it is possible the webContents is destroyed
  if ( win.webContents.isDestroyed() ) {
    return false;
  }

  // TODO: what if win.webContents.isLoading()?
  // should we setInterval to recheck/retry for several times?

  win.webContents.send.apply(win.webContents, args);

  return true;
}

function _send2wins (message, ...args) {
  args = [message, ...args];

  let winlist = BrowserWindow.getAllWindows();

  for ( let i = 0; i < winlist.length; ++i ) {
    let win = winlist[i];

    // NOTE: it is possible the webContents is destroyed
    if ( win.webContents.isDestroyed() ) {
      continue;
    }

    // TODO: what if win.webContents.isLoading()?
    // should we setInterval to recheck/retry for several times?

    win.webContents.send.apply(win.webContents, args);
  }
}

/**
 * Send `args...` to windows except the excluded
 * @method _main2renderersExclude
 * @param {object} excluded - A [WebContents](https://github.com/atom/electron/blob/master/docs/api/browser-window.md#class-webcontents) object.
 * @param {...*} [args] - whatever arguments the message needs
 */
function _main2renderersExclude (excluded, ...args) {
  let winlist = BrowserWindow.getAllWindows();

  for ( let i = 0; i < winlist.length; ++i ) {
    let win = winlist[i];

    // NOTE: it is possible the webContents is destroyed
    if ( win.webContents.isDestroyed() ) {
      continue;
    }

    // if window excluded
    if ( win.webContents === excluded ) {
      continue;
    }

    // TODO: what if win.webContents.isLoading()?
    // should we setInterval to recheck/retry for several times?

    win.webContents.send.apply(win.webContents, args);
  }
}

function _main2renderers (message, ...args) {
  if ( args.length === 0 ) {
    _send2wins( message );
    return;
  }

  // send
  _send2wins.apply( null, [message, ...args] );
}

function _main2mainOpts (message, ...args) {
  let event = {
    senderType: 'main',
    sender: {
      send: ipcPlus.sendToMain
    }
  };

  if ( args.length === 0 ) {
    return ipcMain.emit( message, event );
  }

  // process waitForReply option
  let opts = _popOptions(args);
  if ( opts && opts.waitForReply ) {
    // NOTE: do not directly use message in event.reply, it will cause Electron devtools crash
    let msg = message;
    event.reply = function (...replyArgs) {
      if ( _wrapError(replyArgs) === false ) {
        console.warn(`Invalid argument for event.reply of "${msg}": the first argument must be an instance of "Error" or "null"`);
      }

      let replyOpts = _ipcOption({
        sessionId: opts.sessionId
      });
      replyArgs = [`ipc-plus:reply`, event, ...replyArgs, replyOpts];
      return ipcMain.emit.apply( ipcMain, replyArgs );
    };
  }

  // insert event as 2nd parameter in args
  args = [message, event, ...args];
  return ipcMain.emit.apply( ipcMain, args );
}

function _main2main (message, ...args) {
  let event = {
    senderType: 'main',
    sender: {
      send: ipcPlus.sendToMain
    }
  };

  if ( args.length === 0 ) {
    return ipcMain.emit( message, event );
  }

  // insert event as 2nd parameter in args
  args = [message, event, ...args];
  return ipcMain.emit.apply( ipcMain, args );
}

function _renderer2mainOpts (event, message, ...args) {
  if ( args.length === 0 ) {
    return ipcMain.emit( message, event );
  }

  // process waitForReply option
  let opts = _popOptions(args);
  if ( opts && opts.waitForReply ) {
    // NOTE: do not directly use `event` and `message` in event.reply, it will cause Electron devtools crash
    let sender = event.sender;
    let msg = message;

    event.reply = function (...replyArgs) {
      // if the sender is invalid (destroyed)
      if ( sender.isDestroyed() ) {
        return;
      }

      if ( _wrapError(replyArgs) === false ) {
        console.warn(`Invalid argument for event.reply of "${msg}": the first argument must be an instance of "Error" or "null"`);
      }

      let replyOpts = _ipcOption({
        sessionId: opts.sessionId
      });
      replyArgs = [`ipc-plus:reply`, ...replyArgs, replyOpts];
      return sender.send.apply( sender, replyArgs );
    };
  }

  // refine the args
  args = [message, event, ...args];
  return ipcMain.emit.apply( ipcMain, args );
}

function _renderer2main (event, message, ...args) {
  if ( args.length === 0 ) {
    return ipcMain.emit( message, event );
  }

  // refine the args
  args = [message, event, ...args];
  return ipcMain.emit.apply( ipcMain, args );
}

function _renderer2renderersOpts (event, message, ...args) {
  // check options
  let opts = _popOptions(args);
  if (opts && opts.excludeSelf) {
    _main2renderersExclude.apply( null, [event.sender, message, ...args] );
    return;
  }

  _main2renderers.apply(null, [message, ...args]);
}

// ========================================
// ipcPlus
// ========================================

ipcMain.on('ipc-plus:renderer2all', (event, message, ...args) => {
  let opts = _popOptions(args);

  _renderer2main.apply(null, [event, message, ...args]);

  if (opts && opts.excludeSelf) {
    _main2renderersExclude.apply( null, [event.sender, message, ...args] );
  } else {
    _main2renderers.apply(null, [message, ...args]);
  }
});

ipcMain.on('ipc-plus:renderer2wins', _renderer2renderersOpts );

ipcMain.on('ipc-plus:renderer2main', (event, message, ...args) => {
  if ( _renderer2mainOpts.apply ( null, [event, message, ...args] ) === false ) {
    console.error( `Message "${message}" from renderer to main failed, no response receieved.` );
  }
});

ipcMain.on('ipc-plus:reply', (event, ...args) => {
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
