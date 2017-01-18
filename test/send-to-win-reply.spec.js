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
      .waitUntilTextExists('.label', 'Ready')
      .getRenderProcessLogs()
      .then(function (logs) {
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello cell') !== -1);

        return app.client
          .windowByIndex(1)
          .waitUntilTextExists('.label', 'Ready')
          .getRenderProcessLogs()
          .then(function (logs) {
            assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
            assert.ok(logs[1].message.indexOf('app:hello beta') !== -1);

            return app.client
              .windowByIndex(2)
              .waitUntilTextExists('.label', 'Ready')
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

describe('app-main2win-reply-cancel-request', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply-cancel-request')]
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
            assert.equal(ipcCalls.length, 0);
          });
      });
  });
});

describe('app-main2win-reply-error-win-destroyed', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply-error-win-destroyed')]
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
      .windowByIndex(0) // NOTE: yes, should be index-0, not index-1
      .waitUntilTextExists('.label', 'Ready')
      .then(function () {
        return app.electron.remote.getGlobal('ipcCalls')
          .then(function (ipcCalls) {
            assert.equal(ipcCalls.length, 1);
            assert.equal(ipcCalls[0], 'EWINCLOSED, undefined');
          });
      });
  });
});

describe('app-main2win-reply-a-user-error', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply-a-user-error')]
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
        assert.equal(logs.length, 4);
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('app:hello alpha') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello beta') !== -1);
        assert.ok(logs[3].message.indexOf('app:hello cell') !== -1);

        return app.electron.remote.getGlobal('ipcCalls')
          .then(function (ipcCalls) {
            assert.equal(ipcCalls.length, 4);
            assert.equal(ipcCalls[0], 'Error: user,  failed');
            assert.equal(ipcCalls[1], 'Error: user, alpha failed');
            assert.equal(ipcCalls[2], 'Error: user, beta failed');
            assert.equal(ipcCalls[3], 'Error: user, cell failed');
          });
      });
  });
});

describe('app-main2win-reply-error-invalid-first-arg', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-main2win-reply-error-invalid-first-arg')]
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
        assert.equal(logs.length, 8);
        assert.ok(logs[0].message.indexOf('app:hello ') !== -1);
        assert.ok(logs[1].message.indexOf('Invalid argument for event.reply') !== -1);
        assert.ok(logs[2].message.indexOf('app:hello alpha') !== -1);
        assert.ok(logs[3].message.indexOf('Invalid argument for event.reply') !== -1);
        assert.ok(logs[4].message.indexOf('app:hello beta') !== -1);
        assert.ok(logs[5].message.indexOf('Invalid argument for event.reply') !== -1);
        assert.ok(logs[6].message.indexOf('app:hello cell') !== -1);
        assert.ok(logs[7].message.indexOf('Invalid argument for event.reply') !== -1);

        return app.electron.remote.getGlobal('ipcCalls')
          .then(function (ipcCalls) {
            assert.equal(ipcCalls.length, 4);
            assert.equal(ipcCalls[0], 'EINVALIDARGS,  received');
            assert.equal(ipcCalls[1], 'EINVALIDARGS, alpha received');
            assert.equal(ipcCalls[2], 'EINVALIDARGS, beta received');
            assert.equal(ipcCalls[3], 'EINVALIDARGS, cell received');
          });
      });
  });
});
