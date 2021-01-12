// packageWarehouse/pages/addCheck/addCheck.js
const app = getApp();
import { Config, Http, Constant, Verification } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';
Page({
  behaviors: [ Base, Detail ],

  /**
   * 页面的初始数据
   */
  data: {
    subLoading:false,
    addData:{
      storehouse_id:'',
      warehouse_id: '',
      warehouse_title: '',
      remark:'',
      num: null,
      item_id: '',
      item_code:'',
      item_title:'',
      batch_code:'',
      ware_tray_item_id:'',
      c_item_id:''
    },
    selectStorehouse:{},
    //扫码搜索的条件
    query:{
      storehouse_id: '',
      c_item_id: '',
      condition:'',
      page: 1,
      page_size: Constant.PAGE_SIZE
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { addData } = this.data;

    let page = this.getPage('packageWarehouse/pages/index/index');
    let selectStorehouse = {};
    if(page){
      selectStorehouse = page.data.selectStorehouse;
      addData.storehouse_id = selectStorehouse.id;
    }
    this.setData({ addData, selectStorehouse })
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
  //选择商品
  skipPage(e){
    let url = e.currentTarget.dataset.page;
    let { addData } = this.data;
    if(url.indexOf('selectBatchCode') >= 0 && !addData.item_id){
      wx.showToast({ title: '请先选择商品', icon: 'none' });
      return;
    }
    wx.navigateTo({ url });
  },

  //选择仓库
  changeWarehouse(e){
    let { addData } = this.data
    let index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    addData.warehouse_title = value.title
    addData.warehouse_id= value.id
    addData.warehouse_id_error= ''
    this.setData({addData})

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
  //扫码选择批次
  // getScanMsg(){
  //   let that = this;
  //   let {addData,detail} = that.data
  //   wx.showNavigationBarLoading();
  //   Http.get(Config.api.stockItemBatchList, that.data.query).then(res => {
  //     wx.hideNavigationBarLoading();
  //     if(res.data.items.length === 1){
  //       detail = res.data.items[0]
  //       addData.item_code = detail.item_code
  //       addData.item_title = detail.item_title
  //       addData.batch_code = detail.batch_code
  //       addData.c_item_id_error = ''
  //       addData.batch_code_error = ''
  //       addData.c_item_id = detail.c_item_id
  //       that.setData({addData,detail})
  //     }else{
  //       console.log(res.data);  
  //     }
  //   }).catch((error)=>{
  //     wx.hideNavigationBarLoading();
  //   });
  // },
  //扫码选择商品
  getScanMsg(){
    let that = this;
    let {addData,detail} = that.data
    wx.showNavigationBarLoading();
    Http.get(Config.api.stockItemList, that.data.query).then(res => {
      wx.hideNavigationBarLoading();
      if(res.data.items.length === 1){
        detail = res.data.items[0]
        addData.item_code = detail.code
        addData.item_title = detail.title
        addData.item_id = detail.id
        addData.item_id_error = '';
        addData.c_item_id_error = ''
        addData.batch_code_error = ''
        addData.c_item_id = detail.c_item_id
        that.setData({addData})
      }else{
        console.log(res.data);  
      }
    }).catch((error)=>{
      wx.hideNavigationBarLoading();
    });
  },
    //扫码成功
    scancodeSuccess(result){
      console.log(result);

      if(result.indexOf('{') !== 0 || result.indexOf('}') !== result.length - 1){
        wx.showToast({
          title: '请扫正确的商品码',
          icon: 'none'
        });
        return;
      }
      
      //JSON.parse(JSON.stringify(json))
      result = JSON.parse(result);
      console.log(result);
      
      let { addData,query,selectStorehouse } = this.data;
      if(result.type === 'item'){
        query.page = 1;
        query.storehouse_id = selectStorehouse.id
        query.c_item_id = result.c_item_id;
        this.setData({ query }, ()=>{
          this.getScanMsg()
        });
      }
      else{
        wx.showToast({
          title: '请扫描正确的商品码',
          icon: 'none'
        });
      }
    },
  //确认提交
  handleAffirm(){
    let that = this;
    let { addData,selectStorehouse } = that.data
    let con = true
    if(!addData.c_item_id){
      addData.c_item_id_error = '请选择商品';
      con = false
    }
    if(!addData.batch_code){
      addData.batch_code_error = '请选择批次';
      con = false
    }
    if(!addData.num || !Number(addData.num)){
      addData.num_error = '不能小于1件';
      con = false
    }
    if(!Verification.isNumber(addData.num)){
      addData.num_error = '请输入正确的数值';
      con = false
    }
    if(!addData.warehouse_title){
      addData.warehouse_id_error = '请选择要入的仓库'
      con = false
    }
    if(!con){
      that.setData({ addData });
      return;
    }
    wx.showModal({
      title: '提示',
      content: `请仔细确认信息，盘点数量${addData.num}件，入库为${addData.warehouse_title},是否确认？`,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.setData({
            subLoading: true
          }, ()=>{
            Http.post(Config.api.wareTrayItemAddCheck, {
              warehouse_id: addData.warehouse_id,
              batch_code: addData.batch_code,
              num: Number(addData.num),
              remark: addData.remark
            }).then(res => {
              that.setData({ subLoading: false });
              // let page = that.getPage('packageWarehouse/pages/trayDetail/trayDetail');
              // if(page){
              //   page.supWareTrayDetail();
              // }else{
              //   page = that.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
              //   if(page){
              //     page.getData();
              //   }
              // }
             let page = that.getPage('packageWarehouse/pages/inventory/inventory');
             if(page){
              page.getData();
             }
              wx.navigateBack();
              wx.showToast({
                title: '新增盘点成功',
                icon: 'none'
              });
            }).catch(error => {
              that.setData({ subLoading: false });
            });
          });
        }
      }
    });
  },
 
})