const app = getApp();
import { Config, Http } from './../../../utils/index';
import { Base } from './../../../behaviors/index';

Page({
  behaviors: [ Base ],
  /**
   * 页面的初始数据
   */
  data: {
    query: {
      is_audited: 1, // 是否审核通过？ 0 否 1 是 null 全部
      is_freeze: 0, // 是否冻结？ 0 否 1 是 null 全部
      need_num: 20,
      condition: ''
    },
    dataItem: [],
    page: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      let page = options.page || ''; //页面
      let { query } = this.data;
      if(options.custom_type){
        query.custom_type = 'A,' + options.custom_type;
      }
      this.setData({page, query}, ()=>{
        this.getData();
      });
    });
  },

  //输入框事件
  inputChange(e) {
    let value = e.detail.value;
    this.setData({
      'query.condition': value
    });
  },

  //搜索
  searchInputConfirm(){
    this.getData();
  },

  //获取数据
  getData(){
    let that = this;
    wx.showNavigationBarLoading();
    Http.get(Config.api.baseSupplierList, that.data.query).then(res => {
      wx.hideNavigationBarLoading();
      that.setData({ dataItem: res.data });
    }).catch((error)=>{
      wx.hideNavigationBarLoading();
    });
  },

  //选择供应商
  selectSupplier(e){
    let index = e.currentTarget.dataset.index;
    let { page, dataItem } = this.data;
    let data = dataItem[index], pc = null;
    switch(page){
      //商品 - 采购 - 新增预采
      case 'globalAdd':
        pc = this.getPage('packageItem/pages/purchase/globalAdd/globalAdd');
        if(pc){
          let { addData } = pc.data;
          if(addData.supplier_id !== data.id){
            addData.c_items = [{c_item_id: '', num: '', item_total_price: ''}];
          }
          addData.supplier_id = data.id;
          addData.supplier_id_error = '';
          addData.supplier_title = data.title;
          pc.setData({ addData });
          wx.navigateBack();
        }
        break;
      default:
        wx.navigateBack();
    }
  }
  
})