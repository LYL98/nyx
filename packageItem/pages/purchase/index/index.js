const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    auth: {},
    status: {
      keys: [], //'global', 'local'
      values: [] //'预采', '反采'
    },
    activeIndex: -1,
    pageOnPullDownRefresh: 0,
    pageOnReachBottom: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      let { auth, status } = this.data;
      auth = app.globalData.auth;
      if(auth.isAdmin || auth.ItemGPurchase){
        status.keys.push('global');
        status.values.push('预采');
      }
      if(auth.isAdmin || auth.ItemLocalPurchase){
        status.keys.push('local');
        status.values.push('反采');
      }
      this.setData({ activeIndex: 0, auth, status });
    });
  },
  
  //切换订单状态
  clickTab(e) {
    let activeIndex = e.detail.index;
    this.setData({ activeIndex, pageOnPullDownRefresh: 0, pageOnReachBottom: 0 });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
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