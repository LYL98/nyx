// components/form/input/input.js
Component({
  externalClasses: ['pg-input'],
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
    type: { type: String, value: 'text' },
    placeholder: { type: String, value: '请输入' },
    value: {
      type: String,
      value: '',
      observer(next, prev) {
        if (!next && !prev) { // 表示初始化时，是空值的情况
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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(e) {
      this.triggerEvent('change', { value: e.detail.value });
    },

    onChange(e) {
      this.data.form_item.onBlur && this.data.form_item.onBlur();
    }
  }
})
