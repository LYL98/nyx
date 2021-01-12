// components/form/form-item/form-item.js

import createValidator from '../validator';

Component({
  externalClasses: ['pg-form-item'],
  relations: {
    '../form/form': {
      type: 'parent',
      linked(target) {
        this.setData({
          form: target,
          detail_module: target.properties && target.properties.detail,
        });
      }
    },
    '../avatar/avatar': {
      type: 'child'
    },
    '../upload/upload': {
      type: 'child'
    },
    '../input/input': {
      type: 'child'
    },
    '../picker/picker': {
      type: 'child'
    },
    '../select/select': {
      type: 'child'
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    borderless: { type: Boolean, value: false },
    label: { type: String , value: '' },
    helpText: { type: String , value: '' },
    rules: {
      type: Object | String,
      value: '',
      observer(val) {
        try {
          let validator = createValidator(val, this.properties.label);
          this.setData({
            validator: validator,
            required: validator.some(item => item.key === 'required')
          });
        } catch (e) {
          console.log("createValidator error: ", e);
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    form: {},
    detail_module: false,
    validator: [],
    errored: [],
    errors: [],
    v: '',
    isBlured: false,
    required: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    sync (v) {
      this.setData({ v: v }, () => {
        if (this.data.v === '' && !this.data.required) {
          return;
        }
        this.onChange();
      });
      
    },

    // 校验项发生变化时的值
    validate() {
      if (this.data.v === '' && (!this.data.required)) {
        this.setData({
          errors: []
        });
        return [];
      }
      let errors = this.onChange();
      if (!this.data.isBlured) {
        errors = this.onBlur();
      }
      return errors;
    },

    onChange() {
      const v = this.data.v;

      const nonEmpty = this.data.validator.filter(item => item.key === 'required');

      // 第一步非空校验
      let errors = nonEmpty.map(item => item.validate(v)).filter(item => !!item);
      

      if (errors.length === 0) {

        const changed = this.data.validator.filter(item => item.key !== 'required' && !item.blur);
        const blured = this.data.validator.filter(item => item.key !== 'required' && item.blur);

        // 第二步 不包含 blur 的项目
        errors = changed.map(item => item.validate(v)).filter(item => !!item);
        /*在change的时候只判断已有的错误，失焦事件在失焦时判断*/
        blured.filter(item => this.data.errored.some(key => key === item.key))
          .forEach(item => {
            if (item.validate(v)) {
              errors.push(item.validate(v));
            }
          });
      }

      this.setData({
        errors: errors
      });
      return errors;
    },

    onBlur() {
      this.setData({
        isBlured: true
      })

      let errors = this.data.errors;
      let errored = this.data.errored;
      const v = this.data.v;

      const blured = this.data.validator.filter(item => item.key !== 'required' && item.blur);
      blured.forEach(item => {
        let error = item.validate(v);
        if (error) {
          // 向里边推入错误，需要将之前相同的清除掉

          errored.push(item.key);
          errored = errored.filter((key, index, array) => array.indexOf(key) === index);

          errors = [
            ...(errors.filter(item => item.key !== error.key)),
            error
          ];
        }
      });

      this.setData({
        errors: errors,
        errored: errored
      })
      return errors;
    },
  }
})
