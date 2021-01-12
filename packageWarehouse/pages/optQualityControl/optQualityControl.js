
const app = getApp();
import { Config, Http, Constant, Verification,Util } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    rangeData: Constant.QUA_OPT_TYPES('list'),
    qaTypes: Constant.QUA_OPT_TYPES(),
    subLoading: false,
    detail: {},
    addData: {
      id: '', //tray_item_id
      num_after: '',
      remark: '',
      // trays: [],
      new_shelf_life: null,
      new_stock_life: null,
      qa_type: '',
      qa_sample_num:'',
      un_qa_num:'',
    },
    selectStorehouse:{},
    newShelfDueDate: '',
    newStockDueDate: '',
    shelf_life_ph:'',
    stock_life_ph:'',
    isShowCalendar: false
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


  //获取数据
  getData(from, index){
    console.log(Util);
    
    let { detail, addData, selectStorehouse,shelf_life_ph,stock_life_ph } = this.data;
    //获取首页(仓)
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) selectStorehouse = page.data.selectStorehouse;
    let dd = Util.formatDate(new Date(),'yyyy-MM-dd')
    //获取仓库商品、托盘详情returnDateTimeCalc
    if(from === 'inventoryItem'){
      let iPage = this.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
      if(iPage){
        detail = iPage.data.dataItem.items[index];
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
        addData.shelf_life = detail.shelf_life;
        addData.stock_life = detail.stock_life;
        shelf_life_ph = Util.returnDateTimeCalc(dd,detail.due_date || '')
        stock_life_ph = Util.returnDateTimeCalc(dd,detail.stock_due_date || '')

      }
    }else if(from === 'trayDetail'){
      let tPage = this.getPage('packageWarehouse/pages/trayDetail/trayDetail');
      if(tPage){
        detail = tPage.data.detail.tray_items[index];
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
        detail.warehouse_title = tPage.data.detail.warehouse.title;
        detail.tray_code = tPage.data.detail.code;
        shelf_life_ph = Util.returnDateTimeCalc(dd,detail.due_date || '')
        stock_life_ph = Util.returnDateTimeCalc(dd,detail.stock_due_date || '')
      }
    }
    this.setData({detail, addData, selectStorehouse, shelf_life_ph,stock_life_ph});
  },

  //选择品控类型
  changeOrderType(e){
    let index = e.detail.value;
    let { addData, rangeData } = this.data;
    addData.qa_type = rangeData[index].key;
    addData.qa_type_error = '';
    this.setData({ addData });
  },

  //输入天数
  inputDateNum(e){
    this.inputChange(e, (v)=>{
      let { detail, addData, newShelfDueDate, newStockDueDate } = this.data;
      if(addData.new_shelf_life && Verification.isNumber(addData.new_shelf_life)){
        newShelfDueDate = Util.returnDateStr();
        newShelfDueDate = Util.returnDateCalc(newShelfDueDate, Number(addData.new_shelf_life));
      }else{
        newShelfDueDate = detail.due_date;
      }

      if(addData.new_stock_life && Verification.isNumber(addData.new_stock_life)){
        newStockDueDate = Util.returnDateStr();
        newStockDueDate = Util.returnDateCalc(newStockDueDate, Number(addData.new_stock_life));
      }else{
        newStockDueDate = detail.stock_due_date;
      }
      
      this.setData({newShelfDueDate, newStockDueDate});
    });
  },
  //显示选择日期
  showSelectCalendar(e){
    let type = e.currentTarget.dataset.type;
    let dateTemp = this.data.addData.produce_date || '';
    this.setData({ isShowCalendar: true, dateTemp });
  },
  //隐藏选择日期
  cancelSelectCalendar(){
    this.setData({ isShowCalendar: false });
  },
  //选择日历后回调
  selectCalendar(e){
    console.log(e.detail);
    
    this.cancelSelectCalendar();
    let { detail, addData,newShelfDueDate, newStockDueDate, shelf_life_ph, stock_life_ph } = this.data;
    //新商品过期时间和新库存过期时间
      addData.produce_date = e.detail;
      addData.produce_date_error = '';
      newShelfDueDate = Util.returnDateCalc(addData.produce_date, detail.shelf_life);
      newStockDueDate = Util.returnDateCalc(addData.produce_date, detail.stock_life);
      shelf_life_ph = detail.shelf_life
      stock_life_ph = detail.stock_life
      this.setData({ addData,newShelfDueDate,newStockDueDate,shelf_life_ph,stock_life_ph });
  },
  //确认
  handleAffirm(){
    let that = this;
    let { addData, detail } = that.data;
    let con = true;
    if(!addData.qa_type){
      addData.qa_type_error = '请选择品控类型';
      con = false;
    }
    //库期调整
    if(addData.qa_type === 'due_date_modify'){
      if(detail.produce_date){
        if(!addData.produce_date){
          addData.produce_date_error = '请选择生产日期';
          con = false;
        }
      }else{
        if(!addData.new_shelf_life || !Verification.isNumber(addData.new_shelf_life)){
          addData.new_shelf_life_error = '请输入正确的数值';
          con = false;
        }
        if(!addData.new_stock_life || !Verification.isNumber(addData.new_stock_life)){
          addData.new_stock_life_error = '请输入正确的数值';
          con = false;
        }
      }
      
    }else{
      if(!Verification.isNumber(addData.qa_sample_num)){
        addData.qa_sample_num_error = '请输入正确的数值';
        con = false;
      }
      if(!Number(addData.qa_sample_num)){
        addData.qa_sample_num_error = '不能小于1件';
        con = false;
      }
      if(Number(addData.qa_sample_num) > Number(detail.num)){
        addData.qa_sample_num_error = '不能大于库存数量';
        con = false;
      }
      if(!Verification.isNumber(addData.un_qa_num)){
        addData.un_qa_num_error = '请输入正确的数值';
        con = false;
      }
      if(Number(addData.un_qa_num) > Number(detail.num)){
        addData.un_qa_num_error = '不能大于库存数量';
        con = false;
      }
      if(Number(addData.un_qa_num) > Number(addData.qa_sample_num)){
        addData.un_qa_num_error = '不能大于抽检数量';
        con = false;
      }        
    }
    // if(!addData.remark){
    //   addData.remark_error = '请输入备注';
    //   con = false;
    // }
    if(!con){
      that.setData({ addData });
      return;
    }
    // let msgStr = `请仔细确认信息，不合格数量为${addData.un_qa_num}件，是否确认？`;
    // if(addData.opt_type === 'stocked_qa'){
    //   if(addData.new_shelf_life || addData.new_stock_life){
    //     msgStr = '请仔细确认信息，该批次所有商品的';
    //     if(addData.new_shelf_life){
    //       msgStr += `商品过期时间更新为：${that.data.newShelfDueDate}；`;
    //     }
    //     if(addData.new_stock_life){
    //       msgStr += `库存过期时间为：${that.data.newStockDueDate}；`;
    //     }
    //   }else{
    //     msgStr = '请仔细确认信息，是否确认？';
    //   }
    // }
    let msgStr = ''
    if(addData.qa_type === 'daily_qa'){
       msgStr = `请仔细确认信息，抽检数量为${addData.qa_sample_num}件，不合格数量为${addData.un_qa_num}件，是否确认？`;
    }else if(addData.qa_type === 'due_date_modify'){
      if(detail.produce_date){
        msgStr = `请仔细确认信息，该批次所有商品的商品的生产日期更新为${addData.produce_date}，是否确认？`;
      }else{
        msgStr = `请仔细确认信息，该批次所有商品的商品过期时间更新为${that.data.newShelfDueDate}，库存过期时间为：${that.data.newStockDueDate}，是否确认？`;
      }
    }
    wx.showModal({
      title: '提示',
      content: msgStr,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
            that.supQualityAddSubmit();
        }
      }
    });
  },
  //品控变动 supQualityAdd
  supQualityAddSubmit(){
    let that = this;
    let { addData, detail, newShelfDueDate,newStockDueDate } = that.data;
    that.setData({ subLoading: false });
    let shelf_life,stock_life
    if(detail.produce_date){
      shelf_life = Number(detail.shelf_life)
      stock_life = Number(detail.stock_life)
    }else{
      shelf_life = Number(addData.new_shelf_life)
      stock_life = Number(addData.new_stock_life)
    }
    Http.post(Config.api.supQualityAdd, {
      ware_tray_item_id: detail.id,
      qa_type: addData.qa_type,
      shelf_life: shelf_life,
      stock_life: stock_life,
      qa_sample_num: Number(addData.qa_sample_num),
      un_qa_num: Number(addData.un_qa_num),
      produce_date:addData.produce_date,
      remark: addData.remark,
      ware_tray_item_num: Number(detail.num) || 0
    }).then((res)=>{
      that.setData({ subLoading: false });
      let page = that.getPage('packageWarehouse/pages/trayDetail/trayDetail');
      if(page){
        page.supWareTrayDetail();
      }else{
        page = that.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
        if(page){
          page.getData();
        }
      }
      wx.navigateBack();
      wx.showToast({
        title: '品控成功',
        icon: 'none'
      });
    }).catch(error => {
      that.setData({ subLoading: false });
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})