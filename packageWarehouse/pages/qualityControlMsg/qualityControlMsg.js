const app = getApp();
import { Config, Http, Constant } from './../../../utils/index';
import { Base, List } from './../../../behaviors/index';

Page({
  behaviors: [ Base, List ],

  /**
   * 页面的初始数据
   */
  data: {
    query: {
      qa_type:'daily_qa',
      un_qa: 1,
      storehouse_id: '',
      condition:'',
      is_used:'0',
      custom_type: 'B'
    },
    operate: '',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let operate = options.operate || '';
    wx.setNavigationBarTitle({
      title: '品控记录'
    });
    let {  query } = this.data;
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) {
      query.storehouse_id = page.data.selectStorehouse.id
      query.custom_type = page.data.custom_type
    };
    this.setData({ query, operate }, ()=>{
      this.initGetData();
    });
  },

  //初始请求数据
  initGetData(){
    wx.showNavigationBarLoading();
    this.setData({
      loading: true,
      appError: '',
    }, ()=>{
      app.signIsLogin((res)=>{
        this.getData();
      });
    });
  },

  //获取数据
  getData(){
    let that = this;
    wx.showNavigationBarLoading();
    that.setData({
      loading: true
    }, ()=>{
      Http.get(Config.api.supQualityWareTrayItem, that.data.query).then(res => {
        that.handleResData(res.data);
        typeof callback === 'function' && callback(res.data);
      }).catch((error)=>{
        that.handleResError(error);
      });
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.pullDownRefresh(); //方法在 behaviors - list.js
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reachBottom(); //方法在 behaviors - list.js
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})