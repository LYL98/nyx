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
    itemData: {
      fisrt_system_class: {
        qa_rate: 0,
        has_produce_date: false
      },
      system_class: {
        qa_rate: 0,
        qa_standard: ''
      },
      images: [],
      content: ''
    },
    inventoryData: {
      produce_date: null,
      purchase_order_id: '',
      un_qa_num: null,
      qa_sample_num: null,
      shelf_life: null,
      stock_life: null,
      remark: '',

      length:'',
      width:'',
      height:'',
      store_env:'',
      pro_package:'',
      stack_code_level:'',
      inout_stock_level:''
    },
    lifeDesabled: false, //库存期、保质期禁用,
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
      that.handleResData(rd, ()=>{
        that.supPItemDetail();
      });
      that.setData({
        inventoryData: {
          ...inventoryData,
          purchase_order_id: rd.id,
          produce_date: rd.produce_date || null,
          shelf_life: rd.shelf_life,
          stock_life: rd.stock_life,

          
        }
      });
    }).catch(error => {
      that.handleResError(error);
    });
  },
  //商品信息，用于入库 时候查看其一级科学分类，库存期，保质期
  supPItemDetail(){
    let that = this;
    let { inventoryData, detail, lifeDesabled } = that.data;
    Http.get(Config.api.supPItemDetail, {
      c_item_id: detail.c_item_id
    }).then(res => {
      let rd = res.data;
      //第一次品控
      if(!detail.stock_due_date){
        inventoryData.shelf_life = rd.shelf_life;
        inventoryData.stock_life = rd.stock_life;
      }

      if(rd.fisrt_system_class.has_produce_date){
        lifeDesabled = true;
      }else{
        lifeDesabled = false;
      }
      //处理图片尺寸
      if(rd.system_class.qa_standard){
        rd.system_class.qa_standard = rd.system_class.qa_standard.replace(/<img/g, '<img style="width:100%;height:auto" ');
      }
      if(rd.content){
        rd.content = rd.content.replace(/<img/g, '<img style="width:100%;height:auto" ');
      }

      inventoryData.length = rd.length;
      inventoryData.width = rd.width;
      inventoryData.height = rd.height;
      inventoryData.store_env = rd.store_env;
      inventoryData.pro_package = rd.pro_package;
      inventoryData.stack_code_level = rd.stack_code_level;
      inventoryData.inout_stock_level = rd.inout_stock_level;
      
      this.setData({ lifeDesabled, inventoryData, itemData: rd });
    });
  },
  //显示选择日期
  showSelectCalendar(){
    this.setData({ isShowCalendar: true });
  },
  //隐藏选择日期
  cancelSelectCalendar(){
    this.setData({ isShowCalendar: false });
  },
  //选择日历后回调
  selectCalendar(e){
    this.cancelSelectCalendar();
    let { inventoryData } = this.data;
    inventoryData.produce_date = e.detail;
    inventoryData.produce_date_error = '';
    this.setData({ inventoryData });
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

  //提交数据
  addEditData(){
    let { inventoryData, detail, itemData } = this.data;
    let con = true, d = inventoryData;

    if(!Verification.isNumber(d.qa_sample_num)){
      d.qa_sample_num_error = '请输入正确的数量';
      con = false;
    }else if(Number(d.qa_sample_num) > detail.num - detail.num_in){
      d.qa_sample_num_error = '不能大于可收货数量';
      con = false;
    }else if(Number(d.qa_sample_num) < 1){
      d.qa_sample_num_error = '品控抽检数量不能小于1件';
      con = false;
    }
    
    if(!Verification.isNumber(d.un_qa_num)){
      d.un_qa_num_error = '请输入正确的数量';
      con = false;
    }else if(Number(d.un_qa_num) > detail.num - detail.num_in){
      d.un_qa_num_error = '不能大于可收货数量';
      con = false;
    }
    
    if(itemData.fisrt_system_class.has_produce_date && !d.produce_date){
      d.produce_date_error = '请选择生产日期';
      con = false;
    }
    if(typeof d.shelf_life === 'string' && !Verification.isNumber(d.shelf_life)){
      d.shelf_life_error = '请输入保质期天数';
      con = false;
    }
    if(typeof d.stock_life === 'string' && !Verification.isNumber(d.stock_life)){
      d.stock_life_error = '请输入库存期天数';
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
      return;
    }


    wx.showModal({
      title: '提示',
      content: '确认提交品控信息？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success: (res)=>{
        if (res.confirm) {
          this.supQualityPurAdd();
        }
      }
    });
  },

  //确认品控
  supQualityPurAdd(){
    let that = this;
    let { inventoryData } = that.data;
      // inventoryData.length = inventoryData.length === null ? null : Number(inventoryData.length);
      // inventoryData.width = inventoryData.width === null ? null : Number(inventoryData.width);
      // inventoryData.height = inventoryData.height === null ? null : Number(inventoryData.height);
      // inventoryData.stack_code_level = inventoryData.stack_code_level === null ? null : Number(inventoryData.stack_code_level);
      // inventoryData.inout_stock_level = inventoryData.inout_stock_level === null ? null : Number(inventoryData.inout_stock_level);

    that.setData({submitLoading: true}, ()=>{
      Http.post(Config.api.supQualityPurAdd, {
        ...Util.mapToNumbers(inventoryData, ['qa_sample_num', 'un_qa_num', 'shelf_life', 'stock_life'])
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
          title: '已品控',
          icon: 'none'
        });
      }).catch(error => {
        that.setData({submitLoading: false});
      });
    });
  }
})