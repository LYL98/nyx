const app = getApp();
import { Config, Http, Util, Verification, Constant } from '../../../../utils/index';
import { Base, Detail } from '../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    isShowNo: false,
    inventoryData: {
      distribute_order_id: '',
      num_arrive: null,
      num_accept: null,
      un_qa_num: 0,
      remark: '',
    },
    lifeDesabled: false, //库存期、保质期禁用
    detail: {
      accepts: [],
      qa_records: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showNavigationBarLoading();
    this.setData({
      loading: true,
      appError: ''
    }, ()=>{
      app.signIsLogin((res)=>{
        this.getData(options.id);
      });
    });
  },
  //获取数据
  getData(id){
    let that = this;
    let { inventoryData } = that.data;
    Http.get(Config.api.supAcceptDistDetail, { id }).then(res => {
      let rd = res.data;
      that.handleResData(rd);
      that.setData({
        inventoryData: {
          ...inventoryData,
          distribute_order_id: rd.id
        }
      });
    }).catch(error => {
      that.handleResError(error);
    });
  },
  //数量输入
  numInput(e){
    this.inputChange(e, ()=>{
      this.showHideNo();
    });
  },
  //显示或隐藏处理
  showHideNo(){
    let { isShowNo, inventoryData, detail } = this.data;
    let d = inventoryData;
    //到货数量小于或等于可到货数量 && 到货数量大于合格数量
    if(Verification.isNumber(d.num_arrive) && Verification.isNumber(d.num_accept) &&
      Number(d.num_arrive) <= detail.num &&
      Number(d.num_arrive) > Number(d.num_accept)){
        d.un_qa_num = Number(d.num_arrive) - Number(d.num_accept);
        isShowNo = true;
    }else{
      d.un_qa_num = 0;
      isShowNo = false;
    }
    if(this.myTime) clearTimeout(this.myTime);
    this.myTime = setTimeout(()=>{
      this.setData({ isShowNo, inventoryData: d });
    }, 800);
  },

  //验证数据
  verificationData(){
    let { inventoryData, detail } = this.data;
    let con = true, d = inventoryData;
    if(!Verification.isNumber(d.num_arrive)){
      d.num_arrive_error = '请输入正确的数量';
      con = false;
    }else if(Number(d.num_arrive) > detail.num){
      d.num_arrive_error = '不能大于调拨数量';
      con = false;
    }else if(Number(d.num_arrive) < 1){
      d.num_arrive_error = '到货数量不能小于1件';
      con = false;
    }
    
    if(!Verification.isNumber(d.num_accept)){
      d.num_accept_error = '请输入正确的数量';
      con = false;
    }else if(Number(d.num_accept) > Number(d.num_arrive)){
      d.num_accept_error = '不能大于到货数量';
      con = false;
    }
    
    if(!con){
      this.setData({ inventoryData: d });
      wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
    }
    return con;
  },

  //收货并入库
  addEditInStorage(){
    if(!this.verificationData()){
      return;
    }
    wx.navigateTo({
      url: '/packageOperate/pages/receiving/receiving-in-storage/receiving-in-storage?type=distribute'
    });
  },

  //提交数据
  addEditData(){
    if(!this.verificationData()){
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确认收货？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success: (res)=>{
        if (res.confirm) {
          this.supAcceptDistributeAdd();
        }
      }
    });
  },

  //确认收货
  supAcceptDistributeAdd(){
    let that = this;
    let { inventoryData } = that.data;
    that.setData({submitLoading: true}, ()=>{
      Http.post(Config.api.supAcceptDistributeAdd, {
        ...Util.mapToNumbers(inventoryData, ['num_arrive', 'num_accept', 'un_qa_num'])
      }).then(res => {
        let page = that.getPage('packageOperate/pages/receiving/index/index');
        if(page){
          let com = that.getPageComponent(page, 'distribute');
          if(com){
            com.setData({ 'query.page': 1}, ()=>{
              com.getData();
            });
          }
        }
        that.setData({submitLoading: false});
        wx.navigateBack();
        wx.showToast({
          title: '已收货',
          icon: 'none'
        });
      }).catch(error => {
        that.setData({submitLoading: false});
      });
    });
  }
})