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
      condition: '',
      is_audited: 1,
      is_freeze: 0,
      need_num: 100
    },
    dataItem: [],
    from: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      this.setData({ from: options.from });
    });
  },

  //获取数据
  getData(){
    let that = this;
    wx.showNavigationBarLoading();
    that.setData({
      loading: true
    }, ()=>{
      Http.get(Config.api.baseDistributorList, that.data.query).then(res => {
        that.setData({ dataItem: res.data });
        wx.hideNavigationBarLoading();
      }).catch((error)=>{
        wx.hideNavigationBarLoading();
      });
    });
  },
  
  //选择司机
  selectDriver(e){
    let d = e.currentTarget.dataset.item;
    let { from } = this.data;
    //暂无用
    if(from === 'xxx'){
      let page = this.getPage('packageWarehouse/pages/xxx/xxx');
      if(page){
        wx.navigateBack();
      }
    }
  }
})