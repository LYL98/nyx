// pages/setting/setting-operator/setting-operator.js
import util from "../../../utils/util";
import constant from "../../../utils/constant";
import http from "../../../utils/http";
import config from "../../../utils/config";

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    auth: {},
    loginUserInfo: {},

    inputValue: '',
    dialog: {
      isShowFilterDialog: false,
      isShowRoleDialog: false
    },
    roleList: [],
    showRoleList: [], // 省略显示的角色列表
    hasSelectRole: '全部',

    query: {
      opt_type: '',
      province_code: '',
      condition: '',
      is_freeze: '',
      post: '',
      data_level: '',
      role_id: '',
      page: 1,
      page_size: constant.PAGE_SIZE
    },
    operatorListData: {
      items: [],
      num: 0
    },

    showPostList: [
      // {code: '', title: '全部'},
      {code: 'buyer', title: '商品'},
      {code: 'salesman', title: '业务'},
      {code: 'supply', title: '供应链'},
      {code: 'service', title: '客服'},
      {code: 'other', title: '其他'},
    ],
    showProvinceList: [],
    /* :options="{'全部': '', '已冻结': 1, '未冻结': 0}"*/
    showStatusList: [
      // {code: '', title: '全部'},
      {code: '1', title: '已冻结'},
      {code: '0', title: '未冻结'},
    ],
  },

  // pageLifetimes: {
  //   show() {
  //     app.signIsLogin(() => {
  //       console.log('app.globalData.loginUserInfo: ', app.globalData.loginUserInfo);
        
  //       // 从本地读取缓存的当前区域，如果存在
  //       if (app.globalData && app.globalData.loginUserInfo) {
  //         this.setData({
  //           auth: app.globalData.auth,
  //           province: globalProvince,
  //         });
  //       }

  //       this.loadOperatorListFirstPage();

  //       this.roleList();
  //     });
  //   }
  // },

  /**
   * 组件的方法列表
   */
  methods: {

    initialize() {
          
      app.signIsLogin(() => {
        if (app.globalData && app.globalData.loginUserInfo) {
          
          this.setData({
            auth: app.globalData.auth,
            loginUserInfo: app.globalData.loginUserInfo,
            'query.opt_type': app.globalData.loginUserInfo.opt_type === 'local' ? 'local' : '',
            'query.province_code': app.globalData.loginUserInfo.opt_type === 'local' ? app.globalData.loginUserInfo.province_code : ''
          }, () => {
            this.loadOperatorListFirstPage();

            this.provinceList();
            this.roleList();
          });
        }

      });
    },

    //搜索框回调方法 start--------------------------------------
    onChange(e) {
      this.setData({
        inputValue: e.detail.value
      });
      this.loadOperatorListFirstPage();
    },
    onFocus(e) {
      // console.log('onFocus', e)
    },
    onBlur(e) {
      // console.log('onBlur', e)
    },
    onConfirm(e) {
      // console.log('onConfirm', e)
    },
    onClear(e) {
      // console.log('onClear', e)
      this.setData({
        inputValue: '',
      });
      this.loadOperatorListFirstPage();
    },
    onCancel(e) {
      this.setData({
        inputValue: '',
      });
      this.loadOperatorListFirstPage();
    },
    //搜索框回调方法 end--------------------------------------

    //筛选区方法 start -----------------------
    roleList() {
      http.get(config.api.roleList, {province_code: this.data.query.province_code})
          .then(res => {
            this.setData({
              roleList: res.data,
              showRoleList: res.data.slice(0, 6)
            })
          })
    },
    provinceList() {
      http.get(config.api.baseProvinceList)
          .then(res => {
            this.setData({
              showProvinceList: res.data
            })
          })
    },

    openRoleDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, {isShowRoleDialog: true})
      })
    },

    closeRoleDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, {isShowRoleDialog: false})
      })
    },

    toggerFilterDialog() {
      this.setData({
        dialog: Object.assign(this.data.dialog, {isShowFilterDialog: !this.data.dialog.isShowFilterDialog})
      })
    },

    resetQuery() {
      this.setData({
        query: Object.assign(this.data.query, {
          opt_type: app.globalData.loginUserInfo.opt_type === 'local' ? 'local' : '',
          province_code: app.globalData.loginUserInfo.opt_type === 'local' ? app.globalData.loginUserInfo.province_code : '',
          condition: '',
          is_freeze: '',
          post: '',
          data_level: '',
          role_id: '',
          page: 1,
          page_size: constant.PAGE_SIZE
        }),
        dialog: Object.assign(this.data.dialog, {
          isShowFilterDialog: false,
          isShowRoleDialog: false
        }),
        hasSelectRole: '全部',
      });
      this.loadOperatorListFirstPage();
    },

    changeProvince() {
      this.setData({
        query: Object.assign(this.data.query, {opt_type: 'global', province_code: '', page: 1}),
      });
    },

    changeQuery(event) {
      let {key, value, name} = event.target.dataset;
      switch (key) {
        case 'key_post':
          value = this.data.query.post === value ? '' : value;
          this.setData({
            query: Object.assign(this.data.query, {post: value, page: 1}),
          });
          break;
        case 'key_province_code':
          value = this.data.query.province_code === value ? '' : value;
          this.setData({
            query: Object.assign(this.data.query, {opt_type: 'local', province_code: value, page: 1}),
          });
          break;
        case 'key_role':
          value = this.data.query.role_id === value ? '' : value;
          this.setData({
            query: Object.assign(this.data.query, {role_id: value, page: 1}),
            hasSelectRole: value !== '' ? util.selectedLabel(name) : '全部',
          });
          break;
        case 'key_status':
          value = this.data.query.is_freeze === value ? '' : value;
          this.setData({
            query: Object.assign(this.data.query, {is_freeze: value, page: 1}),
          });
          break;
      }
      // console.log('this.data.query', this.data.query);
    },

    submitQuery() {
      this.loadOperatorListFirstPage();
      this.setData({
        dialog: Object.assign(this.data.dialog, {
          isShowFilterDialog: false,
          isShowRoleDialog: false
        })
      })
    },
    //筛选区方法 end -----------------------

    loadOperatorListFirstPage() {
      this.setData({
        'query.page': 1
      });
      this.operatorList();
    },

    operatorList(){
      let that = this;
      let { query, operatorListData, inputValue } = that.data;

      query.condition = inputValue;

      http.get(config.api.operatorQuery, query)
          .then(result => {
            if (query.page === 1){
              that.setData({
                operatorListData: result.data,
              });
            }else{
              operatorListData.items = operatorListData.items.concat(result.data.items);
              that.setData({
                operatorListData: operatorListData,
              });
            }
          })
    },

    showOperatorDetail(event) {
      if (this.data.auth.isAdmin || this.data.auth.SystemOperatorDetail) {
        let item = event.currentTarget.dataset.item;
        if (item && item.id) {
          wx.navigateTo({
            url: '/pages/setting/setting-operator-detail/setting-operator-detail?operator_id=' + item.id,
          });
        }
      }

    },

    handleOperatorAdd(event) {
      if (this.data.auth.isAdmin || this.data.auth) {
        // let item = event.currentTarget.dataset.item;
        // if (item && item.id) {
        //
        // }
        wx.navigateTo({
          url: '/pages/setting/setting-operator-edit/setting-operator-edit?type=add'
        });
      }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      let that = this;
      let {query, operatorListData} = that.data;
      if (operatorListData.num / query.page_size > query.page) {
        //如果没有到达最后一页，加载数据
        query.page = query.page + 1;
        that.setData({
          query: query
        }, () => {
          that.operatorList();
        });
      }
    },

  },
})
