// pages/statistics/statistics-product.js
import DataHandle from "../../../../utils/dataHandle";
import config from "../../../../utils/config";
import http from "../../../../utils/http";
import util from "../../../../utils/util";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankSrc: './../../../../assets/img/rank.png',
    rankSSrc: './../../../../assets/img/rank_s.png',
    rankSl: './../../../../assets/img/rank_l.png',
    auth: {}, //权限
    query: {
      page: 1,
      page_size: 20,
      province_code: '',
      begin_date: '',
      end_date: '',
      sort: '-sale_amount',
      system_class_code: '',
      buyer_id: '',
    },
    orderItemSumData: {
      items: []
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin(() => {
      let { query } = this.data;
      let { system_class1, system_class2, system_class3, system_class_code3, begin_date, end_date, province_code } = options;
      query.system_class_code = system_class_code3;
      query.system_class1 = system_class1;
      query.system_class2 = system_class2;
      query.system_class3 = system_class3;
      query.begin_date = begin_date;
      query.end_date = end_date;
      query.province_code = province_code;
      this.setData({
        query,
        auth: app.globalData.auth,
      }, () => {
        this.statisticalOrderItemSum();
      });
    });

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let { query, orderItemSumData } = that.data;
    if (orderItemSumData.num / query.page_size > query.page) {
      //如果没有到达最后一页，加载数据
      query.page = query.page + 1;
      that.setData({
        query: query
      }, () => {
        that.statisticalOrderItemSum();
      });
    }
  },

  statisticalOrderItemSum() {
    let that = this;
    let { query, orderItemSumData } = that.data;

    http.get(config.api.clsStatisticalOrderItemSum, query)
      .then(result => {
        if (query.page === 1) {
          that.setData({
            orderItemSumData: result.data,
          });
        } else {
          orderItemSumData.items = orderItemSumData.items.concat(result.data.items);
          that.setData({
            orderItemSumData: orderItemSumData,
          });
        }
      })
  },

  onItemClick(e) {
    return;
    let { query } = this.data;
    wx.navigateTo({
      url: "../statistics-product-merchant/statistics-product-merchant?item_id=" + e.currentTarget.dataset.itemId
        + "&item_code=" + e.currentTarget.dataset.itemCode
        + "&item_title=" + e.currentTarget.dataset.itemTitle
        + "&start_date=" + query.begin_date
        + "&end_date=" + query.end_date
        + "&province_code=" + query.province_code
    });
  },

  //排序
  changeSort(e) {
    let value = e.currentTarget.dataset.sort;
    // console.log(value);
    this.setData({
      query: Object.assign(this.data.query, { sort: value, page: 1 })
    }, () => {
      this.statisticalOrderItemSum();//获取商品列表
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });

  },
})
