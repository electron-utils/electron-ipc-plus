const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

let win;

function domReady () {
  ipcPlus.sendToWin(win, 'app:hello', (err, msg) => {
    if ( err ) {
      global.ipcCalls.push(`${err}, ${msg}`);
      return;
    }
    global.ipcCalls.push(`${msg}`);
  });
  ipcPlus.sendToWin(win, 'app:hello', 'alpha', (err, msg) => {
    if ( err ) {
      global.ipcCalls.push(`${err}, ${msg}`);
      return;
    }
    global.ipcCalls.push(`${msg}`);
  });
  ipcPlus.sendToWin(win, 'app:hello', 'beta', (err, msg) => {
    if ( err ) {
      global.ipcCalls.push(`${err}, ${msg}`);
      return;
    }
    global.ipcCalls.push(`${msg}`);
  });
  ipcPlus.sendToWin(win, 'app:hello', 'cell', (err, msg) => {
    if ( err ) {
      global.ipcCalls.push(`${err}, ${msg}`);
      return;
    }
    global.ipcCalls.push(`${msg}`);
  });
}

app.on('ready', function () {
  win = new BrowserWindow({
    x: 100 + 210,
    y: 100,
    width: 200,
    height: 200
  });
  win.loadURL('file://' + __dirname + '/index.html');
  win.webContents.once('dom-ready', domReady);
});
