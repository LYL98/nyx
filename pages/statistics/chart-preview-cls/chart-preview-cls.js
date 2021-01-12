// pages/statistics/chart-preview/chart-preview.js
import util from "../../../utils/util";
import * as echarts from '../../../components/ec-canvas/echarts';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedProvince: '全部',
    isShowIndexSpecDialog: false,
    zoomRate: [1, 1, 1, 1, 1, 1],
    lineColors: [
      '#D27575',   //1
      '#E2BA6F',   //2
      '#E8E676',   //3
      '#819DE0',   //4
      '#9AD782',   //5
      '#66BFD5',   //6
    ],
    indexNames: [
      'GMV',
      '下单客户数',
      '下单商品数'
    ],
    activeIndexes: ['GMV'],
    selectedOperationIndex: 'GMV',
    legendSelected: {
      'GMV': true,
      '下单客户数': false,
      '下单商品数': false,
    },
    indexData: [],
    xDisplayDates: [],
    ecOperation: {
      // onInit: initChart
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {index_data, x_dates, legend_selected, zoom_rate, province_name} = options;
    index_data = index_data && JSON.parse(decodeURIComponent(index_data));
    x_dates = x_dates && JSON.parse(decodeURIComponent(x_dates));
    legend_selected = legend_selected && JSON.parse(decodeURIComponent(legend_selected));
    zoom_rate = zoom_rate && JSON.parse(decodeURIComponent(zoom_rate));
    this.setData({
      indexData: index_data,
      xDisplayDates: x_dates,
      legendSelected: Object.assign(this.data.legendSelected, legend_selected),
      zoomRate: Object.assign(this.data.zoomRate, zoom_rate),
      selectedProvince: province_name
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.ecComponentOperation = this.selectComponent('#mychart-dom-line-operation');

    this.ecComponentOperation.init((canvas, width, height) => {
      return this.initializeOperationChart(canvas, width, height);
    })
  },

  initializeOperationChart(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
    canvas.setChart(chart);

    let that = this;

    let { lineColors, indexNames, legendSelected } = that.data;

    // //与接口数据比较的日期：例如 2018-1-1
    // let xDates = this.dateRange('f1');
    //x轴日期：例如 1月1日
    let xDisplayDates = this.data.xDisplayDates;

    // //放大指标
    // that.zoomLines();
    //
    // //计算每个指标数据集
    // let indexData = Array();
    // for (let i = 0; i < indexNames.length; i++) {
    //   indexData.push(that.lineData(i, xDates))
    // }
    //
    // this.setData({
    //   previewOperationIndexData: indexData
    // });

    let indexData = this.data.indexData;

    let option = {
      tooltip : {
        show: true,
        position: ['5%', '5%'],
        trigger: 'axis',
        formatter: function (params,ticket,callback) {
          var res = params[0].name;
          for (var i = 0, l = params.length; i < l; i++) {
            let zoomValue = params[i].value;
            res += '\n' + params[i].seriesName + ' : ' + zoomValue;
          }
          //callback 异步时使用
          // callback(ticket, res);
          return res
        }
      },
      calculable : true,
      legend: {
        show: false,
        data: indexNames,
        selected: legendSelected,
      },
      xAxis : [
        {
          type : 'category',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          data : xDisplayDates
        }
      ],
      yAxis: {
        show: false
      },
      series: [
        {
          name:'GMV',
          type:'bar',
          itemStyle: {normal: {color: lineColors[0], lineStyle: {color: lineColors[0]}}},
          smooth: true,
          data: indexData[0]
        },
        // {
        //   name:'订单商品金额',
        //   type:'bar',
        //   itemStyle: {normal: {color: lineColors[1], lineStyle: {color: lineColors[1]}}},
        //   smooth: true,
        //   data: indexData[1]
        // },
        {
          name:'下单客户数',
          type:'bar',
          itemStyle: {normal: {color: lineColors[2], lineStyle: {color: lineColors[2]}}},
          smooth: true,
          data: indexData[1]
        },
        // {
        //   name:'下单件数',
        //   type:'bar',
        //   itemStyle: {normal: {color: lineColors[3], lineStyle: {color: lineColors[3]}}},
        //   smooth: true,
        //   data: indexData[3]
        // },
        {
          name:'下单商品数',
          type:'bar',
          itemStyle: {normal: {color: lineColors[4], lineStyle: {color: lineColors[4]}}},
          smooth: true,
          data: indexData[2]
        },
        // {
        //   name:'下单商品种类数量',
        //   type:'line',
        //   itemStyle: {normal: {color: lineColors[5], lineStyle: {color: lineColors[5]}}},
        //   smooth: true,
        //   data: indexData[5]
        // }
      ]
    };

    chart.setOption(option);

    return chart;
  },

  // returnIndexName(indexName) {
  //   if (indexName === '下单商品件数') {
  //     return '下单件数'
  //   } else if (indexName === '下单商品种类数量') {
  //     return '下单商品数'
  //   } else {
  //     return indexName;
  //   }
  // },

  //根据指标名称查找缩小比例
  // narrowRate(seriesName) {
  //   let { zoomRate } = this.data;
  //   switch (seriesName) {
  //     case '下单金额':
  //       return zoomRate[0];
  //     case '发货金额':
  //       return zoomRate[1];
  //     case '下单门店数':
  //       return zoomRate[2];
  //     case '订单数量':
  //       return zoomRate[3];
  //     case '下单商品件数':
  //       return zoomRate[4];
  //     case '下单商品种类数量':
  //       return zoomRate[5];
  //   }
  // },

  onOperationIndexSelect(e) {

    let { activeIndexes, legendSelected, indexNames } = this.data;
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
      selectedOperationIndex: indexName
    }, () => {
      this.ecComponentOperation.init((canvas, width, height) => {
        return this.initializeOperationChart(canvas, width, height);
      })
    })

  },

  onOperationProvinceSelect(e) {
    let index = e.detail.value;  //index值
    let { provinceList } = this.data;
    let provinceCode = "";
    let provinceName = "全部";
    if (index > 0) {
      provinceCode = provinceList[index - 1].code;
      provinceName = provinceList[index - 1].title;
    }
    this.setData({
      // queryOperation: Object.assign(this.data.query, {province_code: provinceCode}),
      selectedProvince: provinceName
    }, () => {
      this.refreshOperationData();
    });
  },


  // onIndexSpecificationClick(e) {
  //   // console.log('onIndexSpecificationClick')
  //   this.setData({
  //     isShowIndexSpecDialog: true
  //   });
  // },

  closeIndexSpecDialog(e) {
    this.setData({
      isShowIndexSpecDialog: false
    });
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})