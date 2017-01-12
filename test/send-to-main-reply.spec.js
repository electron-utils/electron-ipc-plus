'use strict';

const path = require('path');
const electron = require('electron');
const {Application} = require('spectron');
const assert = require('assert');

describe('app-win2main-reply', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-win2main-reply')]
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
        assert.ok(logs[0].message.indexOf(' received') !== -1);
        assert.ok(logs[1].message.indexOf('alpha received') !== -1);
        assert.ok(logs[2].message.indexOf('beta received') !== -1);
        assert.ok(logs[3].message.indexOf('cell received') !== -1);

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

describe('app-win2main-reply-nested', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-win2main-reply-nested')]
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
        assert.equal(logs.length, 8);
        assert.ok(logs[0].message.indexOf(' received') !== -1);
        assert.ok(logs[1].message.indexOf('alpha received') !== -1);
        assert.ok(logs[2].message.indexOf('beta received') !== -1);
        assert.ok(logs[3].message.indexOf('cell received') !== -1);
        assert.ok(logs[4].message.indexOf(' received received') !== -1);
        assert.ok(logs[5].message.indexOf('alpha received received') !== -1);
        assert.ok(logs[6].message.indexOf('beta received received') !== -1);
        assert.ok(logs[7].message.indexOf('cell received received') !== -1);

        return app.electron.remote.getGlobal('ipcCalls')
          .then(function (ipcCalls) {
            assert.equal(ipcCalls.length, 8);
            assert.equal(ipcCalls[0], 'app:hello ');
            assert.equal(ipcCalls[1], 'app:hello alpha');
            assert.equal(ipcCalls[2], 'app:hello beta');
            assert.equal(ipcCalls[3], 'app:hello cell');
            assert.equal(ipcCalls[4], 'app:hello-nested  received');
            assert.equal(ipcCalls[5], 'app:hello-nested alpha received');
            assert.equal(ipcCalls[6], 'app:hello-nested beta received');
            assert.equal(ipcCalls[7], 'app:hello-nested cell received');
          });
      });
  });
});

describe('app-win2main-reply-error-timeout', function () {
  this.timeout(0);
  let app = null;

  before(function () {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, 'fixtures', 'app-win2main-reply-timeout')]
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
        assert.equal(logs.length, 4);
        assert.ok(logs[0].message.indexOf('timeout') !== -1);
        assert.ok(logs[1].message.indexOf('timeout alpha') !== -1);
        assert.ok(logs[2].message.indexOf('timeout beta') !== -1);
        assert.ok(logs[3].message.indexOf('cell received') !== -1);

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

describe('app-win2main-reply-error-reply-more-than-once', function () {
  // TODO
});

describe('app-win2main-reply-cancel-request', function () {
  // TODO
});

describe('app-win2main-reply-error-win-destroyed', function () {
  // TODO
});

describe('app-win2main-reply-error-no-callback', function () {
  // TODO
});

describe('app-win2main-reply-error-first-arg-not-error-or-null', function () {
  // TODO
});

describe('app-win2main-reply-error-user-return', function () {
  // TODO
});
