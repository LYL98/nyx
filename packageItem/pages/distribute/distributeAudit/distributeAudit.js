import { Config, Http, Constant } from './../../../../utils/index';
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
      audit_status: 'audit_success',
      remark: ''
    },
    auditStatusList: (()=>{
      let d =  Constant.AUDIT_STATUS('list');
      d.remove(0);
      return d;
    })(),
    auditStatus: Constant.AUDIT_STATUS(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = Number(options.id);
    let type = options.type;
    this.setData({ id, type });
  },

  //选择类型
  selectAuditStatus(e){
    let { addData, auditStatusList } = this.data;
    let index = e.detail.value;
    addData.audit_status = auditStatusList[index].key;
    this.setData({ addData });
  },

  //确认
  handleAffirm(){
    let that = this;
    let { addData, id, type } = that.data;
    wx.showModal({
      title: '提示',
      content: '确认提交审核？',
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          let apis = {
            'plan': Config.api.supDistributePlanAudit
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
                title: '已审核',
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