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
      supplier: {},
      storehouse: {},
      item: {}
    },
    purchasePlaceTypeData: Constant.PURCHASE_PLACE_TYPE('list'),
    purchasePlaceType: Constant.PURCHASE_PLACE_TYPE(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      this.getDetail(options.id);
    });
  },
  //获取详情
  getDetail(id){
    let that = this;
    wx.showNavigationBarLoading();
    Http.get(Config.api.fromSupplierOrderDetail, { id }).then(res => {
      let rd = res.data;
      rd.price_buy = Util.returnPrice(rd.price_buy);
      that.setData({addData: rd});
      wx.hideNavigationBarLoading();
    }).catch(error => {
      wx.hideNavigationBarLoading();
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

  //提交数据
  handleAffirm(){
    let { addData } = this.data;
    let con = true;
    if(!addData.order_date){
      addData.order_date_error = '请选择采购日期';
      con = false;
    }
    // 产品需求去掉销售日期校验（v4.1）
    // if(!addData.available_date){
    //   addData.available_date_error = '请选择销售日期';
    //   con = false;
    // }
    if(!addData.estimate_arrive_at){
      addData.estimate_arrive_at_error = '请选择预计到货时间';
      con = false;
    }
    if(!addData.purchase_place_type){
      addData.purchase_place_type_error = '请选择采购地';
      con = false;
    }

    //判断商品
    if(addData.price_buy === ''){
      addData.price_buy_error = '请输入总金额';
      con = false;
    }else if(!Verification.isPrice(addData.price_buy)){
      addData.price_buy_error = '请输入正确的金额';
      con = false;
    }else if(Number(addData.price_buy) < 0){
      addData.price_buy_error = '总金额不能小于0';
      con = false;
    }

    if(!addData.num){
      addData.num_error = '请输入数量';
      con = false;
    }else if(!Verification.isNumber(addData.num) || Number(addData.num) <= 0){
      addData.num_error = '请输入正确的数量';
      con = false;
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
          this.fromSupplierOrderEdit();
        }
      }
    });
  },

  //修改采购单
  fromSupplierOrderEdit(){
    let that = this;
    let { addData } = that.data;
    that.setData({subLoading: true}, ()=>{
      Http.post(Config.api.fromSupplierOrderEdit, {
        ...addData,
        price_buy: Util.handlePrice(addData.price_buy),
        num: Number(addData.num),
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
        wx.showToast({ title: '已修改', icon: 'none' });
      }).catch(error => {
        that.setData({subLoading: false});
      });
    });
  }
})