// components/selectWarehouse/selectWarehouse.js
import { Http, Config } from './../../utils/index';

Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
  properties: {
    storehouseId: { type: String | Number, value: '' },
    value: { type: String | Number, value: '' }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dataItem: []
  },
  lifetimes: {
    attached() {
      // this.baseWarehouseList();
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //改变
    bindChange(e){
      let index = e.detail.value;
      let value = this.data.dataItem[index];
      this.triggerEvent('change', {value});
    },
    //获取库列表
    baseWarehouseList(){
      let that = this;
      let { storehouseId } = that.properties;
      Http.get(Config.api.baseWarehouseList, {
        storehouse_id: storehouseId,
        need_num: 50
      }).then(res => {
        that.setData({ dataItem: res.data });
      });
    },

  },
   //监听
   observers: {
    storehouseId(a){
      this.baseWarehouseList();
    }
  }
})
