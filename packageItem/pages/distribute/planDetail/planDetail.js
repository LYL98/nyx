const app = getApp();
import { Config, Http } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    detail: {
      src_storehouse: {},
      tar_storehouse: {},
      p_items: []
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      this.getDetail(options.id);
    });
  },
  //获取详情
  getDetail(id){
    let that = this;
    wx.showNavigationBarLoading();
    Http.get(Config.api.supDistributePlanDetail, { id }).then(res => {
      that.setData({detail: res.data});
      wx.hideNavigationBarLoading();
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
})