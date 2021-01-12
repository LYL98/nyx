// pages/merchant/merchant-member-add/merchant-member-add.js
const app = getApp();

const config = require('./../../../utils/config');
const http = require('./../../../utils/http');
const verification = require('./../../../utils/verification');
const md5 = require('./../../../utils/md5');
import UpCos from './../../../utils/upload-tencent-cos';

const icon_visibility_on = './../../../assets/img/icon-visibility-on.svg';
const icon_visibility_off = './../../../assets/img/icon-visibility-off.svg';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        loading: false,
        tencentPath: config.tencentPath,
        tencentUpPath: config.tencentUpPath,
        editData: {
            merchant_id: '',
            avatar: '',
            realname: '',
            phone: '',
            is_main: 1,
            store_ids: [],
        },
        error: {
            avatar: '',
            realname: '',
            phone: '',
        },
        accountAuths:[
            {
                id: 0,
                name: '子账号'
            },
            {
                id: 1,
                name: '主账号'
            }
        ],

        member_id: '',
        storeList: [],
    },

    onLoad: function (options) {
        let {merchant_id, member_id} = options;
        if (merchant_id) {
            this.setData({
                editData: Object.assign(this.data.editData, {merchant_id: merchant_id})
            },this.getStoreList(merchant_id))
        }

        // 编辑状态
        if(member_id) {
            this._getMemberDetail(member_id)
            this.member_id = member_id
        }
    },

    onShow: function () {
        app.signIsLogin(() => {
            // 如果是新增模式，则需要读取当前的区域code，(编辑模式下，传递进来的参数 自带区域code)。
        })
    },

    // 获取用户详情
    _getMemberDetail(id) {
        http.get(config.api.memberDetail, { id })
        .then(res => {
            const {avatar, merchant_id, realname, phone, is_main,store_ids } = res.data
            this.setData({
                editData: {
                    avatar,
                    merchant_id,
                    realname,
                    phone,
                    is_main: is_main ? 1 : 0,
                    store_ids,
                }
            })
        })
    },

    deleteAvatar() {
        this.setData({
            editData: Object.assign(this.data.editData, {avatar: ''})
        })
    },

    changeAvatar(event) {
        let that = this;
        wx.chooseImage({
            count: 1,
            success(res) {
                that.setData({
                    error: Object.assign(that.data.error, {avatar: ''})
                })
                that.avatarTencentUploadFile(res.tempFiles[0], res.tempFilePaths[0]);

            }
        })
    },

    // 上传单张图片
    avatarTencentUploadFile(file, filePath) {
        let that = this;
        UpCos.upload({
            module: 'merchant',
            filePath: filePath
          }).then((resData)=>{
            that.setData({
                editData: Object.assign(that.data.editData, {avatar: resData.data.key})
            });
          }).catch((res)=>{
            wx.showModal({
              title: '提示',
              content: res.message,
              confirmText: '我知道了',
              confirmColor: '#00AE66',
              showCancel: false
            });
          });
    },

    inputRealname(event) {
        let value = event.detail.value.trim();
        if (!value) {
            this.setData({
                error: Object.assign(this.data.error, {realname: '姓名不能为空'})
            })
        }
        if (value && this.data.error.realname) {
            if (value.length > 10) {
                this.setData({
                    error: Object.assign(this.data.error, { realname: '请输入10个以内的字符' })
                })
            } else {
                this.setData({
                    error: Object.assign(this.data.error, { realname: '' })
                })
            }

        }
        this.setData({
            editData: Object.assign(this.data.editData, {realname: value})
        })
    },

    changeRealname(event) {
        if (event.detail.value && event.detail.value.length > 10) {
            this.setData({
                error: Object.assign(this.data.error, {realname: '请输入10个以内的字符'})
            })
        }
    },

    inputPhone(event) {
        let value = event.detail.value.trim();
        if (!value) {
            this.setData({
                error: Object.assign(this.data.error, {phone: '登录手机不能为空'})
            })
        }
        if (value && this.data.error.phone) {
            if (this.data.error.phone === '请输入11位手机号码' && !verification.checkMobile(value)) {
                this.setData({
                    error: Object.assign(this.data.error, { phone: '请输入11位手机号码' })
                })
            } else {
                this.setData({
                    error: Object.assign(this.data.error, { phone: '' })
                })
            }

        }

        this.setData({
            editData: Object.assign(this.data.editData, {phone: value})
        })
    },

    changePhone(event) {
        if (event.detail.value && !verification.checkMobile(event.detail.value)) {
            this.setData({
                error: Object.assign(this.data.error, {phone: '请输入11位手机号码'})
            })
        }
    },

    changeAccountAuth(e) {
        this.setData({
            editData: Object.assign(this.data.editData, { is_main: parseInt(e.detail.value) })
        })
    },

    submit() {

        if (this.validNonEmpty()) {
            if (this.validLegality()) {

                this.setData({loading: true});
                let data = Object.assign({}, this.data.editData);
                let api = config.api.memberAdd
                if(this.member_id) {// 编辑
                    api = config.api.memberEdit
                    data.id = Number(this.member_id)
                }
                http.post(api, data)
                    .then(res => {
                        this.setData({loading: false});
                        wx.navigateBack();
                        wx.showToast({
                            title: this.member_id ? '用户修改成功' : '用户新增成功',
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
        let editData = this.data.editData;
        let error = this.data.error;
        for (let key in editData) {
            if (key === 'avatar') {
                if (!editData[key]) {
                    valid = false;
                    error.avatar = '请上传头像';
                }

            } else if (key === 'realname') {
                if (!editData[key]) {
                    valid = false;
                    error.realname = '姓名不能为空';
                }

            } else if (key === 'phone') {
                if (!editData[key]) {
                    valid = false;
                    error.phone = '登录手机不能为空';
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
        let data = this.data.editData;

        if (data.realname && data.realname.length > 10) {
            valid = false;
            error.realname = '请输入10个以内的字符';
        }

        if (data.phone && !verification.checkMobile(data.phone)) {
            valid = false;
            error.phone = '请输入11位手机号码';
        }

        this.setData({
            error: Object.assign(this.data.error, error)
        })

        return valid;
    },
    //获取门店列表
    getStoreList(id){
        http.get(config.api.baseStoreList, { merchant_id: id })
        .then(res=>{
            let temps = []
            res.data.map(item=>{
                temps.push({
                    value: item.id,
                    label: item.title,
                })
            })
            this.setData({
                storeList: temps || [],
            })
        })
    },
    //根据 绑定的 data-key 更新 editData
    onChangeKey(e){
        const key = e.currentTarget.dataset.key;
        const value = e.detail.value;
        if (!(value + '')) return;
        this.setData({
            editData: Object.assign(this.data.editData, { [key]: value }),
            error: Object.assign(this.data.error, { [key]: '' }),
        })
    }

})