// pages/merchant/merchant-store/merchant-store.js
const app = getApp();
const config = require('./../../../utils/config');
const http = require('./../../../utils/http');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tencentPath: config.tencentPath,
        dialog: {
            isShow: ''
        },
        auth: {},
        province: {},
        merchant_id: '',
        listItem: [],
        isFisrtIn: true,
        memberList:[], // Arrary<object>
        modifyCityItem: null,  // 需要修改县域的门店
    },

    onLoad: function (options) {
        let {merchant_id} = options;
        this.setData({
            merchant_id: merchant_id
        })
        
    },

    onShow: function () {
        const { isFisrtIn } = this.data
        app.signIsLogin(() => {
            this.setData({
                auth: app.globalData.auth,
                province: app.globalData.globalProvince
            }, () => {
                if(isFisrtIn) {
                    this.getChildMemberList().then(() => {
                        this.storeList();
                    })
                } else {
                    this.storeList();
                }
                
            })
        })
    },

    // 获取门店子帐户列表
    getChildMemberList() {
        const { merchant_id } = this.data
        return http.get(config.api.memberList, {
          merchant_id,
          // is_main: 0,
          page: 1,
          page_size: 50,
        }).then(res => {
          if (res.code === 0) {
              this.data.memberList = res.data
          }
        })
    },

    storeList() {
        http.get(config.api.storeList, { merchant_id: this.data.merchant_id })
            .then(res => {
                
                if(res.data && res.data.length > 0) {
                    let newListItem = res.data.map(item => {
                        
                        this.data.listItem.map(store => {
                            if (store.id === item.id) {
                                item.ui_is_open = store.ui_is_open !== undefined && store.ui_is_open;
                            }
                        })

                        // 处理指定子账号
                        // item.member_ids = [11772, 11727]
                        item.member_ids_obj = []
                        if(item.member_ids && item.member_ids.length > 0) {
                            item.member_ids.forEach(id => {
                                let member = this.data.memberList.find(el => el.id === id)
                                if( !!member ) {
                                    item.member_ids_obj.push({
                                        id,
                                        phone: member.phone,
                                        realname: member.realname,
                                    })
                                }
                            })
                        }
                        return item
                    })
                    this.setData({
                        listItem: newListItem
                    })
                }
                // this.setData({
                //     listItem: res.data.map(item => {
                //         let ui_is_open = false;
                //         this.data.listItem.map(store => {
                //             if (store.id === item.id) {
                //                 ui_is_open = store.ui_is_open !== undefined && store.ui_is_open;
                //             }
                //         });
                //         return Object.assign(item, { ui_is_open: ui_is_open })
                //     })
                // })
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

    selectOperateItem() {

    },

    toggerFlodDetail(event) {
        let item = event.currentTarget.dataset.item;

        let listItem = this.data.listItem.map(store => {
            if(store.id === item.id) {
                store.ui_is_open = !store.ui_is_open;
            }
            return store;
        })
        this.setData({
            listItem: listItem
        })
    },

    // 新增门店
    handleStoreAdd(event) {
        wx.navigateTo({
            url: '/pages/merchant/merchant-edit/merchant-edit?module=store&type=add&merchant_id=' + this.data.merchant_id
        });
    },

    handleStoreModify(event) {
        let item = encodeURIComponent(JSON.stringify(event.currentTarget.dataset.item));
        wx.navigateTo({
            url: '/pages/merchant/merchant-edit/merchant-edit?module=store&type=modify&merchant_id=' + this.data.merchant_id + '&item=' + item
        });
    },

    handleStoreModifyTag(event){
        let item = encodeURIComponent(JSON.stringify(event.currentTarget.dataset.item));
        wx.navigateTo({
            url: '/pages/merchant/merchant-modify-store-tags/merchant-modify-store-tags?detail=' + item
        });
    },

    // 审核门店
    handleStoreApprove(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认审核通过？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.storeApprove, { id: event.target.dataset.item.id })
                        .then(res => {
                            that.storeList();
                            wx.showToast({
                                title: '审核成功',
                                icon: 'success'
                            });
                        })
                }
            }
        });
    },

    // 冻结门店
    handleStoreFreeze(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认冻结门店？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.storeFreeze, { id: event.target.dataset.item.id })
                        .then(res => {
                            that.storeList();
                            wx.showToast({
                                title: '冻结成功',
                                icon: 'success'
                            });
                        })
                }
            }
        });
    },

    // 解冻门店
    handleStoreUnFreeze(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认解冻门店？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.storeUnFreeze, { id: event.target.dataset.item.id })
                        .then(res => {
                            that.storeList();
                            wx.showToast({
                                title: '解冻成功',
                                icon: 'success'
                            });
                        })
                }
            }
        });
    },

    // 添加黑名单
    handleBlacklistAdd(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认将门店添加到黑名单？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.merchantStoreBlacklistAdd, { ids: [event.target.dataset.item.id] })
                      .then(res => {
                        console.log(res);
                          that.storeList();
                          wx.showToast({
                              title: '添加黑名单成功',
                              icon: 'success'
                          });
                      })
                }
            }
        });
    },

    // 移除黑名单
    handleBlacklistRemove(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认将门店从黑名单移除？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.merchantStoreBlacklistRemove, { id: event.target.dataset.item.id })
                      .then(res => {
                          that.storeList();
                          wx.showToast({
                              title: '移除黑名单成功',
                              icon: 'success'
                          });
                      })
                }
            }
        });
    },

    // 删除门店
    handleStoreDelete(event) {
        let that = this;
        wx.showModal({
            title: "提示",
            content: '确认删除门店？',
            confirmText: "确认",
            confirmColor: "#00ADE7",
            success(res) {
                if (res.confirm) {
                    http.post(config.api.storeDelete, { id: event.target.dataset.item.id })
                        .then(res => {
                            that.storeList();
                            wx.showToast({
                                title: '删除成功',
                                icon: 'success'
                            });
                        })
                }
            }
        });
    },

    previewImages(event) {
        let { tencentPath } = this.data;
        var images = event.currentTarget.dataset.src;
        let index = event.currentTarget.dataset.index;

        let current = tencentPath + images[index];

        let urls = [];
        for (let i = 0; i < images.length; i++) {
            urls.push(tencentPath + images[i]);
        }

        wx.previewImage({
            current: current,
            urls: urls
        })
    }

})