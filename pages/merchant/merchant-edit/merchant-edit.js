// pages/setting/setting-operator-edit/setting-operator-edit.js

const app = getApp();
import dataHandle from './../../../utils/dataHandle';
const Config = require('./../../../utils/config');
const Http = require('./../../../utils/http');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    is_post_pay_options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
    gb_included_options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
    province_options: [],
    city_options: [],
    salesman_options: [],
    geo_options: [],

    store_type_options: [
      { label: '精品水果店', value: 'boutique_fruit_shop' },
      { label: '商超系统', value: 'business_super_system' },
      { label: '便利系统', value: 'convenience_system' },
      { label: '大众水果店', value: 'volkswagen_fruit_shop' },
      { label: '非生鲜门店', value: 'not_fresh_shop' },
      { label: '微商', value: 'microboss' },
      { label: '员工内部账号', value: 'inner_test_account' },
      { label: '其他', value: 'other' },
    ],

    business_ares_options: [
      { label: '<50平米', value: '<50平米' },
      { label: '50-100平米', value: '50-100平米' },
      { label: '>100平米', value: '>100平米' },
    ],

    kp_gender_options: [
      { label: '男', value: 0 },
      { label: '女', value: 1 },
    ],

    kp_age_options: [
      { label: '70前', value: '70前' },
      { label: '70后', value: '70后' },
      { label: '80后', value: '80后' },
      { label: '90后', value: '90后' },
    ],

    pur_channels_options: [
      { label: '互联网服务商', value: 'inter_service_provider' },
      { label: '县级批发商', value: 'county_wholesalers' },
      { label: '市级批发市场', value: 'city_wholesalers' },
      { label: '省级批发市场', value: 'province_wholesalers' },
      { label: '连锁店总部统一配送', value: 'host_distribution' },
      { label: '其他', value: 'other' },
    ],

    business_years_options: [
      { label: '<1年', value: '<1年' },
      { label: '1-2年', value: '1-2年' },
      { label: '3-5年', value: '3-5年' },
      { label: '5年以上', value: '5年以上' },
    ],

    is_pos_options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],

    online_sale_tool_options: [
      { label: '未做线上销售', value: '' },
      { label: '朋友圈+微信群', value: 'wechat_group_friends' },
      { label: '外卖平台', value: 'takeaway' },
      { label: '社区团购', value: 'group_pur' },
      { label: '其他电商平台', value: 'other' },
    ],

    monthly_turnover_options: [
      { label: '<3万', value: '<3万' },
      { label: '3-6万', value: '3-6万' },
      { label: '6-9万', value: '6-9万' },
      { label: '9-12万', value: '9-12万' },
      { label: '12-15万', value: '12-15万' },
      { label: '15-18万', value: '15-18万' },
      { label: '18-21万', value: '18-21万' },
      { label: '21-24万', value: '21-24万' },
      { label: '24-27万', value: '24-27万' },
      { label: '27-30万', value: '27-30万' },
      { label: '30-40万', value: '30-40万' },
      { label: '40-50万', value: '40-50万' },
      { label: '50-60万', value: '50-60万' },
      { label: '>60万', value: '>60万' },
    ],

    business_status_options: [
      { label: '营业中', value: 'business' },
      { label: '已关闭', value: 'closed' },
      { label: '因客户恶意情况需要冻结', value: 'need_to_freeze' },
    ],

    business_category_options: [
      { label: '零食坚果', value: '零食坚果' },
      { label: '酒水饮料', value: '酒水饮料' },
      { label: '奶制品', value: '奶制品' },
      { label: '蔬菜', value: '蔬菜' },
      { label: '鲜肉', value: '鲜肉' },
      { label: '冻品', value: '冻品' },
      { label: '米面粮油', value: '米面粮油' },
      { label: '干货调料', value: '干货调料' },
      { label: '鸡蛋', value: '鸡蛋' },
      { label: '小百货', value: '小百货' },
      { label: '水果', value: '水果' },
    ],
    member_list_options: [], //子账号选项列表

    loginUserInfo: {},

    loading: false,

    module: 'merchant', // merchant | intention | store
    type: 'detail', // add | modify | audit | detail

    loadComplete: false, // 针对 type === detai 模式，作出兼容。

    formData: {
      merchant_id: 0, // 在store 编辑模式下需要用到的字段

      // 商户字段 ，在 新增商户 和 激活潜在客户时 ，需要存在
      merchant_title: '',
      is_post_pay: false,
      credit_limit: 10000,

      // 门店字段
      gb_included: false, // 自提点
      images: [], // 图片
      store_title: '', // 门店名称 在编辑 商户的表单中
      title: '', // 门店名称 在编辑门店的表单中
      store_csm_id: '', // 客户经理 在编辑商户的表单中
      csm_id: '', // 客户经理，在编辑门店的表单中
      province_code: '',
      city_id: '',
      geo: { lng: '', lat: '', province_title: '', city_title: '', poi: '' },
      address: '',
      linkman: '',
      store_phone: '', // 门店联系电话 在编辑 商户的表单中
      phone: '', // 门店联系电话 在编辑 门店的表单中

      member_ids: [], //子账号id Array<number>

      store_type: '', // 门店类型
      business_ares: '', // 经营面积
      kp_gender: 0, // KP性别
      kp_age: '', // KP年龄
      pur_channels: '', // 采购渠道
      business_years: '', // 经营年限
      is_pos: true, // 是否一体化POS机
      online_sale_tool: '', // 线上销售工具
      monthly_turnover: '', // 月营业额
      business_status: '', // 经营状态
      business_category: [], // 经营品类

      avatar: '',
      login_phone: '',
      realname: '',
    },
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { module, type, merchant_id, item } = options;
    if (item) {
      item = JSON.parse(decodeURIComponent(item));
    }

    if (merchant_id) {
      merchant_id = Number(merchant_id);
    }

    this.setData({ type, module }, () => { this.setData({ loadComplete: true }) });

    app.signIsLogin(() => {
      const { loginUserInfo } = app.globalData;
      this.provinceList();

      if (type === 'add') {
        this.setData({
          loginUserInfo: loginUserInfo,
          formData: Object.assign(this.data.formData, { 
            province_code: loginUserInfo.province_code, 
            merchant_id: module === 'store' ? merchant_id : 0 
          }),
        }, () => {
          // 新增模式下，请求省份列表，如果是本地用户，则请求城市信息
          this.provinceList(loginUserInfo.opt_type === 'local');
          loginUserInfo.opt_type === 'local' && this.cityList();
        });
        
      } else if (['modify', 'detail', 'audit'].includes(type)) {

        try {
          // 兼容历史数据，没有客户经理 和 地理位置的情况
          if (!item.geo || Object.keys(item.geo).length < 5) {
            item.geo = { lng: '', lat: '', province_title: '', city_title: '', poi: '' };
          }
          item.csm_id = item.csm_id || '';
          
          if (module === 'store') {
            item.merchant_id = merchant_id
          }

          this.setData(
            {
              loginUserInfo: loginUserInfo,
              formData: Object.assign(this.data.formData, item),
              geo_options: [{ label: item.geo.poi, value: item.geo.poi }],
            },
            () => {
              this.provinceList(!item.geo || !item.geo.lng || !item.geo.lat);
              this.cityList(!item.geo || !item.geo.lng || !item.geo.lat);
              this.salesmanList();
            }
          );
        } catch (e) {
          console.log('merchant-edit page onLoad error: ', e);
        }
      }

      if (module === 'store') {
        this.childMemberList()
      }

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
          case 'province_code':
            const province = this.data.province_options.find((d) => d.value === value) || {};

            const geo = {
              lng: '',
              lat: '',
              province_title: province.label || '',
              city_title: '',
              poi: '',
            };

            this.setData({
              formData: Object.assign(this.data.formData, {
                city_id: '',
                store_csm_id: '',
                csm_id: '',
                geo: geo,
              }),
            });
            this.cityList();
            break;
          case 'city_id':
            const city = this.data.city_options.find((d) => d.value === value) || {};
            this.setData({
              formData: Object.assign(this.data.formData, {
                store_csm_id: '',
                csm_id: '',
                geo: Object.assign(this.data.formData.geo, { lng: '', lat: '', city_title: city.label || '', poi: '' }),
              }),
            });

            this.salesmanList();
            break;
        }
      }
    );
  },

  changeGeo() {
    if (this.data.formData.city_id && this.data.formData.province_code) {
      let location = encodeURIComponent(JSON.stringify(this.data.formData.geo));
      wx.navigateTo({
        url: '/pages/amap/amap?location=' + location,
      });
    }
  },

  selectGeoCallBack(selectedLocation) {
    this.setData(
      {
        formData: Object.assign(this.data.formData, { geo: Object.assign(this.data.formData.geo, selectedLocation) }),
        geo_options: [{ label: selectedLocation.poi, value: selectedLocation.poi }],
      }
    );
  },

  onSubmit() {
    this.selectComponent('#pg-form')
      .validateAll()
      .then((valid) => {
        if (!valid) {
          wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
          return;
        }

        switch (this.data.module) {
          case 'intention':
            this.intentionEdit();
            break;
          case 'merchant':
            this.merchantEdit();
            break;
          case 'store':
            this.storeEdit();
            break;
        }
      });
  },

  intentionEdit() {
    const formData = Object.assign({}, this.data.formData);
    formData.store_csm_id = Number(formData.store_csm_id);

    let API = 'intentionMerchantAdd';
    let MSG = '意向客户创建成功';
    if (this.data.type === 'modify') {
      API = 'intentionMerchantEdit';
      MSG = '意向客户修改成功';
    }
    if (this.data.type === 'audit') {
      API = 'intentionMerchantAudit';
      MSG = '意向客户激活成功';
    }

    this.setData({ loading: true });
    Http.post(Config.api[API], formData)
      .then((res) => {
        wx.showToast({
          title: MSG,
          icon: 'success',
        });

        this.setData({ loading: false });
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  merchantEdit() {
    const formData = Object.assign({}, this.data.formData);
    formData.store_csm_id = Number(formData.store_csm_id);
    formData.credit_limit =  formData.is_post_pay ? dataHandle.handlePrice(formData.credit_limit) : 0;

    this.setData({ loading: true });
    Http.post(Config.api.merchantAdd, formData)
      .then((res) => {
        wx.showToast({
          title: '商户新增成功',
          icon: 'success',
        });

        this.setData({ loading: false });
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  storeEdit() {
    const formData = Object.assign({}, this.data.formData);
    formData.csm_id = Number(formData.csm_id);

    const API = this.data.type === 'add' ? 'storeAdd' : 'storeEdit';
    const MSG = this.data.type === 'add' ? '门店新增成功' : '门店修改成功';

    this.setData({ loading: true });
    Http.post(Config.api[API], formData)
      .then((res) => {
        wx.showToast({
          title: MSG,
          icon: 'success',
        });

        this.setData({ loading: false });
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },


  provinceList(init = false) {
    Http.get(Config.api.baseProvinceList).then((res) => {
      this.setData({
        province_options: (res.data || []).map((item) => ({ label: item.title, value: item.code })),
      });
      if (init) {
        const province = (res.data || []).find(d => d.code === this.data.formData.province_code);
        if (province) {
          this.setData({ 'formData.geo.province_title': province.title })
        }
      }
    });
  },

  cityList(init = false) {
    const { province_code } = this.data.formData;
    if (!province_code) return;
    Http.get(Config.api.baseCityList, {
      province_code: province_code,
      for_create_line: 0,
    }).then((res) => {
      if (init) {
        const city = (res.data || []).find(d => d.id === this.data.formData.city_id);
        if (city) {
          this.setData({ 'formData.geo.city_title': city.title })
        }
      }
      this.setData({
        city_options: (res.data || []).map((item) => ({ label: item.title, value: item.id })),
      });
    });
  },
  salesmanList() {
    Http.get(Config.api.baseCommonOperatorList, { city_id: this.data.formData.city_id }).then((res) => {
      if (res.code === 0) {
        this.setData({
          salesman_options: (res.data || []).map((item) => ({ value: item.id, label: item.realname })),
        });
      }
    });
  },
  // 获取子账号列表
  childMemberList() {
    const { merchant_id } = this.data.formData
    Http.get(Config.api.memberList, {
      merchant_id,
      is_main: 0, // 0代表子账号
      page: 1,
      page_size: 50,
    }).then(res => {
      if (res.code === 0) {
        let memberList = res.data || []
        let mlOpt = memberList.map(item => ({ label: item.realname + `(${item.phone})` , value: item.id, phone: item.phone}))
        this.setData({
          member_list_options: mlOpt
        })
      }
    })
  },

});
