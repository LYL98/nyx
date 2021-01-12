// pages/merchant/merchant-member/merchant-member.js

const app = getApp();

const config = require('./../../../utils/config');
const http = require('./../../../utils/http');
const verification = require('./../../../utils/verification');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        dialog: {
            isShow: ''
        },
        auth: {},
        tencentPath: config.tencentPath,
        tencentUpPath: config.tencentUpPath,
        merchant_id: '',
    },

    onLoad: function (options) {
        let {merchant_id} = options;
        this.setData({
            merchant_id: merchant_id
        })
    },

    onShow: function () {
        app.signIsLogin(() => {
            this.setData({
                auth: app.globalData.auth,
            }, () => {
                this.memberList();
            })
        })
    },

    toggerOperateDialog(event) {
        if (event.currentTarget.dataset && event.currentTarget.dataset.item && event.currentTarget.dataset.item.id) {
            this.setData({
                dialog: {isShow: event.currentTarget.dataset.item.id}
            })
        } else {
            this.setData({
                dialog: {isShow: ''}
            })
        }

    },

    // 新增用户
    handleMemberAdd(event) {
        wx.navigateTo({
            url: './../merchant-member-add/merchant-member-add?merchant_id=' + this.data.merchant_id
        });
    },

    // 编辑用户
    handleMemberEdit(e) {
        const { item } = e.currentTarget.dataset
        const { merchant_id } = this.data
        wx.navigateTo({
            url: `./../merchant-member-add/merchant-member-add?merchant_id=${merchant_id}&member_id=${item.id}`
        });
    },

    // 删除用户
    handleMemberDelete(e) {
        wx.showModal({
            title: "提示",
            content: '确认删除用户？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success: res => {
                if (res.confirm) {
                    http.post(config.api.memberDelete, { id: e.target.dataset.item.id })
                        .then(() => {
                            this.memberList();
                            wx.showToast({
                                title: '删除成功',
                                icon: 'success'
                            });
                        })
                }
            }
        })
    },

    // 冻结用户
    handleMemberFreeze(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认冻结用户？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.memberFreeze, { id: event.target.dataset.item.id })
                        .then(res => {
                            that.memberList();
                            wx.showToast({
                                title: '冻结成功',
                                icon: 'success'
                            });
                        })
                }
            }
        });
    },

    // 解冻用户
    handleMemberUnFreeze(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认解冻用户？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.memberUnFreeze, { id: event.target.dataset.item.id })
                        .then(res => {
                            that.memberList();
                            wx.showToast({
                                title: '解冻成功',
                                icon: 'success'
                            });
                        })
                }
            }
        });
    },

    //解除微信绑定
    handleMemberUnBindWechat(event){
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认解除微信绑定？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.memberUnBindWechat, { id: event.target.dataset.item.id })
                        .then(res => {
                            that.memberList();
                            wx.showToast({
                                title: '已解除绑定',
                                icon: 'success'
                            });
                        });
                }
            }
        });
    },

    memberList() {
        http.get(config.api.memberList, { merchant_id: this.data.merchant_id })
            .then(res => {
                this.setData({
                    listItem: res.data
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