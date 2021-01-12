const app = getApp();
const config = require('./../../../../utils/config');
const http = require('./../../../../utils/http');
const constant = require('./../../../../utils/constant');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        afterSaleStatus: constant.AFTER_SALE_STATUS(),
        afterSaleStatusType: constant.AFTER_SALE_STATUS_TYPE,
        afterSaleOptType: constant.AFTER_SALE_OPT_TYPE(),
        auth: {},
        tencentPath: config.tencentPath,
        id: '',
        detail: {
            items: [],
            pay_record: [],
            refund_record: [],
            action_log: []
        },
        ui_is_open: false,
        pay_record_is_open: false,
        refund_record_is_open: false
    },

    onLoad: function (options) {
        let {aftersale_id} = options;
        if (aftersale_id) {
            this.setData({
                id: aftersale_id
            })
        }
    },

    onShow: function () {
        app.signIsLogin(() => {
            this.setData({
                auth: app.globalData.auth
            }, () => {
                this.afterSaleDetail();
            })
        })
    },

    toggerFlodPriceChange(event) {
        this.setData({
            ui_is_open: !this.data.ui_is_open
        })

    },

    toggerFlodPayRecord(event) {
        this.setData({
            pay_record_is_open: !this.data.pay_record_is_open
        })
    },

    toggerFlodRefundRecord(event) {
        this.setData({
            refund_record_is_open: !this.data.refund_record_is_open
        })
    },

    afterSaleDetail() {
        http.post(config.api.afterSaleDetail, {id: this.data.id || '17'})
            .then(res => {
                let data = res.data;
                // data.items = data.items.map(item => {
                //     item.ui_is_open = false;
                //     return item;
                // })

                this.setData({
                    detail: data
                })
            })
            .catch(error => {
                console.log('error', error);
            })
    },

    showOrderDetail() {
        let { order_id, delivery_date } = this.data.detail;
        wx.navigateTo({
            url: '/packageBusiness/pages/order/order-detail/order-detail?order_id=' + order_id + '&delivery_date=' + delivery_date,
        })
    },

    previewImage(event) {
        let tencentPath = this.data.tencentPath;
        let image = event.currentTarget.dataset.src;

        let urls = [];
        let current = tencentPath + image;
        urls.push(current);

        wx.previewImage({
            current: current,
            urls: urls
        });
    },

    //查看图片
    previewImg(e){
        let current = e.currentTarget.dataset.current;
        let urls = e.currentTarget.dataset.urls;
        let { tencentPath } = this.data;
        current = tencentPath + current;
        urls = urls.map(item => item = tencentPath + item);
        wx.previewImage({
            current: current,
            urls: urls
        })
    },

    onNavigateToDone() {
        let item = {...this.data.detail};
        wx.navigateTo({
            url: '/packageBusiness/pages/aftersale/aftersale-done/aftersale-done?item=' + encodeURIComponent(JSON.stringify(item)),
        })
    }

})