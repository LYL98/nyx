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
    filterData: [
    {
      key: 'sale_type',
      title: '销售类型',
      items: [{key: '', title: '全部', active: true},{key: '自营', title: '自营', active: true},{key: '平台', title: '平台', active: true}] //{key: '', title: '全部', active: true}
    },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let operate = options.operate || '';
    wx.setNavigationBarTitle({
      title: '售后退货'
    });
    let {  query } = this.data;
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) query.storehouse_id = page.data.selectStorehouse.id;
    this.setData({ query, operate }, ()=>{
      this.initGetData();
    });
  },
  //筛选
  filterChange(e){
    let data = e.detail.value;
    let type = e.detail.type;
    let { query, filterData } = this.data;
    query.page = 1;
    query.sale_type = data.sale_type || ''
    if(type === 'reset') query.condition = '';
    
    for(let j = 0;j < filterData[0].items.length; j++){
      if(filterData[0].items[j].key === query.sale_type){
        filterData[0].items[j].active = true;
      }else{
        filterData[0].items[j].active = false;
      }
    }
    this.setData({ query, filterData }, ()=>{
      this.getData();
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
  //调起扫一扫
  handleScan() {
    wx.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        this.scancodeSuccess(res.result);
      },
    })
  },
  //扫码成功
  scancodeSuccess(result){
    if(result.indexOf('{') !== 0 || result.indexOf('}') !== result.length - 1){
      wx.showToast({
        title: '请扫专用二维码',
        icon: 'none'
      });
      return;
    }
    //JSON.parse(JSON.stringify(json))
    result = JSON.parse(result);
    let { operate, query } = this.data;
    if(result.type === 'sales_return_handover'){
      let driver_id = result.user_id;
            wx.navigateTo({
              url: `/packageWarehouse/pages/saleBackDriver/saleBackDriver?driver_id=${driver_id}`
            });
    }else{
      wx.showToast({
        title: '请扫正确的二维码',
        icon: 'none'
      });
    }
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