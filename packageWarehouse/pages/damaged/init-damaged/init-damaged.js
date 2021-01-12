const app = getApp();
import { Config, Http, Constant } from './../../../../utils/index';
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
    query: {
     
      storehouse_id: '',
      supplier_title:'',
      condition:'',
      custom_type:'B'
    },
    operate: '',
    damagedOptTypes: Constant.DAMAGED_OPT_TYPES(),
    filterData: [
      {
        key: 'sale_type',
        title: '销售类型',
        items: [{key: '', title: '全部', active: true},{key: '自营', title: '自营', active: true},{key: '平台', title: '平台', active: true}] //{key: '', title: '全部', active: true}
      },
      ],
  },
  //组件生命周期
	lifetimes: {
		attached(){
        wx.setNavigationBarTitle({
          title: '残损区'
        });
        let {  query } = this.data;
        let page = this.getPage('packageWarehouse/pages/index/index');
        if(page && page.data.selectStorehouse) {
          query.storehouse_id = page.data.selectStorehouse.id
          query.custom_type = page.data.custom_type
        };
        this.setData({ query }, ()=>{
          this.initGetData();
        });
		},
	},
 
  
  
  /**
   * 组件的方法列表
   */
  methods: {
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

  //获取数据
  getData(callback){
    let that = this;
    wx.showNavigationBarLoading();
    that.setData({
      loading: true
    }, ()=>{
      Http.get(Config.api.trashQuery, that.data.query).then(res => {
        that.handleResData(res.data);
        typeof callback === 'function' && callback(res.data);
      }).catch((error)=>{
        that.handleResError(error);
      });
    });
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