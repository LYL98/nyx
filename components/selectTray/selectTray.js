// components/selectWarehouse/selectWarehouse.js
import { Http, Config } from '../../utils/index';

Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
  properties: {
    storehouseId: { type: String | Number, value: '' },
    warehouseId: { type: String | Number, value: '' },
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
      // this.baseWareTrayList();
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
      this.triggerEvent('change', { value });
    },
    //托盘列表
    baseWareTrayList(){
      let { storehouseId, warehouseId } = this.properties;
      Http.get(Config.api.baseWareTrayList, {
        storehouse_id: storehouseId,
        warehouse_id: warehouseId,
        need_num: 1000
      }).then(res => {
        this.setData({ dataItem: res.data });
      });
    },

  },
   //监听
   observers: {
    storehouseId(a){
      this.baseWareTrayList();
    },
    warehouseId(a){
      this.baseWareTrayList();
    }
  }
})
