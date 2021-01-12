const app = getApp();
import { Config, Http, Constant, Verification } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';

Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    subLoading: false,
    detail: {},
    addData: {
      id: '', //tray_item_id
      num_after: '',
      remark: '',
      trays: []
    },
    selectStorehouse: {},
    isShowMove: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { from, index } = options;
    app.signIsLogin((res)=>{
      this.getData(from, Number(index));
    });
  },

  //获取数据
  getData(from, index){
    let { detail, addData, selectStorehouse } = this.data;
    //获取首页(仓)
    let page = this.getPage('packageWarehouse/pages/index/index');
    if(page) selectStorehouse = page.data.selectStorehouse;

    //获取仓库商品、托盘详情
    if(from === 'inventoryItem'){
      let iPage = this.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
      if(iPage){
        detail = iPage.data.dataItem.items[index];
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
      }
    }else if(from === 'trayDetail'){
      let tPage = this.getPage('packageWarehouse/pages/trayDetail/trayDetail');
      if(tPage){
        detail = tPage.data.detail.tray_items[index];
        addData.tray_id = detail.tray_id;
        addData.sub_item_id = detail.item_id;
        detail.warehouse_title = tPage.data.detail.warehouse.title;
        detail.tray_code = tPage.data.detail.code;
      }
    }
    this.setData({detail, addData, selectStorehouse});
  },

  //显示移库信息
  showhideMove(){
    if(this.data.isShowMove){
      this.setData({
        'addData.trays': [],
        isShowMove: false
      });
    }else{
      this.addTray();
      this.setData({
        isShowMove: true
      });
    }
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
    let { selectStorehouse } = that.data;
    wx.showLoading({
      title: '请稍等...',
      mask: true,
      success(){
        Http.post(Config.api.supRelationCheck, {
          checks: [{
            c_type: 'tray_and_storehouse', //tray_and_storehouse、item_and_province、tray_and_item
            a_key: id,
            b_key: selectStorehouse.id
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

  //选择仓库
  changeTray(e){
    let index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    this.supWareTrayDetail(value[1], 'edit', index);
  },

  //获取托盘详情
  supWareTrayDetail(id, type, index){
    let that = this;
    wx.showLoading({
      title: '请稍等...',
      mask: true,
      success(){
        Http.get(Config.api.supWareTrayDetail, {id}).then(res => {
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
    let d = {tray_id: '', num: '', warehouse_tray_code: ''};
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
      d.warehouse_tray_code = `${data.warehouse.title}/${data.code}`;
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
    d.warehouse_tray_code = `${data.warehouse.title}/${data.code}`;
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
    let { addData, detail } = that.data;
    let con = true, total = 0;
    if(!addData.num_after){
      addData.num_after_error = '不能小于1件';
      con = false;
    }
    if(!Verification.isNumber(addData.num_after)){
      addData.num_after_error = '请输入正确的数值';
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
      content: `请仔细确认信息，盘点后库存${addData.num_after}件，是否确认？`,
      confirmText: '确认',
      confirmColor: '#00ADE7',
      success(res) {
        if (res.confirm) {
          that.setData({
            subLoading: true
          }, ()=>{
            Http.post(Config.api.supCheckAdd, {
              ...addData,
              id: detail.id,
              num_after: Number(addData.num_after),
              num_before: Number(detail.num) || 0,
            }).then(res => {
              that.setData({ subLoading: false });
              let page = that.getPage('packageWarehouse/pages/trayDetail/trayDetail');
              if(page){
                page.supWareTrayDetail();
              }else{
                page = that.getPage('packageWarehouse/pages/inventoryItem/inventoryItem');
                if(page){
                  page.getData();
                }
              }
              wx.navigateBack();
              wx.showToast({
                title: '盘点成功',
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