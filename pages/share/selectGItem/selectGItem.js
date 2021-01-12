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
      need_num: 20,
      condition: '',
      supplier_id: '',
      sup_type: '',
      is_deleted: '', //''：全部，0：未删除，1：已删除
      custom_type: '', //A：全部，B：商城，C：零售
    },
    dataItem: [],
    page: '',
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      let page = options.page || ''; //页面
      let index = options.index ? Number(options.index) : 0; //页面上的数据列下标
      let supplierId = options.supplierId ? Number(options.supplierId) : ''; //供应商
      let storehouseId = options.storehouseId ? Number(options.storehouseId) : ''; //送达仓
      let supType = options.supType ? options.supType : ''; //供应商类型
      let isDeleted = typeof options.isDeleted === 'undefined' ? '' : options.isDeleted; //是否已删除
      let customType = options.customType ? options.customType : ''; //商品类型
      let { query } = this.data;
      query.supplier_id = supplierId;
      query.storehouse_id = storehouseId;
      query.sup_type = supType;
      query.is_deleted = isDeleted;
      query.custom_type = customType;
      this.setData({page, index, query}, ()=>{
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
    Http.get(Config.api.baseGItemList, that.data.query).then(res => {
      wx.hideNavigationBarLoading();
      that.setData({ dataItem: res.data });
    }).catch((error)=>{
      wx.hideNavigationBarLoading();
    });
  },

  //选择商品
  selectItem(e){
    let i = e.currentTarget.dataset.index;
    let { page, dataItem, index } = this.data;
    let data = dataItem[i], pc = null;
    switch(page){
      //商品 - 采购 - 新增预采
      case 'globalAdd':
        pc = this.getPage('packageItem/pages/purchase/globalAdd/globalAdd');
        if(pc){
          let { addData } = pc.data;
          let con = addData.c_items.filter(item => item.c_item_id === data.c_item_id);
          if(con.length > 0){
            wx.showToast({
              title: '您已选择过该商品',
              icon: 'none'
            });
            return;
          }
          addData.c_items[index].c_item_id = data.c_item_id;
          addData.c_items[index].c_item_id_error = '';
          addData.c_items[index].c_item_title = data.title;
          addData.c_items[index].frame_id = data.frame_id;
          addData.c_items[index].frame_price = data.frame.price;
          pc.setData({ addData });
          wx.navigateBack();
        }
        break;
      //商品 - 调拨 - 新增、修改调拨计划
      case 'planAdd':
      case 'planEdit':
        pc = this.getPage(`packageItem/pages/distribute/${page}/${page}`);
        if(pc){
          let { addData } = pc.data;
          let con = addData.p_items.filter(item => item.c_item_id === data.c_item_id);
          if(con.length > 0){
            wx.showToast({
              title: '您已选择过该商品',
              icon: 'none'
            });
            return;
          }
          addData.p_items[index].c_item_id = data.c_item_id;
          addData.p_items[index].c_item_id_error = '';
          addData.p_items[index].item_title = data.title;
          pc.setData({ addData });
          wx.navigateBack();
        }
        break;
      default:
        wx.navigateBack();
    }
  }
  
})