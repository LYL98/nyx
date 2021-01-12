import * as echarts from '../../../components/ec-canvas/echarts';
import config from "../../../utils/config";
import DataHandle from "../../../utils/dataHandle";
import http from "../../../utils/http";
import util from "../../../utils/util";

const app = getApp();

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Component({
  properties: {
    reachBottom: {
      type: Boolean,
      value: false,
      observer() {
        this.onReachBottom();
      }
    },
  },
  data: {
    rankSrc: './../../../assets/img/rank.png',
    rankSSrc: './../../../assets/img/rank_s.png',
    rankSl: './../../../assets/img/rank_l.png',
    auth: {},
    tabs: [],
    activeIndex: 0,
    productRequestCount: 1,
    clientRequestCount: 1,
    operationRequestCount: 1,
    sliderOffset: 0,
    sliderLeft: 0,

    //商品销售统计
    currentFixDate: '今日',
    startDate: '',
    endDate: '',
    totalClients: [], //客户订单统计
    totalItems: [], //商品销售统计
    orderClassSumData: [],
    query: {
      page: 1,
      page_size: 20,
      province_code: '',
      begin_date: '',
      end_date: '',
      sort: '',
      display_class: '',
      buyer_id: ''
    },

    // 商品销量排行
    currentFixDateRanklist: '今日',
    startDateRanklist: '',
    endDateRanklist: '',
    ranklistData: [],
    queryRanklist: {
      page: 1,
      page_size: 20,
      begin_date: '',
      end_date: '',
      province_code: '',
      sort: '-sale_amount',
    },


    //客户订单统计
    currentFixDateClient: '今日',
    startDateClient: '',
    endDateClient: '',
    clientProvinceSumData: [],
    queryClient: {
      page: 1,
      page_size: 20,
      province_code: '',
      // province_id: '',
      city_id: '',
      begin_date: '',
      end_date: '',
      sort: '-gmv',
    },

    //运营统计
    currentFixDateOperation: '本月',
    startDateOperation: '',
    endDateOperation: '',
    isShowIndexSpecDialog: false,
    operationDataItem: [],
    dataItem: [],
    zoomRate: [1, 1, 1, 1, 1, 1],
    selectedOperationIndex: 'GMV',
    lineColors: [
      '#D27575',   //1
      '#E2BA6F',   //2
      '#E8E676',   //3
      '#C5E26F',   //4
      '#9AD782',   //5
      '#82D7AE',   //6
      '#82D7D7',   //7
      '#82A1D7',   //8
      '#8E82D7',   //9
      '#C682D7',   //10
      '#E58FBC',   //11
    ],
    indexNames: [
      'GMV',
      // '订单商品金额',
      '下单客户数',
      // '下单件数',
      '下单商品数'
    ],
    activeIndexes: ['GMV'],
    legendSelected: {
      'GMV': true,
      // '订单商品金额': false,
      '下单客户数': false,
      // '下单件数': false,
      '下单商品数': false,
    },
    queryOperation: {
      item_id: '',
      begin_date: '',
      end_date: '',
      province_code: '',
    },
    operationFixDates: [
      '近30天',
      '本周',
      '上周',
      '本月',
      '上月',
      '自定义'
    ],
    previewOperationLegendSelected: [],
    previewOperationIndexData: [],
    previewOperationXDisplayDates: [],
    previewOperationZoomRate: [],

    provinceList: [],
    provinceNames: [],
    selectedProvince: '全部',
    selectedProvinceCode: '',

    //共用
    fixDates: [
      '今日',
      '昨日',
      '本周',
      '上周',
      '本月',
      '上月',
      '自定义'
    ],
    color: [
      '#E3D557',   //1
      '#E9AB67',   //2
      '#9C7CDE',   //3
      '#C08DDB',   //4
      '#819DE0',   //5
      '#E081AF',   //6
      '#8BC867',   //7
      '#B2ABAB',   //8
      '#DDB96B',   //9
      '#918BAC',   //10
      '#8DD29D',   //11
      '#D190B1',   //12
      '#DAAA96',   //13
      '#C7BF94',   //14
      '#9AA4CC',   //15
      '#C29E9E',   //16
      '#66BFD5',   //17
      '#C7DE68',   //18
      '#DF6666',   //19
      '#67C8A9'    //20
    ],
    ec: {

    },
    ecClient: {

    },
    ecOperation: {
      // onInit: initChart
    }
  },

  lifetimes: {
    ready() {
      this.onReady();
    }
  },

  methods: {


    onReady() {
      var that = this;

      let {activeIndex} = this.data;

      //默认今天
      let today = util.getFixDateRange(8)[0];
      //今天
      that.setDateRange(today, today);
      that.setDateRangeRanklist(today, today);
      //今天
      that.setClientDateRange(today, today);
      //本月
      that.setDateRangeOperation(util.getFixDateRange(4)[0], util.getFixDateRange(4)[1]);

      app.signIsLogin(() => {
        let auth = app.globalData.auth;

        // let tabs = Array();
        // if (auth.isAdmin || auth.StatisticMarket) {
        //   tabs.push("商品销售统计");
        // }
        // if (auth.isAdmin || auth.StatisticItem) {
        //   tabs.push("商品销量排行");
        // }
        // if (auth.isAdmin || auth.StatisticOperation) {
        //   tabs.push("运营统计")
        // }

        let tabs = ['商品销售统计', '商品销量排行', '运营统计'];
        that.setData({
          auth: auth,
          tabs: tabs,
          'query.province_code': app.globalData.loginUserInfo.province_code,
          'queryRanklist.province_code': app.globalData.loginUserInfo.province_code,
          'queryClient.province_code': app.globalData.loginUserInfo.province_code,
          'queryOperation.province_code': app.globalData.loginUserInfo.province_code
        });

        wx.getSystemInfo({
          success: function (res) {
            that.setData({
              sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
              sliderOffset: res.windowWidth / that.data.tabs.length * activeIndex
            }, () => {
              that.ecComponent = that.selectComponent('#mychart-dom-pie');
              // that.ecComponentClient = that.selectComponent('#mychart-dom-pie-client');
              that.ecComponentOperation = that.selectComponent('#mychart-dom-line-operation');

              let tab = tabs[activeIndex];
              switch (tab) {
                case '商品销售统计':
                  that.refreshProductData()
                  break;
                case '商品销量排行':
                  that.itemRanklist();
                  break;
                // case '客户订单统计':
                //   that.refreshClientData()
                //   break;
                case '运营统计':
                  that.loadOperationStatistics()
                  break;

              }
            });
          }
        });

        this.loadProvinceList()

      });
    },

    onFixDateSelectRanklist(e) {
      let that = this;
      let {fixDates} = this.data;
      let index = e.detail.value;  //index值
      //设置显示值
      that.setData({
        currentFixDateRanklist: fixDates[index]
      });

      let fixDate = fixDates[index];

      let start = '';
      let end = '';
      //自动改变时间范围
      switch (fixDate) {
        case '今日': {
          start = util.getFixDateRange(8)[0];
          end = util.getFixDateRange(8)[1];
        }
          break;
        case '昨日': {
          start = util.getFixDateRange(9)[0];
          end = util.getFixDateRange(9)[1];
        }
          break;
        case '本周': {
          start = util.getFixDateRange(2)[0];
          end = util.getFixDateRange(2)[1];
        }
          break;
        case '上周': {
          start = util.getFixDateRange(3)[0];
          end = util.getFixDateRange(3)[1];
        }
          break;
        case '本月': {
          start = util.getFixDateRange(4)[0];
          end = util.getFixDateRange(4)[1];
        }
          break;
        case '上月': {
          start = util.getFixDateRange(5)[0];
          end = util.getFixDateRange(5)[1];
        }
          break;
        case '自定义':

          break;
      }

      if (fixDate !== '自定义') {
        that.setDateRangeRanklist(start, end);

        that.itemRanklist();

      }
    },

    setDateRangeRanklist(startDate, endDate) {
      this.setData({
        startDateRanklist: startDate,
        endDateRanklist: endDate
      });
    },

    onSelectStartDateRanklist(e) {
      let that = this;
      let {endDateRanklist} = this.data;
      let startDateRanklist = e.detail.value;
      let sDate = Date.parse(startDateRanklist);
      let eDate = Date.parse(endDateRanklist);
      if (sDate <= eDate) {
        this.setData({
          currentFixDateRanklist: '自定义',
          startDateRanklist: startDateRanklist
        }, () => {
          that.itemRanklist();
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

    onSelectEndDateRanklist(e) {
      let that = this;

      let {startDateRanklist} = this.data;
      let endDateRanklist = e.detail.value;
      let sDate = Date.parse(startDateRanklist);
      let eDate = Date.parse(endDateRanklist);
      if (eDate >= sDate) {
        this.setData({
          currentFixDateRanklist: '自定义',
          endDateRanklist: e.detail.value
        }, () => {
          that.itemRanklist();
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

    changeSortProductRanklist(e) {
      let value = e.currentTarget.dataset.sort;
      // console.log(value);
      this.setData({
        queryRanklist: Object.assign(this.data.queryRanklist, {sort: value, page: 1})
      }, () => {
        this.itemRanklist();
      });

      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });

    },

    itemRanklist() {
      const queryRanklist = { ...this.data.queryRanklist };
      const {startDateRanklist, endDateRanklist} = this.data;
      queryRanklist.begin_date = startDateRanklist;
      queryRanklist.end_date = endDateRanklist;

      http.get(config.api.clsStatisticalOrderRanklist, queryRanklist)
        .then(res => {
          let list = res.data || { items: [] };
          if (queryRanklist.page > 1) {
            list.items = this.data.ranklistData.items.concat(list.items);
          }
          this.setData({
            ranklistData: list
          })
        })
        .catch(() => {
          if (queryRanklist.page > 1) {
            this.setData({'queryRanklist.page': queryRanklist.page - 1});
          }
        })
    },

    onReachBottom: function () {
      if (this.data.activeIndex != 1) return;
      console.log('onReachBottom');
      let {queryRanklist, ranklistData} = this.data;
      if (ranklistData.num / queryRanklist.page_size > queryRanklist.page) {
        queryRanklist.page = queryRanklist.page + 1;
        this.setData({
          queryRanklist: queryRanklist
        }, () => {
          this.itemRanklist();
        });
      }
    },

    loadProvinceList() {
      http.get(config.api.baseProvinceList, {is_no_prompt: true})
        .then(res => {
          let names = [];
          let provinces = res.data;
          let selectedProvince = '全部';
          for (let i = 0; i < res.data.length; i++) {
            names.push(res.data[i].title);
            if (res.data[i].code === app.globalData.loginUserInfo.province_code) {
              selectedProvince = res.data[i].title;
            }
          }
          if (app.globalData.loginUserInfo.opt_type === "global") {
            names.unshift('全部');
            provinces.unshift({code: '', title: '全部'});
          }
          this.setData({
            provinceList: provinces,
            provinceNames: names,
            selectedProvince: selectedProvince,
            selectedProvinceCode: app.globalData.loginUserInfo.province_code
          })
        })
    },

    onFixDateSelect(e) {
      let that = this;
      let {fixDates} = this.data;
      let index = e.detail.value;  //index值
      //设置显示值
      that.setData({
        currentFixDate: fixDates[index]
      });

      let fixDate = fixDates[index];

      let start = '';
      let end = '';
      //自动改变时间范围
      switch (fixDate) {
        case '今日': {
          start = util.getFixDateRange(8)[0];
          end = util.getFixDateRange(8)[1];
        }
          break;
        case '昨日': {
          start = util.getFixDateRange(9)[0];
          end = util.getFixDateRange(9)[1];
        }
          break;
        case '本周': {
          start = util.getFixDateRange(2)[0];
          end = util.getFixDateRange(2)[1];
        }
          break;
        case '上周': {
          start = util.getFixDateRange(3)[0];
          end = util.getFixDateRange(3)[1];
        }
          break;
        case '本月': {
          start = util.getFixDateRange(4)[0];
          end = util.getFixDateRange(4)[1];
        }
          break;
        case '上月': {
          start = util.getFixDateRange(5)[0];
          end = util.getFixDateRange(5)[1];
        }
          break;
        case '自定义':

          break;
      }

      if (fixDate !== '自定义') {
        that.setDateRange(start, end);

        that.refreshProductData();

      }
    },

    setDateRange(startDate, endDate) {
      this.setData({
        startDate: startDate,
        endDate: endDate
      });
    },

    formatDate(date) {
      return DataHandle.formatDate(date, 'yyyy-MM-dd')
    },

    onSelectStartDate(e) {
      let that = this;
      let {endDate} = this.data;
      let startDate = e.detail.value;
      let sDate = Date.parse(startDate);
      let eDate = Date.parse(endDate);
      if (sDate <= eDate) {
        this.setData({
          currentFixDate: '自定义',
          startDate: startDate
        });
        that.refreshProductData();

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

      let {startDate} = this.data;
      let endDate = e.detail.value;
      let sDate = Date.parse(startDate);
      let eDate = Date.parse(endDate);
      if (eDate >= sDate) {
        this.setData({
          currentFixDate: '自定义',
          endDate: e.detail.value
        });
        that.refreshProductData();
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

    refreshProductData() {
      let that = this;
      that.statisticalOrderClassSum(_ => {
        that.ecComponent.init((canvas, width, height) => {
          return that.initializeChart(canvas, width, height);
        })
      })
    },

    //统计分析 - 商品销售统计 - 分类统计
    statisticalOrderClassSum(callback) {
      let that = this;
      let {query, startDate, endDate} = that.data;
      query.begin_date = startDate;
      query.end_date = endDate;
      let sort = '';
      switch(query.sort) {
        case 'amount_real':
          sort = 'sale_amount';
          break;
        case '-amount_real':
          sort = '-sale_amount';
          break;
        case 'count_real':
          sort = 'item_amount';
          break;
        case '-count_real':
          sort = '-item_amount';
          break;
        default:
          sort = '';
          break;
      }
      http.get(config.api.clsStatisticalOrderClassSum, {...query, sort})
        .then(res => {
          that.setData({
            orderClassSumData: res.data.map(item => ({
              item_system_class: item.system_class_title,
              system_class_code: item.system_class_code,
              amount_real: Number(item.sale_amount),
              count_real: Number(item.item_amount)
            }))
          });
          typeof callback === 'function' && callback();
        })
    },

    createGetRequestUrl(api, data) {
      let url = api + '?time=' + new Date().getTime();

      for (let item in data) {
        url = url + "&" + item + "=" + data[item];
      }
      // console.log('url = ' + url);
      return url;
    },

    initializeChart(canvas, width, height) {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(chart);

      let that = this;
      let {orderClassSumData, color} = that.data;

      //数据处理
      let data = new Array(), data2 = new Array(), dataTemp = {value: 0, name: '其它'}, dataTemp2 = {},
        totalItemTotalPrice = 0, totalFramPrice = 0, totalOrderModifyPrice = 0, totalCount = 0;
      for (let i = 0; i < orderClassSumData.length; i++) {
        //总数据
        totalItemTotalPrice += orderClassSumData[i].amount_real;
        totalFramPrice += orderClassSumData[i].fram_total_price;
        totalOrderModifyPrice += orderClassSumData[i].check_chg;
        totalCount += orderClassSumData[i].count_real;
      }
      for (let i = 0; i < orderClassSumData.length; i++) {
        //饼图数据
        // let percent = orderClassSumData[i].amount_real / totalItemTotalPrice;
        let percent = util.returnPercentage(orderClassSumData[i].amount_real / 100, that.returnPrice(totalItemTotalPrice));
        if (percent > 0.05 && orderClassSumData[i].item_system_class !== '其它') {
          data.push({
            value: that.returnPrice(orderClassSumData[i].amount_real),
            name: orderClassSumData[i].item_system_class,
          });
        } else {
          dataTemp.value += orderClassSumData[i].amount_real;
        }

        //列表数据
        if (orderClassSumData[i].item_system_class !== '其它') {
          data2.push(orderClassSumData[i]);
        } else {
          dataTemp2 = orderClassSumData[i];
        }
      }
      if (dataTemp.value) {
        data.push({
          value: that.returnPrice(dataTemp.value),
          name: dataTemp.name
        });
      }

      if (dataTemp2.item_system_class) {
        data2.push(dataTemp2);
      }

      that.setData({
        totalItems: [{
          title: '订单商品总金额',
          value: that.returnPrice(totalItemTotalPrice),
        },
        //   {
        //   title: '筐总金额',
        //   value: that.returnPrice(totalFramPrice),
        // },
        //   {
        //   title: '改单商品总金额',
        //   value: that.returnPrice(Math.abs(totalOrderModifyPrice)),
        // },
          {
          title: '销售总量',
          value: totalCount,
        }]
      });

      let formatter = "{name|{b}}\n{hr|}\n{per|{d}%}";
      if (data && data.length === 0) {
        data.push({value: '0', name: '暂无数据'});
        color = ['#a5a5a5'];
        formatter = "{b}";
      }

      var option = {
        series: [
          {
            name: "商品销售统计",
            type: "pie",
            radius: ['20%', '50%'],
            avoidLabelOverlap: true,
            selectedMode: false,
            color: color,
            label: {
              minAngle: 20,
              normal: {
                formatter: formatter,
                backgroundColor: "#fff",
                rich: {
                  name: {
                    padding: [2, 0],
                    color: "#20232C",
                    fontSize: 12,
                    align: 'center'
                  },
                  hr: {
                    borderColor: "#000",
                    width: '100%',
                    borderWidth: 0.5,
                    height: 0
                  },
                  per: {
                    padding: [2, 0],
                    color: "#A1A6B3",
                    fontSize: 12
                  }
                }
              }
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 2, 2, 0.3)'
              }
            },
            data: data
          }
        ]
      };
      chart.setOption(option);
      chart.on('click', function (params) {
        console.log('click');
      });
      return chart;
      // that.chart = echarts.init(that.$refs.myEchart);
      // 把配置和数据放这里
      // that.chart.setOption();
      // // 防止click触发两次
      // that.chart.off('click');
      // // 点击饼图事件处理

    },

    //返回价格
    returnPrice(price) {
      return DataHandle.returnPrice(price);
    },

    onItemClick(e) {
      let {startDate, endDate} = this.data;
      let item = e.currentTarget.dataset.item;
      wx.navigateTo({
        url: "/pages/statistics/statistics-cls/system-class2/system-class2"
          + "?system_class1=" + item.item_system_class
          + "&system_class_code1=" + item.system_class_code
          + "&begin_date=" + startDate
          + "&end_date=" + endDate
          + "&province_code=" + this.data.selectedProvinceCode
        //+"&total_shop="+this.data.totalItems[0].value //商品销售统计的占比总数
      });
    },

    //排序
    changeSortProduct(e) {
      let value = e.currentTarget.dataset.sort;
      // console.log(value);
      this.setData({
        query: Object.assign(this.data.query, {sort: value, page: 1})
      }, () => {
        this.statisticalOrderClassSum();
      });

      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });

    },

    // 商品销售统计 - 省份选择
    onProvinceSelect(e) {
      let index = e.detail.value;  //index值
      let {provinceList} = this.data;
      let provinceCode = provinceList[index].code;
      let provinceName = provinceList[index].title;
      this.setData({
        query: Object.assign(this.data.query, {province_code: provinceCode}),
        queryRanklist: Object.assign(this.data.queryRanklist, {province_code: provinceCode}),
        queryOperation: Object.assign(this.data.queryOperation, {province_code: provinceCode}),
        selectedProvince: provinceName,
        selectedProvinceCode: provinceCode
      }, () => {
        this.refreshProductData();
      });
    },
    // 商品销售统计 - 省份选择
    onRanklistonProvinceSelect(e) {
      let index = e.detail.value;  //index值
      let {provinceList} = this.data;
      let provinceCode = provinceList[index].code;
      let provinceName = provinceList[index].title;
      this.setData({
        query: Object.assign(this.data.query, {province_code: provinceCode}),
        queryRanklist: Object.assign(this.data.queryRanklist, {province_code: provinceCode}),
        queryOperation: Object.assign(this.data.queryOperation, {province_code: provinceCode}),
        selectedProvince: provinceName,
        selectedProvinceCode: provinceCode
      }, () => {
        this.itemRanklist();
      });
    },

    //统计分析 - 客户订单统计 - 片区分类统计-----------------------------------------------------------------------------------
    //排序
    changeSortOrder(e) {
      let value = e.currentTarget.dataset.sort;
      // console.log(value);
      this.setData({
        queryClient: Object.assign(this.data.queryClient, {sort: value, page: 1})
      }, () => {
        this.statisticalClientProvinceSum();
      });

      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });

    },

    statisticalClientProvinceSum(callback) {
      let that = this;
      let {queryClient, startDateClient, endDateClient} = that.data;
      queryClient.begin_date = startDateClient;
      queryClient.end_date = endDateClient;

      http.get(config.api.statisticalOrderProvinceSum, queryClient)
        .then(result => {
          that.setData({
            clientProvinceSumData: result.data
          });
          typeof callback === 'function' && callback();
        })
    },

    onClientItemClick(e) {
      let {startDateClient, endDateClient, currentFixDateClient} = this.data;
      wx.navigateTo({
        url: "../statistics-client-zone/statistics-client-zone?province_code=" + e.currentTarget.dataset.provinceId
          + "&province_title=" + e.currentTarget.dataset.provinceTitle
          + "&fix_date=" + currentFixDateClient
          + "&start_date=" + startDateClient
          + "&end_date=" + endDateClient
        //+"&total_client="+ this.data.totalClients[0].value

      });
    },

    onClientFixDateSelect(e) {
      // console.log('picker发送选择改变，携带值为', e.detail.value)
      let that = this;
      let {fixDates, nowYear, nowMonth, nowDay, nowDayOfWeek} = this.data;
      let value = e.detail.value;
      //设置显示值
      that.setData({
        currentFixDateClient: fixDates[value]
      });

      let fixDate = fixDates[value];

      let start = '';
      let end = '';
      //自动改变时间范围
      switch (fixDate) {
        case '今日': {
          let today = new Date();
          start = end = that.formatDate(today);
        }
          break;
        case '昨日': {
          let today = new Date();
          let yesterday = new Date(today.setDate(today.getDate() - 1));
          start = end = that.formatDate(yesterday);
        }
          break;
        case '本周': {
          start = util.getFixDateRange(2)[0];
          end = util.getFixDateRange(2)[1];
        }
          break;
        case '上周': {
          start = util.getFixDateRange(3)[0];
          end = util.getFixDateRange(3)[1];
        }
          break;
        case '本月': {
          start = util.getFixDateRange(4)[0];
          end = util.getFixDateRange(4)[1];
        }
          break;
        case '上月': {
          start = util.getFixDateRange(5)[0];
          end = util.getFixDateRange(5)[1];
        }
          break;
        case '自定义':

          break;
      }

      if (fixDate !== '自定义') {
        that.setClientDateRange(start, end);

        that.refreshClientData()
      }
    },

    setClientDateRange(startDate, endDate) {
      this.setData({
        startDateClient: startDate,
        endDateClient: endDate
      });
    },

    onClientSelectStartDate(e) {
      let that = this;
      let {endDateClient} = this.data;
      let startDate = e.detail.value;
      let sDate = Date.parse(startDate);
      let eDate = Date.parse(endDateClient);
      if (sDate <= eDate) {
        this.setData({
          currentFixDateClient: '自定义',
          startDateClient: startDate
        });
        that.refreshClientData()
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

    onClientSelectEndDate(e) {
      let that = this;

      let {startDateClient} = this.data;
      let endDate = e.detail.value;
      let sDate = Date.parse(startDateClient);
      let eDate = Date.parse(endDate);
      if (eDate >= sDate) {
        this.setData({
          currentFixDateClient: '自定义',
          endDateClient: e.detail.value
        });
        that.refreshClientData()
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

    refreshClientData() {
      let that = this;
      that.statisticalClientProvinceSum(_ => {
        that.ecComponentClient.init((canvas, width, height) => {
          return that.initializeClientChart(canvas, width, height);
        })
      })
    },

    initializeClientChart(canvas, width, height) {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(chart);

      let that = this;
      let {clientProvinceSumData, color} = that.data;

      let data = new Array(), data2 = new Array(), dataTemp = {value: 0, name: '其它'}, dataTemp2 = {},
        totalItemTotalPrice = 0, totalPricePreStore = 0, totalAmountReal = 0, totalFramPrice = 0,
        totalBonusPromotion = 0, totalStoreNum = 0, totalPieceNum = 0;
      for (let i = 0; i < clientProvinceSumData.length; i++) {
        //总数据
        totalItemTotalPrice += clientProvinceSumData[i].gmv;
        totalPricePreStore += clientProvinceSumData[i].price_per_store;
        totalAmountReal += clientProvinceSumData[i].amount_real;
        totalFramPrice += clientProvinceSumData[i].fram_total_price;
        totalBonusPromotion += clientProvinceSumData[i].bonus_promotion;
        totalStoreNum += clientProvinceSumData[i].store_num;
        totalPieceNum += clientProvinceSumData[i].piece_num;
      }
      for (let i = 0; i < clientProvinceSumData.length; i++) {
        //饼图数据
        let percent = clientProvinceSumData[i].gmv / totalItemTotalPrice;
        if (percent > 0.05 && clientProvinceSumData[i].province_title !== '其它') {
          data.push({
            value: that.returnPrice(clientProvinceSumData[i].gmv),
            name: clientProvinceSumData[i].province_title,
            id: clientProvinceSumData[i].province_code
          });
        } else {
          dataTemp.value += clientProvinceSumData[i].gmv;
        }

      }
      if (dataTemp.value) {
        data.push({
          value: that.returnPrice(dataTemp.value),
          name: dataTemp.name
        });
      }

      that.setData({
        totalClients: [{
          title: 'GMV',
          value: that.returnPrice(totalItemTotalPrice),
        }, {
          title: '客单价',
          value: that.returnPrice(totalPricePreStore),
        }, {
          title: '订单商品金额',
          value: that.returnPrice(totalAmountReal),
        }, {
          title: '筐总金额',
          value: that.returnPrice(totalFramPrice),
        }, {
          title: '优惠总金额',
          value: that.returnPrice(totalBonusPromotion),
        }, {
          title: '下单门店数',
          value: totalStoreNum,
        }, {
          title: '销售总量',
          value: totalPieceNum,
        }]
      });

      let formatter = "{name|{b}}\n{hr|}\n{per|{d}%}";
      if (data && data.length === 0) {
        data.push({value: '0', name: '暂无数据'});
        color = ['#a5a5a5'];
        formatter = "{b}";
      }

      var option = {
        series: [
          {
            name: "客户订单统计",
            type: "pie",
            radius: ['20%', '50%'],
            avoidLabelOverlap: true,
            selectedMode: false,
            color: color,
            label: {
              minAngle: 20,
              normal: {
                formatter: formatter,
                backgroundColor: "#fff",
                rich: {
                  name: {
                    padding: [2, 0],
                    color: "#20232C",
                    fontSize: 12,
                    align: 'center'
                  },
                  hr: {
                    borderColor: "#000",
                    width: '100%',
                    borderWidth: 0.5,
                    height: 0
                  },
                  per: {
                    padding: [2, 0],
                    color: "#A1A6B3",
                    fontSize: 12
                  }
                }
              }
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 2, 2, 0.3)'
              }
            },
            data: data
          }
        ]
      };
      chart.setOption(option);
      return chart;
    },


    //运营统计 start-------------------------------
    //返回价格
    formatPrice(price) {
      if (price || price === 0) {
        if (price < 0) {
          return '-¥' + DataHandle.returnPrice(Math.abs(price));
        } else {
          return '¥' + DataHandle.returnPrice(price);
        }
      } else {
        return '-';
      }
    },
    formatValue(value) {
      return value || value === 0 ? Math.round(value) : '-'
    },
    formatRate(value) {
      return value || value === 0 ? DataHandle.keepTwoDecimal(this.returnMarkup(value)) + '%' : '-'
    },
    //返回加价率
    returnMarkup(markup) {
      return DataHandle.returnMarkup(markup);
    },

    onFixDateSelectOperation(e) {
      let that = this;
      let {operationFixDates} = this.data;
      let index = e.detail.value;  //index值
      //设置显示值
      that.setData({
        currentFixDateOperation: operationFixDates[index]
      });

      let fixDate = operationFixDates[index];

      let start = '';
      let end = '';
      //自动改变时间范围
      switch (fixDate) {
        case '近30天': {
          start = util.getFixDateRange(1)[0];
          end = util.getFixDateRange(1)[1];
        }
          break;
        case '本周': {
          start = util.getFixDateRange(2)[0];
          end = util.getFixDateRange(2)[1];
        }
          break;
        case '上周': {
          start = util.getFixDateRange(3)[0];
          end = util.getFixDateRange(3)[1];
        }
          break;
        case '本月': {
          start = util.getFixDateRange(4)[0];
          end = util.getFixDateRange(4)[1];
        }
          break;
        case '上月': {
          start = util.getFixDateRange(5)[0];
          end = util.getFixDateRange(5)[1];
        }
          break;
        case '自定义':

          break;
      }

      if (fixDate !== '自定义') {
        that.setDateRangeOperation(start, end);
        that.refreshOperationData()
      }
    },

    setDateRangeOperation(startDate, endDate) {
      this.setData({
        startDateOperation: startDate,
        endDateOperation: endDate,
      });
    },

    onSelectStartDateOperation(e) {
      let that = this;
      let {endDateOperation} = this.data;
      let startDate = e.detail.value;
      let sDate = Date.parse(startDate);
      let eDate = Date.parse(endDateOperation);
      if (sDate <= eDate) {
        this.setData({
          currentFixDateOperation: '自定义',
          startDateOperation: startDate,
        });
        that.refreshOperationData()

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

    onSelectEndDateOperation(e) {
      let that = this;

      let {startDateOperation} = this.data;
      let endDate = e.detail.value;
      let sDate = Date.parse(startDateOperation);
      let eDate = Date.parse(endDate);
      if (eDate >= sDate) {
        this.setData({
          currentFixDateOperation: '自定义',
          endDateOperation: e.detail.value,
        });
        that.refreshOperationData()
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

    /**
     * 用户选择的时间范围
     * @param format 返回的日期格式：f1: yyyy-MM-dd, f2: MM-dd
     * @returns {*}
     */
    dateRange(format) {
      let {startDateOperation, endDateOperation} = this.data;
      let begin = new Date(Date.parse(startDateOperation));
      let end = new Date(Date.parse(endDateOperation));
      let dateList = Array();
      let tmpDate = new Date(begin.setDate(begin.getDate() - 1));
      while (tmpDate < end) {
        tmpDate = new Date(begin.setDate(tmpDate.getDate() + 1));
        if (format === 'f1') {
          dateList.push(DataHandle.formatDate(tmpDate, 'yyyy-MM-dd'))
        } else if (format === 'f2') {
          dateList.push(this.labelDate(tmpDate))
        } else {
          dateList.push(tmpDate);
        }
      }
      return dateList;
    },

    labelDate(date) {
      let month = date.getMonth() + 1;
      let day = date.getDate();
      return month + '-' + day
    },

    refreshOperationData() {
      let that = this;
      that.loadOperationStatistics(_ => {
        that.ecComponentOperation.init((canvas, width, height) => {
          return that.initializeOperationChart(canvas, width, height);
        })
      })
    },

    initializeOperationChart(canvas, width, height) {

      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(chart);

      let that = this;

      let {lineColors, indexNames, legendSelected} = that.data;

      //与接口数据比较的日期：例如 2018-1-1
      let xDates = this.dateRange('f1');
      //x轴日期：例如 1月1日
      let xDisplayDates = this.dateRange('f2');

      //放大指标
      // that.zoomLines();

      //计算每个指标数据集
      let indexData = Array();
      for (let i = 0; i < indexNames.length; i++) {
        indexData.push(that.lineData(i, xDates))
      }

      this.setData({
        previewOperationIndexData: indexData,
        previewOperationXDisplayDates: xDisplayDates,
        previewOperationLegendSelected: legendSelected,
      });

      let option = {
        tooltip: {
          show: true,
          trigger: 'axis',
          position: ['5%', '5%'],
          formatter: function (params, ticket, callback) {
            var res = params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
              let zoomValue = params[i].value /*/ that.narrowRate(params[i].seriesName)*/;
              res += '\n' + params[i].seriesName + ' : ' + zoomValue;
            }
            //callback 异步时使用
            // callback(ticket, res);
            return res
          }
        },
        calculable: true,
        legend: {
          show: false,
          data: indexNames,
          selected: legendSelected,
        },
        xAxis: [
          {
            type: 'category',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            data: xDisplayDates
          }
        ],
        yAxis: {
          show: false
        },
        series: [
          {
            name: 'GMV',
            type: 'bar',
            itemStyle: {normal: {color: lineColors[0], lineStyle: {color: lineColors[0]}}},
            smooth: true,
            data: this.lineData(0, xDates)
          },
          // {
          //   name: '订单商品金额',
          //   type: 'bar',
          //   itemStyle: {normal: {color: lineColors[1], lineStyle: {color: lineColors[1]}}},
          //   smooth: true,
          //   data: this.lineData(1, xDates)
          // },
          {
            name: '下单客户数',
            type: 'bar',
            itemStyle: {normal: {color: lineColors[2], lineStyle: {color: lineColors[2]}}},
            smooth: true,
            data: this.lineData(1, xDates)
          },
          // {
          //   name: '下单件数',
          //   type: 'bar',
          //   itemStyle: {normal: {color: lineColors[3], lineStyle: {color: lineColors[3]}}},
          //   smooth: true,
          //   data: this.lineData(3, xDates)
          // },
          {
            name: '下单商品数',
            type: 'bar',
            itemStyle: {normal: {color: lineColors[4], lineStyle: {color: lineColors[4]}}},
            smooth: true,
            data: this.lineData(2, xDates)
          }
        ]
      };

      chart.setOption(option);

      return chart;
    },

    /**
     * 每个指标的数据
     * @param index 指标序号
     * @param xDates x轴的日期，用来做比对
     * @returns {any[]}
     */
    lineData(index, xDates) {
      let {dataItem, zoomRate} = this.data;
      let lineData = Array();
      if (dataItem && dataItem.length > 0) {
        //得到特定指标的行数据
        let item = dataItem[index];

        for (let i = 0; i < xDates.length; i++) {
          //得到当前列的日期
          let colDate = xDates[i];
          let hasDate = false;
          for (let i = 0; i < item.cells.length; i++) {
            let cellDate = item.cells[i].date;
            let cellValue = item.cells[i].origin_value;
            //如果单元格日期等于当前日期，说明当前日期对应的单元格存在
            if (cellDate === colDate) {
              hasDate = true;
              //放大相应的比例，方便数据比对
              lineData.push(Number(this.handleIndexValue(index, cellValue)) * zoomRate[index]);
              break;
            }
          }
          //如果当前列的日期无法匹配所有列单元格的日期，说明当前日期对应的单元格不存在，赋默认值0
          if (!hasDate) {
            lineData.push(0)
          }
        }
      }
      return lineData;
    },

    //根据特定的指标来处理对应的值
    handleIndexValue(index, value) {
      switch (index) {
        case 0:
          return DataHandle.returnPrice(value);
        case 1:
        case 2:
          return value;
        default:
          return 0;
      }
    },
    //根据特定的指标来处理对应的值
    handleIndexValueToDisplay(index, value) {
      switch (index) {
        case 0:
          return this.returnPrice(value);
        case 1:
        case 2:
          return this.formatValue(value);
        default:
          return 0;
      }
    },

    cellDisplayValue(index, cellItem) {
      let that = this;
      let result = '-';
      switch (index) {
        case 0:
          result = that.returnPrice(cellItem.gmv);
          break;
        case 1:
          result = that.formatValue(cellItem.member_num);
          break;
        case 2:
          result = that.formatValue(cellItem.item_num);
          break;
        default:
          break;
      }
      return result
    },

    cellOriginValue(index, cellItem) {
      let result = '-';
      switch (index) {
        case 0:
          result = cellItem.gmv;
          break;
        case 1:
          result = cellItem.member_num;
          break;
        case 2:
          result = cellItem.item_num;
          break;
        default:
          break;
      }
      return result
    },

    cellValue(rowItems, date) {
      let cellItem;
      let dateStr = DataHandle.formatDate(date, 'yyyy-MM-dd');
      rowItems.map(function (rowItem) {
        if (rowItem.date === dateStr) {
          cellItem = rowItem;
        }
      });
      return cellItem ? cellItem.value : '-'
    },
    total(rowItems) {
      let sum = 0;
      for (let i = 0; i < rowItems.length; i++) {
        let cellItem = rowItems[i];
        sum += Number(cellItem.origin_value)
      }
      return sum;
    },
    average(rowItems) {
      let sum = 0;
      for (let i = 0; i < rowItems.length; i++) {
        let cellItem = rowItems[i];
        sum += Number(cellItem.origin_value)
      }
      return sum / rowItems.length;
    },

    loadOperationStatistics(callback) {
      this.statisticalSumBusinessDelivery(callback)
    },

    statisticalSumBusinessDelivery(callback) {
      let that = this;
      let {queryOperation, startDateOperation, endDateOperation, indexNames} = that.data;
      queryOperation.begin_date = startDateOperation;
      queryOperation.end_date = endDateOperation;
      http.get(config.api.clsStatisticalOrderSale, queryOperation)
        .then(res => {
          if (res.code === 0) {
            //将日期维度转化成指标维度
            let dateItems = res.data;
            let indexItems = Array();
            let operationDataItems = Array();
            let totals = Array();
            let averages = Array();
            if (dateItems && dateItems.length > 0) {
              //图表数据
              for (let i = 0; i < indexNames.length; i++) {
                //初始化行变量
                let indexItem = {
                  name: indexNames[i],
                  cells: Array()
                };

                //计算列
                for (let j = 0; j < dateItems.length; j++) {
                  let item = dateItems[j];
                  //初始化一行中每列单元格
                  let cell = {
                    date: item.date,
                    //用index区分赋值
                    value: this.cellDisplayValue(i, item),
                    origin_value: this.cellOriginValue(i, item),
                    type: i
                  };
                  indexItem.cells.push(cell)
                }
                totals.push(this.total(indexItem.cells));
                averages.push(this.average(indexItem.cells));
                indexItems.push(indexItem)
              }

              let total = {
                date: '合计',
                gmv: totals[0],
                member_num: totals[1],
                item_num: totals[2],
                // total_delivery_item_price: totals[5],
                // price_per_order: totals[6],
                // store_num: totals[7],
                // order_num: totals[8],
                // item_num: totals[9],
                // item_cat_num: totals[10]
              };
              let average = {
                date: '平均值',
                gmv: averages[0],
                member_num: averages[1],
                item_num: averages[2],
                // total_delivery_item_price: averages[5],
                // price_per_order: averages[6],
                // store_num: averages[7],
                // order_num: averages[8],
                // item_num: averages[9],
                // item_cat_num: averages[10]
              };

              //列表数据
              let dateRange = that.dateRange('f1');
              for (let i = 0; i < dateRange.length; i++) {
                let date = dateRange[i];

                let hasDate = false;
                for (let j = 0; j < dateItems.length; j++) {
                  let item = dateItems[j];
                  //初始化一行中每列单元格
                  if (item.date === date) {
                    hasDate = true;
                    operationDataItems.push({
                      ...item,
                      price_per_order: item.total_delivery_item_price / item.member_num //发货金额 / 下单客户数
                    });
                  }
                }
                if (!hasDate) {
                  operationDataItems.push({
                    date: date,
                  })
                }
              }

              operationDataItems.unshift(average);
              operationDataItems.unshift(total);
            }
            this.setData({
              dataItem: indexItems,
              operationDataItem: operationDataItems
            }, () => {
              typeof callback === 'function' && callback();
            });
          }
        });
    },

    onOperationIndexSelect(e) {

      let {activeIndexes, legendSelected, indexNames} = this.data;
      let indexName = indexNames[e.detail.value];
      for (let j = 0; j < indexNames.length; j++) {
        let index = indexNames[j];
        if (index === indexName) {
          legendSelected[index] = true;
        } else {
          legendSelected[index] = false;
        }
      }

      this.setData({
        legendSelected: legendSelected,
        previewOperationLegendSelected: legendSelected,
        selectedOperationIndex: indexName
      }, () => {
        this.ecComponentOperation.init((canvas, width, height) => {
          return this.initializeOperationChart(canvas, width, height);
        })
      })

    },

    onIndexSpecificationClick(e) {
      this.setData({
        dialogType: e.currentTarget.dataset.type,
        isShowIndexSpecDialog: true
      });
    },

    closeIndexSpecDialog(e) {
      this.setData({
        isShowIndexSpecDialog: false
      });
    },

    previewLineChart() {
      let {selectedProvince} = this.data;
      let previewOperationIndexData = encodeURIComponent(JSON.stringify(this.data.previewOperationIndexData));
      let previewOperationXDisplayDates = encodeURIComponent(JSON.stringify(this.data.previewOperationXDisplayDates));
      let previewOperationLegendSelected = encodeURIComponent(JSON.stringify(this.data.previewOperationLegendSelected));
      let previewOperationZoomRate = encodeURIComponent(JSON.stringify(this.data.previewOperationZoomRate));
      // console.log("selectedProvince: ", selectedProvince)
      wx.navigateTo({
        url: "../chart-preview-cls/chart-preview-cls" + "?index_data=" + previewOperationIndexData
          + '&x_dates=' + previewOperationXDisplayDates
          + '&legend_selected=' + previewOperationLegendSelected
          + '&zoom_rate=' + previewOperationZoomRate
          + '&province_name=' + selectedProvince
      });
    },

    onOperationProvinceSelect(e) {
      let index = e.detail.value;  //index值
      let {provinceList} = this.data;
      // console.log(provinceList)
      let provinceCode = provinceList[index].code;
      let provinceName = provinceList[index].title;
      this.setData({
        query: Object.assign(this.data.query, {province_code: provinceCode}),
        queryRanklist: Object.assign(this.data.queryRanklist, {province_code: provinceCode}),
        queryOperation: Object.assign(this.data.queryOperation, {province_code: provinceCode}),
        selectedProvince: provinceName,
        selectedProvinceCode: provinceCode
      }, () => {
        this.refreshOperationData();
      });
    },


    //运营统计 end-------------------------------

    tabClick: function (e) {
      let that = this;
      this.setData({
        sliderOffset: e.currentTarget.offsetLeft,
        activeIndex: e.currentTarget.id,
        isShowIndexSpecDialog: false
      }, () => {
        if (e.currentTarget.id === '0') {
          this.setData({
            clientRequestCount: 1,
            operationRequestCount: 1
          });
          if (this.data.productRequestCount > 0) {
            that.refreshProductData();
          }
          this.setData({
            productRequestCount: this.data.productRequestCount - 1
          })
        }
        else if (e.currentTarget.id === '1') {
          this.setData({
            productRequestCount: 1,
            operationRequestCount: 1
          });
          if (this.data.clientRequestCount > 0) {
            that.itemRanklist();
          }
          this.setData({
            clientRequestCount: this.data.clientRequestCount - 1
          })
        }
        else {
          this.setData({
            clientRequestCount: 1,
            productRequestCount: 1
          });
          if (this.data.operationRequestCount > 0) {
            that.refreshOperationData();
          }
          this.setData({
            operationRequestCount: this.data.operationRequestCount - 1
          })
        }
      });
    },
  }

});
