const app = getApp();
import { Config, Http, Constant } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    operate: '',
    operates: Constant.WAREHOUSE_OPERATE
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      this.setData({
        operate: options.operate || '',
        id: options.id ? Number(options.id) : ''
      }, ()=>{
        this.supWareTrayDetail();
      });
    });
  },

  //获取托盘详情
  supWareTrayDetail(){
    let that = this;
    let { id } = that.data;
    Http.get(Config.api.supWareTrayDetail, {id}).then(res => {
      that.handleResData(res.data);
    }).catch(error => {
      that.handleResError(error);
    });
  },

  //红外扫描输入
  scanInput(e){
    this.setData({ 'query.condition': '' });
    this.scancodeSuccess(e.detail.value);
  },

  //调起扫一扫
  handleScan() {
    wx.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        this.scancodeSuccess(res.result);
      },
    })
  },

  //扫码成功
  scancodeSuccess(result){
    if(result.indexOf('{') !== 0 || result.indexOf('}') !== result.length - 1){
      wx.showToast({
        title: '请扫专用二维码',
        icon: 'none'
      });
      return;
    }
    //JSON.parse(JSON.stringify(json))
    result = JSON.parse(result);
    if(result.type === 'item'){
      this.judgeItem(result);
    }else{
      wx.showModal({
        title: '提示',
        content: '请扫商品码',
        confirmText: '我知道了',
        confirmColor: '#00ADE7',
        showCancel: false
      });
    }
  },

  //商品校验
  judgeItem(result){
    let { detail, operate, operates } = this.data;
    for(let i = 0; i < detail.tray_items.length; i++){
      let dd = detail.tray_items[i];
      if(dd.item_id === result.sub_item_id && dd.purchase_order_id === result.order_id){
        wx.navigateTo({
          url: `${operates[operate].url}?index=${i}&from=trayDetail&operate=${operate}`
          //url: `${operates[operate].url}?order_id=${result.order_id}&sub_item_id=${result.sub_item_id}&tray_id=${id}&batch_code=${result.batch_code}&operate=${operate}`
        });
        return;
      }
    }
    wx.showModal({
      title: '提示',
      content: '托盘上无该商品',
      confirmText: '我知道了',
      confirmColor: '#00ADE7',
      showCancel: false
    });
  },
})