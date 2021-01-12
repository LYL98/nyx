Component({
	properties: {
		bgcolor: {
			type: String,
      value: 'transparent'
		},
		selector: {
			type: String,
			value: 'skeleton'
		}
	},
	data: {
    height: 0,
		skeletonRectLists: [],
		skeletonCircleLists: []
	},
  attached: function () {
    //默认的首屏宽高，防止内容闪现
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      height: systemInfo.windowHeight
    })
  },
	ready: function () {
		const that = this;
    //获取文档高度
    let query = wx.createSelectorQuery();
    query.select('.skeleton').boundingClientRect(function (rect) {
      that.setData({
        height: rect && rect.height
      });
    }).exec();

		//绘制矩形
		this.rectHandle();

		//绘制圆形
		this.radiusHandle();

	},
	methods: {
		rectHandle: function () {
			const that = this;

			//绘制不带样式的节点
			wx.createSelectorQuery().selectAll(`.${this.data.selector}-rect`).boundingClientRect().exec(function(res){
				that.setData({
					skeletonRectLists: res[0]
				});
			});

		},
		radiusHandle: function () {
			const that = this;
			wx.createSelectorQuery().selectAll(`.${this.data.selector}-radius`).boundingClientRect().exec(function(res){
				that.setData({
					skeletonCircleLists: res[0]
				});
			});
		},

	}

})