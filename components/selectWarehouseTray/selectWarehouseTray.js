
import { Http, Config } from './../../utils/index';

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
  /**
   * 组件的属性列表
   */
  properties: {
    storehouseId: { type: String | Number, value: '' }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dataItem: [[],[]],
    ids: [0, 0]
  },

  lifetimes: {
    attached() {
      
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //改变
    bindChange(e){
      let v = e.detail.value;
      let value = [];
      let { dataItem } = this.data;
      if(dataItem.length > 0) value.push(dataItem[0][v[0]].id);
      if(dataItem.length > 1) value.push(dataItem[1][v[1]].id);
      if(value.length < 2) return;
      this.triggerEvent('change', {value});
    },
    //列改变
    columnChange(e){
      let column = e.detail.column;
      let index = e.detail.value;
      let { dataItem, ids } = this.data;
      if(column === 0){
        this.baseWareTrayList(dataItem[0][index].id);
      }
      ids[column] = index;
      this.setData({ ids });
    },
    //获取库列表
    baseWarehouseList(){
      let that = this;
      let { dataItem } = that.data;
      let { storehouseId } = that.properties;
      Http.get(Config.api.baseWarehouseList, {
        storehouse_id: storehouseId,
        need_num: 50
      }).then(res => {
        let rd = res.data;
        dataItem[0] = rd;
        that.setData({ dataItem }, ()=>{
          if(rd.length > 0) that.baseWareTrayList(rd[0].id);
        });
      });
    },
    //托盘列表
    baseWareTrayList(warehouseId){
      let that = this;
      let { dataItem } = that.data;
      let { storehouseId } = that.properties;
      Http.get(Config.api.baseWareTrayList, {
        storehouse_id: storehouseId,
        warehouse_id: warehouseId,
        need_num: 1000
      }).then(res => {
        let rd = res.data;
        if(rd.length > 0){
          rd.forEach(item => {
            item.title = item.code;
          });
        }
        dataItem[1] = rd;
        that.setData({ dataItem });
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
