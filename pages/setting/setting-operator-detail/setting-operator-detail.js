// pages/setting/setting-operator-detail/setting-operator-detail.js
import util from "../../../utils/util";
import http from "../../../utils/http";
import config from "../../../utils/config";
import constant from "../../../utils/constant";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    auth: {},
    tencentPath: config.tencentPath,
    tencentUpPath: config.tencentUpPath,
    defaultAvatar: './../../../assets/img/default_avatar.png',
    query: {
      id: '',
    },
    showRoleList: [],
    showProvinceList: [],
    dialog: {
      isShow: false
    },
    operatorDetail: {
      role_ids: [],
      roles: [],
    },
    postName: {
      buyer: '商品',
      salesman: '业务',
      supply: '供应链',
      service: '客服',
      other: '其他'
    },
    dataLevelName: constant.OPERATOR_DATA_LEVEL,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { operator_id } = options;
    this.setData({
      'query.id': operator_id || '',
    });
  },

  operatorDetail(){
    let that = this;
    let { query } = that.data;

    http.get(config.api.operatorDetail, query)
        .then(result => {
          // console.log('detail: ', result.data)
          that.setData({
            operatorDetail: {
              ...result.data,
              roles: (result.data.roles || []).map(item => item.title).join(','),
              data_titles: (result.data.data_titles || []).map(item => item.title).join(','),
            },
          }, () => {
            // console.log('detail: ', this.data.operatorDetail)
          });
        })
  },

  toggerOperateDialog() {
    this.setData({
      dialog: {isShow: !this.data.dialog.isShow}
    })
  },

  selectOperateItem(event) {
    switch (event.target.dataset.type) {
      case 'add_merchant':
        wx.navigateTo({
          url: './../merchant-add/merchant-add'
        });
        break;
      case 'modify_freeze':
        this.operateFreeze(this.data.operatorDetail.id);
        break;
      case 'modify_unfreeze':
        this.operateUnfreeze(this.data.operatorDetail.id);
        break;
      case 'modify_edit':
        let detail = encodeURIComponent(JSON.stringify(this.data.operatorDetail));
        wx.navigateTo({
          url: '/pages/setting/setting-operator-edit/setting-operator-edit?type=modify'
              + '&item=' + detail
        });
        break;
      case 'modify_password_reset':
        wx.navigateTo({
          url: '/pages/setting/setting-operator-reset-password/setting-operator-reset-password?id=' + this.data.operatorDetail.id
        });
        break;
      default:
        break;
    }
  },

  operateFreeze(id) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认冻结用户',
      success(res) {
        if (res.confirm) {
          http.post(config.api.operatorFreeze, {id: id})
              .then(res => {
                if (res.data.is_freeze) {
                  wx.showToast({
                    title: '冻结成功',
                    icon: 'success'
                  });
                  that.operatorDetail();
                } else {
                  wx.showToast({
                    title: '冻结失败',
                    icon: 'none'
                  });
                }
              })
        } else if (res.cancel) {

        }
      }
    })
  },

  operateUnfreeze(id) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认解冻用户',
      success(res) {
        if (res.confirm) {
          http.post(config.api.operatorUnFreeze, {id: id})
              .then(res => {
                if (!res.data.is_freeze) {
                  wx.showToast({
                    title: '解冻成功',
                    icon: 'success'
                  });
                  that.operatorDetail();
                } else {
                  wx.showToast({
                    title: '解冻失败',
                    icon: 'none'
                  });
                }
              })
        } else if (res.cancel) {

        }
      }
    })
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.signIsLogin(() => {
      this.setData({
        auth: app.globalData.auth || {},
      }, () => {
        this.operatorDetail();
      });
    });
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