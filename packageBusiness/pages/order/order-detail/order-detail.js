// pages/order/order-detail/order-detail.js
const app = getApp();
const config = require('./../../../../utils/config');
const http = require('./../../../../utils/http');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        auth: {},
        tencentPath: config.tencentPath,
        id: '',
        detail: {
            items: [],
            pay_record: [],
            refund_record: [],
            action_log: []
        },
        orderStatus: '',
        pay_record_is_open: false,
        refund_record_is_open: false,
        loading: false
    },

    onLoad: function (options) {
        let { order_id, delivery_date } = options;
        if (order_id && delivery_date) {
            this.setData({
                id: order_id,
                detail: Object.assign(this.data.detail, { delivery_date: delivery_date })
            })
        }
    },

    onShow: function () {
        app.signIsLogin(() => {
            this.setData({
                auth: app.globalData.auth
            }, () => {
                this.orderDetail();
            })
        })
    },

    submit() {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认取消订单？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    that.setData({loading: true});
                    http.post(config.api.orderCancel, { id: that.data.detail.id})
                        .then(res => {
                            that.setData({loading: false});
                            that.orderDetail();
                            wx.showToast({
                                title: '订单取消成功',
                                icon: 'success'
                            });
                        })
                        .catch(error => {
                            that.setData({loading: false});
                        })
                }
            }
        });


    },

    toggerFlodPriceChange(event) {
        let target = event.currentTarget.dataset.item;
        if (target) {
            let items = this.data.detail.items.map(item => {
                if(item.id === target.id) {
                    item.ui_is_open = !item.ui_is_open
                }
                return item;
            })
            this.setData({
                detail: Object.assign(this.data.detail, { items: items })
            })
        }

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

    orderDetail() {
        http.get(config.api.orderDetail, {id : this.data.id})
            .then(res => {
                let data = res.data;

                data.items = data.items.map(item => {
                    item.ui_is_open = false;
                    return item;
                })

                this.setData({
                    detail: data,
                    orderStatus: data.status
                })
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
})