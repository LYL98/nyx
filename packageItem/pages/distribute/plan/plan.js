// pages/setting/setting-operator/setting-operator.js
import { Util, Constant, Http, Config } from "../../../../utils/index";
import { Base, List } from '../../../../behaviors/index';

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
    distributePlanStatus: Constant.DISTRIBUTE_PLAN_STATUS(),
    distributePlanStatusType: Constant.DISTRIBUTE_PLAN_STATUS_TYPE,
    query: {
      status: 'init',
      src_storehouse_id: '',
      tar_storehouse_id: ''
    },
    filterData: [{
      key: 'src_storehouse_id',
      title: '选择调出仓',
      items: [{key: '', title: '全部', active: true}]
    },{
      key: 'tar_storehouse_id',
      title: '选择调入仓',
      items: [{key: '', title: '全部', active: true}]
    }],
  },

  //组件生命周期
	lifetimes: {
		attached(){
      this.getStorehouse();
		},
	},

  /**
   * 组件的方法列表
   */
  methods: {
    //获取调入/出仓【无权限控制】
    getStorehouse(){
      let that = this;
      let { query, filterData } = that.data;
      wx.showNavigationBarLoading();
      Http.get(Config.api.baseStorehouseList, {
        need_num: 200
      }).then(res => {
        let rd = res.data;
        for(let i = 0; i < rd.length; i++){
          filterData[0].items.push({key: rd[i].id, title: rd[i].title, active: false});
          filterData[1].items.push({key: rd[i].id, title: rd[i].title, active: false});
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
      query.src_storehouse_id = data.src_storehouse_id || '';
      query.tar_storehouse_id = data.tar_storehouse_id || '';
      query.page = 1;
      if(type === 'reset'){
        query.condition = '';
      }
      filterData[0].items.forEach(item => {
        if(item.key === query.src_storehouse_id){
          item.active = true;
        }else{
          item.active = false;
        }
      });
      filterData[1].items.forEach(item => {
        if(item.key === query.tar_storehouse_id){
          item.active = true;
        }else{
          item.active = false;
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
      let that = this;
      wx.showNavigationBarLoading();
      that.setData({
        loading: true
      }, ()=>{
        Http.get(Config.api.supDistributePlanQuery, that.data.query).then(res => {
          that.handleResData(res.data);
          typeof callback === 'function' && callback(res.data);
        }).catch(error => {
          that.handleResError(error);
        });
      });
    },
    //新增调拨计划
    addPlan(){
      wx.navigateTo({
        url: '/packageItem/pages/distribute/planAdd/planAdd'
      });
    },
    //跳转详情
    skipDetail(e){
      let { dataItem } = this.data;
      let index = e.currentTarget.dataset.index;
      let id = dataItem.items[index].id;
      wx.navigateTo({
        url: `/packageItem/pages/distribute/planDetail/planDetail?id=${id}`
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
