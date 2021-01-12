// components/form/picker/picker.js
Component({

  externalClasses: ['pg-picker'],
  relations: {
    '../form-item/form-item': {
      type: 'parent',
      linked(target) {
        this.setData({
          form_item: target,
          detail_module: target.data.form && target.data.form.properties && target.data.form.properties.detail
        });
      }
    },
  },

  /**
   * 组件的属性列表
   */
  properties: {
    disabled: { type: Boolean, value: false },
    placeholder: { type: String, value: '请选择' },
    options: { 
      type: Object, 
      value: {},
      observer(val) {
        let index = -1;
        
        val.forEach((item, i) => {
          if (item.value === this.properties.value) {
            index = i;
          }
        });
    
        this.setData({
          index: index
        });
      }
    },
    value: {
      type: String | Number | Boolean,
      value: '',
      observer(next, prev) {

        let index = -1;
        
        this.properties.options.forEach((item, i) => {
          if (item.value === next) {
            index = i;
          }
        });
    
        this.setData({
          index: index
        });

        if (typeof next !== 'boolean' && !next && !prev) { // 表示初始化时，是空值的情况
          return;
        }
        
        let timer = setTimeout(() => {
          this.data.form_item.sync && this.data.form_item.sync(next);
          clearTimeout(timer);
        }, 20);
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    form_item: {},
    detail_module: false,
    index: -1,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(e) {
      let value = '';
      this.properties.options.forEach((item, index) => {
        if (index == e.detail.value) { // 根据索引查找item
          value = item.value;
        }
      });
      this.triggerEvent('change', { value: value });
    }
  }
})
