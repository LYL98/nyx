import { Util, Http, Config } from "./../../../../utils/index";
import { Base, List } from './../../../../behaviors/index';

Component({
  behaviors: [ Base, List ],
  options: {
		addGlobalClass: true
	},
  /**
   * 组件的属性列表
   */
  properties: {
    auth: { type: Object, defautl: {} },
    pageOnPullDownRefresh: { type: Number, defautl: 0 }, //下拉
    pageOnReachBottom: { type: Number, defautl: 0 }, //翻页
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowCalendar: false,
    toDay: '',
    query: {
      status: '', //not_done 待出库、部分出库、v3.4.1产品要求显示所有数据
      storehouse_id: '',
      warehouse_id: '',
      delivery_date: '',
      custom_type:'B'
    },
    filterData: [{
      key: 'warehouse_id',
      title: '选择库',
      items: [{key: '', title: '全部', active: true}]
    }]
  },

  //组件生命周期
	lifetimes: {
		attached(){
      let toDay = Util.returnDateStr();
      toDay = Util.returnDateFormat(toDay, 'yyyy-MM-dd');
      let { query } = this.data;
      let page = this.getPage('packageWarehouse/pages/index/index');
      if(page && page.data.selectStorehouse){
        query.storehouse_id = page.data.selectStorehouse.id; //从首页取仓id
        query.custom_type = page.data.custom_type
      }
      query.delivery_date = toDay;
      this.setData({ query, toDay }, ()=>{
        this.baseWarehouseList();
      });
		},
	},

  /**
   * 组件的方法列表
   */
  methods: {
    //获取调出库
    baseWarehouseList(){
      let that = this;
      let { query, filterData } = that.data;
      wx.showNavigationBarLoading();
      Http.get(Config.api.baseWarehouseList, {
        storehouse_id: query.storehouse_id,
        need_num: 50
      }).then(res => {
        let rd = res.data;
        rd.forEach(item => {
          filterData[0].items.push({key: item.id, title: item.title, active: false});
        });        
        that.setData({ query, filterData }, ()=>{
          that.initGetData();
        });
      }).catch(error => {
        wx.hideNavigationBarLoading();
      })
    },
    //筛选
    filterChange(e){
      let data = e.detail.value;
      let type = e.detail.type;
      let { query, filterData } = this.data;
      query.warehouse_id = data.warehouse_id || '';
      query.page = 1;
      if(type === 'reset'){
        query.condition = '';
        query.delivery_date = this.data.toDay;
      }
      filterData[0].items.forEach(item => {
        if(item.key === query.warehouse_id){
          item.active = true;
        }else{
          item.active = false;
        }
      });
      this.setData({ query, filterData }, ()=>{
        this.getData();
      });
    },
    //显示选择日期
    showSelectCalendar(){
      this.setData({ isShowCalendar: true });
    },
    //隐藏选择日期
    cancelSelectCalendar(){
      this.setData({ isShowCalendar: false });
    },
    //选择日历后回调
    selectCalendar(e){
      this.cancelSelectCalendar();
      this.setData({ 'query.delivery_date': e.detail });
    },
    
    //初始请求数据
    initGetData(){
      wx.showNavigationBarLoading();
      this.setData({
        loading: true,
        appError: ''
      }, ()=>{
        this.getData();
      });
    },
    //获取数据
    getData(callback){
      let that = this;
      wx.showNavigationBarLoading();
      that.setData({
        loading: true
      }, ()=>{
        Http.get(Config.api.supOutPlanQuery, that.data.query).then(res => {
          that.handleResData(res.data);
          typeof callback === 'function' && callback(res.data);
        }).catch(error => {
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
      let { query } = this.data;
      if(result.type === 'item'){
        query.page = 1;
        query.condition = result.item_code;
        this.setData({ query }, ()=>{
          this.getData((rd) => {
            if(rd.items.length === 1){
              wx.navigateTo({
                url: `/packageWarehouse/pages/out-storage-plan/market-out-storage/market-out-storage?index=0`
              });
            }
          });
        });
      }else{
        wx.showToast({
          title: '请扫商品码',
          icon: 'none'
        });
      }
    },
  },
  //监听
  observers: {
    //下拉刷新
    pageOnPullDownRefresh(a){
      if(a === 0) return false;
      this.pullDownRefresh();
    },
    //页面触底次数
    pageOnReachBottom(a){
      if(a === 0) return false;
      this.reachBottom();
    }
  },
})
