'use strict';

const path = require('path');
const electron = require('electron');
const {Application} = require('spectron');
const assert = require('assert');

describe('app-main2win-reply', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply')]
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
                    assert.equal(ipcCalls.length, 6);
                    assert.equal(ipcCalls[0], ' received');
                    assert.equal(ipcCalls[1], 'alpha received');
                    assert.equal(ipcCalls[2], ' received');
                    assert.equal(ipcCalls[3], 'beta received');
                    assert.equal(ipcCalls[4], ' received');
                    assert.equal(ipcCalls[5], 'cell received');
                  });
              });
          });
      });
  });
});

describe('app-main2win-reply-nested', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply-nested')]
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
      .waitUntilTextExists('.label', 'Ready')
      .getRenderProcessLogs()
      .then(function (logs) {
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello cell') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello-nested ') !== -1);
        assert.ok(logs[3].message.indexOf('app:hello-nested cell-nested') !== -1);

        return app.client
          .windowByIndex(1)
          .waitUntilTextExists('.label', 'Ready')
          .getRenderProcessLogs()
          .then(function (logs) {
            assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
            assert.ok(logs[1].message.indexOf('app:hello beta') !== -1);
            assert.ok(logs[2].message.indexOf('app:hello-nested ') !== -1);
            assert.ok(logs[3].message.indexOf('app:hello-nested beta-nested') !== -1);

            return app.client
              .windowByIndex(2)
              .waitUntilTextExists('.label', 'Ready')
              .getRenderProcessLogs()
              .then(function (logs) {
                assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
                assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
                assert.ok(logs[2].message.indexOf('app:hello-nested ') !== -1);
                assert.ok(logs[3].message.indexOf('app:hello-nested alpha-nested') !== -1);

                return app.electron.remote.getGlobal('ipcCalls')
                  .then(function (ipcCalls) {
                    assert.equal(ipcCalls.length, 12);
                    assert.equal(ipcCalls[ 0], ' received');
                    assert.equal(ipcCalls[ 1], 'alpha received');
                    assert.equal(ipcCalls[ 2], ' received');
                    assert.equal(ipcCalls[ 3], 'alpha-nested received');
                    assert.equal(ipcCalls[ 4], ' received');
                    assert.equal(ipcCalls[ 5], 'beta received');
                    assert.equal(ipcCalls[ 6], ' received');
                    assert.equal(ipcCalls[ 7], 'beta-nested received');
                    assert.equal(ipcCalls[ 8], ' received');
                    assert.equal(ipcCalls[ 9], 'cell received');
                    assert.equal(ipcCalls[10], ' received');
                    assert.equal(ipcCalls[11], 'cell-nested received');
                  });
              });
          });
      });
  });
});

describe('app-main2win-reply-more-than-once', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply-more-than-once')]
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
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
        assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

        return app.electron.remote.getGlobal('ipcCalls')
          .then(function (ipcCalls) {
            assert.equal(ipcCalls.length, 4);
            assert.equal(ipcCalls[0], ' received');
            assert.equal(ipcCalls[1], 'alpha received');
            assert.equal(ipcCalls[2], 'beta received');
            assert.equal(ipcCalls[3], 'cell received');
          });
      });
  });
});

describe('app-main2win-reply-timeout', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply-timeout')]
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
      .waitUntilTextExists('.label', 'Ready')
      .getRenderProcessLogs()
      .then(function (logs) {
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
        assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

        return app.electron.remote.getGlobal('ipcCalls')
          .then(function (ipcCalls) {
            assert.equal(ipcCalls.length, 4);
            assert.equal(ipcCalls[0], 'timeout');
            assert.equal(ipcCalls[1], 'timeout alpha');
            assert.equal(ipcCalls[2], 'timeout beta');
            assert.equal(ipcCalls[3], 'cell received');
          });
      });
  });
});
