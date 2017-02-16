const {app, BrowserWindow} = require('electron');
const foo = require('foo');
const bar = require('bar');

let win;

app.on('ready', function () {
  // win
  win = new BrowserWindow({
    center: true,
    width: 400,
    height: 300,
    x: 100,
    y: 100,
    backgroundColor: '#09f',
  });
  win.loadURL('file://' + __dirname + '/index.html');
});

foo.ipcPlus.on('app:hello', event => {
  console.log('Received from renderer');
  event.reply(null, 'Hello World');
});
