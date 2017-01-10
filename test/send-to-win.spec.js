'use strict';

const path = require('path');
const electron = require('electron');
const {Application} = require('spectron');
const assert = require('assert');

describe('app-main2win', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win')]
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
        assert.ok(logs[1].message.indexOf('app:hello cell') !== -1);

        return app.client
          .windowByIndex(1)
          .waitUntilWindowLoaded()
          .getRenderProcessLogs()
          .then(function (logs) {
            assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
            assert.ok(logs[1].message.indexOf('app:hello beta') !== -1);

            return app.client
              .windowByIndex(2)
              .waitUntilWindowLoaded()
              .getRenderProcessLogs()
              .then(function (logs) {
                assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
                assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);

                return app.electron.remote.getGlobal('ipcCalls')
                  .then(function (ipcCalls) {
                    assert.equal(ipcCalls.length, 0);
                  });
              });
          });
      });
  });
});
