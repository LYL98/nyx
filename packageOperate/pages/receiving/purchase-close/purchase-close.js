const app = getApp();
import { Config, Http } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    subLoading: false,
    detail: {
      id: '',
      remark: '',
      remark_error: ''
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      this.setData({ 'detail.id': options.id });
    });
  },

  //确认
  handleAffirm(){
    let that = this;
    let { detail } = that.data;
    let con = true;
    if(!detail.remark){
      detail.remark_error = '请输入备注';
      con = false;
    }
    if(!con){
      that.setData({ detail });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确认关闭？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.setData({ subLoading: true }, ()=>{
            Http.post(Config.api.supFromSupplierInClose, detail).then(res => {
              that.setData({ subLoading: false });
              let page = that.getPage('packageOperate/pages/receiving/index/index');
              if(page){
                let com = that.getPageComponent(page, 'purchase');
                if(com){
                  com.setData({ 'query.page': 1}, ()=>{
                    com.getData();
                  });
                }
              }
              wx.navigateBack();
              wx.showToast({
                title: '已关闭',
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