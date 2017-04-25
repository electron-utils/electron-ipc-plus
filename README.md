# electron-ipc-plus

[![Linux Build Status](https://travis-ci.org/electron-utils/electron-ipc-plus.svg?branch=master)](https://travis-ci.org/electron-utils/electron-ipc-plus)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/crnftwhvfxyldw75?svg=true)](https://ci.appveyor.com/project/jwu/electron-ipc-plus)
[![Dependency Status](https://david-dm.org/electron-utils/electron-ipc-plus.svg)](https://david-dm.org/electron-utils/electron-ipc-plus)
[![devDependency Status](https://david-dm.org/electron-utils/electron-ipc-plus/dev-status.svg)](https://david-dm.org/electron-utils/electron-ipc-plus#info=devDependencies)

Improved IPC for Electron

## Features

 - Enhance IPC Programming Experience
 - Allow sending ipc message to specific window
 - Allow sending ipc request and waiting for the reply in callback function

## Install

```bash
npm install --save electron-ipc-plus
```

## Run The Example

```bash
npm start examples/${name}
```

## Usage

### Send request from main process to renderer process and wait for reply.

**main process**

```javascript
const ipcPlusM = require('electron-ipc-plus');

ipcPlusM.sendToWin(browserWin, 'app:say-hello', 'hello renderer process!', (err, message) => {
  console.log(`renderer replied: ${message}`);
});
```

**renderer process**

```javascript
const ipcPlusR = require('electron-ipc-plus');

ipcPlusR.on('app:say-hello', (event, message) => {
  console.log(`main process said: ${message}`);

  setTimeout(() => {
    event.reply(null, 'hi main process!');
  }, 500);
});
```

### Send request from renderer process to main process and wait for reply.

**renderer process**

```javascript
const ipcPlusR = require('electron-ipc-plus');

ipcPlusR.sendToMain('app:say-hello', 'hello main process!', (err, message) => {
  console.log(`main replied: ${message}`);
});
```

**main process**

```javascript
const ipcPlusM = require('electron-ipc-plus');

ipcPlusM.on('app:say-hello', (event, message) => {
  console.log(`renderer process said: ${message}`);

  setTimeout(() => {
    event.reply(null, 'hi renderer process!');
  }, 500);
});
```

## FAQ

### How can I know if an IPC is waiting for reply?

Just check if `event.reply` exists:

```javascript
ipcMain.on('app:say-hello', (event, message) => {
  if ( event.reply ) {
    event.reply(null, 'hi renderer process!');
  }
});
```

### Can I reply a message for multiple times?

Only the first reply will be handled, after that the session will be closed and the rest of replies will be ignored.

### What happen when the window closed and I still waiting the reply from it.

An error with the code `'EWINCLOSED'` will be sent to your reply handler.

```javascript
ipcPlus.sendToWin(win, 'app:say-hello', (err, message) => {
  if ( err && err.code === 'EWINCLOSED' ) {
    console.error('Window closed');
  }
});
```

### What happen when the reply is timed out.

An error with the code `'ETIMEDOUT'` will be sent to your reply handler.

```javascript
ipcPlus.sendToWin(win, 'app:say-hello', (err, message) => {
  if ( err && err.code === 'ETIMEDOUT' ) {
    console.error('Target failed to reply you: timedout for 100ms');
  }
}, 100);
```

## Known Issues

### ipcPlus.sendToWin could leave wild sessions in main process when the window reload.

I try to solve this problem by the code below:

```javascript
app.on('browser-window-created', (event, browserWin) => {
  // close all session once the window closed
  browserWin.webContents.once('did-navigate', () => {
    _closeAllSessionsInWin(browserWin);
  });
});
```

The problem is 'did-navigate' will be triggerred at the first time we open the window and I disable the above solution and leave this to user.
Currently the best way to solve it is wrapping your own reload function, and manually close all sessions in that wrapped function.

### Different versions of electron-ipc-plus.

When running an Electron app that has several modules depends on different version of `electron-ipc-plus`,
we will receive a warning message.

## API Reference

  - [Module: ipcPlus (main process)](docs/ipc-main.md)
  - [Module: ipcPlus (renderer process)](docs/ipc-renderer.md)

## License

MIT © 2017 Johnny Wu
