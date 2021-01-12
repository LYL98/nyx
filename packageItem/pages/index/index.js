//获取应用实例
const app = getApp();

Page({
  data: {
    auth: {},
    items: [
      {url: '/packageItem/pages/purchase/index/index', icon: 'purchase.png', str: '采购', auth: 'ItemPurchaseMain'},
      {url: '/packageItem/pages/distribute/index/index', icon: 'distribute.png', str: '调拨计划', auth: 'ItemSupDistributePlan'}
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