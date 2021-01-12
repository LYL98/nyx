const app = getApp();

Page({

    /**
     * 组件的初始数据
     */
    data: {
        auth: {},
        province_code: '',
        opt_type: '',

        // 页面的查询条件
        search: {
            aftersale: { condition: '', item: '' }
        }
    },

    /**
     * 页面加载完毕后，配置区域code 权限列表、tabs选项卡
     */

    onLoad: function () {
        app.signIsLogin(() => {
            this.setData({
                auth: app.globalData.auth,
                province_code: app.globalData.loginUserInfo.province_code,
                opt_type: app.globalData.loginUserInfo.opt_type
            });
        })
    },
    /**
     * 页面上拉触底事件的处理函数，根据当前激活的选项卡，触发对应组件的下拉刷新事件
     */
    onReachBottom: function () {
        this.selectComponent('#aftersale-list').onReachBottom();
    },
})
