const app = getApp();
import { Config, Http, Util, Verification, Constant } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    isShowAffirm: false,
    inventoryData: {
      accept_type: '',
      purchase_order_id: '',
      num_arrive: null,
      num_accept: null,
      remark: '',

      length:'',
      width:'',
      height:'',
      store_env:'',
      pro_package:'',
      stack_code_level:'',
      inout_stock_level:''
    },
    detail: {
      accepts: [],
      qa_records: []
    },
    type: 'submit', //收货并入库inStorage；收货submit
    storageData: Constant.STORAGE_TYPE('list'),
    productData: Constant.PRODUCT_PACKAGING('list'),
    storageType:Constant.STORAGE_TYPE(),
    productType: Constant.PRODUCT_PACKAGING(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    wx.showNavigationBarLoading();
    this.setData({
      loading: true,
      appError: ''
    }, ()=>{
      app.signIsLogin((res)=>{
        this.getData(id);
      });
    });
  },
  //获取数据
  getData(id){
    let that = this;
    let { inventoryData } = that.data;
    Http.get(Config.api.fromSupplierOrderDetail, { id }).then(res => {
      let rd = res.data;
      that.handleResData(rd);
      that.setData({
        inventoryData: {
          ...inventoryData,
          purchase_order_id: rd.id,

          length:rd.item.length,
          width:rd.item.width,
          height:rd.item.height,
          store_env:rd.item.store_env,
          pro_package:rd.item.pro_package,
          stack_code_level:rd.item.stack_code_level,
          inout_stock_level:rd.item.inout_stock_level,
        }
      });
    }).catch(error => {
      that.handleResError(error);
    });
  },

  //显示或隐藏确认
  showHideAffirm(){
    this.setData({
      isShowAffirm: !this.data.isShowAffirm
    });
  },

  //选择存储环境类型
  selectStorageData(e){
    let index = e.detail.value;
    let { inventoryData, storageData } = this.data;
    inventoryData.store_env = storageData[index].key;
    // inventoryData.type_error = '';
    this.setData({ inventoryData });
  },
//选择包装
  selectProductData(e){
    let index = e.detail.value;
      let { inventoryData, productData } = this.data;
      inventoryData.pro_package = productData[index].key;
      // inventoryData.type_error = '';
      this.setData({ inventoryData });
  },

  //校验
  verificationData(){
    let { inventoryData, detail } = this.data;
    let con = true, d = inventoryData;
    if(!Verification.isNumber(d.num_arrive)){
      d.num_arrive_error = '请输入正确的数量';
      con = false;
    }else if(Number(d.num_arrive) > detail.num - detail.num_in){
      d.num_arrive_error = '不能大于可收货数量';
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
    }else if(detail.purchase_place_type !== 'origin' && Number(d.num_accept) < 1){ //异地采购收货可以为0
      d.num_accept_error = '收货数量不能小于1件';
      con = false;
    }

    if(d.length && !Verification.isNumber(d.length)){
      d.length_error = '请输入长度';
      con = false;
    }
    if(d.width && !Verification.isNumber(d.width)){
      d.width_error = '请输入宽度';
      con = false;
    }
    if(d.height && !Verification.isNumber(d.height)){
      d.height_error = '请输入高度';
      con = false;
    }
    if(d.stack_code_level && !Verification.isNumber(d.stack_code_level)){
      d.stack_code_level_error = '请输入堆码等级';
      con = false;
    }
    if(d.inout_stock_level && !Verification.isNumber(d.inout_stock_level)){
      d.inout_stock_level_error = '请输入出入库等级';
      con = false;
    }
    
    if(!con){
      this.setData({ inventoryData: d });
      wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
    }
    return con;
  },

  //提交数据
  addEditData(e){
    let { inventoryData, detail } = this.data;
    if(!this.verificationData()){
      return;
    }
    let type = e.currentTarget.dataset.type; //收货并入库inStorage；收货submit
    this.setData({ type });

    let isAfterHave = false; //后面是否会来货

    if(detail.num !== Number(inventoryData.num_accept) + detail.num_in){
      isAfterHave = true;
    }

    console.log(isAfterHave);
    //异地采购 不会多次收货
    if(detail.purchase_place_type === 'origin'){
      isAfterHave = false
    }

    if(isAfterHave){
      this.showHideAffirm();
    }else{

      let content = `采购数量:${detail.num}件、实际收货:${detail.num}件,确认收货后该采购单将采购完成`;
      //异地采购
      if(detail.purchase_place_type === 'origin'){
        content = `采购数量:${detail.num}件、实际收货:${inventoryData.num_arrive}件,确认收货后该采购单将采购完成`;
      }
      //如品控不合格，但收货，提示
      if(Number(inventoryData.num_arrive) < detail.un_qa_num + Number(inventoryData.num_accept)){
        content = `到货数量${inventoryData.num_arrive}件，品控不合格${detail.un_qa_num}件,收货数量:${inventoryData.num_accept}件，是否确认收货数量正常`;
      }
      let acceptType = 'all_accept';
      //异地采购收货,传 after_no
      if(detail.purchase_place_type === 'origin'){
        acceptType = 'after_no'
      }
      wx.showModal({
        title: '提示',
        content: content,
        confirmText: type === 'inStorage' ? '收货入库' : '确认',
        confirmColor: '#00ADE7',
        success: (res)=>{
          if (res.confirm) {
            //收货并入库
            if(type === 'inStorage'){
              wx.navigateTo({
                url: `/packageOperate/pages/receiving/receiving-in-storage/receiving-in-storage?type=purchase&accept_type=${acceptType}`
              });
            }
            //收货
            if(type === 'submit'){
              this.supAcceptPurAdd();
            }
          }
        }
      });
    }
  },

  //确认收货
  supAcceptPurAdd(e){
    let that = this;
    let { inventoryData, type, detail } = that.data;

      // inventoryData.length = inventoryData.length === null ? null : Number(inventoryData.length);
      // inventoryData.width = inventoryData.width === null ? null : Number(inventoryData.width);
      // inventoryData.height = inventoryData.height === null ? null : Number(inventoryData.height);
      // inventoryData.stack_code_level = inventoryData.stack_code_level === null ? null : Number(inventoryData.stack_code_level);
      // inventoryData.inout_stock_level = inventoryData.inout_stock_level === null ? null : Number(inventoryData.inout_stock_level);

    let acceptType = 'all_accept'; //全部入库
    if(e){
      acceptType = e.currentTarget.dataset.acceptType;
    }
    //异地采购收货,传 after_no
    if(detail.purchase_place_type === 'origin'){
      acceptType = 'after_no'
    }
    //如果是收货并入库
    if(type === 'inStorage'){
      wx.navigateTo({
        url: `/packageOperate/pages/receiving/receiving-in-storage/receiving-in-storage?type=purchase&accept_type=${acceptType}`
      });
      return;
    }
    that.setData({submitLoading: true}, ()=>{
      Http.post(Config.api.supAcceptPurAdd, {
        ...Util.mapToNumbers(inventoryData, ['num_arrive', 'num_accept']),
        accept_type: acceptType
      }).then(res => {
        let page = that.getPage('packageOperate/pages/receiving/index/index');
        if(page){
          let com = that.getPageComponent(page, 'purchase');
          if(com){
            com.setData({ 'query.page': 1}, ()=>{
              com.getData();
            });
          }
        }
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