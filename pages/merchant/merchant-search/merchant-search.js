// pages/merchant/merchant-search/merchant-search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    condition: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  confirmCondition(event) {
    let pages = getCurrentPages();
    let prevPage = pages[ pages.length - 2 ];
    prevPage.setData({
      query: Object.assign(prevPage.data.query, {
        condition: event.detail.value,
        page: 1
      })
    })
    wx.navigateBack();
  },
})