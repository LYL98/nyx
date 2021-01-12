/**
 * filterData: [{
      key: 'title',
      title: '选择标题',
      items: [{
        key: '',
        title: '全部'
      },{
        key: 1,
        title: '123'
      }]
    },{
      key: 'title2',
      title: '选择标题2',
      items: [{
        key: '',
        title: '全部'
      },{
        key: 1,
        title: '123'
      }]
    }]
 * 
 */

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
  properties: {
    fixed: { type: Boolean, value: true }, // 是否浮动在页面顶部
    value: { type: String, value: ''},
    placeholder: { type: String, value: '搜索' },
    focus: { type: Boolean, value: false },
    isScan: { type: Boolean, value: false }, //是否支持红外扫
    filter: { type: Boolean, value: false }, //筛选
    filterData: { type: Object, value: {} }, //筛选数据
    showAdd:{type: Boolean, value: false},//是否需要新增
  },

  data: {
    isShowFilter: false,
    filterResult: {}
  },

  lifetimes: {
    ready() {
    }
  },

  methods: {
    //输入
    inputChange(e) {
      let value = e.detail.value;
      //判断是否扫码
      if(value.indexOf('{') === 0 && value.indexOf('}') === value.length - 1){
        this.triggerEvent('scan', e.detail);
      }else{
        this.triggerEvent('input', e.detail);
      }
    },
    //点击完成
    inputConfirm(e){
      this.triggerEvent('confirm', e.detail);
    },
    //显示筛选
    showFilter(){
      this.setData({
        isShowFilter: true,
        filterResult: this.initFilterResult()
      });
    },
    //隐藏筛选
    hideFilter(){
      this.setData({ isShowFilter: false, filterResult: {} });
    },
    //选择筛选数据
    activeFilter(e){
      let { key, value } = e.currentTarget.dataset;
      let { filterResult } = this.data;
      filterResult[key] = value;
      this.setData({ filterResult });
      this.triggerEvent('filterItemChange', { value: {
        key: key,
        value: value
      }});
    },
    //重置筛选
    handleReset(){
      this.triggerEvent('filterChange', { value: {}, type: 'reset' });
      this.hideFilter();
    },
    //确认筛选
    handleAffirm(){
      this.triggerEvent('filterChange', { value: this.data.filterResult });
      this.hideFilter();
    },
    //初始化筛选数据
    initFilterResult(){
      let { filterData } = this.properties;
      let filterResult = {};
      filterData.forEach(item => {
        filterResult[item.key] = '';
        for(let i = 0; i < item.items.length; i++){
          if(item.items[i].active){
            filterResult[item.key] = item.items[i].key;
            break;
          }
        }
      });
      return filterResult;
    },
    //触发新增事件
    handleShowAdd(e){
      this.triggerEvent('getAdd', e.detail);
    }
  },
})
