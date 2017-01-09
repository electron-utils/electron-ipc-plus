'use strict';

const platform = require('electron-platform');

let ipcPlus;

if ( platform.isMainProcess ) {
  ipcPlus = require('./lib/ipc-main');
} else {
  ipcPlus = require('./lib/ipc-renderer');
}

// ==========================
// exports
// ==========================

module.exports = ipcPlus;
