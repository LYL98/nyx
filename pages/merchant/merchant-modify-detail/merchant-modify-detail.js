// pages/merchant/merchant-modify-detail/merchant-modify-detail.js
const app = getApp();
import dataHandle from './../../../utils/dataHandle';
import config from "./../../../utils/config";
import http from "./../../../utils/http";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        payList: ['是', '否'],
        index: 0, // 标识是否协议用户
        id: '',
        item: {
            title: '',
            is_post_pay: false,
            credit_limit: 10000
        },
        error: {
            title: '',
            is_post_pay: '',
            credit_limit: ''
        },
        loading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {merchant_id, title, is_post_pay, credit_limit} = options;
        this.setData({
            id: merchant_id,
            item: Object.assign(this.data.item, {
                title: title,
                is_post_pay: is_post_pay == 0 ? true : false,
                credit_limit: is_post_pay == 0 ? dataHandle.returnPrice(credit_limit) : 10000
            }),
            index: Number(is_post_pay)
        });

    },

    inputMerchantTitle(event) {
        let value = event.detail.value.trim();
        if (!value) {
            this.setData({
                error: Object.assign(this.data.error, { title: '商户名称不能为空' })
            })
        }
        if (value && this.data.error.title) {
            if (value.length > 10) {
                this.setData({
                    error: Object.assign(this.data.error, { title: '请输入10个以内的字符' })
                })
            } else {
                this.setData({
                    error: Object.assign(this.data.error, { title: '' })
                })
            }

        }
        this.setData({
            item: Object.assign(this.data.item, { title: value })
        })
    },
    changeMerchantTitle(event) {
        if (event.detail.value && event.detail.value.length > 10) {
            this.setData({
                error: Object.assign(this.data.error, { title: '请输入10个以内的字符' })
            })
        }
    },


    bindPickerChange(event) {
        if (event.detail.value) {
            let is_post_pay = event.detail.value == 0 ? true : false;
            this.setData({
                error: Object.assign(this.data.error, { is_post_pay: '' }),
                index: event.detail.value,
                item: Object.assign(this.data.item, {is_post_pay: is_post_pay})
            })
        }
    },

    inputCreditLimit(event) {
        let value = event.detail.value.trim();
        if (!value) {
            this.setData({
                error: Object.assign(this.data.error, { credit_limit: '授信额度不能为空' })
            })
        }
        if (value && this.data.error.credit_limit) {
            if (this.data.error.credit_limit === '授信额度必须为大于零的纯数字' && (isNaN(value) || value <= 0)) {
                this.setData({
                    error: Object.assign(this.data.error, { credit_limit: '授信额度必须为大于零的纯数字' })
                })
            } else if (this.data.error.credit_limit === '授信额度最多只能输入两位小数' && !/^[0-9]+([.]\d{0,2})?$/.test(value)) {
                this.setData({
                    error: Object.assign(this.data.error, { credit_limit: '授信额度最多只能输入两位小数' })
                })
            } else if (this.data.error.credit_limit === '授信额度不能超过1000000' && value > 1000000) {
                this.setData({
                    error: Object.assign(this.data.error, { credit_limit: '授信额度不能超过1000000' })
                })
            } else {
                this.setData({
                    error: Object.assign(this.data.error, { credit_limit: '' })
                })
            }

        }
        this.setData({
            item: Object.assign(this.data.item, { credit_limit: value })
        })
    },

    changeCreditLimit(event) {
        let value = event.detail.value;
        if (value && (isNaN(value) || value <= 0)) {
            this.setData({
                error: Object.assign(this.data.error, { credit_limit: '授信额度必须为大于零的纯数字' })
            })
            return;
        }
        if (value && !/^[0-9]+([.]\d{0,2})?$/.test(value)) {
            this.setData({
                error: Object.assign(this.data.error, { credit_limit: '授信额度最多只能输入两位小数' })
            })
            return;
        }
        if (value && value > 1000000) {
            this.setData({
                error: Object.assign(this.data.error, { credit_limit: '授信额度不能超过1000000' })
            })
            return;
        }
    },

    submit() {
        if (this.validNonEmpty()) {
            if (this.validLegality()) {
                this.submitModify();
            }
        }
    },

    submitModify() {
        let that = this;
        let {id, item} = that.data;
        let credit_limit = item.is_post_pay ? dataHandle.handlePrice(item.credit_limit) : 0;
        that.setData({loading: true});

        http.post(config.api.merchantEdit, {id: id, title: item.title, is_post_pay: item.is_post_pay, credit_limit: credit_limit})
            .then(res => {
                that.setData({loading: false});
                wx.navigateBack();
                wx.showToast({
                    title: '客户信息修改成功',
                    icon: 'success'
                });
            })
            .catch(error => {
                that.setData({loading: false});
            })
    },

    validNonEmpty() {
        let valid = true;
        let item = this.data.item;
        let error = this.data.error;
        for(let key in item) {
            if (key === 'title') {
                if (!item[key]) {
                    valid = false;
                    error.title = '商户名称不能为空';
                }

            } else if (key === 'is_post_pay') {
                if (item[key] !== true && item[key] !== false) {
                    valid = false;
                    error.is_post_pay = '请选择商户性质';
                }

            } else if (key === 'credit_limit') {
                if (item.is_post_pay && !item[key] && item[key] != 0) {
                    valid = false;
                    error.credit_limit = '授信额度不能为空';
                }

            }
        }

        if (!valid) {
            this.setData({
                error: error
            })
        }
        return valid;
    },

    // 验证合法性
    validLegality() {
        let valid = true;
        let error = this.data.error;
        let data = this.data.item;

        if (data.title && data.title.length > 10) {
            valid = false;
            error.title = '请输入10个以内的字符';
        }

        if (data.is_post_pay) {
            if (data.credit_limit && (isNaN(data.credit_limit) || data.credit_limit <= 0)) {
                valid = false;
                error.credit_limit = '授信额度必须为大于零的纯数字';
            }
            if (data.credit_limit && !/^[0-9]+([.]\d{0,2})?$/.test(data.credit_limit)) {
                valid = false;
                error.credit_limit = '授信额度最多只能输入两位小数';
            }
            if (data.credit_limit && data.credit_limit > 1000000) {
                valid = false;
                error.credit_limit = '授信额度不能超过1000000';
            }
        }

        return valid;
    },

})