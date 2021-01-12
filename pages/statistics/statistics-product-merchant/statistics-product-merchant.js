// pages/statistics/statistics-product-merchant/statistics-product-merchant.js
import http from "../../../utils/http";
import config from "../../../utils/config";
import util from "../../../utils/util";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      auth: {}, //权限
      rankSrc: './../../../assets/img/rank.png',
      rankSSrc: './../../../assets/img/rank_s.png',
      rankSl: './../../../assets/img/rank_l.png',
      itemCode: '',
      itemTitle: '',
      merchantListData: {
          items: []
      },
      inputValue: '',
      query: {
          page: 1,
          page_size: 20,
          begin_date: '',
          end_date: '',
          condition: '',
          item_id: '',
          province_code: '',
          zone_id: '',
          city_id: '',
          sort: ''
      },
      showSkeleton: true,

      dialog: {
          isShowFilterDialog: false,
          isShowZoneDialog: false,
          isShowCityDialog: false
      },
      zoneList: [],
      showZoneList: [], // 省略显示的city 列表
      cityList: [],
      showCityList: [], // 省略显示的city 列表
      hasSelectZone: '全部',
      hasSelectCity: '全部'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let {item_id, item_code, item_title, start_date, end_date, province_code} = options;
      if (item_id && item_code && item_title && start_date && end_date) {
        this.setData({
            'query.item_id': item_id,
            'query.begin_date': start_date,
            'query.end_date': end_date,
            'query.province_code': province_code,
            itemCode: item_code,
            itemTitle: item_title
        })
      }

      app.signIsLogin(() => {
          this.setData({
              auth: app.globalData.auth,
              // 'query.province_code': this.query.province_code,
          }, () => {
              console.log("load data")
              this.statisticalOrderItemSaleStores();
              this.zoneList();
              this.cityList('');
          })
      });
  },

    //搜索框回调方法 start--------------------------------------
    onChange(e) {
        this.setData({
            inputValue: e.detail.value
        });
        this.statisticalOrderItemSaleStores();
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
            inputValue: '',
        });
        this.statisticalOrderItemSaleStores();
    },
    onCancel(e) {
        // console.log('onCancel', e)
    },
    //搜索框回调方法 end--------------------------------------

    statisticalOrderItemSaleStores(){
        let that = this;
        let { query, merchantListData, inputValue } = that.data;

        query.condition = inputValue;
        // console.log('query: ', query);

        http.get(config.api.statisticalOrderItemSaleStores, query)
            .then(result => {
                if (query.page === 1){
                    that.setData({
                        merchantListData: result.data,
                        showSkeleton: false
                    });
                }else{
                    merchantListData.items = merchantListData.items.concat(result.data.items);
                    that.setData({
                        merchantListData: merchantListData,
                        showSkeleton: false
                    });
                }
            })
    },

    //筛选  start---------------------------------------------------------------------------------------

    zoneList() {
        http.get(config.api.basicdataZoneList, {province_code: this.data.query.province_code})
            .then(res => {
                this.setData({
                    zoneList: res.data,
                    showZoneList: res.data.slice(0, 6)
                })
                // console.log('this.data.zoneList', this.data.zoneList, this.data.showZoneList);
            })
    },

    cityList(zoneId) {
        http.get(config.api.baseCityList, {province_code: this.data.query.province_code, zone_id: zoneId})
            .then(res => {
                this.setData({
                    cityList: res.data,
                    showCityList: res.data.slice(0, 6)
                })
            })
    },

    changeQuery(event) {
        // console.log('event.target.dataset', event.target.dataset);
        let {key, value, name} = event.target.dataset;
        switch (key) {
            case 'zone_id':
                value = this.data.query.zone_id === value ? '' : value;
                this.setData({
                    query: Object.assign(this.data.query, {zone_id: value, city_id: '', page: 1}),
                    hasSelectZone: value !== '' ? util.selectedLabel(name) : '全部',
                    hasSelectCity: '全部'
                }, () => {
                    this.cityList(this.data.query.zone_id)
                });
                break;
            case 'city_id':
                value = this.data.query.city_id === value ? '' : value;
                this.setData({
                    query: Object.assign(this.data.query, {city_id: value, page: 1}),
                    hasSelectCity: value !== '' ? util.selectedLabel(name) : '全部'
                });
                break;
        }
        // console.log('this.data.query', this.data.query);
    },

    changeSecondQuery(event) {
        this.changeQuery(event);
        let {key} = event.target.dataset;
        switch (key) {
            case 'zone_id':
                this.closeZoneDialog();
                break;
            case 'city_id':
                this.closeCityDialog();
                break;
        }
    },

    toggerFilterDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowFilterDialog: !this.data.dialog.isShowFilterDialog})
        })
    },

    openZoneDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowZoneDialog: true})
        })
    },

    closeZoneDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowZoneDialog: false})
        })
    },

    openCityDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowCityDialog: true})
        })
    },

    closeCityDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowCityDialog: false})
        })
    },

    submitQuery() {
        this.statisticalOrderItemSaleStores();
        this.setData({
            dialog: Object.assign(this.data.dialog, {
                isShowFilterDialog: false,
                isShowZoneDialog: false,
                isShowCityDialog: false
            })
        })
    },

    resetQuery() {
        this.setData({
            query: Object.assign(this.data.query, {
                page: 1,
                page_size: 20,
                condition: '',
                zone_id: '',
                city_id: '',
                sort: ''
            }),
            dialog: Object.assign(this.data.dialog, {
                isShowFilterDialog: false,
                isShowZoneDialog: false,
                isShowCityDialog: false
            }),
            hasSelectZone: '全部',
            hasSelectCity: '全部'
        });
        this.statisticalOrderItemSaleStores();
    },

    //排序
    changeSort(e){
        let value = e.currentTarget.dataset.sort;
        // console.log(value);
        this.setData({
            query: Object.assign(this.data.query, {sort: value, page: 1})
        }, () => {
            this.statisticalOrderItemSaleStores();//获取商品列表
        });

        wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
        });

    },

    //筛选  end---------------------------------------------------------------------------------------

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      wx.setNavigationBarTitle({
          title: '门店销售统计'
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      let that = this;
      let { query, merchantListData } = that.data;
      if (merchantListData.num / query.page_size > query.page) {
          //如果没有到达最后一页，加载数据
          query.page = query.page + 1;
          that.setData({
              query: query
          }, () => {
              that.statisticalOrderItemSaleStores();
          });
      }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
