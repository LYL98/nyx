// pages/merchant/merchant.js
const app = getApp();
const config = require('./../../../utils/config');
const http = require('./../../../utils/http');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    province_code: String,
    auth: Object,
  },

  /**
   * 组件的初始数据
   */
  data: {
    showType: 'init', // 页面生命周期 onShow 触发的类型( init | search | modify ) ，默认为 init
    query: { condition: '' },
    pickerType: 'begin_date',

    dialog: {
      isShowFilterDialog: false,
      isShowCityDialog: false,
    },

    selectedCity: { code: '', title: '' },
    cityList: [],
    showCityList: [], // 省略显示的city 列表

    provinceList: [],
    showProvinceList: [],
    selectedProvince: { code: '', title: '' },

    data: '',

    listItem: {
      num: 0,
      items: [],
    },
  },

  lifetimes: {
    attached() {
      this.initQuery();
      this.cityList();
      this.loadProvinceList();
      this.intentionQuery();
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      // console.log('组件被移除');
    },
  },

  pageLifetimes: {
    show() {
      switch (this.data.showType) {
        case 'init': // 1、初始化时的处理方式，加载门店列表
          this.intentionQuery();
          break;
        case 'modify': // 3、打开详情后的处理方式，根据当前页面的位置，再次加载可能被修改的列表值。
          let { query } = this.data;
          if (query.page === 1) {
            this.intentionQuery();
          } else {
            let items = query.page === 2 ? [] : this.data.listItem.items.slice(0, (query.page - 2) * query.page_size);
            query.page = query.page - 1;
            http
              .get(config.api.intentionMerchantQuery, query)
              .then((res) => {
                items = items.concat(res.data.items);
                query.page = query.page + 1;
                return http.get(config.api.intentionMerchantQuery, query);
              })
              .then((res) => {
                items = items.concat(res.data.items);
                this.setData({
                  listItem: Object.assign(this.data.listItem, {
                    num: res.data.num,
                    items: items,
                  }),
                });
              });
          }
          break;
        default:
          break;
      }
    },
  },

  methods: {
    //搜索框回调方法 start--------------------------------------
    onChange(e) {
      this.setData(
        {
          query: Object.assign(this.data.query, { condition: e.detail.value, page: 1 }),
        },
        () => {
          this.intentionQuery();
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0,
          });
        }
      );
    },
    onFocus(e) {
      // console.log('onFocus', e)
    },
    onBlur(e) {
      // console.log('onBlur', e)
    },
    onConfirm(e) {
      // console.log('onConfirm', e)
    },
    onClear(e) {
      // console.log('onClear', e)
      this.setData(
        {
          query: Object.assign(this.data.query, { condition: '', page: 1 }),
        },
        () => {
          this.intentionQuery();
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0,
          });
        }
      );
    },
    onCancel(e) {
      this.setData(
        {
          query: Object.assign(this.data.query, { condition: '', page: 1 }),
        },
        () => {
          this.intentionQuery();
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0,
          });
        }
      );
    },
    //搜索框回调方法 end--------------------------------------

    handleAddItem() {
      this.setData({ showType: 'modify' });
      wx.navigateTo({
        url: '/pages/merchant/merchant-edit/merchant-edit?module=intention&type=add',
      });
    },

    handleDetailItem(e) {
      if (this.properties.auth.isAdmin || this.properties.auth.IntentionMerchantDetail) {
        let item = e.currentTarget.dataset.item;
        http.get(config.api.intentionMerchantDetail, { id: item.id }).then((res) => {
          this.setData({ showType: 'modify' });
          item = res.data;
          item = encodeURIComponent(JSON.stringify(item));
          wx.navigateTo({
            url: '/pages/merchant/merchant-edit/merchant-edit?module=intention&type=detail&item=' + item,
          });
        });
      }
    },

    handleModifyItem(e) {
      let item = e.currentTarget.dataset.item;
      http.get(config.api.intentionMerchantDetail, { id: item.id }).then((res) => {
        this.setData({ showType: 'modify' });
        item = res.data;
        item = encodeURIComponent(JSON.stringify(item));
        wx.navigateTo({
          url: '/pages/merchant/merchant-edit/merchant-edit?module=intention&type=modify&item=' + item,
        });
      });
    },

    handleAuditItem(e) {
      let item = e.currentTarget.dataset.item;
      http.get(config.api.intentionMerchantDetail, { id: item.id }).then((res) => {
        this.setData({ showType: 'modify' });
        item = Object.assign(res.data, { intention_merchant_id: item.id });
        item = encodeURIComponent(JSON.stringify(item));
        wx.navigateTo({
          url: '/pages/merchant/merchant-edit/merchant-edit?module=intention&type=audit&item=' + item,
        });
      });
    },

    handleDeleteItem(e) {
      let that = this;
      wx.showModal({
        title: '提示',
        content: '确认删除意向客户？',
        confirmText: '确认',
        confirmColor: '#00ADE7',
        success(res) {
          if (res.confirm) {
            let item = e.currentTarget.dataset.item;
            http.post(config.api.intentionMerchantDelete, { id: item.id }).then((res) => {
              that.intentionQuery();
              wx.showToast({ title: '删除成功', icon: 'success' });
              wx.pageScrollTo({ scrollTop: 0, duration: 0 });
            });
          }
        },
      });
    },

    lowerQuery() {
      // 如果总数 小于等于 当前列表长度，则表示已经加载完成，提示用户已经加载完毕...

      http.get(config.api.intentionMerchantQuery, this.data.query).then((res) => {
        let items = this.data.listItem.items;
        items = items.concat(res.data.items);
        this.setData({
          listItem: Object.assign(this.data.listItem, {
            num: res.data.num,
            items: items,
          }),
        });
      });
    },

    toggerFilterDialog(event) {
      this.setData({
        dialog: Object.assign(this.data.dialog, {
          isShowFilterDialog: !this.data.dialog.isShowFilterDialog,
        }),
      });
    },

    openCityDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowCityDialog: true }),
      });
    },

    closeCityDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowCityDialog: false }),
      });
    },

    initQuery() {
      this.setData({
        query: Object.assign(this.data.query, {
          province_code: this.properties.province_code,
          is_audited: '',
          is_freeze: '',
          is_post_pay: '',
          city_id: '',
          begin_date: '',
          end_date: '',
          condition: '',
          userinfo: '',
          page: 1,
          page_size: 20,
        }),
      });
    },

    changeQuery(event) {
      let { key, value } = event.target.dataset;
      switch (key) {
        case 'is_audited':
          // 如果query对应的值，等于用户选中的值，则取消选中状态
          value = this.data.query.is_audited === value ? '' : value;
          this.setData({
            query: Object.assign(this.data.query, { is_audited: value }),
          });
          break;
        case 'is_freeze':
          value = this.data.query.is_freeze === value ? '' : value;
          this.setData({
            query: Object.assign(this.data.query, { is_freeze: value }),
          });
          break;
        case 'is_post_pay':
          value = this.data.query.is_post_pay === value ? '' : value;
          this.setData({
            query: Object.assign(this.data.query, { is_post_pay: value }),
          });
          break;
        case 'city_id':
          let item = this.data.query.city_id === value ? { id: '', title: '' } : event.target.dataset.item;
          value = this.data.query.city_id === value ? '' : value;
          this.setData({
            selectedCity: Object.assign(this.data.selectedCity, { id: item.id, title: item.title }),
            query: Object.assign(this.data.query, { city_id: value }),
            dialog: Object.assign(this.data.dialog, { isShowCityDialog: false }),
          });
          break;
        case 'province_code':
          let provinceItem = event.target.dataset.item;
          value = this.data.query.province_code === value ? '' : value;
          this.setData(
            {
              query: Object.assign(this.data.query, { province_code: value }),
              selectedProvince: Object.assign(this.data.selectedProvince, { code: provinceItem.code, title: provinceItem.title }),
            },
            () => {
              this.cityList();
            }
          );
          break;
      }
    },

    changePicker(event) {
      switch (this.data.pickerType) {
        case 'begin_date':
          this.setData({
            query: Object.assign(this.data.query, {
              begin_date: event.detail.value,
            }),
          });
          break;
        case 'end_date':
          this.setData({
            query: Object.assign(this.data.query, {
              end_date: event.detail.value,
            }),
          });
          break;
      }
    },

    changeBeginDate(event) {
      this.setData({
        pickerType: 'begin_date',
      });
    },

    changeEndDate() {
      this.setData({
        pickerType: 'end_date',
      });
    },

    submitQuery() {
      this.setData(
        {
          query: Object.assign(this.data.query, { condition: '', page: 1 }),
          dialog: Object.assign(this.data.dialog, { isShowFilterDialog: false, isShowCityDialog: false }),
        },
        () => {
          this.intentionQuery();
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0,
          });
        }
      );
    },

    resetQuery() {
      // 全国权限重置到所有省份，区域权限不重置省份
      if (this.properties.opt_type === 'global') {
        this.setData({
          selectedProvince: Object.assign(this.data.selectedProvince, { code: '', title: '' }),
        });
      }
      this.initQuery();
      this.setData({
        selectedCity: Object.assign(this.data.selectedCity, { code: '', title: '' }),
        dialog: Object.assign(this.data.dialog, {
          isShowFilterDialog: false,
          isShowCityDialog: false,
        }),
      });
      this.intentionQuery();
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
    },

    intentionQuery() {
      http.get(config.api.intentionMerchantQuery, this.data.query).then((res) => {
        this.setData({
          listItem: Object.assign(this.data.listItem, {
            num: res.data.num,
            items: res.data.items,
          }),
        });
      });
    },

    cityList() {
      http.get(config.api.baseCityList, { province_code: this.data.selectedProvince.code }).then((res) => {
        this.setData({
          cityList: res.data,
          showCityList: res.data.slice(0, 6),
        });
      });
    },

    loadProvinceList() {
      http.get(config.api.baseProvinceList, { is_no_prompt: true }).then((res) => {
        this.setData({
          provinceList: res.data,
          showProvinceList: res.data.slice(0, 6),
        });
      });
    },

    showItemDetail(event) {
      if (this.properties.auth.isAdmin || this.properties.auth.MerchantAuditDetail) {
        let item = event.currentTarget.dataset.item;
        if (event.currentTarget.dataset.item && event.currentTarget.dataset.item.merchant_id) {
          this.setData({
            showType: 'modify',
          });
          wx.navigateTo({
            url: '/pages/merchant/merchant-detail/merchant-detail?merchant_id=' + event.currentTarget.dataset.item.merchant_id,
          });
        }
      }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      let that = this;
      let { query, listItem } = that.data;
      if (listItem.num / query.page_size > query.page) {
        //如果没有到达最后一页，加载数据
        query.page = query.page + 1;
        that.setData(
          {
            query: query,
          },
          () => {
            that.lowerQuery();
          }
        );
      }
    },
  },
});
