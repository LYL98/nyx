// pages/merchant/merchant-city-list/merchant-city-list.js
const app = getApp();
const config = require('./../../../utils/config');
const http = require('./../../../utils/http');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        province_code: '',
        selectedCity: {},
        cityList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let { selected, province_code } = options;
        selected = selected && JSON.parse(decodeURIComponent(selected));
        this.setData({
            selectedCity: Object.assign(this.data.selectedCity, selected),
            province_code: province_code
        })

    },

    onShow: function () {
        app.signIsLogin(() => {
            this.cityList();
        })
    },

    cityList() {
        http.get(config.api.baseCityList, {province_code: this.data.province_code})
            .then(res => {
                this.setData({
                    cityList: res.data
                })
            })
    },

    selectCity(event) {
        let item = event.target.dataset.item;
        this.setData({
            selectedCity: item
        });
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        if (typeof prevPage.selectCityCallBack === 'function') {
            prevPage.selectCityCallBack(item)
        }
        wx.navigateBack();
    },

})