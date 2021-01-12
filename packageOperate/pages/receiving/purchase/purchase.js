// pages/setting/setting-operator/setting-operator.js
import { Util, Constant, Http, Config } from "./../../../../utils/index";
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
    qCStatus: Constant.Q_C_STATUS(),
    qCStatusType: Constant.Q_C_STATUS_TYPE,
    query: {
      custom_type: 'B',
      status: 'audit_success,part_in',
      init_storehouse_id: '',
      storehouse_id: '',
      condition: '',
      buyer_id: '',
      sale_type:'',
      purchase_place_type:'',
    },
    filterData: [{
      key: 'storehouse_id',
      title: '选择仓',
      items: [], //{key: '', title: '全部', active: true}
    },
    {
      key: 'sale_type',
      title: '销售类型',
      items: [{key: '', title: '全部', active: true},{key: '自营', title: '自营', active: true},{key: '平台', title: '平台', active: true}] //{key: '', title: '全部', active: true}
    },
    {
      key: 'purchase_place_type',
      title: '采购地',
      items: [{key: '', title: '全部', active: true},{key: 'local', title: '本地', active: true},{key: 'origin', title: '异地', active: true}] //{key: '', title: '全部', active: true}
    },
    {
      key: 'buyer_id',
      title: '选择采购员',
      items: [{key: '', title: '全部', active: true}] //{key: '', title: '全部', active: true}
    }],
  },

  //组件生命周期
	lifetimes: {
		attached(){
      this.getTarStorehouse();
      this.baseCommonOperatorList();
		},
	},

  /**
   * 组件的方法列表
   */
  methods: {
    //获取所有采购人员
    baseCommonOperatorList(){
      let that = this;
      let { filterData } = that.data;
      Http.get(Config.api.baseCommonOperatorList, {
        post: 'buyer',
        is_freeze: 0,
        need_num: 200,
      }).then(res => {
        if(res.code === 0){
          let rd = res.data;
          for(let i = 0; i < rd.length; i++){
            filterData[3].items.push({key: rd[i].id, title: rd[i].realname, active: false});
          }
          that.setData({ filterData });
        }
      });
    },
    changeCustomType(e){
      let key = e.currentTarget.dataset.key;
      let { query } = this.data;
      query.custom_type = key;
      query.page = 1;
      this.setData({ query }, () => {
        this.getData();
      });
    },
    //获取仓(有权限)
    getTarStorehouse(){
      let that = this;
      let { query, filterData } = that.data;
      wx.showNavigationBarLoading();
      Http.get(Config.api.baseSupStorehouseList, {
        need_num: 200
      }).then(res => {
        let rd = res.data;
        if(rd.length === 0) return; //没有仓
        for(let i = 0; i < rd.length; i++){
          if(i === 0){
            query.init_storehouse_id = rd[0].id;
            query.storehouse_id = rd[0].id;
          }
          filterData[0].items.push({key: rd[i].id, title: rd[i].title, active: false});
        }
        filterData[0].items[0].active = true;
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
      query.storehouse_id = data.storehouse_id || query.init_storehouse_id;
      query.buyer_id = data.buyer_id || '';
      query.page = 1;
      query.sale_type = data.sale_type || '';
      query.purchase_place_type = data.purchase_place_type || '';

      if(type === 'reset') query.condition = '';
      
      for(let j = 0; j < filterData[0].items.length; j++){
        if(filterData[0].items[j].key === query.storehouse_id){
          filterData[0].items[j].active = true;
        }else{
          filterData[0].items[j].active = false;
        }
      }
      for(let j = 0;j < filterData[1].items.length; j++){
        if(filterData[1].items[j].key === query.sale_type){
          filterData[1].items[j].active = true;
        }else{
          filterData[1].items[j].active = false;
        }
      }
      for(let j = 0;j < filterData[2].items.length; j++){
        if(filterData[2].items[j].key === query.purchase_place_type){
          filterData[2].items[j].active = true;
        }else{
          filterData[2].items[j].active = false;
        }
      }
      for(let j = 0; j < filterData[3].items.length; j++){
        if(filterData[3].items[j].key === query.buyer_id){
          filterData[3].items[j].active = true;
        }else{
          filterData[3].items[j].active = false;
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
        Http.get(Config.api.supPurchaseQueryForAccept, that.data.query).then(res => {
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
      console.log(result);
      
      if(result.indexOf('{') !== 0 || result.indexOf('}') !== result.length - 1){
        wx.showToast({
          title: '请扫专用二维码',
          icon: 'none'
        });
        return;
      }
      //JSON.parse(JSON.stringify(json))
      result = JSON.parse(result);
      if(result.type === 'item'){
        let { query } = this.data;
        query.page = 1;
        query.condition = result.item_code;
        this.setData({ query }, ()=>{
          this.getData((rd) => {
            if(rd.items.length === 1){
              wx.navigateTo({
                url: `/packageOperate/pages/receiving/purchase-opt/purchase-opt?id=${rd.items[0].id}`
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
    //跳转收货
    skipReceiv(e){
      let item = e.currentTarget.dataset.item;
      if(item.qa_times <= 0){
        wx.showToast({
          title: '该商品尚未品控，请联系品控及时操作',
          icon: 'none'
        });
        return;
      }
      wx.navigateTo({
        url: `/packageOperate/pages/receiving/purchase-receiv/purchase-receiv?id=${item.id}`
      });
    }
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
