// pages/statistics/statistics-client-zone.js
import util from "../../../utils/util";
import http from "../../../utils/http";
import config from "../../../utils/config";
import DataHandle from "../../../utils/dataHandle";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankSrc: './../../../assets/img/rank.png',
    rankSSrc: './../../../assets/img/rank_s.png',
    rankSl: './../../../assets/img/rank_l.png',
    auth: {}, //权限
    provinceTitle: '',
    provinceTitleTmp: '',
    now: new Date(),
    nowDayOfWeek : new Date().getDay() === 0 ? 7 : new Date().getDay(),  //星期日默认是0
    nowDay : new Date().getDate(),
    nowMonth : new Date().getMonth(),
    nowYear : new Date().getFullYear(),
    currentFixDate: '今日',
    fixDates: [
      '今日',
      '昨日',
      '本周',
      '上周',
      '本月',
      '上月',
      '自定义'
    ],
    startDate: '',
    endDate: '',
    query: {
      page: 1,
      page_size: 20,
      province_code: '',
      province_title: '',
      zone_id: '',
      city_id: '',
      begin_date: '',
      end_date: '',
      sort: '-gmv',
    },
    total: 0,
    orderItemSumData: [],
    dialog: {
      isShowFilterDialog: false,
      isShowProvinceDialog: false
    },
    provinceList: [],
    showProvinceList: [], // 省略显示的省份 列表
    hasSelectProvince: '全部',
    //total_client:0//客户订单统计的占比的总数
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    let that = this;
    let {province_code, province_title, fix_date, start_date, end_date} = options;
    if (province_code && fix_date && start_date && end_date) {
      this.setData({
        'query.province_id': province_code,
        hasSelectProvince: util.selectedLabel(province_title),
        provinceTitle: province_title,
        startDate: start_date,
        endDate: end_date,
        currentFixDate: fix_date,
        //total_client: total_client
      });
    }

    app.signIsLogin(() => {
      this.setData({
        auth: app.globalData.auth,
        'query.province_code': province_code,
      }, () => {
        that.statisticalOrderZoneSum();
        that.loadProvinceList();
      })
    });
  },

  loadProvinceList() {
    http.get(config.api.baseProvinceList, {is_no_prompt: true})
        .then(res => {
          let names = ["全部"];
          for (let i = 0; i < res.data.length; i++) {
            names.push(res.data[i].title);
          }
          // console.log("names: ", names, res.data)
          this.setData({
            provinceList: res.data,
            showProvinceList: res.data.slice(0, 6),
            provinceNames: names
          })
        })
  },

  statisticalOrderZoneSum(){
    let that = this;
    let { query, startDate, endDate } = that.data;
    query.begin_date = startDate;
    query.end_date = endDate;

    http.get(config.api.statisticalOrderGradeSum, query)
        .then(result => {
          let total = 0;
          result.data.map(item => {
            total += Number(DataHandle.returnPrice(item.gmv))
          });
          that.setData({
            orderItemSumData: result.data,
            total: total
          });
        })
  },

  onFixDateSelect(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    let that = this;
    let { fixDates, nowYear, nowMonth, nowDay, nowDayOfWeek } = this.data;
    let value = e.detail.value;
    //设置显示值
    that.setData({
      currentFixDate: fixDates[value]
    });

    let fixDate = fixDates[value];

    let start = '';
    let end = '';
    //自动改变时间范围
    switch (fixDate) {
      case '今日':{
        let today = new Date();
        start = end = that.formatDate(today);
      }
        break;
      case '昨日':{
        let today = new Date();
        let yesterday = new Date(today.setDate(today.getDate() - 1));
        start = end = that.formatDate(yesterday);
      }
        break;
      case '本周':{
        start = util.getFixDateRange(2)[0];
        end = util.getFixDateRange(2)[1];
      }
        break;
      case '上周':{
        start = util.getFixDateRange(3)[0];
        end = util.getFixDateRange(3)[1];
      }
        break;
      case '本月':{
        start = util.getFixDateRange(4)[0];
        end = util.getFixDateRange(4)[1];
      }
        break;
      case '上月':{
        start = util.getFixDateRange(5)[0];
        end = util.getFixDateRange(5)[1];
      }
        break;
      case '自定义':

        break;
    }

    if (fixDate !== '自定义') {
      that.setDateRange(start, end);

      that.statisticalOrderZoneSum();
    }
  },

  setDateRange(startDate, endDate) {
    this.setData({
      startDate: startDate,
      endDate: endDate,
      'query.page': 1
    });
  },

  getMonthDays(myMonth){
    let { nowYear } = this.data;
    var monthStartDate = new Date(nowYear, myMonth, 1);
    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate)/(1000 * 60 * 60 * 24);
    return days;
  },

  formatDate(date) {
    return DataHandle.formatDate(date, 'yyyy-MM-dd')
  },

  onSelectStartDate(e) {
    let that = this;
    let { endDate } = this.data;
    let startDate = e.detail.value;
    let sDate = Date.parse(startDate);
    let eDate = Date.parse(endDate);
    if (sDate <= eDate) {
      this.setData({
        currentFixDate: '自定义',
        startDate: startDate,
        'query.page': 1
      });
      that.statisticalOrderZoneSum();
    } else {
      wx.showModal({
        title: "提示",
        content: "起始日期不能大于结束日期",
        confirmText: "我知道了",
        confirmColor: "#00ADE7",
        showCancel: false
      });
    }
  },

  onSelectEndDate(e) {
    let that = this;
    let { startDate } = this.data;
    let endDate = e.detail.value;
    let sDate = Date.parse(startDate);
    let eDate = Date.parse(endDate);
    if (eDate >= sDate) {
      this.setData({
        currentFixDate: '自定义',
        endDate: e.detail.value,
        'query.page': 1
      });
      that.statisticalOrderZoneSum();
    } else {
      wx.showModal({
        title: "提示",
        content: "结束日期不能小于起始日期",
        confirmText: "我知道了",
        confirmColor: "#00ADE7",
        showCancel: false
      });
    }
  },

  onItemClick(e) {
    let { startDate, endDate, currentFixDate, provinceTitle } = this.data;
    wx.navigateTo({
      url: "../statistics-client-city/statistics-client-city?zone_id=" + e.currentTarget.dataset.zoneCode
          + "&zone_title=" + e.currentTarget.dataset.zoneTitle
          + "&province_code=" + this.data.query.province_code
          + "&province_title=" + provinceTitle
          + "&start_date=" + startDate
          + "&end_date=" + endDate
          + "&fix_date=" + currentFixDate
          //+"&total_client="+ this.data.total_client

    });
  },

  //筛选区  start--------------------------------------
  //排序
  changeSort(e){
    let value = e.currentTarget.dataset.sort;
    this.setData({
      query: Object.assign(this.data.query, {sort: value, page: 1})
    }, () => {
      this.statisticalOrderZoneSum();
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });

  },

  // zoneList() {
  //   http.get(config.api.basicdataZoneList, {province_code: app.globalData.globalProvince.code})
  //       .then(res => {
  //         this.setData({
  //           zoneList: res.data,
  //           showZoneList: res.data.slice(0, 6)
  //         })
  //       })
  // },

  toggerFilterDialog() {
    this.setData({
      dialog: Object.assign(this.data.dialog, {isShowFilterDialog: !this.data.dialog.isShowFilterDialog})
    })
  },

  openProvinceDialog() {
    this.setData({
      dialog: Object.assign(this.data.dialog, {isShowProvinceDialog: true})
    })
  },

  closeProvinceDialog() {
    this.setData({
      dialog: Object.assign(this.data.dialog, {isShowProvinceDialog: false})
    })
  },

  submitQuery() {
    this.statisticalOrderZoneSum();
    this.setData({
      dialog: Object.assign(this.data.dialog, {
        isShowFilterDialog: false,
        isShowProvinceDialog: false
      }),
      provinceTitle: this.data.provinceTitleTmp
    })
  },

  resetQuery() {
    this.setData({
      query: Object.assign(this.data.query, {
        // province_code: app.globalData.globalProvince.code,
        page: 1,
        page_size: 20,
        province_code: '',
        province_title: '',
        zone_id: '',
        city_id: '',
      }),
      dialog: Object.assign(this.data.dialog, {
        isShowFilterDialog: false,
        isShowProvinceDialog: false
      }),
      hasSelectProvince: '全部',
      provinceTitle: ''
    });
    //默认今天
    let today = this.formatDate(new Date());
    this.setData({
      currentFixDate: '今日',
      startDate: today,
      endDate: today,
    });
    this.statisticalOrderZoneSum();
  },

  changeQuery(event) {
    // console.log('event.target.dataset', event.target.dataset);
    let {key, value, name} = event.target.dataset;
    switch (key) {
      case 'province_code':
        value = this.data.query.province_code === value ? '' : value;
        this.setData({
          query: Object.assign(this.data.query, {province_code: value}),
          hasSelectProvince: value !== '' ? util.selectedLabel(name) : '全部',
          provinceTitleTmp: name
        });
        break;
    }
    // console.log('this.data.query', this.data.query);
  },

  changeSecondQuery(event) {
    this.changeQuery(event);
    let {key} = event.target.dataset;
    switch (key) {
      case 'province_code':
        this.closeProvinceDialog();
        break;
    }
  },

  onFixDateSelectInDialog(e) {
    let that = this;
    let { fixDates, nowYear, nowMonth, nowDay, nowDayOfWeek } = this.data;
    let value = e.detail.value;
    //设置显示值
    that.setData({
      currentFixDate: fixDates[value]
    });

    let fixDate = fixDates[value];

    let start = '';
    let end = '';
    //自动改变时间范围
    switch (fixDate) {
      case '今日':{
        let today = new Date();
        start = end = that.formatDate(today);
        that.setDateRange(todayStr, todayStr);
      }
        break;
      case '昨日':{
        let today = new Date();
        let yesterday = new Date(today.setDate(today.getDate() - 1));
        start = end = that.formatDate(yesterday);
      }
        break;
      case '本周':{
        start = that.formatDate(
            new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+1)
        );
        end = that.formatDate(
            new Date(nowYear, nowMonth, nowDay+ (6 - nowDayOfWeek+1))
        );
      }
        break;
      case '上周':{
        start = that.formatDate(
            new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7+1)
        );
        end = that.formatDate(
            new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1+1)
        );
      }
        break;
      case '本月':{
        start = that.formatDate(
            new Date(nowYear, nowMonth, 1)
        );
        end = that.formatDate(
            new Date(nowYear, nowMonth, that.getMonthDays(nowMonth))
        );
      }
        break;
      case '上月':{
        let lastMonthDate = new Date(); //上月日期
        lastMonthDate.setDate(1);
        lastMonthDate.setMonth(lastMonthDate.getMonth()-1);
        let lastYear = lastMonthDate.getYear();
        let lastMonth = lastMonthDate.getMonth();

        start = that.formatDate(
            new Date(nowYear, lastMonth, 1)
        );
        end = that.formatDate(
            new Date(nowYear, lastMonth, that.getMonthDays(lastMonth))
        );
      }
        break;
      case '自定义':

        break;
    }

    if (fixDate !== '自定义') {
      that.setDateRange(start, end);
    }
  },

  onSelectStartDateInDialog(e) {
    let that = this;
    let { endDate } = this.data;
    let startDate = e.detail.value;
    let sDate = Date.parse(startDate);
    let eDate = Date.parse(endDate);
    if (sDate <= eDate) {
      this.setData({
        currentFixDate: '自定义',
        startDate: startDate,
        'query.page': 1
      });
    } else {
      wx.showModal({
        title: "提示",
        content: "起始日期不能大于结束日期",
        confirmText: "我知道了",
        confirmColor: "#00ADE7",
        showCancel: false
      });
    }
  },

  onSelectEndDateInDialog(e) {
    let that = this;
    let { startDate } = this.data;
    let endDate = e.detail.value;
    let sDate = Date.parse(startDate);
    let eDate = Date.parse(endDate);
    if (eDate >= sDate) {
      this.setData({
        currentFixDate: '自定义',
        endDate: e.detail.value,
        'query.page': 1
      });
    } else {
      wx.showModal({
        title: "提示",
        content: "结束日期不能小于起始日期",
        confirmText: "我知道了",
        confirmColor: "#00ADE7",
        showCancel: false
      });
    }
  },

  //筛选  end----------------------------------------------


  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})