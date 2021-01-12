const app = getApp();
import { Config, Http, Constant, Verification, Util } from './../../../utils/index';
import { Base, List } from './../../../behaviors/index';

Page({
  behaviors: [ Base,List ],
  /**
   * 页面的初始数据
   */
  data: {
    //need_num: 20,
    query: {
      storehouse_id:'',
      c_item_id:'',
      condition: ''
    },
    dataItem: [],
    from: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let from = options.from || ''; //页面
    let {  query } = this.data;
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) query.storehouse_id = page.data.selectStorehouse.id;
    let pc = this.getPage('packageWarehouse/pages/addCheck/addCheck');
    if(pc){
      let { addData } = pc.data;
      query.c_item_id = addData.c_item_id
    } 
    this.setData({query,from},()=>{
      app.signIsLogin((res)=>{
        
        this.initGetData()
      });
    })
    
  },

  //输入框事件
  inputChange(e) {
    let value = e.detail.value;
    this.setData({
      'query.condition': value
    });
  },

  //搜索
  searchInputConfirm(){
    this.getData();
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
    Http.get(Config.api.stockItemBatchList, that.data.query).then(res => {
      wx.hideNavigationBarLoading();
      that.handleResData(res.data);
      typeof callback === 'function' && callback(res.data);
    }).catch((error)=>{
      that.handleResError(error);
    });
  },

  //选择商品
  selectItem(e){
    let that = this
    let index = e.currentTarget.dataset.index;
    let { from, dataItem } = this.data;
    let data = dataItem.items[index], pc = null;
    switch(from){
      case 'addCheck':
        pc = that.getPage('packageWarehouse/pages/addCheck/addCheck');
        
        if(pc){
          let { addData,detail } = pc.data;
          detail = data
          addData.batch_code = data.batch_code
          addData.batch_code_error = '';
          addData.ware_tray_item_id = data.id
          pc.setData({ addData,detail });
          wx.navigateBack();
        }
        break;
      default:
        wx.navigateBack();
    }
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
})