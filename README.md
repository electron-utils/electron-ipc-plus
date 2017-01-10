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
const ipcPlus = require('electron-ipc-plus');

ipcPlus.sendToWin(browserWin, 'app:say-hello', 'hello renderer process!', (err, message) => {
  console.log(`renderer replied: ${message}`);
});
```

**renderer process**

```javascript
const ipcPlus = require('electron-ipc-plus');

ipcPlus.on('app:say-hello', (event, message) => {
  console.log(`main process said: ${message}`);

  setTimeout(() => {
    event.reply('hi main process!');
  }, 500);
});
```

### Send request from renderer process to main process and wait for reply.

**renderer process**

```javascript
const ipcPlus = require('electron-ipc-plus');

ipcPlus.sendToMain(browserWin, 'app:say-hello', 'hello main process!', (err, message) => {
  console.log(`main replied: ${message}`);
});
```

**main process**

```javascript
const ipcPlus = require('electron-ipc-plus');

ipcPlus.on('app:say-hello', (event, message) => {
  console.log(`renderer process said: ${message}`);

  setTimeout(() => {
    event.reply('hi renderer process!');
  }, 500);
});
```

## API

TODO

## License

MIT © 2016 Johnny Wu
