Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeList: ['售后单号/门店名称', '商品编号/名称'],
    index: 0,
    condition: '',
    item: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  changeType(event) {
    this.setData({
      index: event.detail.value,
      condition: '',
      item: ''
    })
  },

  confirmCondition(event) {
    let pages = getCurrentPages();
    let prevPage = pages[ pages.length - 2 ];
    prevPage.setData({
      search: Object.assign(prevPage.data.search, {
        aftersale: Object.assign(prevPage.data.search.aftersale, {
          condition: this.data.index == 0 ? event.detail.value : '',
          item: this.data.index == 1 ? event.detail.value : ''
        })
      })
    })
    wx.navigateBack();
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