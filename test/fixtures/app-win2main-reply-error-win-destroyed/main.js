const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

let win, win2;
app.on('ready', function () {
  win = new BrowserWindow({
    x: 300,
    y: 100,
    width: 200,
    height: 200
  });
  win.loadURL('file://' + __dirname + '/index.html');

  win2 = new BrowserWindow({
    x: 300 + 210,
    y: 100,
    width: 200,
    height: 200
  });
  win2.loadURL('file://' + __dirname + '/index2.html');
});

ipcPlus.on('app:hello', (event, ...args) => {
  win.close();

  global.ipcCalls.push(`app:hello ${args}`);
  setTimeout(() => {
    event.reply(null, `${args} received`);
  }, 300);
});
