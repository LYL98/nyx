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
    let {  query } = this.data;
    let from = options.from || ''; //页面
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) query.storehouse_id = page.data.selectStorehouse.id;

    this.setData({query, from},()=>{
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
    Http.get(Config.api.stockItemList, that.data.query).then(res => {
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
    console.log(index);
    
    let { from, dataItem } = this.data;
    let data = dataItem.items[index], pc = null;
    switch(from){
      case 'addCheck':
        
        pc = that.getPage('packageWarehouse/pages/addCheck/addCheck');
        
        if(pc){
          let { addData } = pc.data;
          addData.item_id = data.id
          addData.item_id_error = '';
          addData.item_code = data.code
          addData.item_title = data.title;
          addData.batch_code = ''
          addData.c_item_id = data.c_item_id
          pc.setData({ addData });
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