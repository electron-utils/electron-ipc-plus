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

  ipcPlus.on('app:hello', (event, ...args) => {
    global.ipcCalls.push(`app:hello ${args}`);
    event.reply(`${args} received`);
  });
  ipcPlus.on('app:hello-error', (event, ...args) => {
    global.ipcCalls.push(`app:hello ${args}`);
    event.reply(new Error('user'), `${args} failed`);
  });

  ipcPlus.sendToMain('app:hello', (err, msg) => {
    global.ipcCalls.push(`${msg}`);
  });
  ipcPlus.sendToMain('app:hello', 'alpha', (err, msg) => {
    global.ipcCalls.push(`${msg}`);
  });
  ipcPlus.sendToMain('app:hello', 'beta', (err, msg) => {
    global.ipcCalls.push(`${msg}`);
  });
  ipcPlus.sendToMain('app:hello', 'cell', (err, msg) => {
    global.ipcCalls.push(`${msg}`);
  });
  ipcPlus.sendToMain('app:hello-error', 'foobar', (err, msg) => {
    global.ipcCalls.push(`${err}, ${msg}`);
  });
});
