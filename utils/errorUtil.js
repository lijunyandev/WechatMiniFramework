'use strict';
const service = require('../service/service');
var app = getApp()

const errorCodeHandle = (res) => {
  console.log('error code', res);
  if (res.data.status == 555) {
    wx.showToast({
      title: '登录失效，正在重新登录',
      image: '../../resources/info-failed.png'
    })
    reLogin();
  } else {
    console.log('error code', res.data.message);
    wx.showToast({
      title: res.data.message,
      image: '../../resources/info-failed.png'
    })
  }
}

var reLogin = () => {
  wx.login({
    success: (res) => {
      var code = res.code
      if (code) {
        wx.getUserInfo({
          success: (res) => {
            var encryptedData = res.encryptedData
            var iv = res.iv

            service.postLoginAuth(code, encryptedData, iv)
              .then((res) => {
                console.log('login', res);

                // 兼容低版本，无法获取header中的数据
                var token = res.header
                  ? res.header['X-Auth-Token'] || res.header['x-auth-token']
                  : res.data.data['X-Auth-Token'];
                // 删除token
                delete res.data.data['X-Auth-Token']

                console.log('token fetched: ', token);

                app.globalData.token = token
                app.globalData.userInfo = res.data.data
                wx.setStorageSync('token', token)
                wx.setStorageSync('userInfo', res.data.data)
              })
              .catch((error) => {
                console.log('login err', error)
              });
          }
        })
      }
    }
  })
}

module.exports = {
  errorCodeHandle: errorCodeHandle
}