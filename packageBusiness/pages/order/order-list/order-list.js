// pages/order/order-list/order-list.js

const config = require('./../../../../utils/config');
const http = require('./../../../../utils/http');

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        condition: String,
        auth: Object,
        province: Object,
        province_code: String,
        opt_type: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        showType: 'init', // 页面生命周期 show 触发的类型( init | search | modify ) ，默认为 init
        query: {},
        pickerType: 'begin_date',
        auth: {},
        province: {},

        dialog: {
            isShowFilterDialog: false,
            isShowCityDialog: false
        },

        selectedCity: { id: '', title: '' },
        cityList: [],
        showCityList: [], // 省略显示的city 列表

        provinceList: [],
        showProvinceList: [],
        selectedProvince: { code: '', title: '' },

        data: '',

        listItem: {
            num: 0,
            items: []
        }
    },

    pageLifetimes: {
        show() {
            switch(this.data.showType) {
                case 'search':
                    this.setData({
                        query: Object.assign(this.data.query, {
                            condition: this.properties.condition,
                            page: 1
                        })
                    }, () => {
                        this.orderQuery();
                        wx.pageScrollTo({
                            scrollTop: 0,
                            duration: 0
                        });
                    })
                    break;
                case 'modify':
                    let { query } = this.data;
                    if (query.page === 1) {
                        this.orderQuery();
                    } else {
                        let items = query.page === 2
                            ? []
                            : this.data.listItem.items.slice(0, (query.page - 2) * query.page_size);
                        query.page = query.page - 1
                        http.get(config.api.orderQuery, query)
                            .then(res => {
                                items = items.concat(res.data.items);
                                query.page = query.page + 1;
                                return http.get(config.api.orderQuery, query)
                            })
                            .then(res => {
                                items = items.concat(res.data.items);
                                this.setData({
                                    listItem: Object.assign(this.data.listItem, {
                                        num: res.data.num,
                                        items: items
                                    })
                                })
                            });
                    }
                    break;
                default:
                    break;
            }

        }
    },

    lifetimes: {
        attached() {
            this.initQuery();
            this.cityList();
            this.loadProvinceList();
            this.orderQuery();
        },
        detached() {
            // 在组件实例被从页面节点树移除时执行
            // console.log('组件被移除');
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        gotoSearch() {
            this.setData({
                showType: 'search'
            })
            wx.navigateTo({
                url: './order-search/order-search'
            });
        },

        lowerQuery() {
            // 如果总数 小于等于 当前列表长度，则表示已经加载完成，提示用户已经加载完毕...

            http.get(config.api.orderQuery, this.data.query)
                .then(res => {
                    let items = this.data.listItem.items;
                    items = items.concat(res.data.items);
                    this.setData({
                        listItem: Object.assign(this.data.listItem, {
                            num: res.data.num,
                            items: items
                        })
                    })
                });
        },

        toggerFilterDialog(event) {
            this.setData({
                dialog: Object.assign(this.data.dialog, { isShowFilterDialog: !this.data.dialog.isShowFilterDialog })
            })
        },

        openCityDialog() {
            this.setData({
                dialog: Object.assign(this.data.dialog, {isShowCityDialog: true})
            })
        },

        closeCityDialog() {
            this.setData({
                dialog: Object.assign(this.data.dialog, {isShowCityDialog: false})
            })
        },

        loadProvinceList() {
            http.get(config.api.baseProvinceList, {is_no_prompt: true})
                .then(res => {
                    this.setData({
                        provinceList: res.data,
                        showProvinceList: res.data.slice(0, 6),
                    })
                })
        },

        initQuery() {
            this.setData({
                query: Object.assign(this.data.query, {
                    province_code: this.properties.province_code,
                    city_id: '',
                    status: '',
                    pay_status: '',
                    order_type: '',
                    condition: '',
                    to_be_canceled: '',
                    begin_date: '',
                    end_date: '',
                    is_init: 1,
                    page: 1,
                    page_size: 20
                })
            })
        },

        changeQuery(event) {
            let {key, value} = event.target.dataset;
            switch (key) {
                case 'status':
                    value = this.data.query.status === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {status: value})
                    });
                    break;
                case 'pay_status':
                    // 如果query对应的值，等于用户选中的值，则取消选中状态
                    value = this.data.query.pay_status === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {pay_status: value})
                    });
                    break;
                case 'order_type':
                    value = this.data.query.order_type === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {order_type: value})
                    });
                    break;
                case 'to_be_canceled':
                    value = this.data.query.to_be_canceled === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {to_be_canceled: value})
                    });
                    break;
                case 'city_id':
                    let item = this.data.query.city_id === value ? { id: '', title: '' } : event.target.dataset.item;
                    value = this.data.query.city_id === value ? '' : value;
                    this.setData({
                        selectedCity: Object.assign(this.data.selectedCity, { id: item.id, title: item.title }),
                        query: Object.assign(this.data.query, {city_id: value}),
                        dialog: Object.assign(this.data.dialog, {isShowCityDialog: false})
                    });
                    break;
                case 'province_code':
                    let provinceItem = event.target.dataset.item;
                    value = this.data.query.province_code === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {province_code: value}),
                        selectedProvince: Object.assign(this.data.selectedProvince, { code: provinceItem.code, title: provinceItem.title }),
                    }, () => {
                        this.cityList();
                    });
                    break;
            }
        },

        changePicker(event) {
            switch (this.data.pickerType) {
                case 'begin_date':
                    this.setData({
                        query: Object.assign(this.data.query, {
                            begin_date: event.detail.value
                        })
                    })
                    break;
                case 'end_date':
                    this.setData({
                        query: Object.assign(this.data.query, {
                            end_date: event.detail.value
                        })
                    })
                    break;
            }
        },

        changeBeginDate(event) {
            this.setData({
                pickerType: 'begin_date'
            })
        },

        changeEndDate() {
            this.setData({
                pickerType: 'end_date'
            })
        },

        //  重置当前组件 父页面的查询参数
        resetSuperSearch() {
            //  重置页面的查询参数
            let pages = getCurrentPages();
            let currentPage = pages[pages.length - 1];
            currentPage.setData({
                search: Object.assign(currentPage.data.search, {
                    order: Object.assign(currentPage.data.search.order, { condition: '' })
                })
            })
        },

        submitQuery() {
            this.resetSuperSearch();
            // 判断是否输入了查询条件？如果输入了查询条件，则将is_init 设置为0，即查询列表返回已取消的订单。
            let is_init = this.data.query.status === 'order_canceled' ? 0 : 1;
            this.setData({
                query: Object.assign(this.data.query, {condition: '', page: 1, is_init: is_init}),
                dialog: Object.assign(this.data.dialog, {isShowFilterDialog: false, isShowCityDialog: false})
            }, () => {
                this.orderQuery();
                wx.pageScrollTo({
                    scrollTop: 0,
                    duration: 0
                })
            })
        },

        resetQuery() {
            // 全国权限重置到所有省份，区域权限不重置省份
            if (this.properties.opt_type === "global") {
                this.setData({
                    selectedProvince: Object.assign(this.data.selectedProvince, { code: '', title: '' }),
                })
            }
            this.resetSuperSearch();
            this.initQuery();
            this.setData({
                selectedCity: Object.assign(this.data.selectedCity, { id: '', title: '' }),
                dialog: Object.assign(this.data.dialog, {
                    isShowFilterDialog: false,
                    isShowCityDialog: false
                })
            });
            this.orderQuery();
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            })
        },

        orderQuery() {
            http.get(config.api.orderQuery, this.data.query)
                .then(res => {
                    this.setData({
                        listItem: res.data
                    })
                });
        },

        cityList() {
            http.get(config.api.baseCityList, {province_code: this.data.selectedProvince.code})
                .then(res => {
                    this.setData({
                        cityList: res.data,
                        showCityList: res.data.slice(0, 6)
                    })
                })
        },

        showItemDetail(event) {
            if (this.data.auth.isAdmin || this.data.auth.OrderDetail) {
                let item = event.currentTarget.dataset.item;
                if (event.currentTarget.dataset.item && event.currentTarget.dataset.item.id) {
                    this.setData({
                        showType: 'modify'
                    })
                    wx.navigateTo({
                        url: '/packageBusiness/pages/order/order-detail/order-detail?order_id=' + item.id + '&delivery_date=' + item.delivery_date,
                    });
                }
            }

        },
        /**
         * 页面上拉触底事件的处理函数
         */
        onReachBottom: function () {
            let that = this;
            let {query, listItem} = that.data;
            if (listItem.num / query.page_size > query.page) {
                //如果没有到达最后一页，加载数据
                query.page = query.page + 1;
                that.setData({
                    query: query
                }, () => {
                    that.lowerQuery();
                });
            }
        },
    }
})
