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
      isShowProvinceDialog: false,
      isShowCityDialog: false,
      isShowZoneDialog: false,
      isShowCsmDialog: false
    },

    provinceList: [],
    showProvinceList: [],
    selectedProvince: { code: '', title: '' },

    zoneList: [],
    showZoneList: [],
    selectedZone: { id: '', title: '' },

    cityList: [],
    showCityList: [],
    selectedCity: { id: '', title: '' },

    csmList: [],
    showCsmList: [],
    selectedCsm: { id: '', title: '' },

    listItem: {
      num: 0,
      items: [],
    },
  },

  lifetimes: {
    attached() {
      this.initQuery();
      this.loadProvinceList();
      this.loadCsmList();
      this.storeQuery();
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
          this.storeQuery();
          break;
        case 'modify': // 3、打开详情后的处理方式，根据当前页面的位置，再次加载可能被修改的列表值。
          let { query } = this.data;
          if (query.page === 1) {
            this.storeQuery();
          } else {
            let items = query.page === 2 ? [] : this.data.listItem.items.slice(0, (query.page - 2) * query.page_size);
            query.page = query.page - 1;
            http.get(config.api.storeQuery, query)
              .then((res) => {
                items = items.concat(res.data.items);
                query.page = query.page + 1;
                return http.get(config.api.storeQuery, query);
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
      this.setData({
        query: Object.assign(this.data.query, { condition: e.detail.value, page: 1 })
      }, () => {
        this.storeQuery();
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0,
        });
      });
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
      this.setData({
        query: Object.assign(this.data.query, { condition: '', page: 1 })
      }, () => {
        this.storeQuery();
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0,
        });
      });
    },
    onCancel(e) {
      this.setData({
        query: Object.assign(this.data.query, { condition: '', page: 1 })
      }, () => {
        this.storeQuery();
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0,
        });
      });
    },
    //搜索框回调方法 end--------------------------------------

    handleMerchantAdd() {
      this.setData({
        showType: 'init',
      });
      wx.navigateTo({
        url: '/pages/merchant/merchant-edit/merchant-edit?module=merchant&type=add',
      });
    },

    lowerQuery() {
      // 如果总数 小于等于 当前列表长度，则表示已经加载完成，提示用户已经加载完毕...

      http.get(config.api.storeQuery, this.data.query).then((res) => {
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

    openProvinceDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowProvinceDialog: true }),
      });
    },

    closeProvinceDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowProvinceDialog: false }),
      });
    },

    openZoneDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowZoneDialog: true }),
      });
    },

    closeZoneDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowZoneDialog: false }),
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

    openCsmDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowCsmDialog: true }),
      });
    },

    closeCsmDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, { isShowCsmDialog: false }),
      });
    },

    initQuery() {
      this.setData({
        query: Object.assign(this.data.query, {
          status: '',
          province_code: this.properties.province_code,
          is_post_pay: '',
          zone_id: '',
          city_id: '',
          begin_date: '',
          end_date: '',
          condition: '',
          has_location: '',
          csm_id: '',
          page: 1,
          page_size: 20,
        })
      }, () => {
        if(this.properties.province_code){
          this.loadZoneList();
        }
      });
    },

    changeQuery(event) {
      let { item, key, value } = event.target.dataset;
      let { query } = this.data;
      switch (key) {
        case 'status':
          value = query.status === value ? '' : value;
          this.setData({
            query: Object.assign(query, { status: value }),
          })
          break;
        case 'is_post_pay':
          value = query.is_post_pay === value ? '' : value;
          this.setData({
            query: Object.assign(query, { is_post_pay: value }),
          });
          break;
        case 'province_code':
          value = query.province_code === value ? '' : value;
          let provinceItem = value ? { code: item.code, title: item.title } : { code: '', title: '' };
          this.setData(
            {
              selectedProvince: Object.assign(this.data.selectedProvince, provinceItem),
              selectedZone: { id: '', title: '' },
              selectedCity: { id: '', title: '' },
              query: Object.assign(query, { province_code: value, zone_id: '', city_id: '' }),
              dialog: Object.assign(this.data.dialog, { isShowProvinceDialog: false }),
            }, () => {
              this.loadZoneList();
            }
          );
          break;
        case 'zone_id':
          value = query.zone_id === value ? '' : value;
          let zoneItem = value ? { id: item.id, title: item.title } : { id: '', title: '' };
          this.setData({
            selectedZone: Object.assign(this.data.selectedZone, zoneItem),
            selectedCity: { id: '', title: '' },
            query: Object.assign(query, { zone_id: value, city_id: '' }),
            dialog: Object.assign(this.data.dialog, { isShowZoneDialog: false }),
          }, () => {
            this.loadCityList();
          });
          break;
        case 'city_id':
          value = query.city_id === value ? '' : value;
          let cityItem = value ? { id: item.id, title: item.title } : { id: '', title: '' };
          this.setData({
            selectedCity: Object.assign(this.data.selectedCity, cityItem),
            query: Object.assign(query, { city_id: value }),
            dialog: Object.assign(this.data.dialog, { isShowCityDialog: false }),
          });
          break;
        case 'csm_id':
          value = query.csm_id === value ? '' : value;
          let csmItem = value ? { id: item.id, realname: item.realname } : { id: '', realname: '' };
          this.setData({
            selectedCsm: Object.assign(this.data.selectedCsm, csmItem),
            query: Object.assign(query, { csm_id: value }),
            dialog: Object.assign(this.data.dialog, { isShowCsmDialog: false }),
          });
          break;
        case 'has_location':
          value = query.has_location === value ? '' : value;
          this.setData({
            query: Object.assign(query, { has_location: value }),
          });
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
          this.storeQuery();
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
      this.storeQuery();
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
    },

    storeQuery() {
      http.get(config.api.storeQuery, this.data.query).then((res) => {
        this.setData({
          listItem: Object.assign(this.data.listItem, {
            num: res.data.num,
            items: res.data.items,
          }),
        });
      });
    },

    loadCsmList(){
      let that = this;
      let { query } = that.data;
      http.get(config.api.baseCommonOperatorList, {
        province_code: query.province_code,
        post: 'salesman',
        is_freeze: 0,
        need_num: 200
      }).then(res => {
        that.setData({
          csmList: res.data,
          showCsmList: res.data.slice(0, 6),
        });
      })
    },

    loadProvinceList() {
      http.get(config.api.baseProvinceList, { is_no_prompt: true }).then((res) => {
        this.setData({
          provinceList: res.data,
          showProvinceList: res.data.slice(0, 6),
        });
      });
    },

    loadZoneList() {
      http.get(config.api.baseZoneList, { is_no_prompt: true, province_code: this.data.selectedProvince.code }).then((res) => {
        this.setData({
          zoneList: res.data,
          showZoneList: res.data.slice(0, 6),
        });
      });
    },

    loadCityList() {
      http.get(config.api.baseCityList, { zone_id: this.data.selectedZone.id }).then((res) => {
        this.setData({
          cityList: res.data,
          showCityList: res.data.slice(0, 6),
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

    showMap(){
      wx.navigateTo({
        url: '/pages/merchant/merchant-location/merchant-location',
      });
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
        that.setData({
            query: query,
          },() => {
            that.lowerQuery();
          }
        );
      }
    },
  },
});
