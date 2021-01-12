
import { Http, Config } from './../../utils/index';

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
  /**
   * 组件的属性列表
   */
  properties: {
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
      this.baseStorehouseList();
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
    //获取仓列表
    baseStorehouseList(){
      let that = this;
      Http.get(Config.api.baseStorehouseList, {
        need_num: 50
      }).then(res => {
        that.setData({ dataItem: res.data });
      });
    },
  }
})
