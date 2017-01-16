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
npm install electron-ipc
```

Run the example:

```bash
npm start example
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

ipcPlusR.sendToMain(browserWin, 'app:say-hello', 'hello main process!', (err, message) => {
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

## FAQs

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

## API

**Main Process**

### Methods

### ipcPlusM.option(opts)

  - `opts` object
    - `excludeSelf` boolean - exclude send ipc message to main process when calling `ipcPlusM.sendToAll`.

Ipc option used in `ipcPlusM.sendToAll` and `ipcPlusM.sendToWins`.

### ipcPlusM.sendToAll(message[, ...args, option])

  - `message` string - Ipc message.
  - `...args` ... - Whatever arguments the message needs.
  - `option` object - You can indicate the last argument as an IPC option by `ipcPlusM.option({...})`.

Send `message` with `...args` to all opened window and to main process asynchronously.

### ipcPlusM.sendToWins(message[, ...args, option])

  - `message` string - Ipc message.
  - `...args` ... - Whatever arguments the message needs.
  - `option` object - You can indicate the last argument as an IPC option by `ipcPlusM.option({...})`.

Send `message` with `...args` to all opened windows asynchronously. The renderer process can handle it by listening to the message through the `electron.ipcRenderer` or `ipcPlus` module.

Example:

**Send IPC message (main process)**

```javascript
const ipcPlusM = require('electron-ipc-plus');

ipcPlusM.sendToWins('foobar:say-hello', 'Hello World!');
```

**Receive IPC message (renderer process)**

```html
<html>
  <body>
    <script>
      const {ipcRenderer} = require('electron');

      ipcRenderer.on('foobar:say-hello', (event, text) => {
        console.log(text);  // Prints "Hello World!"
      });
    </script>
  </body>
</html>
```

### ipcPlusM.sendToMain(message[, ...args, callback, timeout])

 - `message` string - Ipc message.
 - `...args` ... - Whatever arguments the message needs.
 - `callback` function - You can specify a callback function to receive IPC reply at the last or the 2nd last argument.
 - `timeout` number - You can specify a timeout for the callback at the last argument. If no timeout specified, it will be 5000ms.

Returns `number` - If we have callback function, a session ID will returned.

Example:

**Send IPC message (main process)**

```javascript
const ipcPlusM = require('electron-ipc-plus');

ipcPlusM.sendToMain('foobar:say-hello', (err, msg) => {
  if ( err.code === 'ETIMEOUT' ) {
    console.error('Timeout for ipc message foobar:say-hello');
    return;
  }

  console.log(`foobar replied: ${msg}`);
});
```

**Receive and Reply IPC message (main process)**

```javascript
const {ipcMain} = require('electron');

ipcMain.on('foobar:say-hello', event => {
  event.reply(null, 'Hi');
});
```

### ipcPlusM.sendToWin(win, message[, ...args, callback, timeout])

 - `win` BrowserWindow
 - `message` string - Ipc message.
 - `...args` ... - Whatever arguments the message needs.
 - `callback` function - You can specify a callback function to receive IPC reply at the last or the 2nd last argument.
 - `timeout` number - You can specify a timeout for the callback at the last argument. If no timeout specified, it will be 5000ms.

Returns `number` - If we have callback function, a session ID will returned.

Example:

**Send IPC message (main process)**

```javascript
const ipcPlusM = require('electron-ipc-plus');

ipcPlusM.sendToMain('foobar:say-hello', (err, msg) => {
  if ( err.code === 'ETIMEOUT' ) {
    console.error('Timeout for ipc message foobar:say-hello');
    return;
  }

  console.log(`foobar replied: ${msg}`);
});
```

**Receive and Reply IPC message (renderer process)**

```javascript
const {ipcRenderer} = require('electron');

ipcRenderer.on('foobar:say-hello', event => {
  event.reply(null, 'Hi');
});
```

### ipcPlusM.cancelRequest(sessionId)

  - `sessionId` number - The session ID.

Cancel request sent to main or renderer process via `ipcPlusM.sendToMain` or `ipcPlusM.sendToWin`.

## Properties

### ipcPlusM.debug

Turn on/off the debug information. No use in current version.

------

**Renderer Process**

## Methods

### ipcPlusR.option(opts)

  - `opts` object
    - `excludeSelf` boolean - exclude send ipc message to main process when calling `ipcPlusR.sendToAll`.

Ipc option used in `ipcPlusR.sendToAll` and `ipcPlusR.sendToWins`.

### ipcPlusR.sendToAll(message[, ...args, option])

  - `message` string - Ipc message.
  - `...args` ... - Whatever arguments the message needs.
  - `option` object - You can indicate the last argument as an IPC option by `ipcPlusR.option({...})`.

Send `message` with `...args` to all opened window and to main process asynchronously.

### ipcPlusR.sendToWins(message[, ...args, option])

  - `message` string - Ipc message.
  - `...args` ... - Whatever arguments the message needs.
  - `option` object - You can indicate the last argument as an IPC option by `ipcPlusR.option({...})`.

Send `message` with `...args` to all opened windows asynchronously. The renderer process can handle it by listening to the message through the `electron.ipcRenderer` or `ipcPlus` module.

Example:

**Send IPC message (renderer process)**

```javascript
const ipcPlusR = require('electron-ipc-plus');

ipcPlusR.sendToWins('foobar:say-hello', 'Hello World!');
```

### ipcPlusR.sendToMainSync(message[, ...args])

  - `message` string - Ipc message.
  - `...args` ... - Whatever arguments the message needs.

Returns ...: Whatever returns from main process.

Send `message` with `...args` to main process synchronously. (This is same as `electron.ipcRenderer.sendSync`).

### ipcPlusR.sendToMain(message[, ...args, callback, timeout])

 - `message` string - Ipc message.
 - `...args` ... - Whatever arguments the message needs.
 - `callback` function - You can specify a callback function to receive IPC reply at the last or the 2nd last argument.
 - `timeout` number - You can specify a timeout for the callback at the last argument. If no timeout specified, it will be 5000ms.

Returns `number` - If we have callback function, a session ID will returned.

Example:

**Send IPC message (renderer process)**

```javascript
const ipcPlusR = require('electron-ipc-plus');

ipcPlusR.sendToMain('foobar:say-hello', (err, msg) => {
  if ( err.code === 'ETIMEOUT' ) {
    console.error('Timeout for ipc message foobar:say-hello');
    return;
  }

  console.log(`foobar replied: ${msg}`);
});
```

**Receive and Reply IPC message (main process)**

```javascript
const {ipcRenderer} = require('electron');

ipcRenderer.on('foobar:say-hello', event => {
  event.reply(null, 'Hi');
});
```

### ipcPlusR.cancelRequest(sessionId)

  - `sessionId` number - The session ID.

Cancel request sent to main process via `ipcPlusR.sendToMain`.

## Properties

### ipcPlusR.debug

Turn on/off the debug information. No use in current version.

## License

MIT © 2017 Johnny Wu
