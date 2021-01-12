// packageBusiness/pages/aftersale/aftersale-done/aftersale-done.js
import dataHandle from './../../../../utils/dataHandle';
const Config = require('./../../../../utils/config');
const Http = require('./../../../../utils/http');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    opt_type_options: [
      { value: 'quality', label: '质量异常' },
      { value: 'delivery', label: '物流异常' },
      { value: 'amount_delivery', label: '运费退还' },
      { value: 'weight', label: '少称' },
      { value: 'not_match', label: '与SKU描述不相符' },
      // { value: 'num', label: '缺货/错货' }, //新增时不显示
      { value: 'num_short', label: '缺货' },
      { value: 'num_error', label: '错货' },
      { value: 'big_order_bonus', label: '大单优惠' },
      { value: 'betray_low_price', label: '违反低价承诺' },
      { value: 'other', label: '其他' }
    ],

    handle_way_options: [
      { label: '仅退款', value: 'only_refund' },
      { label: '仅退货', value: 'only_goods' },
      { label: '退货退款', value: 'refund_goods' },
      { label: '其他', value: 'other' },
    ],

    formData: {
      opt_type: '',
      handle_way: '',
      num: '',
      refund: '',
      opt_detail: '',
    },

    item: {},

    maxRefundPrice: '',
    maxRefundPriceStr: '',
    loading: false,

    loadComplete: true,

    refund_validator: {},
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { item } = options;
    if (item) {
      item = JSON.parse(decodeURIComponent(item));
      console.log("item", item);
      this.setData({ item });
    }
  },

  onShow: function () {

  },

  onSubmit() {
    this.selectComponent('#pg-form')
      .validateAll()
      .then((valid) => {
        if (!valid) {
          wx.showToast({ title: '请检查填写内容是否正确', icon: 'none' });
          return;
        }

        const formData = { ...this.data.formData }
        formData.aftersale_id = this.data.item.id
        formData.refund = dataHandle.handlePrice(formData.refund)
        formData.num = Number(formData.num);

        this.setData({ loading: true });
        Http.post(Config.api.afterSaleDirectDone, formData)
          .then(() => {
            this.setData({ loading: false });
            wx.showToast({ title: '处理完成', icon: 'success' });
            let timer = setTimeout(() => {
              wx.navigateBack();
              clearTimeout(timer);
            }, 500);
          })
          .catch(() => {
            this.setData({ loading: false });
          })

      });
  },

  changeRefundNum(e){
    const value = e.detail.value;
    //先判断是否是退货
    let formData  = {...this.data.formData};
    formData.num = value;
    if(formData.opt_type === 'num_short' ){
      let n = formData.num || 1;
      formData.refund = this.data.item.count_real == 0 ? '' : dataHandle.returnPrice(this.data.item.max_refund_amount_when_refund / this.data.item.count_real * n)
    }else{
      let r = this.data.item.final_price;
      let n = formData.num || 1;
      formData.refund = dataHandle.returnPrice(r * n)
    }

    this.setData({
      formData
    })

  },

  changeOptType(e) {
    const value = e.detail.value;
    let formData = { ...this.data.formData };
    let item = { ...this.data.item };
    let maxRefundPrice = this.data.maxRefundPrice;

    formData.opt_type = value;

    if (value === 'num_short') {
      //处理类型为缺货时
      maxRefundPrice = item.max_refund_amount_when_refund
      //缺货情况下的默认退款
      if (formData.handle_way === 'only_refund') {
        formData.refund = item.default_only_refund + item.final_delivery_price
      } else if (formData.handle_way === 'refund_goods') {
        let n = formData.num || 1
        //如果 count_real = 0
        formData.refund =
          item.count_real == 0
            ? ''
            : (item.max_refund_amount_when_refund / item.count_real) * n
      }
    } else {
      //处理类型除了缺货的情况外的处理
      let n = formData.num || 1
      maxRefundPrice = item.max_refund_amount

      if (formData.handle_way === 'only_refund') {
        formData.refund = item.default_only_refund
      } else if (formData.handle_way === 'refund_goods') {
        formData.refund = item.final_price * n
      }

    }
    formData.refund = dataHandle.returnPrice(formData.refund);

    this.setData({
      formData,
      maxRefundPrice,
      maxRefundPriceStr: dataHandle.returnPrice(maxRefundPrice)
    });
  },

  changeHandleWay(e) {
    let v = e.detail.value;
    //先判断是否是缺货
    let formData = { ...this.data.formData };
    let item = { ...this.data.item };

    formData.handle_way = v;

    let refund_message = `${formData.handle_way === 'only_refund' ? '退款金额' : '退货金额'}不能大于最多可${formData.handle_way === 'only_refund' ? '退款金额' : '退货金额'}`;
    let refund_validator = {
      required: true,
      'decimal:2': true,
      'min_value:0.01': true,
      logic: {
        validate: (v, n) => {
          return dataHandle.handlePrice(v) <= item.max_refund_amount_when_refund
        },
        getMsg: refund_message,
      }
    }
    if (formData.opt_type === 'num_short') {
      //缺货情况下的仅退款 和 退货退款的默认金额不一样
      if (v === 'refund_goods') {
        let n = formData.num || 1
        formData.refund =
          item.count_real == 0
            ? ''
            : (item.max_refund_amount_when_refund / item.count_real) * n
      } else if (v === 'only_refund') {
        formData.refund = item.default_only_refund + item.final_delivery_price
      }
    } else {
      if (v === 'only_refund') {
        formData.refund = item.default_only_refund
      } else if (v === 'refund_goods') {
        let n = formData.num || 1
        formData.refund = item.final_price * n
      }
    }
    formData.refund = dataHandle.returnPrice(formData.refund)
    this.setData({
      formData,
      refund_validator
    })
  },

  onChangeKey(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    this.setData({
      formData: Object.assign(this.data.formData, { [key]: value }),
    });
  },

})