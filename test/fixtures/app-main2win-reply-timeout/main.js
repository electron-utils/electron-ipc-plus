const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

let win;

function domReady () {
  ipcPlus.sendToWin(win, 'app:hello', (err, msg) => {
    if ( err && err.code === 'ETIMEDOUT' ) {
      global.ipcCalls.push('timeout');
      return;
    }
    global.ipcCalls.push(`${msg}`);
  }, 100);

  ipcPlus.sendToWin(win, 'app:hello', 'alpha', (err, msg) => {
    if ( err && err.code === 'ETIMEDOUT' ) {
      global.ipcCalls.push(`timeout alpha`);
      return;
    }
    global.ipcCalls.push(`${msg}`);
  }, 100);

  ipcPlus.sendToWin(win, 'app:hello', 'beta', (err, msg) => {
    if ( err && err.code === 'ETIMEDOUT' ) {
      global.ipcCalls.push(`timeout beta`);
      return;
    }
    global.ipcCalls.push(`${msg}`);
  }, 100);

  ipcPlus.sendToWin(win, 'app:hello', 'cell', (err, msg) => {
    if ( err && err.code === 'ETIMEDOUT' ) {
      global.ipcCalls.push(`timeout cell`);
      return;
    }
    global.ipcCalls.push(`${msg}`);
  }, 400);
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
