//获取应用实例
const app = getApp();
import { Config, Http, Constant } from './../../../utils/index';

Page({
  data: {
    auth: {},
    province: {},
    selectStorehouse: {},
    storehouseList: [],
    items: [
      {url: '/packageWarehouse/pages/inventory/inventory', icon: 'inventory.png', str: '库存', auth: 'WarehouseInventory'},
      {url: '/packageWarehouse/pages/inventory/inventory?operate=check', icon: 'check.png', str: '盘点', auth: 'WarehouseInventoryCheck'},
      {url: '/packageWarehouse/pages/inventory/inventory?operate=putaway', icon: 'putaway.png', str: '上架', auth: 'WarehouseInventoryMoveOp'},
      {url: '/packageWarehouse/pages/out-storage-plan/index/index', icon: 'out_storage_plan.png', str: '出库计划', auth: 'OutStoragePlanMain'},
      {url: '/packageWarehouse/pages/inventory/inventory?operate=variation', icon: 'variation.png', str: '变动', auth: 'WarehouseInventoryVariation'},
      {url: '/packageWarehouse/pages/inventory/inventory?operate=move', icon: 'move.png', str: '移库', auth: 'WarehouseInventoryMoveOp'},
      {url: '/packageWarehouse/pages/inventory/inventory?operate=out_storage', icon: 'out_storage.png', str: '出库', auth: 'WarehouseInventoryOutStorage'},

      {url: '/packageWarehouse/pages/inventory/inventory?operate=quality_control', icon: 'quality_control.png', str: '品控', auth: 'WarehouseInventorySupQualityAdd'},
      {url: '/packageWarehouse/pages/qualityControlMsg/qualityControlMsg?operate=quality_control_msg', icon: 'quality_control_msg.png', str: '品控记录', auth: 'WarehouseInventorySupQualityQuery'},
      {url: '/packageWarehouse/pages/saleBack/saleBack?operate=sale_back', icon: 'sale_back.png', str: '售后退货', auth: 'WarehouseInventorySaleback'},
      {url: '/packageWarehouse/pages/damaged/index/index', icon: 'damaged.png', str: '残损区', auth: 'WarehouseTrashMain'},


    ],
    custom_type: 'B',
    status: {
      keys: ['B','C'], //'B', 'C'
      values: ['商城', '零售'] //'商城', '零售'
    },
    activeIndex: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.signIsLogin(()=>{
      this.setData({
        auth: app.globalData.auth,
        // province: app.globalData.globalProvince
      }, ()=>{
        this.baseSupStorehouseList();
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