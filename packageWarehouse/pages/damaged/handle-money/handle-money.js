

const app = getApp();
import { Config, Http, Constant, Verification, Util } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';
Page({
  behaviors: [ Base, Detail ],

  /**
   * 页面的初始数据
   */
  data: {
    subLoading: false,
    detail:{},
    addData:{
      sale_amount:'',
      remark:'',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '提交货款'
    });
    let { from, id } = options;
    // that.setData({fromPage: from})
    app.signIsLogin((res)=>{
      this.getData(from,id);
    });
  },
   //获取数据
   getData(from, id){
    let { detail } = this.data;
    let that = this;
    wx.showNavigationBarLoading();
    that.setData({
      loading: true
    }, ()=>{
      Http.get(Config.api.trashLogDetail, {id: id}).then(res => {

        that.handleResData(res.data);
      }).catch((error)=>{
        that.handleResError(error);
      });
    });

    this.setData({detail});
  },
  
  //确认
  handleAffirm(){
    let that = this;
    let { addData,detail } = that.data;
    let con = true;
    //线下销售
    if(!Verification.isPrice(addData.sale_amount) || !Number(addData.sale_amount) || !addData.sale_amount ){
        addData.sale_amount_error = '请输入正确的数值(最多保留两位小数)';
        con = false;
      }
    
    if(!con){
      that.setData({ addData });
      return;
    }
    let msgStr = `销售金额为：${addData.sale_amount}元，是否确认？`;
    wx.showModal({
      title: '提示',
      content: msgStr,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.commonSubmit();
        }
      }
    });
  },
  //确认处理
  commonSubmit(){
    let that = this
    let { detail, addData } = that.data;
    that.setData({ subLoading: false });
    Http.post(Config.api.trashLogEditSaleAmount, {
      id: detail.id,
      sale_amount: Util.handlePrice(addData.sale_amount),
      remark: addData.remark,
    }).then((res)=>{
      that.setData({ subLoading: false });
      let pc = that.getPage('packageWarehouse/pages/damaged/index/index');
      
      let com = this.getPageComponent(pc, 'msgDamaged');
      if(com){
        com.setData({
          'query.page': 1
        }, ()=>{
          com.getData();
        });
      }
      wx.navigateBack();
      wx.showToast({
        title: '提交成功',
        icon: 'none'
      });
    }).catch(error => {
      that.setData({ subLoading: false });
    });
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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