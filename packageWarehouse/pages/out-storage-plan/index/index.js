const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    auth: {},
    status: {
      keys: [], //'market', 'distribute'
      values: [] //'销售出库', '调拨出库'
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
      let { auth, status, activeIndex } = this.data;
      auth = app.globalData.auth;
      activeIndex = 1;
      if(auth.isAdmin || auth.WarehouseOutStorage){
        status.keys.push('market');
        status.values.push('销售出库');
        activeIndex = 0;
      }
      if(auth.isAdmin || auth.DistributeOutStorage){
        status.keys.push('distribute');
        status.values.push('调拨出库');
      }
      if(!auth.isAdmin && !auth.WarehouseOutStorage && !auth.DistributeOutStorage){
        activeIndex = -1;
      }
      this.setData({ activeIndex, auth, status });
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