//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    myInfo: {},
    auth: {},
    province: {},
    dataItem: [{
      title: '业务',
      icon: 'client.png',
      auth: 'Business',
      url: '/packageBusiness/pages/index/index'
    },{
      title: '商品',
      icon: 'item.png',
      auth: 'Item',
      url: '/packageItem/pages/index/index'
    },{
      title: '仓库',
      icon: 'warehouse.png',
      auth: 'Warehouse',
      url: '/packageWarehouse/pages/index/index'
    },{
      title: '场地',
      icon: 'operate.png',
      // auth: 'OperateReceivingMain',
      // url: '/packageOperate/pages/receiving/index/index'
      auth: 'Operate',
      url: '/packageOperate/pages/index/index'
    },{
      title: '统计',
      icon: 'statistics.png',
      auth: 'Statistic',
      url: '/pages/statistics/statistics-index/statistics-index'
    }]
  },
  /**
   * 在页面显示时，对区域的处理逻辑 以及 获取权限对象
   */
  onShow() {
    app.signIsLogin((res)=>{
      this.setData({
        myInfo: res,
        auth: app.globalData.auth,
        province: app.globalData.globalProvince
      });
    });
  },

})