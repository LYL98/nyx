
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
      status:"init,pick",
      storehouse_id: '',
      condition:'',
      driver_id:''
    },
    operate: '',
    saleBackTypes: Constant.SALE_BACK_TYPES(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '扫码收货'
    });
    let {driver_id} = options

    let {  query } = this.data;
    query.driver_id = driver_id
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) query.storehouse_id = page.data.selectStorehouse.id;
    this.setData({ query }, ()=>{
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
      Http.get(Config.api.saleBackDriverList, that.data.query).then(res => {
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