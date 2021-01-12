//app.js
import {Config, Http, Md5} from './utils/index';

let modalInstanceCreated = false; // 单例化 错误处理的 modal 控制器

/**
 * 初始化删除数组；删除数组重组数组
 * 用法：数组.remove(元素下标)
 */
Array.prototype.remove = function (dx) {
  if (isNaN(dx) || dx > this.length) {
    return false;
  }
  for (var i = 0, n = 0; i < this.length; i++) {
    if (this[i] != this[dx]) {
      this[n++] = this[i];
    }
  }
  this.length -= 1;
}

/**
 * 初始化查询数组；
 * 用法：数组.inArray('')
 */
Array.prototype.inArray = function (data) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === data) {
      return true;
    }
  }
  return false;
}

App({
  globalData: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    loginUserInfo: {}, //系统登录信息
    system: null,
    auth: {}, //权限
    globalProvince: {province_code: ''}, // 当前选中的省份，对应的 storage key： globalProvince
  },
  //encodeUTF8
  encodeUTF8(str) {
    var temp = "", rs = "";
    for (var i = 0, len = str.length; i < len; i++) {
      temp = str.charCodeAt(i).toString(16);
      rs += "\\u" + new Array(5 - temp.length).join("0") + temp;
    }
    return rs;
  },
  //decodeUTF8
  decodeUTF8(str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });
  },
  //获取省份
  getGlobalProvince() {
    return this.globalData.globalProvince.code
      ? this.globalData.globalProvince
      : wx.getStorageSync('globalProvince');
  },
  //判断是否登录(登录成功后回调)
  signIsLogin(callBack) {
    let that = this;
    let {loginUserInfo} = that.globalData;
    //成功方法
    const successFun = (rd) => {
      // 由于判断是否登录的接口 不返回 jwt_token 此处防止直接赋值，导致jwt-token为空
      this.globalData.loginUserInfo = {...this.globalData.loginUserInfo, ...rd};
      this.getAuthorityList();

      // 处理省份
      if (rd.opt_type === 'global') {
        // 总部权限，某些模块选择省份之后，缓存省份
        let agp = wx.getStorageSync('globalProvince');
        if (agp && agp.code) {
          this.globalData.globalProvince = agp;
        }
      } else {
        // 区域权限，获取后端省份
        this.globalData.globalProvince = {code: rd.province_code}
      }
      typeof callBack === 'function' && callBack(rd);
    };

    //失败方法
    const failFun = () => {
      that.updateLoginInfo({});//系统登录信息
      wx.reLaunch({
        url: '/pages/loginGuide/loginGuide'
      });
    };

    // 如果内存中存在用户登录信息
    if (loginUserInfo && loginUserInfo.jwt_token && loginUserInfo.weapp_openid !== null) {
      typeof callBack === 'function' && callBack(loginUserInfo);
      return;
    }

    // 如果内存中不存在用户信息，从缓存中读取登录过的用户信息，并执行登录校验
    let gd = wx.getStorageSync('loginUserInfo');
    if (gd && gd.jwt_token && gd.weapp_openid !== null) {
      this.globalData.loginUserInfo = gd;

      Http.get(Config.api.signIsLogin, {
        is_no_prompt: true
      }).then((res) => {
        successFun(res.data);
      }).catch(error => {
        if (error && error.data && error.data.code === 200) {
          failFun();
        } else {
          this.requestResultCode(error);
        }
      });

      return;
    }

    failFun();
  },

  //更新登录信息
  updateLoginInfo(data) {
    this.globalData.loginUserInfo = data;
    this.getAuthorityList();
    wx.setStorageSync("loginUserInfo", data);
  },

  //获取当前登录用户权限
  getAuthorityList() {
    let that = this;
    let {loginUserInfo} = that.globalData;

    let data = {permission_codes: []};
    if (loginUserInfo && loginUserInfo.jwt_token && loginUserInfo.weapp_openid !== null) {
      data = loginUserInfo;
    }
    let auth = {};
    if (data.is_admin) {
      auth.isAdmin = true;
    } else {
      (data.permission_codes || []).forEach(code => {
        auth[code] = true;
      });
    }
    that.globalData.auth = auth;
  },
  // 处理省份列表
  getCurrentProvince(callback) {
    let that = this;
    let gp = that.globalData.globalProvince;
    // 1、如果全局状态，存在province对象
    if (gp && gp.code) {
      typeof callback === 'function' && callback(gp);
      return;
    }
    // 2、读取本地缓存，如果存在，则赋值给全局province 以及本页面的province
    let agp = wx.getStorageSync('globalProvince');
    if (agp && agp.code) {
      that.globalData.globalProvince = agp;
      typeof callback === 'function' && callback(agp);
      return;
    }

    Http.get(Config.api.baseProvinceListMy, {}).then((res) => {
      // 如果身份列表中只有一个省份，则默认设置当前省份，否则跳转选择页面，让用户选择当前省份
      let rd = res.data;
      if (rd.length > 1) { // 如果有多个省份
        wx.navigateTo({
          url: '/pages/province/province',
        });

      } else if (rd.length === 1) { // 如果只有一个省份
        that.globalData.globalProvince = rd[0];
        wx.setStorageSync('globalProvince', rd[0]);
        typeof callback === 'function' && callback(rd[0]);
      }
    }).catch(() => {
      typeof callback === 'function' && callback({});
    });
  },
  //网络请求异常处理方法
  requestResultCode(res) {
    let that = this;
    if (modalInstanceCreated) return; // 如果已经存在modal 则不做处理

    modalInstanceCreated = true;
    if (res.statusCode >= 500) {
      wx.showModal({
        title: '提示',
        content: '服务器异常，请重试',
        confirmText: '我知道了',
        confirmColor: '#00ADE7',
        showCancel: false,
        complete: function() {
          modalInstanceCreated = false;
        },
      });
    } else if (res.statusCode >= 400) {
      wx.showModal({
        title: '提示',
        content: '请求出错啦',
        confirmText: '我知道了',
        confirmColor: '#00ADE7',
        showCancel: false,
        complete: function() {
          modalInstanceCreated = false;
        },
      });
    } else if (res.statusCode === 200 && res.data.code === 200) {
      wx.showModal({
        title: "提示",
        content: res.data.message,
        confirmText: "重新登录",
        confirmColor: "#00ADE7",
        showCancel: false,
        complete: function() {
          modalInstanceCreated = false;
        },
        success: function (resData) {
          if (resData.confirm) {
            that.updateLoginInfo({});//系统登录信息
            wx.reLaunch({
              url: '/pages/loginGuide/loginGuide'
            });
          }
        }
      });
    } else {
      wx.showModal({
        title: '提示',
        content: res.data.message,
        confirmText: '我知道了',
        confirmColor: '#00ADE7',
        showCancel: false,
        complete: function() {
          modalInstanceCreated = false;
        },
      });
    }
  },
  //网络超时
  requestTimeout(res, callback) {
    if (res.errMsg.indexOf('timeout') >= 0) {
      wx.showModal({
        title: '提示',
        content: '网络超时，请重试',
        confirmText: '重试',
        confirmColor: '#00ADE7',
        success: function (res) {
          if (res.confirm) {
            typeof callback === 'function' && callback('timeout');
          } else {
            typeof callback === 'function' && callback('cancel');
          }
        }
      });
    } else if (res.errMsg.indexOf('fail') >= 0) {
      wx.showModal({
        title: '提示',
        content: '请求出错啦,请检查网络是否可用',
        confirmText: '重试',
        confirmColor: '#00ADE7',
        success: function (res) {
          if (res.confirm) {
            typeof callback === 'function' && callback('netFail');
          } else {
            typeof callback === 'function' && callback('cancel');
          }
        }
      });
    } else {
      typeof callback === 'function' && callback('fail');
    }
  },

  //小程序初始化完成时触发，全局只触发一次。
  onLaunch() {
    this.screenSize();//获取屏宽高
  },

  //全局显示时
  onShow() {
    this.updateApp(); //更新小程序
  },

  //更新应用
  updateApp() {
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              confirmColor: "#00ADE7",
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
              confirmColor: "#00ADE7",
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法自动更新，请升级到最新微信版本后重试。',
        confirmColor: "#00ADE7",
      })
    }
  },

  //获取屏宽高
  screenSize: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var ww = res.windowWidth;
        var hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
        res.system.indexOf('iOS') > -1 ? that.globalData.system = 'ios' : that.globalData.system = 'android'
      }
    })
  },

  //判断是否有权限
  judgeSetting(auth, callback) {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting[auth]) {
          typeof callback === 'function' && callback(true);
        } else {
          typeof callback === 'function' && callback(false);
        }
      },
      fail: ()=>{
        typeof callback === 'function' && callback(false);
      }
    });
  },
})
