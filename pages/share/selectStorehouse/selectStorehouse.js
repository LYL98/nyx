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
      condition: ''
    },
    dataItem: [],
    page: '',
    pageField: '',
    isAuth: false,
    provinceCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      let page = options.page || ''; //页面
      let pageField = options.pageField || ''; //页面字段
      let isAuth = !options.isAuth || options.isAuth === '0' ? false : true; //是否数据权限
      let provinceCode = options.provinceCode || ''; //省份
      this.setData({page, pageField, isAuth, provinceCode}, ()=>{
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
    let { isAuth, query, provinceCode } = that.data;
    wx.showNavigationBarLoading();
    Http.get(isAuth ? Config.api.baseSupStorehouseList : Config.api.baseStorehouseList, query).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
      if(provinceCode){
        rd = rd.filter(item => item.province_code === provinceCode);
      }
      that.setData({ dataItem: rd });
    }).catch((error)=>{
      wx.hideNavigationBarLoading();
    });
  },

  //选择仓
  selectStorehouse(e){
    let index = e.currentTarget.dataset.index;
    let { page, pageField, dataItem } = this.data;
    let data = dataItem[index], pc = null;
    switch(page){
      //商品 - 采购 - 新增预采
      case 'globalAdd':
        pc = this.getPage('packageItem/pages/purchase/globalAdd/globalAdd');
        if(pc){
          let { addData } = pc.data;
          if(addData.storehouse_id !== data.id){
            addData.c_items = [{c_item_id: '', num: '', price_buy: ''}]
          }
          addData.storehouse_id = data.id;
          addData.storehouse_id_error = '';
          addData.storehouse_title = data.title;
          pc.setData({ addData });
          wx.navigateBack();
        }
        break;
      //商品 - 调拨 - 新增调拨计划
      case 'planAdd':
        pc = this.getPage('packageItem/pages/distribute/planAdd/planAdd');
        if(pc){
          let { addData } = pc.data;
          addData[`${pageField}_id`] = data.id;
          addData[`${pageField}_id_error`] = '';
          addData[`${pageField}_title`] = data.title;
          pc.setData({ addData });
          wx.navigateBack();
        }
        break;
      default:
        wx.navigateBack();
    }
  }
  
})