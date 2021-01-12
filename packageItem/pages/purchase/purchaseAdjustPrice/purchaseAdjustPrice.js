const app = getApp();
import { Config, Http, Verification, Util } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    type: '', //'global', 'local'
    editData: {
      remark: '',
      remark_error: ''
    },
    detail: {
      storehouse: {}
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      app.signIsLogin((res)=>{
        this.getDetail(options.id);
      });
      this.setData({ type: options.type });
    });
  },
  //获取详情
  getDetail(id){
    let that = this;
    wx.showNavigationBarLoading();
    Http.get(Config.api.fromSupplierOrderDetail, { id }).then(res => {
      let rd = res.data;
      rd.price_buy = Util.returnPrice(rd.price_buy);
      that.setData({detail: rd});
      wx.hideNavigationBarLoading();
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
  handleAffirm(){
    let that = this;
    let { editData, detail } = that.data;
    let con = true;
    if(!editData.price_buy){
      editData.price_buy_error = '请输入新采购价';
      con = false;
    }else if(!Verification.isPrice(editData.price_buy)){
      editData.price_buy_error = '请输入正确的金额';
      con = false;
    }else if(Number(editData.price_buy) >= Number(detail.price_buy)){
      editData.price_buy_error = '新采购价必须小于原采购价';
      con = false;
    }
    if(!editData.remark){
      editData.remark_error = '请输入备注';
      con = false;
    }
    if(!con){
      that.setData({ editData });
      wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '提示',
      content: `原采购价：￥${detail.price_buy}，调价后采购价：￥${editData.price_buy}，请仔细核对价格，确认调整？`,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.fromSupplierOrderUpgradePrice();
        }
      }
    });
  },
  fromSupplierOrderUpgradePrice(){
    let that = this;
    let { detail, editData, type } = that.data;
    that.setData({ subLoading: true }, ()=>{
      Http.post(Config.api.fromSupplierOrderUpgradePrice, {
        id: detail.id,
        price_buy: Util.handlePrice(editData.price_buy),
        remark: editData.remark
      }).then(res => {
        that.setData({ subLoading: false });
        let page = that.getPage('packageItem/pages/purchase/index/index');
        if(page){
          let com = that.getPageComponent(page, type);
          if(com){
            com.setData({ 'query.page': 1}, ()=>{
              com.getData();
            });
          }
        }
        wx.navigateBack();
        wx.showToast({
          title: '已调价',
          icon: 'none'
        });
      }).catch(error => {
        that.setData({ subLoading: false });
      });
    });
  }
})