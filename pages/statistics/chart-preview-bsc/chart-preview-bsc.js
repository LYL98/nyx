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
      '#E3D557',   //1
      '#8BC867',   //2
      '#E081AF',   //3
      '#819DE0',   //4
      '#C08DDB',   //5
      '#66BFD5',   //6
    ],
    indexNames: [
      'GMV',
      '订单商品金额',
      '下单门店数',
      '下单件数',
      '下单商品数'
    ],
    activeIndexes: ['GMV'],
    selectedOperationIndex: 'GMV',
    legendSelected: {
      'GMV': true,
      '订单商品金额': false,
      '下单门店数': false,
      '下单件数': false,
      '下单商品数': false,
    },
    previewSeries: [],
    indexData: [],
    xDisplayDates: [],
    ecOperation: {
      // onInit: initChart
    },
    current_hour_index: 0,
    type: 'operation',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {preview_series, index_data, x_dates, legend_selected, zoom_rate, province_name, current_hour_index, type} = options;
    preview_series = preview_series && JSON.parse(decodeURIComponent(preview_series));
    index_data = index_data && JSON.parse(decodeURIComponent(index_data));
    current_hour_index = current_hour_index && JSON.parse(decodeURIComponent(current_hour_index));
    type = type && JSON.parse(decodeURIComponent(type));
    x_dates = x_dates && JSON.parse(decodeURIComponent(x_dates));
    legend_selected = legend_selected && JSON.parse(decodeURIComponent(legend_selected));
    zoom_rate = zoom_rate && JSON.parse(decodeURIComponent(zoom_rate));
    this.setData({
      previewSeries: preview_series,
      indexData: index_data,
      xDisplayDates: x_dates,
      legendSelected: Object.assign(this.data.legendSelected, legend_selected),
      zoomRate: Object.assign(this.data.zoomRate, zoom_rate),
      selectedProvince: province_name,
      current_hour_index: current_hour_index,
      type: type
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

    let { lineColors, indexNames, legendSelected, previewSeries, type, current_hour_index } = that.data;

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

    const xAxis = type === 'operation' ?
        [{
          type : 'category',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          data : xDisplayDates,
        }]
      : [{
        type : 'category',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        data : xDisplayDates,
        axisLabel: {interval: 11},
      }];

    let option = {
      tooltip : {
        show: true,
        position: ['5%', '5%'],
        trigger: 'axis',
        formatter: function (params,ticket,callback) {

          if (type === 'operation') {
            let res = params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
              let zoomValue = params[i].value;

              if (legendSelected['GMV'] || legendSelected['客单价'] || legendSelected['订单商品金额']) {
                res += '\n' + params[i].seriesName + ' : ' + zoomValue + '元';
              } else if (legendSelected['下单门店数']) {
                res += '\n' + params[i].seriesName + ' : ' + zoomValue + '个';
              } else {
                res += '\n' + params[i].seriesName + ' : ' + zoomValue + '件';
              }
            }
            //callback 异步时使用
            // callback(ticket, res);
            return res

          } else {

            let res = params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
              if (!isNaN(params[i].value)) {
                let zoomValue = params[i].value /*/ that.narrowRate(params[i].seriesName)*/;

                if (i === 1 && Number(params[0].name) === current_hour_index) {

                } else {

                  if (legendSelected['GMV']) {
                    res += '\n' + params[i].seriesName + ' : ' + zoomValue + '元';
                  } else if (legendSelected['下单门店数']) {
                    res += '\n' + params[i].seriesName + ' : ' + zoomValue + '个';
                  }

                }

              }
            }
            //callback 异步时使用
            // callback(ticket, res);
            return res

          }
        }
      },
      calculable : true,
      legend: {
        show: true,
        selectedMode: false,
        data: ['当前', type === 'operation' ? '同比' : '昨日', '前七天'],
      },
      xAxis :xAxis,
      yAxis: {
        show: true,
        axisLabel: {
          formatter: v => v < 1000 ? v : Math.ceil(v / 1000 * 10) / 10 + 'k'
        }
      },
      series: previewSeries
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