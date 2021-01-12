//获取应用实例
const app = getApp();

Page({
  data: {
    auth: {},
    items: [
      {url: '/pages/merchant/merchant', icon: 'merchant.png', str: '商户', auth: 'MerchantMain'},
      {url: '/packageBusiness/pages/order/order', icon: 'order.png', str: '用户订单', auth: 'OrderList'},
      {url: '/packageBusiness/pages/aftersale/aftersale', icon: 'aftersale.png', str: '售后订单', auth: 'OrderAfterSale'}
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.signIsLogin(()=>{
      this.setData({
        auth: app.globalData.auth
      });
    });
  },
})