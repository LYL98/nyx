Page({
  data: {
    tab_index: 'bsc',
    reachBottom: false
  },

  onTabChange(e) {
    this.setData({
      tab_index: e.target.dataset.index || 'bsc'
    })
  },

  onReachBottom: function () {
    this.setData({ reachBottom: !this.data.reachBottom })
  },
});
