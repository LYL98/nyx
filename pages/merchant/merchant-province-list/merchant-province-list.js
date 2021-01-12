// pages/merchant/merchant-province-list/merchant-province-list.js
const app = getApp();
const config = require('./../../../utils/config');
const http = require('./../../../utils/http');

Page({

  /**
   * Page initial data
   */
  data: {
    selectedProvince: { },
    provinceList: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    let { selected } = options;
    selected = selected && JSON.parse(decodeURIComponent(selected));
    this.setData({
      selectedProvince: Object.assign(this.data.selectedProvince, selected)
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
    app.signIsLogin(() => {
      this.loadProvinceList();
    })
  },

  loadProvinceList() {
    http.get(config.api.baseProvinceList, {is_no_prompt: true})
        .then(res => {
          this.setData({
            provinceList: res.data
          })
          // console.log('res.data: ', res.data)
        })
  },

  selectProvince(event) {
    let item = event.target.dataset.item;
    this.setData({
      selectedProvince: item
    });
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (typeof prevPage.selectProvinceCallBack === 'function') {
      prevPage.selectProvinceCallBack(item)
    }
    wx.navigateBack();
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