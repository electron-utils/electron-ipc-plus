'use strict';

const path = require('path');
const electron = require('electron');
const {Application} = require('spectron');
const assert = require('assert');

describe('app-win2main', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-win2main')]
    });
    return app.start();
  });

  after(function () {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('should be ok', function () {
    return app.client
      .windowByIndex(0)
      .waitUntilWindowLoaded()
      .getRenderProcessLogs()
      .then(function (logs) {
        assert.equal(logs.length, 0);

        return app.electron.remote.getGlobal('ipcCalls')
          .then(function (ipcCalls) {
            assert.equal(ipcCalls.length, 4);
            assert.equal(ipcCalls[0], 'app:hello ');
            assert.equal(ipcCalls[1], 'app:hello alpha');
            assert.equal(ipcCalls[2], 'app:hello beta');
            assert.equal(ipcCalls[3], 'app:hello cell');
          });
      });
  });
});

describe('app-main2main', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2main')]
    });
    return app.start();
  });

  after(function () {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('should be ok', function () {
    return app.electron.remote.getGlobal('ipcCalls')
      .then(function (ipcCalls) {
        assert.equal(ipcCalls.length, 4);
        assert.equal(ipcCalls[0], 'app:hello ');
        assert.equal(ipcCalls[1], 'app:hello alpha');
        assert.equal(ipcCalls[2], 'app:hello beta');
        assert.equal(ipcCalls[3], 'app:hello cell');
      });
  });
});
