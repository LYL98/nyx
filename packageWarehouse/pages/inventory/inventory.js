const app = getApp();
import { Config, Http, Constant, Util } from './../../../utils/index';
import { Base, List } from './../../../behaviors/index';

Page({

  behaviors: [ Base, List ],

  /**
   * 页面的初始数据
   */
  data: {
    selectStorehouse: {},
    query: {
      storehouse_id: '',
      warehouse_id: '',
      tray_id: '',
      custom_type:'B',
      stock_age:''
    },
    filterData: [
    {
      key: 'warehouse_id',
      title: '选择库',
      items: [{
        key: '',
        title: '全部',
        active: true
      }]
    }
   ],
    operate: '',
    operates: Constant.WAREHOUSE_OPERATE,
    isShowStockAge: false,
    stockAgeList:[Constant.STOCK_AGE_LIST('list'),Constant.STOCK_AGE_LIST('list')],
    values: [0, 0]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let operate = options.operate || '';
    let { operates, query } = this.data;
    wx.setNavigationBarTitle({
      title: operate ? operates[operate].title + (operate === 'out_storage_plan' ? '计划' : '') : '库存'
    });
    let page = this.getPage('packageWarehouse/pages/index/index');
    let selectStorehouse = {};
    if(page){
      selectStorehouse = page.data.selectStorehouse;
      query.storehouse_id = selectStorehouse.id;
      query.custom_type = page.data.custom_type
    }
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
      query.province_code = selectStorehouse.province_code;
      query.status = 'we_app_q'; //init,part 小程序专用status,待出库，已出库
      let toDay = Util.returnDateStr();
      toDay = Util.returnDateFormat(toDay, 'yyyy-MM-dd');
      query.delivery_date = toDay;
    }
    this.setData({ operate, query, selectStorehouse }, ()=>{
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
        this.baseWarehouseList();
      });
    });
  },

  //获取库列表
  baseWarehouseList(){
    let that = this;
    let { query, filterData } = that.data;
    Http.get(Config.api.baseWarehouseList, {
      storehouse_id: query.storehouse_id,
      need_num: 50
    }).then(res => {
      let rd = res.data;
      if(rd.length > 0){
        rd.forEach(item => {
          filterData[0].items.push({
            key: item.id,
            title: item.title,
            active: false
          });
        });
        that.setData({ filterData });
      }
    });
  },
  //获取临库、托盘列表
  baseWareTrayList(warehouseId){
    let that = this;
    let { query, filterData } = that.data;
    Http.get(Config.api.baseWareTrayList, {
      storehouse_id: query.storehouse_id,
      warehouse_id: warehouseId,
      need_num: 1000
    }).then(res => {
      let rd = res.data;
      if(filterData.length >= 2){
        filterData.remove(1);
      }
      if(rd.length > 0){
        filterData.push({
          key: 'tray_id',
          title: '选择托盘',
          items: [{
            key: '',
            title: '全部',
            active: true
          }]
        });
        rd.forEach(item => {
          filterData[1].items.push({
            key: item.id,
            title: item.code,
            active: false
          });
        });
      }
      that.setData({ filterData });
    });
  },
  //显示选择库龄
  showSelectStockAge(){
    this.setData({ isShowStockAge: true });
  },
  //隐藏选择库龄
  cancelStockAge(){
    this.setData({ isShowStockAge: false });
  },
  //选择库龄后回调
  selectStockAge(e){
    // this.cancelStockAge();
    
    let stock_age_begin = Constant.STOCK_AGE_LIST('list')[e.detail.value[0]]
    let stock_age_end = Constant.STOCK_AGE_LIST('list')[e.detail.value[1]]
    if(stock_age_begin > stock_age_end){
      wx.showToast({
        title: '库龄开始天数不得大于库龄结束天数',
        icon: 'none'
      });
      return
    }
    let stock_age = `${stock_age_begin}-${stock_age_end}`
    this.setData({ 'query.stock_age': stock_age });
  },
  //清除库龄选择
  closeStockAge(){
    this.setData({ 'query.stock_age': '' });
  },

  //筛选点击选择时
  filterItemChange(e){
    let data = e.detail.value;
    if(data.key === 'warehouse_id'){
      if(data.value){
        this.baseWareTrayList(data.value);
      }else{
        let { filterData } = this.data;
        if(filterData.length >= 2) filterData.remove(1);
        this.setData({ filterData });
      }
    }
  },

  //筛选
  filterChange(e){
    let data = e.detail.value;
    console.log(data);
    let type = e.detail.type;
    let { query, filterData } = this.data;
    query.warehouse_id = data.warehouse_id || '';
    query.tray_id = data.warehouse_id && data.tray_id || '';
    query.page = 1;
    if(type == "reset"){
      query.condition = ''
      query.stock_age = ''
    }
    if(!data.warehouse_id && filterData.length >= 2){
      filterData.remove(1);
    }
    for(let i = 0; i < filterData.length; i++){
      for(let j = 0; j < filterData[i].items.length; j++){
        if((i === 0 && filterData[i].items[j].key === query.warehouse_id) || 
            (i === 1 && filterData[i].items[j].key === query.tray_id)){
            filterData[i].items[j].active = true;
        }else{
          filterData[i].items[j].active = false;
        }
      }
    }

    this.setData({ query, filterData }, ()=>{
      this.getData();
    });
  },

  //获取数据
  getData(callback){
    let that = this;
    let api = Config.api.wareTrayQeruy;
    //如果是出库计划
    if(this.data.operate === 'out_storage_plan'){
      api = Config.api.supOutPlanQuery;
    }
    wx.showNavigationBarLoading();
    that.setData({
      loading: true
    }, ()=>{
      Http.get(api, that.data.query).then(res => {
        that.handleResData(res.data);
        typeof callback === 'function' && callback(res.data);
      }).catch((error)=>{
        that.handleResError(error);
      });
    });
  },

  //红外扫描输入
  scanInput(e){
    this.setData({ 'query.condition': '' });
    this.scancodeSuccess(e.detail.value);
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
    if(result.type === 'item'){
      query.page = 1;
      query.condition = result.item_code;
      this.setData({ query }, ()=>{
        this.getData((rd) => {
          if(rd.items.length === 1){
            wx.navigateTo({
              url: `/packageWarehouse/pages/inventoryItem/inventoryItem?c_item_id=${rd.items[0].p_item.c_item_id}&operate=${operate}`
            });
          }
        });
      });
    }else if(result.type === 'tray' && (operate === 'out_storage_plan' || operate === 'putaway')){
      //出库记划、上架
      wx.showToast({
        title: '请扫商品码',
        icon: 'none'
      });
    }else if(result.type === 'tray' && operate !== 'out_storage_plan'){
      this.supRelationCheckTray(result.id);
    }else{
      wx.showToast({
        title: '请扫商品码或托盘码',
        icon: 'none'
      });
    }
  },

  //托盘关系校验
  supRelationCheckTray(id){
    let that = this;
    let { operate, selectStorehouse } = that.data;
    wx.showLoading({
      title: '请稍等...',
      mask: true,
      success(){
        Http.post(Config.api.supRelationCheck, {
          checks: [{
            c_type: 'tray_and_storehouse', //tray_and_storehouse、item_and_province、tray_and_item
            a_key: id,
            b_key: selectStorehouse.id
          }]
        }).then(res => {
          wx.hideLoading();
          wx.navigateTo({
            url: `/packageWarehouse/pages/trayDetail/trayDetail?id=${id}&operate=${operate}`
          });
        }).catch(error => {
          wx.hideLoading();
        });
      }
    });
  },
  //新增盘点
  goToAdd(){
    let that = this;
    let { operate, selectStorehouse } = that.data;
    wx.navigateTo({
      url: `/packageWarehouse/pages/addCheck/addCheck?operate=${operate}&id=${selectStorehouse.id}`
    });
    
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