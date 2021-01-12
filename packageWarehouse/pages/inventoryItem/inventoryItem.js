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
      storehouse_id: '',
      // item_code: '',
      sub_item_id: '',
      c_item_id: ''
    },
    operate: '',
    operates: Constant.WAREHOUSE_OPERATE,
    outStoragePlanData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let operate = options.operate || '';
    let { operates, query } = this.data;
    wx.setNavigationBarTitle({
      title: operate ? operates[operate].title + (operate === 'out_storage_plan' ? '计划' : '') + '商品' : '商品库存'
    });
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) query.storehouse_id = page.data.selectStorehouse.id;
    query.sub_item_id = options.sub_item_id || '';
    // query.item_code = options.item_code || '';
    query.c_item_id = Number(options.c_item_id) || '';
    
    //如果是上架
    if(operate === 'putaway'){
      query.is_tmp_ware = 1; //是否临时库
      query.for_on_board = 1; //仓库上架的数据返回了全部库存数据，调整为仅返回入库未在托盘的库存数据
    }
    //如果是移库
    if(operate === 'move'){
      query.is_tmp_ware = 0; //是否临时库
    }
    //如果是出库计划
    if(operate === 'out_storage_plan'){
      page = this.getPage('packageWarehouse/pages/inventory/inventory');
      if(page){
        let opd = page.data.dataItem.items;
        let con = opd.filter(item => item.item_id === Number(options.sub_item_id));
        this.setData({
          outStoragePlanData: con.length > 0 ? con[0] : {}
        });
      }
    }
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
      Http.get(Config.api.wareTrayItemList, {
        ...that.data.query
      }).then(res => {
        that.handleResData(res.data);
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
    if(result.type === 'tray'){
      this.judgeTray(result.id);
    }else{
      wx.showModal({
        title: '提示',
        content: '请扫托盘码',
        confirmText: '我知道了',
        confirmColor: '#00ADE7',
        showCancel: false
      });
    }
  },

  //商品校验
  judgeTray(id){
    let { operates, operate, dataItem } = this.data;
    for(let i = 0; i < dataItem.items.length; i++){
      let dd = dataItem.items[i];
      if(dd.tray_id === id){
        wx.navigateTo({
          url: `${operates[operate].url}?index=${i}&from=inventoryItem`
          //url: `${operates[operate].url}?order_id=${dd.purchase_order_id}&sub_item_id=${dd.item_id}&tray_id=${id}&batch_code=${dd.batch_code}`
        });
        return;
      }
    }
    wx.showModal({
      title: '提示',
      content: '托盘上无该商品',
      confirmText: '我知道了',
      confirmColor: '#00ADE7',
      showCancel: false
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.pullDownRefresh(); //方法在 behaviors - list.js
  },
})