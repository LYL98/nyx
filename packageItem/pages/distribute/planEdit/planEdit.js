const app = getApp();
import { Config, Http, Verification, Util } from './../../../../utils/index';
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
      src_storehouse_id: '',
      tar_storehouse_id: '',
      available_date: '',
      estimate_arrive_at: '',
      src_storehouse: {},
      tar_storehouse: {},
      p_items: []
    },
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
    Http.get(Config.api.supDistributePlanDetail, { id }).then(res => {
      let rd = res.data;
      rd.p_items.forEach(item => {
        item.item_title = item.item_title;
      });
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
  //增加商品
  addItem(){
    let { addData } = this.data;
    addData.p_items.push({c_item_id: '', num: ''});
    this.setData({ addData });
  },

  //删除商品
  deleteItem(e){
    let index = e.currentTarget.dataset.index;
    let { addData } = this.data;
    addData.p_items.remove(index);
    this.setData({ addData });
  },

  //跳转页面
  skipPage(e){
    let url = e.currentTarget.dataset.page;
    wx.navigateTo({ url });
  },

  //提交数据
  handleAffirm(){
    let { addData } = this.data;
    let con = true;
    if(!addData.available_date){
      addData.available_date_error = '请选择销售日期';
      con = false;
    }
    if(!addData.estimate_arrive_at){
      addData.estimate_arrive_at_error = '请选择预计到货时间';
      con = false;
    }

    //判断商品
    for(let i = 0; i < addData.p_items.length; i++){
      let d = addData.p_items[i];
      if(!d.c_item_id){
        d.c_item_id_error = '请选择商品';
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
      content: '确认提交调拨计划信息？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success: (res)=>{
        if (res.confirm) {
          this.supDistributePlanEdit();
        }
      }
    });
  },

  //提交调拨计划单
  supDistributePlanEdit(){
    let that = this;
    let { addData } = that.data;
    let pItems = [];
    for(let i = 0; i < addData.p_items.length; i++){
      let d = addData.p_items[i];
      pItems.push({
        ...d,
        num: Number(d.num)
      });
    }
    that.setData({subLoading: true}, ()=>{
      Http.post(Config.api.supDistributePlanEdit, {
        ...addData,
        p_items: pItems
      }).then(res => {
        let pc = this.getPage('packageItem/pages/distribute/index/index');
        let com = this.getPageComponent(pc, 'plan');
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