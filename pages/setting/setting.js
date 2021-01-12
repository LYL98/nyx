// pages/setting/setting.js
const app = getApp();

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [],
    sliderOffset: 0,
    sliderLeft: 0,
    activeIndex: 0,

    auth: {},
    userInfo: {}
  },

  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });

    let tabIndex = e.currentTarget.id;

    let tab = this.data.tabs[Number(tabIndex)];
    switch (tab) {
      case '运营人员':
        let so = this.selectComponent('#setting-operator');
        if (so) so.initialize();
        break;
      case '个人中心':
        let sp = this.selectComponent('#setting-profile');
        if (sp) sp.initialize();
        break;
    }
  },

  /**
   * 页面加载完毕后，配置区域code 权限列表、tabs选项卡
   */

  onLoad: function() {
    let that = this;

    app.signIsLogin(() => {
      let activeIndex = 0;
      let auth = app.globalData.auth;
      let tabs = Array();

      if (auth.isAdmin || auth.SystemOperatorList) {
        tabs.push('运营人员');
      }
      tabs.push('个人中心');

      that.setData({
        auth: auth,
        userInfo: app.globalData.loginUserInfo,
        tabs: tabs,
        activeIndex: activeIndex
      });

      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
            sliderOffset: (res.windowWidth / that.data.tabs.length) * that.data.activeIndex
          });
        }
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    setTimeout(() => {
      if (this.data.tabs.length === 1) {
        let sp = this.selectComponent('#setting-profile');
        if (sp) sp.initialize();
      } else {
        let so = this.selectComponent('#setting-operator');
        if (so) so.initialize();
      }
    }, 200);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数，根据当前激活的选项卡，触发对应组件的下拉刷新事件
   */
  onReachBottom: function() {
    if (this.data.activeIndex == 1) {
      let sp = this.selectComponent('#setting-profile');
      if (sp) sp.initialize();
    } else if (this.data.activeIndex == 0) {
      let so = this.selectComponent('#setting-operator');
      if (so) {
        so.setData(
          {
            'query.page': so.data.query.page + 1
          },
          () => {
            so.operatorList();
          }
        );
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
