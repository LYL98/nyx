// packageOperate/pages/select-dis-driver/select-dis-driver.js
const app = getApp();

import { Util, Constant, Http, Config } from "./../../../utils/index";
import { Base, List } from './../../../behaviors/index';
Page({
  behaviors: [ Base, List ],
  /**
   * 页面的初始数据
   */
  data: {
    distributes:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '选择司机'
    });
    app.signIsLogin((res)=>{
      this.getData()
    });
    
  },

  getData(){
    let { distributes } = this.data
    let page = this.getPage('packageOperate/pages/sup-stock-distribute/sup-stock-distribute');
    if(page){
      distributes = page.data.distributes
      this.setData({
        distributes
      })
    }
  },

  selectItem(e){
    let index = e.currentTarget.dataset.index;
    let { distributes } = this.data
    let data = distributes[index]
    let page = this.getPage('packageOperate/pages/sup-stock-distribute/sup-stock-distribute');
    if(page){
      let { addData } = page.data;
          addData.distribute_id = data.distribute_id
          addData.distribute_id_error = '';
          addData.driver_realname = data.driver_realname;
          addData.plan_num = data.plan_num;
          addData.dist_num = data.dist_num;
          page.setData({ addData });
          wx.navigateBack();
    }else{
      wx.navigateBack();
    }

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})