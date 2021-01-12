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
    purchaseStatus: Constant.PURCHASE_STATUS(),
    purchaseStatusType: Constant.PURCHASE_STATUS_TYPE,
    query: {
      custom_type: 'B',
      status: 'init,audit_success,part_in', //init,audit_success,part_in
      tar_storehouse_id: '',
      for_pre: 1, //1预采 0反采
      is_mobile: 1, //是否为移动端请求
      purchase_place_type: '',
    },
    filterData: [{
      key: 'tar_storehouse_id',
      title: '选择送达仓',
      items: [{key: '', title: '全部', active: true}] //{key: '', title: '全部', active: true}
    },{
      key: 'status',
      title: '选择状态',
      items: [
        {key: 'init,audit_success,part_in', title: '全部', active: true},
        {key: 'init', title: '待审核', active: false},
        {key: 'audit_success', title: '待收货', active: false},
        {key: 'part_in', title: '部分收货', active: false},
        {key: 'all_in', title: '已完成', active: false} //完成状态时显示所有已完成数据
      ]},
      {
        key: 'purchase_place_type',
        title: '选择采购地',
        items: [
          {key: '', title: '全部', active: true},
          {key: 'local', title: '本地', active: false},
          {key: 'origin', title: '异地', active: false},
        ]},

    ],
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
    changeCustomType(e){
      let key = e.currentTarget.dataset.key;
      let { query } = this.data;
      query.custom_type = key;
      query.page = 1;
      this.setData({ query }, () => {
        this.getData();
      });
    },
    //获取送达仓
    getTarStorehouse(){
      let that = this;
      let { query, filterData } = that.data;
      wx.showNavigationBarLoading();
      Http.get(Config.api.baseStorehouseList, {
        need_num: 200
      }).then(res => {
        let rd = res.data;
        for(let i = 0; i < rd.length; i++){
          filterData[0].items.push({key: rd[i].id, title: rd[i].title, active: false});
        }
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
      query.tar_storehouse_id = data.tar_storehouse_id || '';
      query.status = data.status || 'init,audit_success,part_in';
      query.purchase_place_type = data.purchase_place_type || '';
      query.page = 1;
      if(type === 'reset') query.condition = '';
      filterData.forEach(fd => {
        for(let j = 0; j < fd.items.length; j++){
          if(fd.items[j].key === query[fd.key]){
            fd.items[j].active = true;
          }else{
            fd.items[j].active = false;
          }
        }
      });
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
      let { query } = this.data;
      wx.showNavigationBarLoading();
      this.setData({
        loading: true
      }, ()=>{
        Http.get(Config.api.fromSupplierOrderQuery, {
          ...query,
          is_mobile: query.status === 'init,audit_success,part_in' ? 1 : 0
        }).then(res => {
          this.handleResData(res.data);
          typeof callback === 'function' && callback(res.data);
        }).catch(error => {
          this.handleResError(error);
        });
      });
    },
    //新增采购
    addPurchase(){
      wx.navigateTo({
        url: '/packageItem/pages/purchase/globalAdd/globalAdd?custom_type=' + this.data.query.custom_type
      });
    },
    //跳转详情
    skipDetail(e){
      let { auth } = this.properties;
      if(auth.isAdmin || auth.ItemGPurchaseDetail){
        let { dataItem } = this.data;
        let index = e.currentTarget.dataset.index;
        let id = dataItem.items[index].id;
        wx.navigateTo({
          url: `/packageItem/pages/purchase/purchaseDetail/purchaseDetail?id=${id}`
        });
      }
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
