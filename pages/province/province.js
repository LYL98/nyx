// pages/province/province.js
const app = getApp();
const config = require('./../../utils/config');
const http = require('./../../utils/http');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        from: null, // 来源页面
        provinceList: [],
        globalProvince: {} // 本地缓存的区域信息
    },

    loadProvinceList() {

        let that = this;

        http.get(config.api.baseProvinceListMy, {})
            .then(res => {
                this.setData({
                    provinceList: res.data
                })
            })
            .catch(error => {
                app.requestResultCode(error)
            })
    },

    // 设置当前区域
    selectProvince(event) {
        wx.setStorageSync("globalProvince", event.target.dataset.item);
        app.globalData.globalProvince = event.target.dataset.item;
        if (this.data.from === 'login') {
            wx.reLaunch({
                url: '/pages/index/index'
            })
        } else if (this.data.from === 'warehouse') {
            wx.redirectTo({
                url: '/packageWarehouse/pages/index/index'
            })
        } else {
            wx.navigateBack();
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("onLoad")
        let {from} = options;
        if (from) {
            this.setData({from: from});
        }
        this.loadProvinceList();
        let globalProvince = wx.getStorageSync("globalProvince");
        if (globalProvince) {
            this.setData({
                globalProvince: globalProvince
            });
        }

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