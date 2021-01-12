import config from "../../../utils/config";
import http from "../../../utils/http";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {
            tags: []
        },

        editData: {
            tag_ids: []
        },

        // 加载到的系统可用标签列表
        tags: [],
        loading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {detail} = options;
        detail = JSON.parse(decodeURIComponent(detail));
        let tagIds = [];
        detail.tags.forEach(item => {
            tagIds.push(item.id);
        });
        this.setData({
            detail: detail,
            editData: Object.assign({}, this.data.editData, {
                tag_ids: tagIds
            })
        })
        this.baseStoreTagList();

    },

    submit() {
        this.setData({loading: true})
        http.post(config.api.storeTagEdit, {store_id: this.data.detail.id, ...this.data.editData})
            .then(res => {
                this.setData({loading: false})
                wx.navigateBack();
                wx.showToast({
                    title: '标签修改成功',
                    icon: 'success'
                });
            }).catch(error => {
                this.setData({loading: false})
            })
    },

    selectTag(event) {
        // 判断该标签是否被选中，如果被选中的，则移除 否则 添加
        let data = event.target.dataset.updata;
        let item = event.target.dataset.item;
        let tagIds = this.data.editData.tag_ids;
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
            editData: Object.assign({}, this.data.editData, {tag_ids: tagIds})
        })
    },

    baseStoreTagList() {
        http.get(config.api.baseStoreTagList)
            .then(res => {
                this.setData({
                    tags: res.data
                });
            })
    },

})