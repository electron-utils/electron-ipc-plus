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
    event.reply('hi main process!');
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
    event.reply('hi renderer process!');
  }, 500);
});
```

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

TODO...

### ipcPlusM.sendToMainSync(message[, ...args])

TODO...

### ipcPlusM.sendToMain(message[, ...args, callback, timeout])

TODO...

### ipcPlusM.sendToWin(win, message[, ...args, callback, timeout])

TODO...

### ipcPlusM.cancelRequest(sessionId)

TODO...

## Properties

### ipcPlusM.debug

Turn on/off the debug code in the module.

------

**Renderer Process**

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

TODO...

### ipcPlusR.sendToMainSync(message[, ...args])

TODO...

### ipcPlusR.sendToMain(message[, ...args, callback, timeout])

TODO...

### ipcPlusR.cancelRequest(sessionId)

TODO...

## Properties

### ipcPlusR.debug

Turn on/off the debug code in the module.

## License

MIT © 2017 Johnny Wu
