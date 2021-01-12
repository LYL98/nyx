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
    distributeWaybillStatus: Constant.DISTRIBUTE_WAYBILL_STATUS(),
    distributeWaybillStatusType: Constant.DISTRIBUTE_WAYBILL_STATUS_TYPE,
    distributeReceiveStatus: Constant.DISTRIBUTE_RECEIVE_STATUS(),
    query: {
      status: 'deliveried,part_in',
      init_tar_storehouse_id: '',
      tar_storehouse_id: '',
      condition: ''
    },
    filterData: [{
      key: 'tar_storehouse_id',
      title: '选择仓',
      items: [], //{key: '', title: '全部', active: true}
    }],
  },

  //组件生命周期
	lifetimes: {
		attached(){
      this.getTarStorehouse();
		},
	},

  /**
   * 组件的方法列表
   */
  methods: {
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
            query.init_tar_storehouse_id = rd[0].id;
            query.tar_storehouse_id = rd[0].id;
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
      query.tar_storehouse_id = data.tar_storehouse_id || query.init_tar_storehouse_id;
      query.page = 1;
      if(type === 'reset') query.condition = '';
      for(let j = 0; j < filterData[0].items.length; j++){
        if(filterData[0].items[j].key === query.tar_storehouse_id){
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
        Http.get(Config.api.supDistributeQueryForAccept, that.data.query).then(res => {
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
      if(result.type === 'item'){
        let { query } = this.data;
        query.page = 1;
        query.condition = result.item_code;
        this.setData({ query }, ()=>{
          this.getData((rd) => {
            if(rd.items.length === 1){
              if(rd.items[0].distribute_details.length === 1){
                wx.navigateTo({
                  url: `/packageOperate/pages/receiving/distribute-opt/distribute-opt?id=${rd.items[0].distribute_details[0].id}`
                });
              }
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
        url: `/packageOperate/pages/receiving/distribute-receiv/distribute-receiv?id=${item.id}`
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
