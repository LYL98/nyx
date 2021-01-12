// components/defaultPage/defaultPage.js
Component({
  options: {
		addGlobalClass: true
	},
  /**
   * 组件的属性列表
   */
  properties: {
    currentPage: { type: String, value: '' },
    loading: { type: Boolean, value: false },
    appError: { type: String, value: '' }, //fail 程序错误；timeout 网络超时；netfail 网络错误
    retry: { type: Function }, //重试
  },

  /**
   * 组件的初始数据
   */
  data: {
    pageOption: {
      default: { imgSrc: './../../assets/img/default.png', title: '暂无数据' },
    },
    default: {
      imgSrc: '',
      title: ''
    }
  },

  lifetimes: {
    attached() {
      this.setDefaultPage();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setDefaultPage() {
      this.setData({
        default: this.data.pageOption[this.properties.currentPage]
      })
    },
    //重试
    clickRetry(){
      this.triggerEvent('retry');
    }
  }
})
