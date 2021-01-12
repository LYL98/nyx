// packageOperate/pages/sup-stock-distribute/sup-stock-distribute.js
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
    distributes:[],
    rangeData: [],
    addData:{
      distribute_id: '',
      driver_realname: '',
      need_allocate_num: '',
      plan_num: '',
      dist_num: ''
    },
    detail:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '场地调拨'
    });
    let index = options.index
    app.signIsLogin((res)=>{
      this.getData(Number(index));
    });

  },

  getData(index){
    let { detail,distributes } = this.data;
    let page = this.getPage('packageOperate/pages/item/item');
    if(page){
      detail = page.data.dataItem.items[index];
      
      distributes = page.data.distributes.map(item => ({
        distribute_id: item.id,
        driver_realname: item.driver.realname,
        plan_num: item.plan_num,
        dist_num: item.dist_num,
      }))
      this.setData({detail,distributes});
     }
  },
  skipPage(e){
    let url = e.currentTarget.dataset.page;
    wx.navigateTo({ url });
  },
  //确认
  handleAffirm(){
    let that = this;
    let { addData,detail } = that.data;
    let con = true;
    if(!addData.distribute_id){
      addData.distribute_id_error = '请选择司机';
      con = false;
    }
    if(!Verification.isNumber(addData.need_allocate_num)){
      addData.need_allocate_num_error = '请输入正确的数值';
      con = false;
    }else if(!addData.need_allocate_num || Number(addData.need_allocate_num) === 0){
      addData.need_allocate_num_error = '不能小于1件';
      con = false;
    }else if(Number(addData.need_allocate_num) > Number(detail.num)){
      addData.need_allocate_num_error = '不能大于商品库存数量';
      con = false;
    }else if(Number(addData.need_allocate_num) > (Number(addData.plan_num) - Number(addData.dist_num))){
      addData.need_allocate_num_error = '不能大于调拨计划剩余数量';
      con = false;
    }
    if(!con){
      that.setData({ addData });
      return;
    }
    this.commonSubmit()
  },
  commonSubmit(){
    let that = this;
    let { addData, detail } = that.data;
    that.setData({ subLoading: true });
    Http.post(Config.api.operateItemSupStockDistribute,{
      batch_code: detail.batch_code,
      distribute_id: Number(addData.distribute_id),
      need_allocate_num: Number(addData.need_allocate_num)
    }).then(()=>{
      that.setData({ subLoading: false });
      let page = that.getPage('packageOperate/pages/item/item');
        if(page){
          page.getData();
        }
        wx.navigateBack();
        wx.showToast({
          title: '调拨成功',
          icon: 'none'
        });
    }).catch(()=>{
      that.setData({ subLoading: false });
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})