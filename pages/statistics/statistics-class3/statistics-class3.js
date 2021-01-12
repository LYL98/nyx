import DataHandle from "../../../utils/dataHandle";
import config from "../../../utils/config";
import http from "../../../utils/http";
import util from "../../../utils/util";

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        rankSrc: './../../../assets/img/rank.png',
        rankSSrc: './../../../assets/img/rank_s.png',
        rankSl: './../../../assets/img/rank_l.png',
        query: {
            province_code: '',
            sort: '-amount_real',
            system_class: '',
            system_class_code: '',
            begin_date: '',
            end_date: ''
        },
        dataItem: [],
        totalItemTotalPrice: 0,
        // total_shop:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.signIsLogin(() => {
            let { system_class1, system_class_code1, system_class2, system_class_code2, begin_date, end_date, province_code } = options;
            let { query } = this.data;
            query.province_code = province_code;
            query.begin_date = begin_date;
            query.end_date = end_date;
            query.system_class = system_class2;
            query.system_class_code = system_class_code2;
            query.system_class1 = system_class1;
            query.system_class_code1 = system_class_code1;
            // this.setData({
            //     total_shop: total_shop
            // })
            this.setData({ query }, () => {
                this.statisticalOrderClassSum();
            })
        });

    },

    //获取数据
    statisticalOrderClassSum() {
        let that = this;
        let { query } = that.data;
        wx.showNavigationBarLoading();
        http.get(config.api.statisticalOrderClassSum, query).then(res => {
            let rd = res.data, totalItemTotalPrice = 0;
            for (let i = 0; i < rd.length; i++) {
                //总数据
                totalItemTotalPrice += rd[i].amount_real;
            }
            that.setData({
                dataItem: rd,
                totalItemTotalPrice
            });
            wx.hideNavigationBarLoading();
        }).catch(error =>{
            wx.hideNavigationBarLoading();
        });
    },

    onItemClick(e) {
        let item = e.currentTarget.dataset.item;
        let { query } = this.data;
        let auth = app.globalData.auth;
        if(auth.isAdmin || auth.StatisticMarketClassItem){
            wx.navigateTo({
                url: "../statistics-product/statistics-product"
                    + "?system_class1=" + query.system_class1
                    + "&system_class_code1=" + query.system_class_code1
                    + "&system_class2=" + query.system_class
                    + "&system_class_code2=" + query.system_class_code
                    + "&system_class3=" + item.item_system_class
                    + "&system_class_code3=" + item.system_class_code
                    + "&begin_date=" + query.begin_date
                    + "&end_date=" + query.end_date
                    + "&province_code=" + query.province_code
            });
        }
    },

    //排序
    changeSort(e) {
        let value = e.currentTarget.dataset.sort;
        this.setData({
            query: Object.assign(this.data.query, { sort: value, page: 1 })
        }, () => {
            this.statisticalOrderClassSum();//获取商品列表
        });

        wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
        });

    },

    /**
   * 页面上拉触底事件的处理函数
   */
    onReachBottom: function () {
        let that = this;
        let { query, dataItem } = that.data;
        if (dataItem.num / query.page_size > query.page) {
            //如果没有到达最后一页，加载数据
            query.page = query.page + 1;
            that.setData({
                query: query
            }, () => {
                that.statisticalOrderClassSum();
            });
        }
    },

})
