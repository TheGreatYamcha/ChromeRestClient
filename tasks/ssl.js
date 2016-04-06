'use strict';
const fs = require('fs');
const http = require('http');
const https = require('https');
const basicAuth = require('basic-auth');
const app = require('express')();

class TestServer {
  constructor() {
    this.credentials = {
      key: fs.readFileSync('./tests/certs/server.key', 'utf8'),
      cert: fs.readFileSync('./tests/certs/server.crt', 'utf8')
    };
    app.disable('x-powered-by');
    // app.disable('etag');
    this.setHandlers();
    this.createServer();
  }

  basicAuth(req, res, next) {
    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
      return this.unauthorized(res);
    }
    if (user.name === 'test' && user.pass === 'test') {
      return next();
    } else {
      return this.unauthorized(res);
    }
  }

  /**
   * To be called when the user is not basic authenticated.
   */
  unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required (test:test)');
    return res.sendStatus(401);
  }

  createServer() {
    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(this.credentials, app);
    httpServer.listen(80, () => {
      console.log('HTTP started (80).');
    });
    httpServer.listen(8080, () => {
      console.log('HTTP started (8080).');
    });
    // httpsServer.listen(443, () => {
    //   console.log('HTTPS started (443).');
    // });
    httpsServer.listen(3000, () => {
      console.log('HTTPS started (3000).');
    });
  }

  setHandlers() {
    this._setMain();
    this._setBasicAuth();
  }

  _setMain() {
    app.get('/', (req, res) => {
      // res.removeHeader('Date');
      // res.removeHeader('Connection');
      // res.removeHeader('Content-Length');
      // res.removeHeader('Transfer-Encoding');
      // res.end();
      res.set('Content-Type', 'text/html');
      res.send('<h1>Hello World!</h1>');
    });
  }

  _setBasicAuth() {
    app.get('/auth', this.basicAuth.bind(this), (req, res) => {
      res.set('Content-Type', 'text/html');
      res.send('<h1>You are authenticated</h1>');
    });
  }
}

module.exports = {
  create: () => {
    new TestServer();
  }
};
