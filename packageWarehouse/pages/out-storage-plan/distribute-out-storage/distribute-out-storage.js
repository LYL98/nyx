const app = getApp();
import { Config, Http, Verification } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    trayItems: {
      items: [],
      num: 0,
      stock_num: 0,
    },
    addData: {
      distribute_plan_detail_id: '',
      tray_items: []
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      let index = Number(options.index);
      let page = this.getPage('packageWarehouse/pages/out-storage-plan/index/index');
      let pageCom = this.getPageComponent(page, 'distribute');
      if(pageCom){
        let detail = pageCom.data.dataItem.items[index];
        this.setData({ detail }, ()=>{
          this.wareTrayItemList();
        });
      }
    });
  },

  //获取库存列表
  wareTrayItemList(){
    let that = this;
    let { addData, detail } = that.data;
    Http.get(Config.api.wareTrayItemList, {
      c_item_id: detail.c_item_id,
      storehouse_id: detail.src_storehouse_id
    }).then(res =>{
      let rd = res.data;
      addData.distribute_plan_detail_id = detail.id;
      let sumNum = 0;
      for(let i = 0; i < rd.items.length; i++){
        if(rd.items[i].num + sumNum < detail.num - detail.num_out){
          addData.tray_items.push({tray_item_id: rd.items[i].id, tray_index: i, num: rd.items[i].num});
          sumNum = sumNum + rd.items[i].num;
        }else{
          addData.tray_items.push({tray_item_id: rd.items[i].id, tray_index: i, num: detail.num - sumNum - detail.num_out});
          break;
        }
      }
      rd.items.forEach(item => {
        item.warehouse_tray_code = `${item.warehouse_title} / ${item.tray_code}`;
      });
      if(addData.tray_items.length === 0){
        addData.tray_items.push({tray_item_id: '', tray_index: '', num: ''});
      }
      that.setData({ addData, trayItems: rd });
    }).catch(error => {

    });
  },

  //添加托盘
  addTray(trayItemId, trayIndex){
    let { addData } = this.data;
    trayItemId = trayItemId || '';
    trayIndex = trayIndex || trayIndex === 0 ? trayIndex : '';
    addData.tray_items.push({tray_item_id: trayItemId, tray_index: trayIndex, num: ''});
    this.setData({ addData });
  },

  //删除托盘
  deleteTray(e){
    let index = e.currentTarget.dataset.index;
    let { addData } = this.data;
    addData.tray_items.remove(index);
    this.setData({ addData });
  },

  //选择托盘
  changeTray(e){
    let i = Number(e.detail.value);
    let index = e.currentTarget.dataset.index;
    let { addData, trayItems } = this.data;
    let con = addData.tray_items.filter(item => item.tray_index === i);
    if(con.length > 0){
      wx.showToast({ title: '您已选择了该仓库', icon: 'none' });
      return;
    };
    addData.tray_items[index].tray_item_id = trayItems.items[i].id;
    addData.tray_items[index].tray_index = i;
    addData.tray_items[index].tray_index_error = '';
    this.setData({ addData });
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
    if(result.type === 'tray'){
      let { trayItems, addData } = this.data;
      let d = {}, index = 0;
      for(let i = 0; i < trayItems.items.length; i++){
        if(trayItems.items[i].tray_id === result.id){
          index = i;
          d = trayItems.items[i];
          break;
        }
      }
      if(!d.tray_id){
        wx.showToast({
          title: '托盘上无改商品',
          icon: 'none'
        });
        return;
      }
      let con = addData.tray_items.filter(item => item.tray_item_id === d.id);
      if(con.length > 0){
        wx.showToast({
          title: '您已选择了该仓库',
          icon: 'none'
        });
      }else{
        this.addTray(d.id, index);
      }
    }else{
      wx.showModal({
        title: '提示',
        content: '请扫托盘码',
        confirmText: '我知道了',
        confirmColor: '#00ADE7',
        showCancel: false
      });
    }
  },

  //提交数据
  handleAffirm(){
    let { detail, addData, trayItems } = this.data;
    //校验
    let con = false, sumNum = 0;
    for(let i = 0; i < addData.tray_items.length; i++){
      let d = addData.tray_items[i];
      if(d.tray_index === ''){
        d.tray_index_error = '请选择仓库';
        con = true;
      }
      if(!d.num){
        d.num_error = '请输入出库数量且大于0';
        con = true;
      }else if(!Verification.isNumber(d.num)){
        d.num_error = '请输入正确的数量';
        con = true;
      }else if(d.tray_index !== '' && Number(d.num) > trayItems.items[d.tray_index].num){
        d.num_error = '出库数量不能大于库存数量';
        con = true;
      }
      if(Verification.isNumber(d.num)){
        sumNum = sumNum + Number(d.num);
      }
    }
    if(sumNum > detail.num - detail.num_out){
      wx.showToast({ title: '出库总数不能大于待出库数量', icon: 'none' });
      return;
    }
    if(con){
      this.setData({ addData });
      wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确认提交出库信息？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success: (res)=>{
        if (res.confirm) {
          this.supOutAddWithDistPlan();
        }
      }
    });
  },

  //提交出库信息
  supOutAddWithDistPlan(){
    let that = this;
    let { addData } = that.data;
    let trayItems = [];
    addData.tray_items.forEach(item => {
      trayItems.push({
        ...item,
        num: Number(item.num)
      });
    });
    that.setData({subLoading: true}, ()=>{
      Http.post(Config.api.supOutAddWithDistPlan, {
        ...addData,
        tray_items: trayItems
      }).then(res => {
        let pc = this.getPage('packageWarehouse/pages/out-storage-plan/index/index');
        let com = this.getPageComponent(pc, 'distribute');
        if(com){
          com.setData({
            'query.page': 1
          }, ()=>{
            com.getData();
          });
        }
        that.setData({subLoading: false});
        wx.navigateBack();
        wx.showToast({ title: '已出库', icon: 'none' });
      }).catch(error => {
        that.setData({subLoading: false});
      });
    });
  }
})