// pages/order/order.js
const app = getApp();
const config = require('./../../utils/config');
const http = require('./../../utils/http');

const sliderWidth = 90; // 需要设置slider的宽度，用于计算中间位置

Page({
  /**
   * 组件的初始数据
   */
  data: {
    tabs: [],
    sliderOffset: 0,
    sliderLeft: 0,
    activeIndex: -1,

    auth: {},
    province_code: '',
    opt_type: '',
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
    });
  },

  /**
   * 页面加载完毕后，配置区域code 权限列表、tabs选项卡
   */

  onLoad: function () {
    let that = this;

    app.signIsLogin(() => {
      // 根据权限显示tabs选项卡的内容

      let auth = app.globalData.auth;
      let tabs = [];
      let activeIndex = 0;

      if (auth.isAdmin) {
        tabs.push('客户管理');
        tabs.push('意向客户');
      } else {
        if (auth.MerchantStoreQuery) {
          tabs.push('客户管理');
        }
        if (auth.IntentionMerchantQuery) {
          tabs.push('意向客户');
          activeIndex = auth.MerchantStoreQuery ? 0 : 1;
        }

        if (tabs.length === 0) {
          wx.showModal({
            title: '提示',
            content: '没有操作权限',
            confirmText: '我知道了',
            confirmColor: '#00ADE7',
            showCancel: false,
          });
          return;
        }
      }

      // console.log("app.globalData.loginUserInfo.opt_type: ", app.globalData.loginUserInfo.opt_type)
      this.setData(
        {
          tabs: tabs,
          activeIndex: activeIndex,
          auth: auth,
          province_code: app.globalData.loginUserInfo.province_code,
          opt_type: app.globalData.loginUserInfo.opt_type,
        },
        () => {
          wx.getSystemInfo({
            success: function (res) {
              that.setData({
                sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                sliderOffset: (res.windowWidth / that.data.tabs.length) * that.data.activeIndex,
              });
            },
          });
        }
      );
    });
  },
  /**
   * 页面上拉触底事件的处理函数，根据当前激活的选项卡，触发对应组件的下拉刷新事件
   */
  onReachBottom: function () {
    if (this.data.activeIndex == 0) {
      this.selectComponent('#merchant-list').onReachBottom();
    } else if (this.data.activeIndex == 1) {
      this.selectComponent('#intention-list').onReachBottom();
    }
  },
});
