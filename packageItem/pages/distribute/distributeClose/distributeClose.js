import { Config, Http } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    type: '', //'plan'
    addData: {
      remark: '',
      remark_error: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = Number(options.id);
    let type = options.type;
    this.setData({ id, type });
  },

  //确认
  handleAffirm(){
    let that = this;
    let { addData, id, type } = that.data;
    let con = true;
    if(!addData.remark){
      addData.remark_error = '请输入备注';
      con = false;
    }
    if(!con){
      that.setData({ addData });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确认关闭？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          let apis = {
            'plan': Config.api.supDistributePlanClose
          }
          that.setData({ subLoading: true }, ()=>{
            Http.post(apis[type], {
              ...addData,
              ids: [id]
            }).then(res => {
              that.setData({ subLoading: false });
              let page = that.getPage('packageItem/pages/distribute/index/index');
              if(page){
                let com = that.getPageComponent(page, type);
                if(com){
                  com.setData({ 'query.page': 1 }, ()=>{
                    com.getData();
                  });
                }
              }
              wx.navigateBack();
              wx.showToast({
                title: '已关闭',
                icon: 'none'
              });
            }).catch(error => {
              that.setData({ subLoading: false });
            });
          });
        }
      }
    });
  },
})