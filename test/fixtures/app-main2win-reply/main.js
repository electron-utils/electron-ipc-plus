const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

let readyCnt = 0;
let maxWins = 3;
let wins = [];

function domReady () {
  ++readyCnt;

  if ( readyCnt === maxWins ) {
    ipcPlus.sendToWin(wins[0], 'app:hello', (err, msg) => {
      if ( err ) {
        global.ipcCalls.push(`${err}, ${msg}`);
        return;
      }
      global.ipcCalls.push(`${msg}`);
    });
    ipcPlus.sendToWin(wins[0], 'app:hello', 'alpha', (err, msg) => {
      if ( err ) {
        global.ipcCalls.push(`${err}, ${msg}`);
        return;
      }
      global.ipcCalls.push(`${msg}`);
    });

    ipcPlus.sendToWin(wins[1], 'app:hello', (err, msg) => {
      if ( err ) {
        global.ipcCalls.push(`${err}, ${msg}`);
        return;
      }
      global.ipcCalls.push(`${msg}`);
    });
    ipcPlus.sendToWin(wins[1], 'app:hello', 'beta', (err, msg) => {
      if ( err ) {
        global.ipcCalls.push(`${err}, ${msg}`);
        return;
      }
      global.ipcCalls.push(`${msg}`);
    });

    ipcPlus.sendToWin(wins[2], 'app:hello', (err, msg) => {
      if ( err ) {
        global.ipcCalls.push(`${err}, ${msg}`);
        return;
      }
      global.ipcCalls.push(`${msg}`);
    });
    ipcPlus.sendToWin(wins[2], 'app:hello', 'cell', (err, msg) => {
      if ( err ) {
        global.ipcCalls.push(`${err}, ${msg}`);
        return;
      }
      global.ipcCalls.push(`${msg}`);
    });
  }
}

app.on('ready', function () {
  for ( let i = 0; i < maxWins; ++i ) {
    let win = new BrowserWindow({
      x: 100 + 210*i,
      y: 100,
      width: 200,
      height: 200
    });
    win.loadURL('file://' + __dirname + '/index.html');
    win.webContents.once('dom-ready', domReady);

    wins.push(win);
  }
});
