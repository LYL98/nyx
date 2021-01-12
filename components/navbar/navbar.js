// components/navbar/navbar.js

/**
 *  外部通过 navtouch事件 监听导航的切换。事件参数对象 e.detail: { index, item }
 *  list 导航tab列表
 *  default-index 默认激活的游标索引
 *  下滑条slider宽度 rpx 单位
 *  color背景色
 *  fixed是否悬浮
 *  display-number页面固定显示的tab数量
 *  width: 每个tab项的宽度
 */

Component({

  properties: {
    list: { type: Array, value: ['TAB1', 'TAB2', 'TAB3'] }, // 定义导航条的各项标签名称
    defaultIndex: { type: Number, value: 0 }, // 默认的tabs选中项，对应wxml的组件参数 default-index
    slider: { type: Number, value: 0.2 }, // slider宽度 相对于 每个item项 所占的比重
    color: { type: String, value: '#00ADE7' }, // 导航条颜色
    fixed: { type: Boolean, value: true }, // 是否浮动在页面顶部
    top: { type: Number | String, value: '0' }, //离顶部距离
    displayNumber: { type: Number, value: 4 }, // 页面显示的tab 数量
    width: { type: Number, value: 750 / 3 }, // 指定每项显示的宽度，如果没有，则设置width 为 屏幕宽度 / 列表宽度，单位是 rpx
    totalWidth: { type: Number, value: 750 }
  },

  data: {
    activeIndex: 0,
    itemWidth: 0,
    sliderWidth: 0,
    sliderLeft: 0,
    sliderOffset: 0,
    listOffset: 0,
  },

  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success: res => {
          let factor = res.screenWidth / 750;
          let navbarWidth = res.screenWidth / factor;
          let displayNumber = this.properties.displayNumber;
          let length = this.properties.list.length;
          let itemWidth = this.properties.width || navbarWidth / length;
          let sliderWidth = itemWidth * this.properties.slider;
          let listOffset = itemWidth * (this.properties.defaultIndex > (displayNumber - 1) ? this.properties.defaultIndex - (displayNumber - 1) : 0);
          this.setData({
            activeIndex: this.properties.defaultIndex,
            navbarWidth: navbarWidth,
            factor: factor,
            itemWidth: itemWidth
          }, () => {
            this.setData({
              sliderWidth: sliderWidth,
              sliderLeft: (itemWidth - sliderWidth)/ 2,
              sliderOffset: itemWidth * this.properties.defaultIndex,
              listOffset: listOffset,
            })
          })
        }
      })
    }
  },

  methods: {
    navTouch(e) {
      let id = Number(e.currentTarget.id);
      let navbarWidth = this.data.navbarWidth;
      let itemWidth = this.data.itemWidth;
      let factor = this.data.factor;
      let length = this.properties.list.length;
      let displayNumber = this.properties.displayNumber;
      this.triggerEvent('navtouch', {index: id, item: this.properties.list[id]});
      this.setData({
        sliderOffset: itemWidth * id,
        activeIndex: id
      }, () => {
        this.setData({
          listOffset: itemWidth * (id > (displayNumber - 1) ? id === length - 1 ? id - displayNumber : id - (displayNumber - 1) : 0)
        })
      });
    }
  }
})
