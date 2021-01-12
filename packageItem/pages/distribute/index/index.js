const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    auth: {},
    activeIndex: -1,
    pageOnPullDownRefresh: 0,
    pageOnReachBottom: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      let { auth } = this.data;
      auth = app.globalData.auth;
      this.setData({ activeIndex: 0, auth });
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      pageOnPullDownRefresh: this.data.pageOnPullDownRefresh + 1
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      pageOnReachBottom: this.data.pageOnReachBottom + 1
    });
  },
})