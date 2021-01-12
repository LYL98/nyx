
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    values: [],
    options: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const { value_key, options_key } = options;

    this.value_key = value_key;

    let pages = getCurrentPages();
    this.prevPage = pages[pages.length - 2];

    this.setData({
      values: this.prevPage.data.formData[value_key],
      options: this.prevPage.data[options_key]
    })
  },

  onSelect(event) {
    let item = event.target.dataset.item;
    let values = this.data.values;
    if (values.includes(item.value)) { // 如果已经选择了
      values.splice(values.indexOf(item.value), 1)
    } else {
      values.push(item.value);
    }

    this.setData({
      values: values
    });
  },

  submit() {

    this.prevPage && this.prevPage.setData({
      formData: Object.assign(this.prevPage.data.formData, { [this.value_key]: this.data.values })
    })
    wx.navigateBack();
  },

})