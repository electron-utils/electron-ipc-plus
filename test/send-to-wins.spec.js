'use strict';

const path = require('path');
const electron = require('electron');
const {Application} = require('spectron');
const assert = require('assert');

describe('app-main2wins', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2wins')]
    });
    return app.start();
  });

  after(function () {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('should be received message in all process', function () {
    return app.client
      .windowByIndex(0)
      .waitUntilWindowLoaded()
      .getRenderProcessLogs()
      .then(function (logs) {
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
        assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

        return app.client
          .windowByIndex(1)
          .waitUntilWindowLoaded()
          .getRenderProcessLogs()
          .then(function (logs) {
            assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
            assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
            assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
            assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

            return app.client
              .windowByIndex(2)
              .waitUntilWindowLoaded()
              .getRenderProcessLogs()
              .then(function (logs) {
                assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
                assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
                assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
                assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

                return app.electron.remote.getGlobal('ipcCalls')
                  .then(function (ipcCalls) {
                    assert.equal(ipcCalls.length, 0);
                  });
              });
          });
      });
  });
});

describe('app-win2wins', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-win2wins')]
    });
    return app.start();
  });

  after(function () {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('should be received message in all process', function () {
    return app.client
      .windowByIndex(0)
      .waitUntilWindowLoaded()
      .getRenderProcessLogs()
      .then(function (logs) {
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
        assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

        return app.client
          .windowByIndex(1)
          .waitUntilWindowLoaded()
          .getRenderProcessLogs()
          .then(function (logs) {
            assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
            assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
            assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
            assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

            return app.client
              .windowByIndex(2)
              .waitUntilWindowLoaded()
              .getRenderProcessLogs()
              .then(function (logs) {
                assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
                assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
                assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
                assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

                return app.electron.remote.getGlobal('ipcCalls')
                  .then(function (ipcCalls) {
                    assert.equal(ipcCalls.length, 0);
                  });
              });
          });
      });
  });
});


describe('app-win2wins-exclude-self', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-win2wins-exclude-self')]
    });
    return app.start();
  });

  after(function () {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('should be received message in all process', function () {
    return app.client
      .windowByIndex(0)
      .waitUntilWindowLoaded()
      .getRenderProcessLogs()
      .then(function (logs) {
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
        assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

        return app.client
          .windowByIndex(1)
          .waitUntilWindowLoaded()
          .getRenderProcessLogs()
          .then(function (logs) {
            assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
            assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
            assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
            assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

            return app.client
              .windowByIndex(2)
              .waitUntilWindowLoaded()
              .getRenderProcessLogs()
              .then(function (logs) {
                assert.equal(logs.length, 0);

                return app.electron.remote.getGlobal('ipcCalls')
                  .then(function (ipcCalls) {
                    assert.equal(ipcCalls.length, 0);
                  });
              });
          });
      });
  });
});
