// pages/statistics/statistics-client-merchant/statistics-client-merchant.js
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
      rankSrc: './../../../assets/img/rank.png',
      rankSSrc: './../../../assets/img/rank_s.png',
      rankSl: './../../../assets/img/rank_l.png',
      auth: {}, //权限
      cityTitle: '',
      cityTitleTmp: '',
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
          zone_id: '',
          city_id: '',
          begin_date: '',
          end_date: '',
          sort: '-gmv',
      },
      total: 0,
      merchantListData: {
        items: []
      },
      dialog: {
          isShowFilterDialog: false,
          isShowZoneDialog: false,
          isShowCityDialog: false
      },
      zoneList: [],
      showZoneList: [], // 省略显示的zone 列表
      cityList: [],
      showCityList: [], // 省略显示的city 列表
      showSkeleton: true,
      hasSelectZone: '全部',
      hasSelectCity: '全部',
      //total_client:0//客户订单统计的占比的总数

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      let {zone_id, city_id, zone_title, city_title, fix_date, start_date, end_date, province_code} = options;
      if (zone_id || zone_id === '' && city_id && fix_date && start_date && end_date) {
          this.setData({
              'query.zone_id': zone_id,
              'query.city_id': city_id,
              'query.province_code': province_code,
              hasSelectZone: zone_id !== '' ? util.selectedLabel(zone_title) : '全部',
              hasSelectCity: util.selectedLabel(city_title),
              cityTitle: city_title,
              startDate: start_date,
              endDate: end_date,
              currentFixDate: fix_date,
              //total_client: total_client

          });
      }
      app.signIsLogin(() => {
          this.setData({
              auth: app.globalData.auth,
          }, () => {
              that.statisticalOrderMerchantSum();
              that.zoneList();
              that.cityList('');
          })
      });

  },

    statisticalOrderMerchantSum(){
        let that = this;
        let { query, startDate, endDate, merchantListData } = that.data;
        query.begin_date = startDate;
        query.end_date = endDate;

        http.get(config.api.statisticalOrderMerchantSum, query)
            .then(result => {
                let total = 0;
                // that.setData({
                //     merchantListData: result.data,
                //     total: total
                // });

                if (query.page === 1){
                    result.data.items.map(item => {
                        total += Number(DataHandle.returnPrice(item.gmv))
                    });
                    that.setData({
                        merchantListData: result.data,
                        showSkeleton: false,
                        total: total
                    });
                }else{
                    merchantListData.items = merchantListData.items.concat(result.data.items);
                    merchantListData.items.map(item => {
                        total += Number(DataHandle.returnPrice(item.gmv))
                    });
                    that.setData({
                        merchantListData: merchantListData,
                        showSkeleton: false,
                        total: total
                    });
                }
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

            that.statisticalOrderMerchantSum();
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
            that.statisticalOrderMerchantSum();
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
            that.statisticalOrderMerchantSum();
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
        let { startDate, endDate} = this.data;
        wx.navigateTo({
            url: "../statistics-client-product/statistics-client-product?store_id=" + e.currentTarget.dataset.storeId
                + "&store_title=" + e.currentTarget.dataset.storeTitle
                + "&start_date=" + startDate
                + "&end_date=" + endDate
                + "&province_code=" + this.data.query.province_code
        });
    },


    //筛选区  start--------------------------------------
    //排序
    changeSort(e){
        let value = e.currentTarget.dataset.sort;
        this.setData({
            query: Object.assign(this.data.query, {sort: value, page: 1})
        }, () => {
            this.statisticalOrderMerchantSum();
        });

        wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
        });

    },

    zoneList() {
        http.get(config.api.basicdataZoneList, {province_code: this.data.query.province_code})
            .then(res => {
                this.setData({
                    zoneList: res.data,
                    showZoneList: res.data.slice(0, 6)
                })
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
        this.statisticalOrderMerchantSum();
        this.setData({
            dialog: Object.assign(this.data.dialog, {
                isShowFilterDialog: false,
                isShowZoneDialog: false,
                isShowCityDialog: false
            }),
            cityTitle: this.data.cityTitleTmp
        })
    },

    resetQuery() {
        this.setData({
            query: Object.assign(this.data.query, {
                page: 1,
                page_size: 20,
                zone_id: '',
                city_id: '',
            }),
            dialog: Object.assign(this.data.dialog, {
                isShowFilterDialog: false,
                isShowZoneDialog: false,
                isShowCityDialog: false
            }),
            hasSelectZone: '全部',
            hasSelectCity: '全部',
            cityTitle: ''
        });
        //默认今天
        let today = this.formatDate(new Date());
        this.setData({
            currentFixDate: '今日',
            startDate: today,
            endDate: today,
        });
        this.statisticalOrderMerchantSum();
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
                    hasSelectCity: value !== '' ? util.selectedLabel(name) : '全部',
                    cityTitleTmp: name
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
      let { query, merchantListData } = that.data;
      if (merchantListData.num / query.page_size > query.page) {
          //如果没有到达最后一页，加载数据
          query.page = query.page + 1;
          that.setData({
              query: query
          }, () => {
              that.statisticalOrderMerchantSum();
          });
      }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
