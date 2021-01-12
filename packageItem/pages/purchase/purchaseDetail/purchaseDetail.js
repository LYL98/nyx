const app = getApp();
import { Config, Http, Util } from '../../../../utils/index';
import { Base, Detail } from '../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    detail: {
      supplier: {},
      storehouse: {},
      item: {},
      qa_records: [],
      accepts: []
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
    Http.get(Config.api.fromSupplierOrderDetail, { id }).then(res => {
      let rd = res.data;
      rd.price_buy = Util.returnPrice(rd.price_buy);
      that.setData({detail: rd});
      wx.hideNavigationBarLoading();
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
})