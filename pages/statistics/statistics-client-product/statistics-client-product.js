// pages/statistics/statistics-client-product/statistics-client-product.js
import http from "../../../utils/http";
import config from "../../../utils/config";
import DataHandle from "../../../utils/dataHandle";
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
      store_title: '',
      query: {
          page: 1,
          page_size: 20,
          begin_date: '',
          end_date: '',
          store_id: '',
          province_code: '',
          buyer_id: '',
          display_class: '',
          condition: '',
          sort: ''
      },
      productListData: {
        items: []
      },
      showSkeleton: true,
      buyerList: [],
      showBuyerList: [],
      displayClassList: [],
      showDisplayClassList: [], // 省略显示的city 列表
      dialog: {
          isShowFilterDialog: false,
          isShowBuyerDialog: false,
          isShowDisplayClassDialog: false
      },
      hasSelectBuyer: '全部',
      hasSelectDisplayClass: '全部'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let {store_id, store_title, start_date, end_date, province_code} = options;
      if (store_id && store_title && start_date && end_date) {
          this.setData({
              'query.store_id': store_id,
              'query.begin_date': start_date,
              'query.end_date': end_date,
              store_title: store_title
          })
      }
      app.signIsLogin(() => {
          this.setData({
              auth: app.globalData.auth,
              'query.province_code': province_code,
          }, () => {
              this.statisticalOrderStoreSaleItems();

              this.buyerList();
              this.displayClassList();
          })
      });

  },

    statisticalOrderStoreSaleItems(){
        let that = this;
        let { query, productListData } = that.data;
        query.is_gift = 0;
        http.get(config.api.statisticalOrderStoreSaleItems, query)
            .then(result => {
                if (query.page === 1){
                    that.setData({
                        productListData: result.data,
                        showSkeleton: false
                    });
                }else{
                    productListData.items = productListData.items.concat(result.data.items);
                    that.setData({
                        productListData: productListData,
                        showSkeleton: false
                    });
                }
            })
    },

    //筛选区 start---------------------------
    //排序
    changeSort(e){
        let value = e.currentTarget.dataset.sort;
        this.setData({
            query: Object.assign(this.data.query, {sort: value, page: 1})
        }, () => {
            this.statisticalOrderStoreSaleItems();
        });

        wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
        });

    },

    toggerFilterDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowFilterDialog: !this.data.dialog.isShowFilterDialog})
        })
    },

    buyerList() {
        http.get(config.api.baseCommonBuyerList, {province_code: this.data.query.province_code})
            .then(res => {
                this.setData({
                    buyerList: res.data,
                    showBuyerList: res.data.slice(0, 6)
                })
                // console.log('this.data.zoneList', this.data.buyerList, this.data.showBuyerList);
            })
    },

    displayClassList() {
        http.get(config.api.baseDisplayClassList, {province_code: this.data.query.province_code})
            .then(res => {
                this.setData({
                    displayClassList: res.data,
                    showDisplayClassList: res.data.slice(0, 6)
                })
                // console.log('this.data.showDisplayClassList', this.data.displayClassList, this.data.showDisplayClassList);
            })
    },

    openBuyerDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowBuyerDialog: true})
        })
    },

    closeBuyerDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowBuyerDialog: false})
        })
    },

    openDisplayClassDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowDisplayClassDialog: true})
        })
    },

    closeDisplayClassDialog() {
        this.setData({
            dialog: Object.assign(this.data.dialog, {isShowDisplayClassDialog: false})
        })
    },

    changeQuery(event) {
        // console.log('event.target.dataset', event.target.dataset);
        let {key, value, name} = event.target.dataset;
        switch (key) {
            case 'display_class':
                value = this.data.query.display_class === value ? '' : value;
                this.setData({
                    query: Object.assign(this.data.query, {display_class: value, page: 1}),
                    hasSelectDisplayClass: value !== '' ? util.selectedLabel(name) : '全部'
                });
                break;
            case 'buyer_id':
                value = this.data.query.buyer_id === value ? '' : value;
                this.setData({
                    query: Object.assign(this.data.query, {buyer_id: value, page: 1}),
                    hasSelectBuyer: value !== '' ? util.selectedLabel(name) : '全部'
                });
                break;
        }
    },

    changeSecondQuery(event) {
        this.changeQuery(event);
        let {key} = event.target.dataset;
        switch (key) {
            case 'display_class':
                this.closeDisplayClassDialog();
                break;
            case 'buyer_id':
                this.closeBuyerDialog();
                break;
        }
    },

    submitQuery() {
        this.statisticalOrderStoreSaleItems();
        this.setData({
            dialog: Object.assign(this.data.dialog, {
                isShowFilterDialog: false,
                isShowBuyerDialog: false,
                isShowDisplayClassDialog: false
            })
        })
    },

    resetQuery() {
        this.setData({
            query: Object.assign(this.data.query, {
                page: 1,
                page_size: 20,
                buyer_id: '',
                display_class: '',
                sort: ''
            }),
            dialog: Object.assign(this.data.dialog, {
                isShowFilterDialog: false,
                isShowBuyerDialog: false,
                isShowDisplayClassDialog: false
            }),
            hasSelectDisplayClass: '全部',
            hasSelectBuyer: '全部'
        });
        this.statisticalOrderStoreSaleItems();
    },
    //筛选区 end---------------------------

    /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
      let { query, productListData } = that.data;
      if (productListData.num / query.page_size > query.page) {
          //如果没有到达最后一页，加载数据
          query.page = query.page + 1;
          that.setData({
              query: query
          }, () => {
              that.statisticalOrderStoreSaleItems();
          });
      }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
