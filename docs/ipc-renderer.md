# Module: ipcPlus (renderer process)

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
  if ( err && err.code === 'ETIMEOUT' ) {
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