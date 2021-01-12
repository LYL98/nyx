const app = getApp();
import { Config, Http, Util, Verification, Constant } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    isShowCalendar: false,
    selectCalendarType: '', //选择日期的字段
    isShowTime: false,
    estimateArriveAtTemp: '',
    addData: {
      custom_type: '',
      supplier_id: '',
      order_date: '',
      available_date: null,
      estimate_arrive_at: '',
      storehouse_id: '',
      c_items: [{c_item_id: '', num: '', price_buy: ''}],
      purchase_place_type: ''
    },
    purchasePlaceTypeData: Constant.PURCHASE_PLACE_TYPE('list'),
    purchasePlaceType: Constant.PURCHASE_PLACE_TYPE(),

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      this.setData({ 'addData.custom_type': options.custom_type });
    });
  },
  //显示选择日期
  showSelectCalendar(e){
    let type = e.currentTarget.dataset.type;
    let dateTemp = this.data.addData[type] || '';
    if(type === 'estimate_arrive_at' && dateTemp){
      dateTemp = Util.returnDateFormat(dateTemp, 'yyyy-MM-dd');
    }
    this.setData({ isShowCalendar: true, selectCalendarType: type, dateTemp });
  },
  //隐藏选择日期
  cancelSelectCalendar(){
    this.setData({ isShowCalendar: false });
  },
  //选择日历后回调
  selectCalendar(e){
    this.cancelSelectCalendar();
    let { addData, selectCalendarType } = this.data;
    //预计到货日期
    if(selectCalendarType === 'estimate_arrive_at'){
      this.setData({ estimateArriveAtTemp: e.detail, isShowTime: true });
    }else{
      addData[selectCalendarType] = e.detail;
      addData[selectCalendarType + '_error'] = '';
      this.setData({ addData });
    }
  },
  //隐藏选择时间
  cancelSelectTime(){
    this.setData({ isShowTime: false });
  },
  //选择时间
  selectTime(e){
    this.cancelSelectTime();
    let { addData, estimateArriveAtTemp } = this.data;
    addData.estimate_arrive_at = estimateArriveAtTemp + ' ' + e.detail;
    addData.estimate_arrive_at_error = '';
    this.setData({ addData, timeTemp: e.detail });
  },
  //选择采购地类型
  bindPurchaseChange(e){
    let index = e.detail.value;
    let { addData, purchasePlaceTypeData } = this.data;
    addData.purchase_place_type = purchasePlaceTypeData[index].key;
    addData.purchase_place_type_error = '';
    this.setData({ addData });
  },

  //增加商品
  addItem(){
    let { addData } = this.data;
    if(!addData.supplier_id){
      wx.showToast({
        title: '请先选择供应商',
        icon: 'none'
      });
      return;
    }
    addData.c_items.push({c_item_id: '', num: '', price_buy: ''});
    this.setData({ addData });
  },

  //删除商品
  deleteItem(e){
    let index = e.currentTarget.dataset.index;
    let { addData } = this.data;
    addData.c_items.remove(index);
    this.setData({ addData });
  },

  //跳转页面
  skipPage(e){
    let url = e.currentTarget.dataset.page;
    let { addData } = this.data;
    if(url.indexOf('selectGItem') >= 0 && (!addData.supplier_id || !addData.storehouse_id)){
      wx.showToast({ title: '请先选择供应商和送达仓', icon: 'none' });
      return;
    }
    wx.navigateTo({ url });
  },

  //提交数据
  handleAffirm(){
    let { addData } = this.data;
    let con = true;
    if(!addData.supplier_id){
      addData.supplier_id_error = '请选择供应商';
      con = false;
    }

    if(!addData.order_date){
      addData.order_date_error = '请选择采购日期';
      con = false;
    }
    
    if(!addData.estimate_arrive_at){
      addData.estimate_arrive_at_error = '请选择预计到货时间';
      con = false;
    }
    if(!addData.storehouse_id){
      addData.storehouse_id_error = '请选择送达仓';
      con = false;
    }
    if(!addData.purchase_place_type){
      addData.purchase_place_type_error = '请选择采购地';
      con = false;
    }

    //判断商品
    for(let i = 0; i < addData.c_items.length; i++){
      let d = addData.c_items[i];
      if(!d.c_item_id){
        d.c_item_id_error = '请选择商品';
        con = false;
      }
      if(d.price_buy === ''){
        d.price_buy_error = '请输入采购价';
        con = false;
      }else if(!Verification.isPrice(d.price_buy)){
        d.price_buy_error = '请输入正确的金额';
        con = false;
      }else if(Number(d.price_buy) < 0){
        d.price_buy_error = '采购价不能小于0';
        con = false;
      }

      if(!d.num){
        d.num_error = '请输入数量';
        con = false;
      }else if(!Verification.isNumber(d.num) || Number(d.num) <= 0){
        d.num_error = '请输入正确的数量';
        con = false;
      }
    }

    if(!con){
      this.setData({ addData });
      wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确认提交采购信息？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success: (res)=>{
        if (res.confirm) {
          this.fromSupplierOrderAdd();
        }
      }
    });
  },

  //提交采购单
  fromSupplierOrderAdd(){
    let that = this;
    let { addData } = that.data;
    let cItems = [];
    for(let i = 0; i < addData.c_items.length; i++){
      let d = addData.c_items[i];
      cItems.push({
        ...d,
        price_buy: Util.handlePrice(d.price_buy),
        num: Number(d.num)
      });
    }
    that.setData({subLoading: true}, ()=>{
      Http.post(Config.api.fromSupplierOrderAdd, {
        ...addData,
        c_items: cItems,
        available_date: addData.available_date || null
      }).then(res => {
        let pc = this.getPage('packageItem/pages/purchase/index/index');
        let com = this.getPageComponent(pc, 'global');
        if(com){
          com.setData({
            'query.page': 1
          }, ()=>{
            com.getData();
          });
        }
        that.setData({subLoading: false});
        wx.navigateBack();
        wx.showToast({ title: '已新增', icon: 'none' });
      }).catch(error => {
        that.setData({subLoading: false});
      });
    });
  }
})