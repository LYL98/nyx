const app = getApp();
import { Http, Config } from './../../utils/index';
Page({
  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(){
  },

  //页面显示
  onShow(){
    //隐藏返回首页按钮
    wx.hideHomeButton();
  },
  
  //获取手机号成功后
  getPhoneNumberCallBack(resData) {
    let rd = resData.detail;
    if (rd.weapp_openid) {
      app.updateLoginInfo(rd);
      app.globalData.globalProvince = { code: rd.province_code };
      wx.setStorageSync('globalProvince', app.globalData.globalProvince);
      wx.reLaunch({
        url: '/pages/index/index'
      });
    } else {
      app.globalData.loginUserInfo = rd; //系统登录信息（特殊情况，不能存Storage，只存globalData）
      wx.redirectTo({
        url: '/pages/loginBind/loginBind'
      });
    }
  }
  
})