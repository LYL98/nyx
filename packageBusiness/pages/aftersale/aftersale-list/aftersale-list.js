const config = require('./../../../../utils/config');
const http = require('./../../../../utils/http');
const constant = require('./../../../../utils/constant');

Component({
    options: {
		addGlobalClass: true
	},
    /**
     * 组件的属性列表
     */
    properties: {
        condition: String,
        item: String,
        auth: Object,
        province: Object,
        province_code: String,
        opt_type: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        afterSaleStatusList: constant.AFTER_SALE_STATUS('list'),
        afterSaleStatus: constant.AFTER_SALE_STATUS(),
        afterSaleStatusType: constant.AFTER_SALE_STATUS_TYPE,
        afterSaleOptTypeList: constant.AFTER_SALE_OPT_TYPE('list'),
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
        },
        operatorList: []
    },

    pageLifetimes: {
        show() {

            switch(this.data.showType) {
                case 'search':
                    this.setData({
                        query: Object.assign(this.data.query, {
                            condition: this.properties.condition,
                            item: this.properties.item,
                            page: 1
                        })
                    }, () => {
                        this.afterSaleQuery();
                        wx.pageScrollTo({
                            scrollTop: 0,
                            duration: 0
                        });
                    })
                    break;
                case 'modify':
                    let { query } = this.data;
                    if (query.page === 1) {
                        this.afterSaleQuery();
                    } else {
                        let items = query.page === 2
                            ? []
                            : this.data.listItem.items.slice(0, (query.page - 2) * query.page_size);
                        query.page = query.page - 1
                        http.get(config.api.afterSaleQuery, query)
                            .then(res => {
                                items = items.concat(res.data.items);
                                query.page = query.page + 1;
                                return http.get(config.api.afterSaleQuery, query)
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
            this.afterSaleQuery();
            this.baseCommonOperatorList();
        },
    },

    methods: {
        baseCommonOperatorList(){
            let that = this;
            http.get(config.api.baseCommonOperatorList, {
                post: 'service',
                is_freeze: 0,
                need_num: 200
            }).then((res) => {
                that.setData({ operatorList: res.data });
            });
        },
        gotoSearch() {
            this.setData({
                showType: 'search'
            })
            wx.navigateTo({
                url: '/packageBusiness/pages/aftersale/aftersale-search/aftersale-search'
            });
        },

        toggerFilterDialog(event) {
            this.setData({
                dialog: Object.assign(this.data.dialog, {isShowFilterDialog: !this.data.dialog.isShowFilterDialog})
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

        cityList() {
            http.get(config.api.baseCityList, {province_code: this.data.selectedProvince.code})
                .then(res => {
                    this.setData({
                        cityList: res.data,
                        showCityList: res.data.slice(0, 6)
                    })
                })
        },

        loadProvinceList() {
            http.get(config.api.baseProvinceList, {is_no_prompt: true})
                .then(res => {
                    // let names = ["全部"];
                    // for (let i = 0; i < res.data.length; i++) {
                    //     names.push(res.data[i].title);
                    // }
                    // console.log("names: ", names, res.data)
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
                    opt_type: '',
                    condition: '',
                    item: '',
                    begin_date: '',
                    end_date: '',
                    flag_7: null,
                    flag_2: null,
                    operator_id: '',
                    handle_begin_date: '',
                    handle_end_date: '',
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
                case 'opt_type':
                    // 如果query对应的值，等于用户选中的值，则取消选中状态
                    value = this.data.query.opt_type === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {opt_type: value})
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
                    // console.log("provinceItem: ", provinceItem)
                    value = this.data.query.province_code === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {province_code: value}),
                        selectedProvince: Object.assign(this.data.selectedProvince, { code: provinceItem.code, title: provinceItem.title }),
                    }, () => {
                        this.cityList();
                    });
                    break;
                case 'flag_7':
                    value = this.data.query.flag_7 === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {flag_7: value})
                    });
                    break;
                case 'flag_2':
                    value = this.data.query.flag_2 === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {flag_2: value})
                    });
                    break;
                case 'operator_id':
                    value = this.data.query.operator_id === value ? '' : value;
                    this.setData({
                        query: Object.assign(this.data.query, {operator_id: value})
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
                case 'handle_begin_date':
                    this.setData({
                        query: Object.assign(this.data.query, {
                            handle_begin_date: event.detail.value
                        })
                    })
                    break;
                case 'handle_end_date':
                    this.setData({
                        query: Object.assign(this.data.query, {
                            handle_end_date: event.detail.value
                        })
                    })
                    break;
            }
        },

        changeBeginDate() {
            this.setData({
                pickerType: 'begin_date'
            })
        },

        changeEndDate() {
            this.setData({
                pickerType: 'end_date'
            })
        },

        changeHandleBeginDate() {
            this.setData({
                pickerType: 'handle_begin_date'
            })
        },

        changeHandleEndDate() {
            this.setData({
                pickerType: 'handle_end_date'
            })
        },

        //  重置当前组件 父页面的查询参数
        resetSuperSearch() {
            let pages = getCurrentPages();
            let currentPage = pages[pages.length - 1];
            currentPage.setData({
                search: Object.assign(currentPage.data.search, {
                    aftersale: Object.assign(currentPage.data.search.aftersale, { condition: '', item: '' })
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
            this.afterSaleQuery();
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            })
        },

        submitQuery() {
            this.resetSuperSearch();
            this.setData({
                query: Object.assign(this.data.query, {condition: '', item: '', page: 1}),
                dialog: Object.assign(this.data.dialog, {isShowFilterDialog: false, isShowCityDialog: false})
            }, () => {
                this.afterSaleQuery();
                wx.pageScrollTo({
                    scrollTop: 0,
                    duration: 0
                })
            })
        },

        afterSaleQuery() {
            http.get(config.api.afterSaleQuery, this.data.query)
                .then(res => {
                    this.setData({
                        listItem: res.data
                    })
                })
        },

        lowerQuery() {
            // 如果总数 小于等于 当前列表长度，则表示已经加载完成，提示用户已经加载完毕...

            http.get(config.api.afterSaleQuery, this.data.query)
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

        showItemDetail(event) {
            if (this.data.auth.isAdmin || this.data.auth.OrderAfterSaleDetail) {
                let item = event.currentTarget.dataset.item;
                if (event.currentTarget.dataset.item && event.currentTarget.dataset.item.id) {
                    this.setData({
                        showType: 'modify'
                    })
                    wx.navigateTo({
                        url: '/packageBusiness/pages/aftersale/aftersale-detail/aftersale-detail?aftersale_id=' + item.id,
                    });
                }
            }
        },

    }

})
