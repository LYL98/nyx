// pages/setting/setting-operator-reset-password/setting-operator-reset-password.js
const app = getApp();
import config from './../../../utils/config';
import md5 from './../../../utils/md5';
const http = require('./../../../utils/http');

Page({

  /**
   * Page initial data
   */
  data: {
    editData: {
      id: '',
      password: '',
    },
    loading: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    //判断登录
    app.signIsLogin();

    let { id } = options;

    this.setData({
      'editData.id': id || '',
    });
  },

  //输入框事件
  inputChange(e) {
    let value = e.detail.value.trim();
    this.setData({
      editData: Object.assign(this.data.editData, {password: value})
    });
  },

  //确定
  submit(){
    let that = this;
    let { editData } = that.data;
    if (!editData.password) {
      wx.showToast({
        title: '请输入新的登陆密码',
        icon: 'none'
      });
      return false;
    }
    if (editData.password.length < 6 || editData.password.length > 15 || /.*[\u4e00-\u9fa5]+.*/.test(editData.password)) {
      wx.showToast({
        title: '请输入6-15位的非中文字符',
        icon: 'none'
      });
      return false;
    }
    editData.password = md5(editData.password);
    that.setData({ loading: true });
    http.post(config.api.operatorPwdReset, editData)
        .then(res => {
          if (res.code === 0) {
            wx.showToast({
              title: '密码重置成功',
              icon: 'success'
            });
          }
          that.setData({ loading: false });
          setTimeout(() => {
            wx.navigateBack();
          }, 500)
        })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})