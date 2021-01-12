// pages/merchant/merchant-member-reset/merchant-member-reset.js

const app = getApp();
const http = require('./../../../utils/http');
const config = require('./../../../utils/config');
const md5 = require('./../../../utils/md5');

const icon_visibility_on = './../../../assets/img/icon-visibility-on.svg';
const icon_visibility_off = './../../../assets/img/icon-visibility-off.svg';

Page({

    /**
     * 页面的初始数据
     */
    data: {

        id: '',

        editData: {
            password: '',
        },

        error: {
            password: ''
        },

        input: {
            type: 'password',
            icon: icon_visibility_on
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let { item } = options;
        item = item && JSON.parse(decodeURIComponent(item));

        this.setData({
            id: item.id
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    changeInputType() {
        switch(this.data.input.type) {
            case 'text':
                this.setData({
                    input: Object.assign(this.data.input, {
                        type: 'password',
                        icon: icon_visibility_on
                    })
                });
                break;
            case 'password':
                this.setData({
                    input: Object.assign(this.data.input, {
                        type: 'text',
                        icon: icon_visibility_off
                    })
                });
                break;
            default:
                break;
        }
    },

    inputPassword(event) {
        let value = event.detail.value.trim();
        if (!value) {
            this.setData({
                error: Object.assign(this.data.error, { password: '新密码不能为空' })
            })
        }
        if (value && this.data.error.password) {
            if (this.data.error.password === '请输入6-15位的非中文字符' && (value.length < 6 || value.length > 15 || /.*[\u4e00-\u9fa5]+.*/.test(value))) {
                this.setData({
                    error: Object.assign(this.data.error, { password: '请输入6-15位的非中文字符' })
                })
            } else {
                this.setData({
                    error: Object.assign(this.data.error, { password: '' })
                })
            }

        }
        this.setData({
            editData: Object.assign(this.data.editData, { password: value })
        })
    },

    changePassword(event) {
        if (event.detail.value && (event.detail.value.length < 6 || event.detail.value.length > 15 || /.*[\u4e00-\u9fa5]+.*/.test(event.detail.value))) {
            this.setData({
                error: Object.assign(this.data.error, { password: '请输入6-15位的非中文字符' })
            })
        }
    },

    submit() {

        if (this.validNonEmpty()) {
            if (this.validLegality()) {
                this.setData({loading: true});
                http.post(config.api.memberPasswordReset, {
                    id: this.data.id,
                    password: md5(this.data.editData.password)
                })
                    .then(res => {
                        this.setData({loading: false});
                        wx.navigateBack();
                        wx.showToast({
                            title: '密码重置成功',
                            icon: 'success'
                        });
                    })
                    .catch(error => {
                        this.setData({loading: false});
                    })
            }

        }

    },

    validNonEmpty() {
        let valid = true;
        if (!this.data.editData.password) {
            valid = false;
            this.setData({
                error: Object.assign(this.data.error, {password: '新密码不能为空'})
            })
        }

        return valid;
    },

    // 验证合法性
    validLegality() {
        let valid = true;
        let error = this.data.error;
        let data = this.data.editData;

        if (data.password && (data.password.length < 6 || data.password.length > 15 || /.*[\u4e00-\u9fa5]+.*/.test(data.password))) {
            valid = false;
            error.password = '请输入6-15位的非中文字符';
        }

        this.setData({
            error: Object.assign(this.data.error, error)
        })

        return valid;
    },


})