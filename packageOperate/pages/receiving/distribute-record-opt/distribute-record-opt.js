const app = getApp();
import { Config, Http } from '../../../../utils/index';
import { Base } from '../../../../behaviors/index';

Page({
  behaviors: [ Base ],
  /**
   * 页面的初始数据
   */
  data: {
    detail: {
      accepts: [],
      qa_records: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.id = options.id ? Number(options.id) : '';
    wx.showNavigationBarLoading();
    app.signIsLogin((res)=>{
      this.getData();
    });
  },

  //获取数据
  getData(){
    let that = this;
    Http.get(Config.api.supAcceptDistDetail, {id: this.id}).then(res => {
      that.setData({ detail: res.data });
      wx.hideNavigationBarLoading();
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  }
})