'use strict';

const httpUtil = require('../utils/httpUtil');


/**
 * base url
 */
const BASE_URL = '';

const that = this;
let globalToken = null;

// 登录
const postLoginAuth = (code, rawData, signature, encryptedData, iv) => {
  const url = BASE_URL + '/auth';
  return httpUtil.post(
    url,
    {
      data: {
        code: code,
        rawData: rawData,
        signature: signature,
        encryptedData: encryptedData,
        iv: iv
      }
    }
  );
};

// 检验token 是否还有效
const checkToken = (header) => {
  const url = BASE_URL + '/auth';
  return httpUtil.get(
    url,
    {
      header: header
    }
  );
};

const getTokenedHeader = () => {
  console.log("getTokenedHeader  ")

  const generateHeader = token => {
    console.log("generateHeader" + token)
    globalToken = token;
    return {
      "X-AUTH-TOKEN": "Bearer " + token
    }
  };

  if (globalToken) {
    console.log("globalToken true")
    return Promise.resolve({
      "X-AUTH-TOKEN": "Bearer " + globalToken
    })
  } else {
    console.log("globalToken false")
    var token = wx.getStorageSync('token')
    var userInfo = wx.getStorageSync('userInfo')
    if (token) {
      console.log("token true")
      return checkAuth(token).then(generateHeader)
    } else {
      console.log("token false")
      return wechatLogin().then(generateHeader);
    }
  }
};

const checkAuth = (token) => {
  //验证token 是否还有效
  return checkToken({
    "X-AUTH-TOKEN": "Bearer " + token
  }).then((res) => {
    if (res.data.success) {
      console.log('token from local');
      console.log('checkToken', res);

      return token;
    } else {
      console.log('checkToken fail');
      return wechatLogin();
    }
  })
    .catch((error) => {
      console.log('checkToken error', error);
      return wechatLogin();
    })
};

const wechatLogin = () => {
  console.log('token from server');
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        var code = res.code
        console.log('code = ', code);
        if (code) {
          wx.getUserInfo({
            language: "zh_CN",
            success: (res) => {
              console.log('userInfo: res = ', res);
              return postLoginAuth(code, res.rawData, res.signature, res.encryptedData, res.iv)
                .then((res) => {
                  console.log('postLoginAuth: res = ', res);
                  if (res.data.success) {
                    console.log('postLoginAuth', res);
                    var token = res.header['X-AUTH-TOKEN'];
                    console.log('token', token);
                    wx.setStorageSync('token', token)
                    wx.setStorageSync('userInfo', res.data.data)
                    wx.setStorageSync('userInfo', res.data.data)
                    return resolve(token);
                  } else {
                    wx.showToast({
                      title: '登录失败',
                      image: "../../resources/warnning.png",
                      duration: 2000
                    })
                    return reject(new Error("登录失败"))
                  }
                })
                .catch((error) => {
                  console.log('postLoginAuth error', error);
                  wx.showToast({
                    title: '登录失败',
                    image: "../../resources/warnning.png",
                    duration: 2000
                  })
                  return reject(error)
                })
            }
          })
        }
      }
    })
  })
}


module.exports = {
  //获取默认当天任务
  // getTodayTask: () => {
  //   const url = BASE_URL + '/clazz/task';
  //   return getTokenedHeader().then((header) => httpUtil.get(
  //     url,
  //     {
  //       header: header
  //     }
  //   ))
  // },
}
