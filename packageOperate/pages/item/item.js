// packageOperate/pages/item/item.js
const app = getApp();

import { Util, Constant, Http, Config } from "./../../../utils/index";
import { Base, List } from './../../../behaviors/index';
Page({
  behaviors: [ Base, List ],
  /**
   * 页面的初始数据
   */
  data: {
    auth: {},
    query: {
      custom_type:'B',
      storehouse_id: '',
      condition:'',
      opt_type:'',
    },
    filterData: [{
      key: 'storehouse_id',
      title: '选择仓',
      items: [], //{key: '', title: '全部', active: true}
    },
    {
      key: 'opt_type',
      title: '操作类型',
      items: [{key: '', title: '全部', active: true},{key: 'allocate', title: '分配', active: true},{key: 'distribute', title: '调拨', active: true}] //{key: '', title: '全部', active: true}
    }],
    distributes:[]
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let operate = options.operate || '';
    wx.setNavigationBarTitle({
      title: '场地商品'
    });
    this.getTarStorehouse()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
    query.opt_type = data.opt_type || '';
    query.page = 1;
    query.sale_type = data.sale_type || ''
    if(type === 'reset') query.condition = '';
    
    for(let j = 0; j < filterData[0].items.length; j++){
      if(filterData[0].items[j].key === query.storehouse_id){
        filterData[0].items[j].active = true;
      }else{
        filterData[0].items[j].active = false;
      }
    }
    for(let j = 0;j < filterData[1].items.length; j++){
      if(filterData[1].items[j].key === query.opt_type){
        filterData[1].items[j].active = true;
      }else{
        filterData[1].items[j].active = false;
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
      app.signIsLogin((res)=>{
        this.setData({
          auth:  app.globalData.auth,
        },()=>{
          this.getData();
        })
      });
    });
  },
  //获取数据
  getData(callback){
    let that = this;
    wx.showNavigationBarLoading();
    that.setData({
      loading: true
    }, ()=>{
      Http.get(Config.api.operateItemSupStockQuery, that.data.query).then(res => {
        that.handleResData(res.data);
        typeof callback === 'function' && callback(res.data);
      }).catch(error => {
        that.handleResError(error);
      });
    });
  },
  //分配
  handleAllocateItems(e){
    let item = e.currentTarget.dataset.item;
    let that = this
    let { query } = this.data;
    wx.showLoading()
    Http.post(Config.api.operateItemSupStockAllocate,{
      storehouse_id: query.storehouse_id || '',
      batch_code: item.batch_code
    }).then((res)=>{
    wx.hideLoading()

      wx.showToast({
        title: '分配成功',
        icon: 'none'
      });
      that.getData()
    }).catch(()=>{
    wx.hideLoading()

    })
  },
  //调拨
  handleDistributeItem(e){
    
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    let that = this
    let { query } = this.data;
    

    wx.showModal({
      title: '提示',
      content: `是否确认调拨`,
      confirmColor: '#00ADE7',
      success(res){
        if(res.confirm){
          wx.showLoading()
          Http.get(Config.api.operateItemSupStockGetDistributes,{
            src_storehouse_id: query.storehouse_id || '',
            c_item_id: item.c_item_id || ''
            }).then(resp => {
              if(resp.code !==0 || !Array.isArray(resp.data)){
                wx.hideLoading()
                return
              } 
      
              if(resp.data.length === 0){
                wx.hideLoading()
                wx.showToast({
                  title: '该商品没有关联的调拨单！',
                  icon: 'none'
                });
              }else if(resp.data.length === 1){
                const {id, plan_num, dist_num} = resp.data[0];
                    Http.post(Config.api.operateItemSupStockDistribute,{
                      batch_code: item.batch_code,
                      distribute_id: id,
                      need_allocate_num: plan_num - dist_num > Number(item.num) ? Number(item.num) : plan_num - dist_num
                    }).then(()=>{
                      wx.hideLoading()
                      wx.showToast({
                        title: '调拨成功',
                        icon: 'none'
                      })
                      wx.hideLoading()
                      that.getData()
                    })
                }else{
                  that.setData({
                    distributes: resp.data
                  },()=>{
                    wx.navigateTo({
                      url: `/packageOperate/pages/sup-stock-distribute/sup-stock-distribute?index=${index}`
                    })
                  })
                  wx.hideLoading()
                  
                }
            }).catch(error => {
              wx.hideLoading()
            })
        }
      }
    })
    
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
      console.log(result);
      
      let { query } = this.data;
      query.page = 1;
      query.condition = result.item_code;
      this.setData({ query }, ()=>{
        this.getData();
      });
    }else{
      wx.showToast({
        title: '请扫商品码',
        icon: 'none'
      });
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