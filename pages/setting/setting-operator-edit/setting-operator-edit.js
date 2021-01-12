// pages/setting/setting-operator-edit/setting-operator-edit.js

const app = getApp();
const md5 = require('./../../../utils/md5');
const Config = require('./../../../utils/config');
const Http = require('./../../../utils/http');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    opt_type_options: [
      { label: '总部', value: 'global' },
      { label: '区域', value: 'local' },
    ],
    post_options: [
      { label: '商品', value: 'buyer' },
      { label: '业务', value: 'salesman' },
      { label: '供应商', value: 'supply' },
      { label: '客服', value: 'service' },
      { label: '其他', value: 'other' },
    ],
    post_options2: [
      { label: '商品', value: 'buyer' },
      { label: '业务', value: 'salesman' },
      { label: '供应商', value: 'supply' },
      { label: '客服', value: 'service' },
      { label: '其他', value: 'other' },
    ],
    province_options: [],
    data_level_options: [
      { label: '区域', value: '2' },
      { label: '片区', value: '3' },
      { label: '县域', value: '4' },
    ],
    filter_data_level_options: [
      { label: '区域', value: '2' },
      { label: '片区', value: '3' },
      { label: '县域', value: '4' },
    ],

    role_options: [],
    filter_role_options: [],

    zone_options: [],
    city_options: [],

    loginUserInfo: {},

    loading: false,

    formData: {
      // 账号信息
      avatar: '',
      realname: '',
      phone: '',
      password: '',
      employee_no: '', //工号

      opt_type: '',
      province_code: '',

      post: 'buyer', // 职务 buyer(商品) salesman(业务) supply(供应链) other(其他)
      role_ids: [], //角色

      data_level: '1', // 数据权限 1:总部 2:区域 3:片区 4:县域
      data_value: [], //  数据权限范围 1:空白 2:province_codes 3:zone_ids 4:city_ids

      remark: '', //备注
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { type, item } = options; // add | modify

    app.signIsLogin(() => {
      let loginUserInfo = Object.assign({}, app.globalData.loginUserInfo);

      if (type === 'add') {
        this.setData({
          loginUserInfo: loginUserInfo,
          formData: Object.assign(this.data.formData, {
            opt_type: loginUserInfo.opt_type || 'global',
            province_code: loginUserInfo.opt_type === 'local' ? loginUserInfo.province_code : '',
          }),
        });
        // 在新增模式下，如果登录用户是区域，并且存在省code 的情况下，则加载 片区 和 县域 列表
        if (loginUserInfo.opt_type === 'local' && loginUserInfo.province_code) {
          this.zoneList();
          this.cityList();
        }
      } else {
        if (!item) return;
        item = JSON.parse(decodeURIComponent(item));
        this.setData({
          loginUserInfo: loginUserInfo,
          formData: item,
        });
        // 在编辑模式下，如果存在省code，则加载片区 和 县域列表
        if (item.province_code) {
          this.zoneList();
          this.cityList();
        }
      }
      this.roleList();
      this.provinceList();
    });
  },

  // 根据 绑定的 data-key 更新 formData
  onChangeKey(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    this.setData(
      {
        formData: Object.assign(this.data.formData, { [key]: value }),
      },
      () => {
        switch (key) {
          case 'opt_type':
            this.handleChangeOptType();
            this.filterRoleOptions(); // computed role_options by opt_type
            break;
          case 'post':
            this.handleChangePost();
            this.filterDataLevelOptions();
            break;
          case 'province_code':
            this.handleChangePost();
            // 切换 province_code 之后，重新加载 片区 和 县域列表
            this.zoneList();
            this.cityList();
            break;
          case 'data_level':
            this.handleChangeDataLevel();
            break;
        }
      }
    );
  },

  handleChangeOptType() {
    const { opt_type } = this.data.formData;
    switch (opt_type) {
      case 'global':
        this.setData({
          formData: Object.assign(this.data.formData, {
            province_code: '',
            data_level: '1', // 数据权限 1:总部 2:区域 3:片区 4:县域
            data_value: [],
            role_ids: [],
            // post: 'buyer'
          }),
        });
        break;
      case 'local':
        this.setData({
          formData: Object.assign(this.data.formData, {
            role_ids: [],
            // post: 'buyer'
          }),
        });
        this.handleChangePost();
        break;
    }
  },

  handleChangePost() {
    const { province_code, post } = this.data.formData;
    if (!province_code) return;
    switch (post) {
      case 'buyer':
        this.setData({
          formData: Object.assign(this.data.formData, {
            data_level: '2', // 数据权限 1:总部 2:区域 3:片区 4:县域
            data_value: [province_code],
          }),
        });
        break;
      case 'salesman':
        this.setData({
          formData: Object.assign(this.data.formData, {
            data_level: '3', // 数据权限 1:总部 2:区域 3:片区 4:县域
            data_value: [],
          }),
        });
        break;
      case 'supply':
        this.setData({
          formData: Object.assign(this.data.formData, {
            data_level: '2', // 数据权限 1:总部 2:区域 3:片区 4:县域
            data_value: [province_code],
          }),
        });
        break;
      case 'other':
        this.setData({
          formData: Object.assign(this.data.formData, {
            data_level: '2', // 数据权限 1:总部 2:区域 3:片区 4:县域
            data_value: [province_code],
          }),
        });
        break;
        case 'service':
          this.setData({
            formData: Object.assign(this.data.formData, {
              data_level: '2', // 数据权限 1:总部 2:区域 3:片区 4:县域
              data_value: [province_code],
            }),
          });
          break;
    }
  },

  handleChangeDataLevel() {
    const { data_level, province_code } = this.data.formData;
    if (data_level === '2') {
      this.setData({
        formData: Object.assign(this.data.formData, { data_value: [province_code] }),
      });
      return;
    }
    this.setData({
      formData: Object.assign(this.data.formData, { data_value: [] }),
    });
  },

  onSubmit() {
    this.selectComponent('#pg-form')
      .validateAll()
      .then((valid) => {
        if (!valid) {
          wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
          return;
        }

        const formData = Object.assign({}, this.data.formData);
        this.setData({ loading: true });
        if (!formData.id) {
          // 新增模式
          formData.password = md5(formData.password);
          Http.post(Config.api.operatorAdd, formData)
            .then((res) => {
              wx.showToast({
                title: '新增成功',
                icon: 'success',
              });
              this.setData({ loading: false });
              setTimeout(() => {
                wx.navigateBack();
              }, 500);
            })
            .catch((error) => {
              this.setData({ loading: false });
            });
            
        } else {
          Http.post(Config.api.operatorEdit, formData)
            .then((res) => {
              wx.showToast({
                title: '编辑成功',
                icon: 'success',
              });
              // wx.navigateBack();
              this.setData({ loading: false });
              setTimeout(() => {
                wx.navigateBack();
              }, 500);
            })
            .catch((error) => {
              this.setData({ loading: false });
            });
        }
      });
  },

  filterRoleOptions() {
    this.setData({
      filter_role_options: this.data.role_options.filter((item) => item.role_type === this.data.formData.opt_type),
    });
  },

  filterDataLevelOptions() {
    const post = this.data.formData.post;
    if (post === 'other') {
      // 允许选择区域
      this.setData({
        filter_data_level_options: this.data.data_level_options,
      });
    } else {
      this.setData({
        filter_data_level_options: this.data.data_level_options.slice(1),
      });
    }
  },

  /**
   * 获取基础数据
   */

  roleList() {
    Http.get(Config.api.roleList).then((res) => {
      this.setData(
        {
          role_options: (res.data || []).map((item) => ({ label: item.title, value: item.id, role_type: item.role_type })),
        },
        () => {
          this.filterRoleOptions();
        }
      );
    });
  },
  provinceList() {
    Http.get(Config.api.baseProvinceList).then((res) => {
      this.setData({
        province_options: (res.data || []).map((item) => ({ label: item.title, value: item.code })),
      });
    });
  },
  zoneList() {
    
    const { province_code } = this.data.formData;
    if (!province_code) return;
    Http.get(Config.api.baseZoneList, {
      province_code: province_code,
    }).then((res) => {
      this.setData({
        zone_options: (res.data || []).map((item) => ({ label: item.title, value: item.id })),
      });
    });
  },
  cityList() {
    const { province_code } = this.data.formData;
    if (!province_code) return;
    Http.get(Config.api.baseCityList, {
      province_code: province_code,
      for_create_line: 0,
    }).then((res) => {
      this.setData({
        city_options: (res.data || []).map((item) => ({ label: item.title, value: item.id })),
      });
    });
  },
});
