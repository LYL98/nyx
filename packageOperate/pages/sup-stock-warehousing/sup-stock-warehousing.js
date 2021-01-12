// packageOperate/pages/sup-stock-warehousing/sup-stock-warehousing.js
const app = getApp();
import { Config, Http, Constant, Verification } from './../../../utils/index';
import { Base, Detail } from './../../../behaviors/index';
Page({
  behaviors: [ Base, Detail ],
  /**
   * 页面的初始数据
   */
  data: {
    subLoading:false,
    addData:{
      warehouse_id: '',
      batch_codes: [],
      warehouse_title: '',
      item_nums: []
    },
    storehouse_id: '',
    // detail:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '场地入库'
    });
    let { index, storehouse_id } = options
    this.setData({
      storehouse_id: storehouse_id
    },()=>{
      app.signIsLogin((res)=>{
        this.getData(Number(index))
      });
    })

  },

  getData(index){
    let { detail,addData } = this.data;
     //获取首页
     let page = this.getPage('packageOperate/pages/item/item');
     if(page){
      detail = page.data.dataItem.items[index];
      addData.batch_codes.push(detail.batch_code || '')
      addData.item_nums.push(Number(detail.num) || 0)
      this.setData({detail,addData});
     }

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

  },
  //提交
  handleAffirm(){
    let that = this;
    let { addData } = that.data
    let con = true
    if(!addData.warehouse_id){
      addData.batch_code_error = '请选择库';
      con = false
    }
    if(!con){
      that.setData({ addData });
      return;
    }
    this.setData({
      subLoading: true
    }, Http.post(Config.api.operateItemSupStockInStock,{
      warehouse_id: addData.warehouse_id,
      batch_codes: addData.batch_codes,
      item_nums: addData.item_nums
    }).then(()=>{
      that.setData({ subLoading: false });
      let page = that.getPage('packageOperate/pages/item/item');
             if(page){
              page.getData();
             }
              wx.navigateBack();
              wx.showToast({
                title: '入库成功',
                icon: 'none'
              });
    }).catch(error => {
      that.setData({ subLoading: false });
    })
    )
   
  },

})