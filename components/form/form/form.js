// components/form/form/form.js
Component({
  externalClasses: ['pg-form'],
  relations: {
    '../form-item/form-item': {
      type: 'child',
      linked(target) {
        let items = this.data.form_items;
        items.push(target);
        this.setData({
          form_items: items
        }, () => {
          // console.log('linked: ', this.data.form_items);
        });
      },
      unlinked: function(target) {
        this.setData({
          form_items: this.data.form_items.filter(item => item !== target)
        }, () => {
          // console.log('unlinked: ', this.data.form_items);
        });
      }
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    detail: { type: Boolean, default: false }
  },

  /**
   * 组件的初始数据
   */
  data: {
    form_items: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    validateAll() {
      let errors = this.data.form_items.map(item => item.validate()).filter(item => Array.isArray(item) && item.length > 0);
      return new Promise((resolve, reject) => {
        if (errors.length === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    },

    validate(label) {
      let item = this.data.form_items.find(item => item.properties.label === label);
      return new Promise((resolve, reject) => {
        if (item) {
          let errors = item.validate();
          if (errors.length === 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          console.warn('[pg-ui fail] no found label -- ', label);
          resolve(true);
        }
      });

    },
  }
})
