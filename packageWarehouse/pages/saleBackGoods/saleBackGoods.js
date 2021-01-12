const app = getApp();
import { Config, Http, Constant, Verification, Util } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';
Page({
  behaviors: [ Base, Detail ],

  /**
   * 页面的初始数据
   */
  data: {
    subLoading: false,
    detail:{},
    addData:{
      desc:''
    },
    fromPage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.setNavigationBarTitle({
      title: '收货信息'
    });
    let { from, index } = options;
    that.setData({fromPage: from})
    app.signIsLogin((res)=>{
      this.getData(from, Number(index));
    });
  },


  getData(from, index){
    let { detail } = this.data
    if(from === 'saleBack'){
      let sPage = this.getPage('packageWarehouse/pages/saleBack/saleBack');
      if(sPage){
        detail = sPage.data.dataItem.items[index];
      }
    }else if (from === 'saleBackDriver'){
      let sPage = this.getPage('packageWarehouse/pages/saleBackDriver/saleBackDriver');
      if(sPage){
        detail = sPage.data.dataItem.items[index];
      }
    }
    this.setData({detail})
  },
  //确认
  handleAffirm(){
    let that = this;
    let { detail } = that.data;
    let msgStr = `请仔细核对数量，数量为${detail.back_num}件`;
    msgStr += '，是否确认收货？';
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
  //确认收货
  commonSubmit(){
    let that = this
    let { detail, addData,fromPage } = that.data;
    that.setData({ subLoading: false });
    Http.post(Config.api.saleBackFinish, {
      id: [detail.id],
      desc: addData.desc
    }).then((res)=>{
      that.setData({ subLoading: false });
      if(fromPage === 'saleBackDriver'){
        let page = that.getPage('packageWarehouse/pages/saleBackDriver/saleBackDriver');
        if(page){
          page.getData();
        }
      }else{
        let page = that.getPage('packageWarehouse/pages/saleBack/saleBack');
        if(page){
          page.getData();
        }
      }
      wx.navigateBack();
      wx.showToast({
        title: '收货成功',
        icon: 'none'
      });
    }).catch(error => {
      that.setData({ subLoading: false });
    });
  },
})