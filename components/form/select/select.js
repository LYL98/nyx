// components/form/select/select.js
Component({
  externalClasses: ['pg-select'],
  relations: {
    '../form-item/form-item': {
      type: 'parent',
      linked(target) {
        this.setData({
          form_item: target,
          detail_module: target.data.form && target.data.form.properties && target.data.form.properties.detail
        });
      },
    },
  },

  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: { type: String, value: '请选择' },
    noDataText: { type: String, value: '可选择项为空' },
    disabled: { type: Boolean, valueL: false },
    multiple: { type: Boolean, value: false },
    onlytap: { type: Boolean, value: false },
    options: {
      type: Array,
      value: [],
      observer(next, prev) {
        console.log('options', next);
        
        if (this.properties.multiple) {
          this.setData({
            selected_str: next
              .filter((item) => this.properties.value.includes(item.value))
              .map((item) => item.label)
              .join(','),
          });
        } else {
          let item = next.find((d) => d.value === this.properties.value);

          this.setData({
            selected_str: item ? item.label : '',
          });
        }
      },
    },
    value: {
      type: Array | String,
      value: '',
      observer(next, prev) {
        if (this.properties.multiple) {
          if (!Array.isArray(next)) {
            console.error('The select component properties value must be array type');
            return;
          }

          this.setData({
            value: next,
            selected_str: this.properties.options
              .filter((item) => next.includes(item.value))
              .map((item) => item.label)
              .join(','),
          });

          if (next.length === 0 && prev.length === 0) {
            // 表示初始化时，是空值的情况
            return;
          }
        } else {
          let item = this.properties.options.find((d) => d.value === next);

          this.setData({ selected_str: item ? item.label : '', value: next });

          if (!!next && !!prev) {
            // 表示初始化时，是空值的情况
            return;
          }
        }

        let timer = setTimeout(() => {
          this.data.form_item.sync && this.data.form_item.sync(next);
          clearTimeout(timer);
        }, 20);
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    form_item: {},
    detail_module: false,
    selected_str: '',
    active: false,
    value: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap(e) {

      if(this.properties.disabled){
        return;
      }
      
      if (this.properties.onlytap || this.data.detail_module) {
        return;
      };

      this.setData({ active: true });
    },

    onSelect(event) {

      if (this.properties.multiple) {

        let item = event.target.dataset.item;
        let value = this.data.value;
        if (value.includes(item.value)) {
          // 如果已经选择了
          value.splice(value.indexOf(item.value), 1);
        } else {
          value.push(item.value);
        }
  
        this.setData({
          value: value,
        });

      } else {
        let item = event.target.dataset.item;
        this.setData({
          value: item.value
        });
      }

    },

    onSubmit() {
      
      this.setData({ active: false });
      this.triggerEvent('change', { value: this.data.value });
    },

    onCancel() {
      this.setData({ active: false, value: this.properties.value });
    }
  },
});
