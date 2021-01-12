// pages/merchant/merchant-modify-tags/merchant-modify-tags.js
const app = getApp();
import config from "./../../../utils/config";
import http from "./../../../utils/http";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: { // 商户详情对象
            grade: {},
            inner_tags: [],
            outer_tags: []
        },

        editData: { // 需要编辑的商户详情对象
            grade_code: '',
            inner_tag_ids: [],
            outer_tags: []
        },

        // 加载到的系统可用标签列表
        gradeTags: [],
        innerTags: [],
        outerTags: [],
        loading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {detail} = options;
        detail = JSON.parse(decodeURIComponent(detail));
        let innerTagIds = [];
        detail.inner_tags.forEach(item => {
            innerTagIds.push(item.id);
        });
        this.setData({
            detail: detail,
            editData: Object.assign({}, this.data.editData, {
                grade_code: detail.grade_code,
                inner_tag_ids: innerTagIds,
                outer_tags: detail.outer_tags
            })
        })
        this.baseMerchantGradeTags();
        this.baseMerchantInnerTags();
        this.baseMerchantOuterTags();

    },

    submit() {
        this.setData({loading: true})
        http.post(config.api.merchantGradeTagsEdit, {id: this.data.detail.id, ...this.data.editData})
            .then(res => {
                this.setData({loading: false})
                wx.navigateBack();
                wx.showToast({
                    title: '等级标签修改成功',
                    icon: 'success'
                });
            }).catch(error => {
                this.setData({loading: false})
            })
    },

    selectGradeTag(event) {
        this.setData({
            editData: Object.assign({}, this.data.editData, {grade_code: event.target.dataset.item.code})
        })
    },

    selectInnerTag(event) {
        // 判断该标签是否被选中，如果被选中的，则移除 否则 添加
        let data = event.target.dataset.updata;
        let item = event.target.dataset.item;
        let tagIds = this.data.editData.inner_tag_ids;
        if (tagIds.length === 0) {
            tagIds.push(item.id);
        } else {
            for (let i = 0; i < tagIds.length; i++) {
                //如果点击没选择过的，删除这个父标签下目前已选择的
                let con = data.child_tags.filter(ct => tagIds[i] === ct.id && tagIds[i] !== item.id);
                    if(con.length > 0){
                    tagIds.remove(i);
                    i = i - 1;
                }

                //如果当前已选择的，取消选择
                if (item.id === tagIds[i]) {
                    tagIds.remove(i);
                    break;
                }

                //加入
                if (i === tagIds.length - 1) {
                    tagIds.push(item.id);
                    break;
                }
            }
        }
        this.setData({
            editData: Object.assign({}, this.data.editData, {inner_tag_ids: tagIds})
        });
    },

    selectOuterTag(event) {
        // 判断该标签是否被选中，如果被选中的，则移除 否则 添加
        let item = event.target.dataset.item;
        if (this.data.editData.outer_tags.some(tag => tag === item.title)) {
            let data = this.data.editData.outer_tags.filter(tag => tag !== item.title)
            this.setData({
                editData: Object.assign({}, this.data.editData, {outer_tags: data})
            })
        } else {
            let data = this.data.editData.outer_tags;
            data.push(item.title);
            this.setData({
                editData: Object.assign({}, this.data.editData, {outer_tags: data})
            })
        }
    },

    baseMerchantGradeTags() {
        http.get(config.api.baseMerchantGradeList)
            .then(res => {
                this.setData({
                    gradeTags: res.data
                });
            })
    },

    baseMerchantInnerTags() {
        http.get(config.api.baseMerchantInnerTagsList)
            .then(res => {
                this.setData({
                    innerTags: res.data
                });
            })
    },

    baseMerchantOuterTags() {
        http.get(config.api.baseMerchantOuterTagsList)
            .then(res => {
                this.setData({
                    outerTags: res.data
                });
            })
    },
})