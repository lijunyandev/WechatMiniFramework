'use strict';

const Promise = require('./libs/bluebird.min');
global.Promise = Promise;

const _http = (method) => (url, options) => {
  return new Promise((resolve, reject) => {
    let params = {
      url: url,
      method: method,
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        reject(error);
      }
    };

    if (options) {
      params = Object.assign(params, options);
    }

    wx.request(params);
  });
}

module.exports = {
  get: _http('GET'),
  put: _http('PUT'),
  post: _http('POST'),
  delete: _http('DELETE')
}
