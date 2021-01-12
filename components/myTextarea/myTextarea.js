
Component({
  options: {
    addGlobalClass: true
	},
  /**
   * 组件的属性列表
   */
  properties: {
    value: { type: String, value: '' },
    placeholder: { type: String, value: '' },
    maxlength: { type: String | Number, value: 50 },
    focus: { type: Boolean, value: false },
    bindinput: { type: Function },
    bindfocus: { type: Function }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShowTextarea: false
  },

  lifetimes: {
    attached() {
      if(this.properties.focus) this.setData({ isShowTextarea: true });
    },
    detached(){
      this.setData({ isShowTextarea: false });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //单击
    clickText(){
      this.setData({ isShowTextarea: true });
    },
    textareaChange(e){
      this.triggerEvent('input', {value: e.detail.value});
    },
    textareaFocus(){
      this.triggerEvent('focus', {});
    },
    textareaBlur(){
      this.setData({ isShowTextarea: false });
      this.triggerEvent('blur', {});
    }
  }
})
