import { Base } from './../../../behaviors/index';

Page({
    behaviors: [Base],
    /**
     * 页面的初始数据
     */
    data: {
        selectStorehouse: {},
        storehouseList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let page = this.getPage('packageWarehouse/pages/index/index');

        if(page){
            this.setData({
                selectStorehouse: page.data.selectStorehouse,
                storehouseList: page.data.storehouseList
            });
        }
    },

    // 设置仓库
    selectStorehouse(e) {
        let selectStorehouse = e.currentTarget.dataset.item;
        this.setData({ selectStorehouse });
        let page = this.getPage('packageWarehouse/pages/index/index');
        if(page){
            page.setData({ selectStorehouse });
        }
        wx.setStorageSync('selectedStoreHouse', selectStorehouse);
        wx.navigateBack();
    },
})