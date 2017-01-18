const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

let win, win2;
let readyCnt = 0;

function domReady () {
  ++readyCnt;

  if ( readyCnt === 2 ) {
    ipcPlus.sendToWin(win, 'app:hello', 'foobar', (err, msg) => {
      if ( err ) {
        global.ipcCalls.push(`${err.code}, ${msg}`);
        return;
      }
      global.ipcCalls.push(`${msg}`);
    });

    setTimeout(() => {
      win.close();
    }, 100);
  }
}

app.on('ready', function () {
  win = new BrowserWindow({
    x: 300,
    y: 100,
    width: 200,
    height: 200
  });
  win.loadURL('file://' + __dirname + '/index.html');
  win.webContents.once('dom-ready', domReady);

  win2 = new BrowserWindow({
    x: 300 + 210,
    y: 100,
    width: 200,
    height: 200
  });
  win2.loadURL('file://' + __dirname + '/index2.html');
  win2.webContents.once('dom-ready', domReady);
});
