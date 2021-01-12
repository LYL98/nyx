const app = getApp();
import { Config, Http, Constant, Verification, Util } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    rangeData: Constant.SUP_OPT_TYPES('list'),
    optTypes: Constant.SUP_OPT_TYPES(),
    subLoading: false,
    detail: {},
    addData: {
      id: '', //tray_item_id
      opt_type: 'damage',
      chg_num: '',
      chg_num_later: '-',
      remark: '',
      
      amount:'',
      respor:''
    },
    latest_qa:{},
    fromPage:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { from, index } = options;
    app.signIsLogin((res)=>{
      this.getData(from, Number(index));
    });
  },

  //选择变动类型
  changeOrderType(e){
    let index = e.detail.value;
    let { addData, rangeData } = this.data;
    addData.opt_type = rangeData[index].key;
    addData.opt_type_error = '';
    this.setData({ addData });
  },

  //输入数量
  inputNum(e){
    this.inputChange(e, (v)=>{
      let { detail, addData } = this.data;
      if(!v || !Verification.isNumber(v) || addData.opt_type === ''){
        this.setData({ 'addData.chg_num_later': '-' });
      }else{
        let num = 0;
        if(addData.opt_type === 'refund'){
          num = detail.num + Number(v);
        }else{
          num = detail.num - Number(v);
        }
        this.setData({ 'addData.chg_num_later': num + '件' });
      }
    });
  },
  

  //获取数据
  getData(from, index){
    let { detail, addData,fromPage } = this.data;
    fromPage = from
    //获取仓库商品、托盘详情
    if(from === 'inventoryItem'){
      let iPage = this.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
      if(iPage){
        detail = iPage.data.dataItem.items[index];
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
      }
    }else if(from === 'trayDetail'){
      let tPage = this.getPage('packageWarehouse/pages/trayDetail/trayDetail');
      if(tPage){
        detail = tPage.data.detail.tray_items[index];
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
        detail.warehouse_title = tPage.data.detail.warehouse.title;
        detail.tray_code = tPage.data.detail.code;
      }
    }else if(from === 'qualityControlMsg'){
      let qPage = this.getPage('packageWarehouse/pages/qualityControlMsg/qualityControlMsg');
      if(qPage){
        detail = qPage.data.dataItem.items[index];
        // addData.tray_id = detail.tray_id;
        // addData.sub_item_id = detail.item_id;
        detail.warehouse_title =  qPage.data.dataItem.items[index].warehouse.title;
        detail.tray_code = qPage.data.dataItem.items[index].tray.code;
        detail.due_date = qPage.data.dataItem.items[index].cur_due_date
        detail.stock_due_date = qPage.data.dataItem.items[index].cur_stock_due_date
        detail.num = qPage.data.dataItem.items[index].cur_stock_num,
        detail.created = qPage.data.dataItem.items[index].in_stock_time
      }
    }
    this.setData({detail, addData,fromPage});
    if(from === 'qualityControlMsg'){
      this.wareTrayItemDetail(detail.ware_tray_item_id)
    }else{
      this.wareTrayItemDetail(detail.id)
    }
    
  },
  //具体托盘的库存,以及附加信息(品控信息)wareTrayItemDetail
  wareTrayItemDetail(id){
    let that = this
    Http.get(Config.api.wareTrayItemDetail, {id: id}).then(res=>{
      that.setData({
        latest_qa: res.data.latest_qa || {}
      })
    }).catch((error)=>{
      that.handleResError(error);
    })
  },
  //确认
  handleAffirm(){
    let that = this;
    let { addData,detail } = that.data;
    let con = true;
    if(!addData.opt_type){
      addData.opt_type_error = '请选择变动类型';
      con = false;
    }
    
    //其它
    if(addData.opt_type === 'sale_offline'){
      
      if(!Verification.isPrice(addData.amount) || !Number(addData.amount) || !addData.amount){
        addData.amount_error = '请输入正确的数值(最多保留两位小数)';
        con = false;
      }
    }
    if(addData.opt_type !== 'damage'){
      if(!addData.respor){
        addData.respor_error = '请填写经手人';
        con = false;
      }
    }
    if(!Verification.isNumber(addData.chg_num)){
      addData.chg_num_error = '请输入正确的数值';
      con = false;
    }else if(!addData.chg_num || Number(addData.chg_num) === 0){
      addData.chg_num_error = '不能小于1件';
      con = false;
    }else if(Number(addData.chg_num) > Number(detail.num)){
      addData.chg_num_error = '不能大于库存数量';
      con = false;
    }
         
    
    if(!con){
      that.setData({ addData });
      return;
    }
    let msgStr = `请仔细确认信息，变动数量为${addData.chg_num}件`;
    
    if(addData.opt_type === 'sale_offline'){
      msgStr +=  `,销售金额为：${addData.amount}元`;
    }
    msgStr += '，是否确认？';
    wx.showModal({
      title: '提示',
      content: msgStr,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          
          that.commonSubmit();
        }
      }
    });
  },
  //库内品控变动
  // stockedQaSubmit(){
  //   let that = this;
  //   let { addData, detail } = that.data;
  //   that.setData({ subLoading: false });
  //   Http.post(Config.api.supModifyStockQa, {
  //     id: detail.id,
  //     shelf_life: addData.new_shelf_life || null,
  //     stock_life: addData.new_stock_life || null,
  //     remark: addData.remark
  //   }).then((res)=>{
  //     that.setData({ subLoading: false });
  //     let page = that.getPage('packageWarehouse/pages/trayDetail/trayDetail');
  //     if(page){
  //       page.supWareTrayDetail();
  //     }else{
  //       page = that.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
  //       if(page){
  //         page.getData();
  //       }
  //     }
  //     wx.navigateBack();
  //     wx.showToast({
  //       title: '变动成功',
  //       icon: 'none'
  //     });
  //   }).catch(error => {
  //     that.setData({ subLoading: false });
  //   });
  // },
  //一般变动handlePrice
  commonSubmit(){
    let that = this;
    let { addData, detail, fromPage } = that.data;
    that.setData({ subLoading: false });
    let needId
    if(fromPage === 'qualityControlMsg'){
       needId = detail.ware_tray_item_id
    }else{
       needId = detail.id
    }
    Http.post(Config.api.supModifyAdd, {
      id: needId,
      opt_type: addData.opt_type,
      // chg_num: addData.opt_type === 'refund' ? Number(addData.chg_num) : Number(`-${addData.chg_num}`),
      chg_num: Number(`-${addData.chg_num}`),
      remark: addData.remark,
      amount: Util.handlePrice(addData.amount),
      respor: addData.respor,
      pre_num: Number(detail.num) || 0
    }).then((res)=>{
      that.setData({ subLoading: false });
      if(fromPage == 'inventoryItem'){
       let page = that.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
        if(page){
          page.getData();
        }
      }else if(fromPage == 'qualityControlMsg'){
        let page = that.getPage('packageWarehouse/pages/qualityControlMsg/qualityControlMsg');
        if(page){
          page.getData();
        }
      }
      else{
        let page = that.getPage('packageWarehouse/pages/trayDetail/trayDetail');
        if(page){
          page.supWareTrayDetail();
        }
        
      }
      wx.navigateBack();
      wx.showToast({
        title: '变动成功',
        icon: 'none'
      });
    }).catch(error => {
      that.setData({ subLoading: false });
    });
  }
})