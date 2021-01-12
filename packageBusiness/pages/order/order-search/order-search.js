// pages/merchant/merchant-search/merchant-search.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        condition: '',
    },

    confirmCondition(event) {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
            search: Object.assign(prevPage.data.search, {
                order: Object.assign(prevPage.data.search.order, { condition: event.detail.value })
            })
        })
        wx.navigateBack();
    },

})