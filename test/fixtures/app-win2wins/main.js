const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

let readyCnt = 0;
let maxWins = 3;
let wins = [];

function domReady () {
  ++readyCnt;

  if ( readyCnt === maxWins ) {
    ipcPlus.sendToAll('app:all-windows-ready');
  }
}

app.on('ready', function () {
  let i = 0;
  let mainWin = new BrowserWindow({
    x: 100 + 210*i,
    y: 100,
    width: 200,
    height: 200
  });
  mainWin.loadURL('file://' + __dirname + '/send.html');
  mainWin.webContents.once('dom-ready', domReady);

  wins.push(mainWin);

  for ( i = 1; i < maxWins; ++i ) {
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
