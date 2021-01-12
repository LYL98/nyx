const { Conn } = require('../config')
const http = {
  //数据请求
  request: function(method, url, data) {
    if (!url) {
      throw new Error('缺少请求的URL');
      return;
    }
    if (data && typeof data !== 'object') {
      throw new Error('请求参数必须为object');
      return;
    }

    return new Promise((resolve, reject) => {
      const app = getApp(); //移动到此位置，防止app.js调用出错
      const fun = () => {
        wx.request({
          url: url,
          header: {
            'content-type': 'application/json',
            'Authorization': app && app.globalData.loginUserInfo ? 'Bearer ' + app.globalData.loginUserInfo.jwt_token : ''
          },
          method: method,
          data: data || {},
          success: function (res) {
            if (res.statusCode === 200 && res.data.code === 0) {
              resolve(res.data)
            } else {
              
              //不提示判断
              if(!(data || {}).is_no_prompt) app && app.requestResultCode(res);
              reject(res);
            }
          },
          fail: function(res) {
            //reject(res); //已在complete处理
          },
          complete: function (res) {
            //不提示判断
            if(!(data || {}).is_no_prompt){
              //判断是否网络超时
              app && app.requestTimeout(res, (result) => {
                if(result === 'fail' || result === 'cancel'){
                  reject(res);
                }else{
                  fun();
                }
              });
            }
          }
        });
      }
      fun();
    });
  },
  //上传
  upload: function(url, data){
    if (!url) {
      throw new Error('缺少请求的URL');
      return;
    }
    if (data && typeof data !== 'object') {
      throw new Error('请求参数必须为object');
      return;
    }
    return new Promise((resolve, reject) => {
      const app = getApp(); //移动到此位置，防止app.js调用出错
      const fun = () =>{
        wx.request({
          url: url,
          header: {
              'content-type': 'multipart/form-data'
          },
          method: 'POST',
          data: data || {},
          success: function (res) {
            let rd = JSON.parse(res.data);
            if (res.statusCode === 200 && rd.code === 0) {
              resolve(rd)
            } else {
              //不提示判断
              if(!data.is_no_prompt) app && app.requestResultCode(res);
              reject(res);
            }
          },
          complete: function (res) {
              //不提示判断
            if(!data.is_no_prompt){
              //判断是否网络超时
              app && app.requestTimeout(res, (result) => {
                if(result === 'fail' || result === 'cancel'){
                  reject(res);
                }else{
                  fun();
                }
              });
            }
          }
        });
      }
      fun();
    });
  },
  //下载
  download(url, data){
    if (!url) {
      throw new Error('缺少请求的URL');
      return;
    }
    if (data && typeof data !== 'object') {
      throw new Error('请求参数必须为object');
      return;
    }
    return new Promise((resolve, reject) => {
      const app = getApp(); //移动到此位置，防止app.js调用出错
      const fun = () =>{
        let tokenKey = app && app.globalData.loginUserInfo ? app.globalData.loginUserInfo.token_key : ''; //动态tokenKey
        wx.downloadFile({
          url: url,
          header: {
            // [tokenKey]: app && app.globalData.loginUserInfo ? app.globalData.loginUserInfo.access_token : ''
            'Authorization': app && app.globalData.loginUserInfo ? 'Bearer ' + app.globalData.loginUserInfo.jwt_token : ''
          },
          success (res) {
            if (res.statusCode === 200) {
              resolve(res)
            } else {
              //不提示判断
              if(!data.is_no_prompt) app && app.requestResultCode(res);
              reject(res);
            }
          },
          fail: function(res) {
            // reject(res); //已在complete处理
          },
          complete: function (res) {
            //不提示判断
            if(!data.is_no_prompt){
              //判断是否网络超时
              app && app.requestTimeout(res, (result) => {
                if(result === 'fail' || result === 'cancel'){
                  reject(res);
                }else{
                  fun();
                }
              });
            }
          }
        });
      }
      fun();
    });
  }
}

module.exports = {
  get: function(url, data) {
    return http.request('GET', url, data);
  },
  post: function(url, data) {
    return http.request('POST', url, data);
  },
  upload: function(url, data) {
    return http.upload(url, data);
  },
  download: function(url, data){
    return http.download(url, data);
  }
}