const app = getApp();

Page({
  //获取用户信息后
  getUserInfoCallBack(resData){
    // let rd = resData.detail;
    let rd = {...app.globalData.loginUserInfo, ...resData.detail}
    app.updateLoginInfo(rd); //系统登录信息
    app.globalData.globalProvince = { code: rd.province_code };
    wx.setStorageSync('globalProvince', app.globalData.globalProvince);
    wx.setStorageSync('loginUserId', rd.id);
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
  
})