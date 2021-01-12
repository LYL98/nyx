//获取应用实例
const app = getApp();
// ./../../../utils/index
import { Config, Http, Constant } from './../../../utils/index';

Page({
  data: {
    auth: {},
    // province: {},
    // selectStorehouse: {},
    // storehouseList: [],
    items: [

      {url: '/packageOperate/pages/receiving/index/index', icon: 'receiving.png', str: '品控收货', auth: 'OperateReceivingMain'},
      {url: '/packageOperate/pages/item/item', icon: 'item.png', str: '场地商品', auth: 'OperateItemSupStock'},



    ],
    // custom_type: 'B',
    // status: {
    //   keys: ['B','C'], //'B', 'C'
    //   values: ['商城', '零售'] //'商城', '零售'
    // },
    // activeIndex: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.signIsLogin(()=>{
      this.setData({
        auth: app.globalData.auth,
        // province: app.globalData.globalProvince
      });
    });
  },
  //仓列表
  baseSupStorehouseList(){
    let that = this;
    Http.get(Config.api.baseSupStorehouseList, {}).then(res => {
      let rd = res.data;
      let ssd = rd.filter(item => item.province_code === app.globalData.loginUserInfo.province_code);
      that.setData({
        storehouseList: rd,
        selectStorehouse: ssd.length > 0 ? ssd[0] : {}
      }, () => {
        // console.log("selectedStorage: ", this.data.selectStorehouse)
        let selectedStoreHouse = wx.getStorageSync('selectedStoreHouse')
        if (!app.globalData.loginUserInfo.province_code) {
          if (!selectedStoreHouse) {
            // 如果是总部权限，先选择仓库
            wx.navigateTo({
              url: '/packageWarehouse/pages/selectStorehouse/selectStorehouse'
            });
          } else {
            that.setData({
              selectStorehouse: selectedStoreHouse
            })
          }
        }
      });
    });
  },
  //切换类型
  clickTab(e) {
    let { custom_type, status } = this.data;
    let activeIndex = e.detail.index;
    custom_type = status.keys[activeIndex]
    
    this.setData({ custom_type, activeIndex });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });
  },
})