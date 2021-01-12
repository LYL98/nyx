

const app = getApp();
import { Config, Http, Constant, Verification, Util } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';
Page({
  behaviors: [ Base, Detail ],

  /**
   * 页面的初始数据
   */
  data: {
    subLoading: false,
    detail:{},
    selectStorehouse:{},
    addData:{
      storehouse_id: '',
      warehouse_title:'',
      choose_num:'',
      remark:'',
      warehouse_id:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.setNavigationBarTitle({
      title: '二次挑拣'
    });
    let { from, id } = options;
    let {addData} = this.data
    let page = this.getPage('packageWarehouse/pages/index/index');
    let selectStorehouse = {};
    if(page){
      selectStorehouse = page.data.selectStorehouse;
      addData.storehouse_id = selectStorehouse.id;
    }
    that.setData({selectStorehouse, addData},()=>{
      app.signIsLogin((res)=>{
        this.getData(from, id);
      });
    })
    
  },


   //获取数据
   getData(from, id){
    let { detail } = this.data;
      // let dPage = this.getPage('packageWarehouse/pages/damaged/damaged');
      // if(dPage){
      //   detail = dPage.data.dataItem.items[index];
      // }
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
        this.setData({ 'addData.choose_num_later': '-' });
      }else{
        let num = 0;
        num = detail.num - Number(v);
        this.setData({ 'addData.choose_num_later': num + '件' });
      }
    });
  },
  //选择仓库
  changeWarehouse(e){
    let { addData } = this.data
    let index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    addData.warehouse_title = value.title
    addData.warehouse_id= value.id
    addData.warehouse_id_error= ''
    this.setData({addData})
    console.log(addData);
    
    // this.supWareTrayDetail(value[1], 'edit', index);
  },
  //确认
  handleAffirm(){
    let that = this;
    let { addData,detail } = that.data;
    let con = true;
    if(!addData.warehouse_id){
      addData.warehouse_id_error = '请选择要入的库';
      con = false;
    }
    if(!Verification.isNumber(addData.choose_num)){
      addData.choose_num_error = '请输入正确的数值';
      con = false;
    }else if(!addData.choose_num || Number(addData.choose_num) === 0){
      addData.choose_num_error = '不能小于1件';
      con = false;
    }else if(Number(addData.choose_num) > Number(detail.num)){
      addData.choose_num_error = '挑拣数量不得大于总数量';
      con = false;
    }
    if(!con){
      that.setData({ addData });
      return;
    }
    let msgStr = `请仔细确认信息，挑拣数量为${addData.choose_num}件`;
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
  //确认挑拣
  commonSubmit(){
    let that = this
    let { detail, addData } = that.data;
    that.setData({ subLoading: false });
    Http.post(Config.api.trashSecondChoose, {
      id: detail.id,
      choose_num: Number(addData.choose_num),
      remark: addData.remark,
      warehouse_id: addData.warehouse_id
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
        title: '二次挑拣成功',
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