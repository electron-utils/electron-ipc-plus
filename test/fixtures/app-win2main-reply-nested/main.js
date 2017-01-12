const {app, BrowserWindow} = require('electron');
const ipcPlus = require('../../../index.js');

global.ipcCalls = [];

app.on('ready', function () {
  let win = new BrowserWindow({
    x: 300,
    y: 100,
    width: 200,
    height: 200
  });
  win.loadURL('file://' + __dirname + '/index.html');
});

ipcPlus.on('app:hello', (event, ...args) => {
  global.ipcCalls.push(`app:hello ${args}`);
  event.reply(null, `${args} received`);
});

ipcPlus.on('app:hello-nested', (event, ...args) => {
  global.ipcCalls.push(`app:hello-nested ${args}`);
  event.reply(null, `${args} received`);
});
