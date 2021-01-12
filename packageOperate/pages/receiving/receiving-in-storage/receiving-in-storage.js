const app = getApp();
import { Config, Http, Verification, Util } from './../../../../utils/index';
import { Base, Detail } from './../../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    subLoading: false,
    addData: {
      id: '', //tray_item_id
      warehouse_id: '',
      warehouse_title: '',
      trays: [], //[{tray_id: '', num: '', tray_code: ''}]
    },
    detail: {},
    inventoryData: {},
    selectStorehouseId: '',
    type: '',
    acceptType: '',
    isPutaway: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.signIsLogin((res)=>{
      this.setData({
        type: options.type,
        acceptType: options.accept_type || ''
      }, () => {
        this.getData();
      });
    });
  },

  //获取数据
  getData(){
    let { type } = this.data;
    //获取品控收货(仓)
    let page = this.getPage('packageOperate/pages/receiving/index/index');
    let pc = this.getPageComponent(page, type);
    if(pc){
      let selectStorehouseId = {
        'purchase': pc.data.query.storehouse_id,
        'distribute': pc.data.query.tar_storehouse_id
      }[type];
      this.setData({ selectStorehouseId });
    }

    //采购
    if(type === 'purchase'){
      let pPage = this.getPage('packageOperate/pages/receiving/purchase-receiv/purchase-receiv');
      if(pPage){
        this.setData({
          detail: pPage.data.detail,
          inventoryData: pPage.data.inventoryData,
        });
      }
    }
    //调拨
    else if(type === 'distribute'){
      let dPage = this.getPage('packageOperate/pages/receiving/distribute-receiv/distribute-receiv');
      this.setData({
        detail: dPage.data.detail,
        inventoryData: dPage.data.inventoryData,
      });
    }
  },

  //选择库
  changeWarehouse(e){
    let data = e.detail.value;
    let { addData, isPutaway } = this.data;
    addData.warehouse_id = data.id;
    addData.warehouse_title = data.title;
    addData.warehouse_id_error = '';
    addData.trays = isPutaway ? [{tray_id: '', num: '', tray_code: ''}] : [];
    this.setData({ addData });
  },

  //改变是否上架
  changeIsPutaway(e){
    let value = e.detail.value;
    let { addData } = this.data;
    if(!addData.warehouse_id && value){
      wx.showToast({
        title: '请先选择库',
        icon: 'none'
      });
      this.setData({
        isPutaway: false
      });
      return;
    }
    if(value){
      addData.trays = [{tray_id: '', num: '', tray_code: ''}];
    }else{
      addData.trays = [];
    }
    this.setData({
      isPutaway: value,
      addData
    });
  },


  //调起扫一扫
  handleScan() {
    wx.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        this.scancodeSuccess(res.result);
      },
    })
  },

  //扫码成功
  scancodeSuccess(result){
    if(result.indexOf('{') !== 0 || result.indexOf('}') !== result.length - 1){
      wx.showToast({
        title: '请扫专用二维码',
        icon: 'none'
      });
      return;
    }
    //JSON.parse(JSON.stringify(json))
    result = JSON.parse(result);
    if(result.type === 'tray'){
      this.supRelationCheck(result.id);
    }else{
      wx.showModal({
        title: '提示',
        content: '请扫托盘码',
        confirmText: '我知道了',
        confirmColor: '#00ADE7',
        showCancel: false
      });
    }
  },

  //关系校验
  supRelationCheck(id){
    let that = this;
    let { selectStorehouseId } = that.data;
    wx.showLoading({
      title: '请稍等...',
      mask: true,
      success(){
        Http.post(Config.api.supRelationCheck, {
          checks: [{
            c_type: 'tray_and_storehouse', //tray_and_storehouse、item_and_province、tray_and_item
            a_key: id,
            b_key: selectStorehouseId
          }]
        }).then(res => {
          wx.hideLoading();
          that.supWareTrayDetail(id, 'add');
        }).catch(error => {
          wx.hideLoading();
        });
      }
    });
  },

  //选择托盘
  changeTray(e){
    let index = e.currentTarget.dataset.index;
    let data = e.detail.value;
    this.supWareTrayDetail(data.id, 'edit', index);
  },

  //获取托盘详情
  supWareTrayDetail(id, type, index){
    let that = this;
    wx.showLoading({
      title: '请稍等...',
      mask: true,
      success(){
        Http.get(Config.api.supWareTrayDetail, { id }).then(res => {
          wx.hideLoading();
          if(type === 'add'){
            that.addTray(res.data, 'scan');
          }else if(type === 'edit'){
            that.editTray(res.data, index);
          }
        }).catch(error => {
          wx.hideLoading();
        });
      }
    });
  },

  //添加仓库
  addTray(data, type){
    let d = {tray_id: '', num: '', tray_code: ''};
    let { addData, detail } = this.data;

    if(type === 'scan'){
      //判断页面是否已有该托盘
      let con = addData.trays.filter(item => item.tray_id === data.id);
      if(con.length > 0){
        wx.showToast({
          title: '托盘已存在',
          icon: 'none'
        });
        return;
      }
      //判断托盘上是否已有不同批次的商品
      con = data.tray_items.filter(item => item.c_item_id === detail.c_item_id && item.batch_code !== detail.batch_code);
      if(con.length > 0){
        wx.showToast({
          title: '托盘上已存在不同批次商品',
          icon: 'none'
        });
        return;
      }

      d.tray_id = data.id;
      d.tray_code = data.code;
      if(addData.trays.length > 0 && !addData.trays[0].tray_id){
        addData.trays[0] = d;
      }else{
        addData.trays.push(d);
      }
    }else{
      addData.trays.push(d);
    }
    this.setData({
      addData: this.copyJson(addData)
    });
  },

  //修改仓库
  editTray(data, index){
    let { addData, detail } = this.data;
    let d = addData.trays[index];
    console.log(data,detail);

    //判断页面是否已有该托盘
    let con = addData.trays.filter((item, i) => item.tray_id === data.id && index !== i);
    if(con.length > 0){
      wx.showToast({
        title: '托盘已存在',
        icon: 'none'
      });
      return;
    }
    //判断托盘上是否已有不同批次的商品
    con = data.tray_items.filter((item, i) => item.c_item_id === detail.c_item_id && item.batch_code !== detail.batch_code && index !== i);
    if(con.length > 0){
      wx.showToast({
        title: '托盘上已存在不同批次商品',
        icon: 'none'
      });
      return;
    }

    d.tray_id_error = '';
    d.tray_id = data.id;
    d.tray_code = data.code;
    this.setData({
      addData: this.copyJson(addData)
    });
  },

  //删除仓库
  deleteTray(e){
    let index = e.currentTarget.dataset.index;
    this.data.addData.trays.remove(index);
    this.setData({
      addData: this.copyJson(this.data.addData)
    });
  },

  //确认
  handleAffirm(){
    let that = this;
    let { addData, inventoryData, type, acceptType } = that.data;
    let con = true, total = 0;
    if(!addData.warehouse_id){
      addData.warehouse_id_error = '请选择库';
      con = false;
    }
    for(let i = 0; i < addData.trays.length; i++){
      if(!addData.trays[i].tray_id){
        addData.trays[i].tray_id_error = '请选择托盘';
        con = false;
      }
      if(!addData.trays[i].num){
        addData.trays[i].num_error = '请输入数量';
        con = false;
      }else if(!Verification.isNumber(addData.trays[i].num)){
        addData.trays[i].num_error = '请输入整数';
        con = false;
      }else{
        addData.trays[i].num = Number(addData.trays[i].num);
        total += addData.trays[i].num;
      }
    }
    if(total > Number(inventoryData.num_accept)){
      wx.showToast({ title: '上架数量不能大于收货数量', icon: 'none' });
      return;
    }
    if(!con){
      that.setData({ addData });
      wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
      return;
    }
    let content = `请仔细确认信息，总入库数量为${inventoryData.num_accept}件，是否确认？`;
    if(total > 0){
      content = `请仔细确认信息，总入库数量为${inventoryData.num_accept}件，上架数量为${total}件，是否确认？`;
    }
    wx.showModal({
      title: '提示',
      content: content,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.setData({ subLoading: true }, ()=>{
            Http.post(Config.api[type === 'purchase' ? 'supAcceptAndInstockPurAdd' : 'supAcceptAndInstockDistributeAdd'], {
              ...Util.mapToNumbers(inventoryData, ['num_arrive', 'num_accept']),
              ...addData,
              accept_type: acceptType
            }).then(res => {
              that.setData({ subLoading: false });
              let page = that.getPage('packageOperate/pages/receiving/index/index');
              let pc = that.getPageComponent(page, type);
              if(pc){
                pc.getData();
              }
              wx.navigateBack({
                delta: 2
              });
              wx.showToast({
                title: '入库成功',
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