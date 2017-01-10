const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

let readyCnt = 0;
let maxWins = 3;
let wins = [];

function domReady () {
  ++readyCnt;

  if ( readyCnt === maxWins ) {
    ipcPlus.sendToAll('app:hello');
    ipcPlus.sendToAll('app:hello', 'alpha');
    ipcPlus.sendToAll('app:hello', 'beta');
    ipcPlus.sendToAll('app:hello', 'cell');
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

ipcPlus.on('app:hello', (event, ...args) => {
  global.ipcCalls.push(`app:hello ${args}`);
});
