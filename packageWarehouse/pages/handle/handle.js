

const app = getApp();
import { Config, Http, Constant, Verification, Util } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';
Page({
  behaviors: [ Base, Detail ],

  /**
   * 页面的初始数据
   */
  data: {
    rangeData: Constant.DAMAGED_TYPES('list'),
    subLoading: false,
    detail:{},
    addData:{
      handle_num:'',
      type:'',
      sale_amount:'',
      remark:'',
    },
    optTypes: Constant.DAMAGED_TYPES()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '处理'
    });
    let { from, id } = options;
    // that.setData({fromPage: from})
    app.signIsLogin((res)=>{
      this.getData(from,id);
    });
  },
   //获取数据
   getData(from, id){
    let { detail } = this.data;
    let that = this;
    wx.showNavigationBarLoading();
    that.setData({
      loading: true
    }, ()=>{
      Http.get(Config.api.trashDetail, {id: id}).then(res => {

        that.handleResData(res.data);
      }).catch((error)=>{
        that.handleResError(error);
      });
    });

    this.setData({detail});
  },
  //输入数量
  inputNum(e){
    this.inputChange(e, (v)=>{
      let { detail, addData } = this.data;
      if(!v || !Verification.isNumber(v)){
        this.setData({ 'addData.handle_num_later': '-' });
      }else{
        let num = 0;
        num = detail.num - Number(v);
        this.setData({ 'addData.handle_num_later': num + '件' });
      }
    });
  },
  //选择处理类型
  changeOrderType(e){
    let index = e.detail.value;
    let { addData, rangeData } = this.data;
    addData.type = rangeData[index].key;
    addData.type_error = '';
    this.setData({ addData });
  },
  //确认
  handleAffirm(){
    let that = this;
    let { addData,detail } = that.data;
    let con = true;
    if(!addData.type){
      addData.type_error = '请选择处理类型';
      con = false;
    }
    //线下销售
    if(addData.type === 'offline_sale'){
      
      if(!Verification.isPrice(addData.sale_amount)){
        addData.sale_amount_error = '请输入正确的数值(最多保留两位小数)';
        con = false;
      }
    }
    if(!Verification.isNumber(addData.handle_num)){
      addData.handle_num_error = '请输入正确的数值';
      con = false;
    } else if(!addData.handle_num || Number(addData.handle_num) === 0){
      addData.handle_num_error = '不能小于1件';
      con = false;
    }else if(Number(addData.handle_num) > Number(detail.num)){
      addData.handle_num_error = '处理数量不得大于总数量';
      con = false;
    }
    if(!con){
      that.setData({ addData });
      return;
    }
    let msgStr = `请仔细确认信息，处理数量为${addData.handle_num}件`;
    if(addData.type === 'offline_sale'){
      msgStr +=  `,销售金额为：${addData.sale_amount ? addData.sale_amount + '元' : '0' }`;
    }
    msgStr += '，是否确认？';
    wx.showModal({
      title: '提示',
      content: msgStr,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.commonSubmit();
        }
      }
    });
  },
  //确认处理
  commonSubmit(){
    let that = this
    let { detail, addData } = that.data;
    that.setData({ subLoading: false });
    Http.post(Config.api.trashHandle, {
      id: detail.id,
      type: addData.type,
      sale_amount: Util.handlePrice(addData.sale_amount),
      remark: addData.remark,
      handle_num: Number(addData.handle_num)
    }).then((res)=>{
      that.setData({ subLoading: false });
        let pc = that.getPage('packageWarehouse/pages/damaged/index/index');
        let com = this.getPageComponent(pc, 'initDamaged');
        if(com){
          com.setData({
            'query.page': 1
          }, ()=>{
            com.getData();
          });
        }
      wx.navigateBack();
      wx.showToast({
        title: '处理成功',
        icon: 'none'
      });
    }).catch(error => {
      that.setData({ subLoading: false });
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})