// pages/setting/setting-profile/setting-profile.js
import config from "../../../utils/config";

const app = getApp();

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    userInfo: Object,
    auth: Object,
  },

  /**
   * 页面的初始数据
   */
  data: {
    rightSrc: './../../../assets/img/right.png',
    loginUserInfo: {},
    tencentPath: config.tencentPath,
    tencentUpPath: config.tencentUpPath,
    defaultAvatar: './../../../assets/img/default_avatar.png',
  },

  pageLifetimes: {
    show() {
      app.signIsLogin(() => {
        this.setData({
          loginUserInfo: app.globalData.loginUserInfo
        });
      });
    }
  },

  methods: {
    initialize() {
      this.setData({
        loginUserInfo: this.properties.userInfo
      });
    },

    logout() {
      app.globalData = {
        loginUserInfo: {},
        globalProvince: {}
      };
      wx.removeStorageSync('loginUserInfo');
      wx.removeStorageSync('globalProvince');
      wx.reLaunch({
        url: '/pages/loginGuide/loginGuide',
      });
    },

    previewAvatar(event) {
      let { tencentPath } = this.data;
      var image = event.currentTarget.dataset.src;

      let current = tencentPath + image;

      wx.previewImage({
        current: current,
        urls: [current]
      })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
  }

})
