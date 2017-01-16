const {app, BrowserWindow, ipcMain} = require('electron');
const ipcPlus = require('../index.js');

let win0, win1;

app.on('ready', function () {
  // win0
  win0 = new BrowserWindow({
    center: true,
    width: 400,
    height: 300,
    x: 100,
    y: 100,
    backgroundColor: '#09f',
  });
  win0.loadURL('file://' + __dirname + '/index.html');

  // win1
  win1 = new BrowserWindow({
    center: true,
    width: 400,
    height: 300,
    x: 100 + 400 + 50,
    y: 100,
    backgroundColor: '#888',
  });
  win1.loadURL('file://' + __dirname + '/index.html');
});

ipcPlus.on('app:main2all', (event, ...args) => {
  console.log(`received "app:main2all" at main process: ${args}`);
});

ipcPlus.on('app:win2all', (event, ...args) => {
  console.log(`received "app:win2all" at main process: ${args}`);
});

ipcPlus.on('app:win2main-reply', (event, ...args) => {
  console.log(`received "app:win2main-reply" at main process: ${args}, reply: bar after 500ms`);
  setTimeout(() => {
    event.reply(null, 'bar');
  }, 500);
});

ipcPlus.on('app:win2main-reply-error', (event, ...args) => {
  console.log(`received "app:win2main-reply-error" at main process: ${args}, reply: bar after 500ms`);
  setTimeout(() => {
    event.reply(new Error('Hello'));
  }, 500);
});

// ====================
// handle buttons
// ====================

ipcMain.on('btn:main2all', () => {
  console.log('send app:main2all foo, bar');
  ipcPlus.sendToAll('app:main2all', 'foo', 'bar');
});

ipcMain.on('btn:main2all-exclude-self', () => {
  console.log('send app:main2all (exclude-self): foo, bar');
  ipcPlus.sendToAll('app:main2all', 'foo', 'bar', ipcPlus.option({
    excludeSelf: true
  }));
});

ipcMain.on('btn:main2wins', () => {
  console.log('send app:main2wins foo, bar');
  ipcPlus.sendToWins('app:main2wins', 'foo', 'bar');
});

ipcMain.on('btn:main2win', (event) => {
  console.log('send app:main2win foo, bar');
  let win = BrowserWindow.fromWebContents( event.sender );
  ipcPlus.sendToWin(win, 'app:main2win', 'foo', 'bar');
});

ipcMain.on('btn:main2win-reply', (event) => {
  let win = BrowserWindow.fromWebContents( event.sender );
  console.log('send app:main2win-reply foo');
  ipcPlus.sendToWin(win, 'app:main2win-reply', 'foo', (err, ...args) => {
    console.log(`received "app:main2win-reply" at main process: ${args}`);
  });
});
