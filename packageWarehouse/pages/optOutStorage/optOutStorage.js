const app = getApp();
import { Config, Http, Verification } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    subLoading: false,
    addData: {
      province_code: '',
      plon_out_id: '', //选填，出库计划出库的时候，传递这个参数
      id: '', //tray_item_id
      num: '',
      remark: ''
    },
    operate: '',
    outStoragePlanData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { from, index, operate } = options;
    this.setData({ operate: options.operate });
    app.signIsLogin((res)=>{
      this.getData(from, Number(index));
    });
  },

  //获取数据
  getData(from, index){
    let { detail, addData, outStoragePlanData, operate } = this.data;
    let page = this.getPage('packageWarehouse/pages/index/index');

    //获取仓库商品、托盘详情
    if(from === 'inventoryItem'){
      let iPage = this.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
      if(iPage){
        detail = iPage.data.dataItem.items[index];
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
        addData.province_code = page.data.selectStorehouse.province_code;
      }
    }else if(from === 'trayDetail'){
      let tPage = this.getPage('packageWarehouse/pages/trayDetail/trayDetail');
      if(tPage){
        detail = tPage.data.detail.tray_items[index];
        detail.warehouse_title = tPage.data.detail.warehouse.title;
        detail.tray_code = tPage.data.detail.code;
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
        addData.province_code = page.data.selectStorehouse.province_code;
      }
    }

    //如果是出库计划
    if(operate === 'out_storage_plan'){
      addData.plon_out_id = null;
      page = this.getPage('packageWarehouse/pages/inventory/inventory');
      if(page){
        let con = page.data.dataItem.items.filter(item => item.item_id === detail.item_id);
        if(con.length > 0){
          outStoragePlanData = con[0];
          addData.plon_out_id = con[0].id;
        }
      }
    }

    this.setData({detail, addData, outStoragePlanData});
  },

  //确认
  handleAffirm(){
    let that = this;
    let { addData, detail, outStoragePlanData, operate } = that.data;
    let con = true;
    if(!addData.num){
      addData.num_error = '不能小于1件';
      con = false;
    }
    if(!Verification.isNumber(addData.num)){
      addData.num_error = '请输入正确的数值';
      con = false;
    }
    if(Number(addData.num) > detail.num){
      addData.num_error = '出库数量不能大于库存';
      con = false;
    }
    //出库计划
    if(operate === 'out_storage_plan' && Number(addData.num) > outStoragePlanData.num - outStoragePlanData.num_out){
      addData.num_error = '出库数量不能大于应出库数量';
      con = false;
    }
    if(!con){
      that.setData({ addData });
      return;
    }
    wx.showModal({
      title: '提示',
      content: `请仔细确认信息，出库数量为${addData.num}件，是否确认？`,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.setData({ subLoading: true }, ()=>{
            Http.post(Config.api.supOutAdd, {
              ...addData,
              id: detail.id,
              num: Number(addData.num),
              plan_out_id: addData.plan_out_id || null, //根据出库计划出库的时候，传递这个参数
              pre_num: Number(detail.num) || 0
            }).then(res => {
              that.setData({ subLoading: false });
              let page = that.getPage('packageWarehouse/pages/trayDetail/trayDetail');
              if(page){
                page.supWareTrayDetail();
              }else{
                let iip = that.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
                if(iip){
                  iip.setData({'query.page': 1, 'outStoragePlanData.num_out': Number(addData.num)}, ()=>{
                    iip.getData();
                  });
                }
                let ipage = that.getPage('packageWarehouse/pages/inventory/inventory');
                if(ipage){
                  ipage.setData({'query.page': 1}, ()=>{
                    ipage.getData();
                  });
                }
              }
              wx.navigateBack();
              wx.showToast({
                title: '出库成功',
                icon: 'none'
              });
            }).catch(error => {
              that.setData({ subLoading: false });
            });
          });
        }
      }
    });
  },
})