// pages/merchant/merchant-detail/merchant-detail.js
const app = getApp();
import config from "./../../../utils/config";
import http from "./../../../utils/http";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        auth: {},
        id: '', // 商户的id
        dialog: {
            isShow: false
        },
        detail: {
            grade: {},
            inner_tags: [],
            outer_tags: []
        }
    },

    onLoad: function (options) {
        let {merchant_id} = options;
        this.setData({
            id: merchant_id
        });
        this.merchantDetail(merchant_id);
    },

    onShow: function () {
        app.signIsLogin(() => {
            this.setData({
                auth: app.globalData.auth
            }, () => {
                this.merchantDetail(this.data.id);
            })
        })
    },

    merchantDetail(id) {
        let that = this;
        http.get(config.api.merchantDetail, { id: id })
            .then(res => {
                that.setData({
                    detail: Object.assign({}, that.data.detail, res.data)
                })
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
            case 'modify_detail':
                let is_post_pay = this.data.detail.is_post_pay ? "0" : "1";
                wx.navigateTo({
                    url: "./../merchant-modify-detail/merchant-modify-detail"
                        + "?merchant_id=" + this.data.id
                        + "&title=" + this.data.detail.title
                        + "&is_post_pay=" + is_post_pay
                        + "&credit_limit=" + this.data.detail.credit_limit
                })
                break;
            case 'modify_tags':
                let detail = JSON.stringify(this.data.detail);
                wx.navigateTo({
                    url: "./../merchant-modify-tags/merchant-modify-tags"
                        + "?detail=" + encodeURIComponent(detail)
                })
                break;
            default:
                break;
        }
    },

    handleShowStoreList() {
        wx.navigateTo({
            url: "./../merchant-store/merchant-store?merchant_id=" + this.data.id
        })
    },

    handleShowMemberList() {
        wx.navigateTo({
            url: "./../merchant-member/merchant-member?merchant_id=" + this.data.id
        })
    },

})