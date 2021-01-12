module.exports = {
  //分页大小
  PAGE_SIZE: 20,
  //订单状态
  ORDER_STATUS: {
    wait_confirm: '待确认',
    wait_delivery: '待发货',
    order_done: '已完成',
    order_canceled: '已取消'
  },
  //付款状态
  PAY_STATUS: {
    wait_pay: '待付款',
    wait_complete: '待补款',
    done: '已完成'
  },
  //付款类型
  PAY_TYPE: {
    weixin: '微信',
    balance: '余额'
  },
  //订单价格变动原因
  PRICE_CHANGE: {
    short: '缺货',
    weight_up: '实重上升',
    weight_down: '实重下降'
  },
  //售后单状态
  AFTER_SALE_STATUS: (type) => {
    let data = [
      { key: 'init', value: '待分配' },
      { key: 'waiting_dispose', value: '待处理' },
      { key: 'handling', value: '处理中' },
      { key: 'close', value: '已完成' }
    ];
    return handleKeyValue(type, data);
  },
  //售后状态颜色
  AFTER_SALE_STATUS_TYPE: {
    init: 'color-primary',
    waiting_dispose: 'color-orange',
    handling: 'color-orange',
    close: 'color-grey'
  },
  // 售后单处理类型
  AFTER_SALE_OPT_TYPE: (type) => {
    let data = [
      { key: 'quality', value: '质量异常' },
      { key: 'delivery', value: '物流异常' },
      { key: 'amount_delivery', value: '运费退还' },
      { key: 'weight', value: '少称' },
      { key: 'not_match', value: '与SKU描述不相符' },
      { key: 'num', value: '缺货/错货' }, //新增时不显示
      { key: 'num_short', value: '缺货' },
      { key: 'num_error', value: '错货' },
      { key: 'big_order_bonus', value: '大单优惠' },
      { key: 'betray_low_price', value: '违反低价承诺' },
      { key: 'other', value: '其他' }
    ];
    return handleKeyValue(type, data);
  },
  //售后单处理结果
  AFTER_SALE_RESULT: {
    init: '请您留意及跟进协商处理', //正在处理
    refund: '处理结果：退款', //退款
    'return': '处理结果：退货', //退货
    refund_return: '处理结果：退款、退货', //退款、退货
    ignore: '处理结果：已协商无需处理' //不处理
  },
  //零钱变更记录
  BALANCE_CHANGE: {
    manual_deduct: '手动扣款',
    pay: '用户支付',
    top_up: '用户充值',
    freight_redone: '运费重算',
    sys_refund: '系统退款',
    cancel_order_refund: '订单取消退款',
    after_sale_refund: '售后退款',
    frame_return: '退框退款',
    refund_for_pay_after_cancel: '金额退回',
    manual_aftersale: '退赔售后(手动充值)',
    manual_discount: '优惠充值(手动充值)',
    manual_promotion: '活动充值(手动充值)',
    manual_frame_return: '周转筐充值(手动充值)',
    manual_return_cash: '返点充值(手动充值)',
    manual_freight_redone: '运费充值(手动充值)',
    gb_profit: '团购收益金',
    manual_other: '其他(手动充值)'
  },
  //优惠券类型
  COUPON_TYPE: {
    type_reduction: '订单满减券',
    type_discount: '订单满折券',
    type_gift: '订单满赠券'
  },
  //运营人员数据权限级别1:全国 2:省 3:片区 4:县市 5:线路
  OPERATOR_DATA_LEVEL: {
    '1': '总部',
    '2': '区域',
    '3': '片区',
    '4': '县域'
  },
  //库存操作
  WAREHOUSE_OPERATE: {
    check: {
      title: '盘点',
      url: '/packageWarehouse/pages/optCheck/optCheck'
    },
    variation: {
      title: '变动',
      url: '/packageWarehouse/pages/optVariation/optVariation'
    },
    move: {
      title: '移库',
      url: '/packageWarehouse/pages/optMove/optMove' //与上架一起
    },
    out_storage: {
      title: '出库',
      url: '/packageWarehouse/pages/optOutStorage/optOutStorage'
    },
    putaway: {
      title: '上架',
      url: '/packageWarehouse/pages/optMove/optMove' //与移库一起
    },
    out_storage_plan: {
      title: '出库', //出库计划
      url: '/packageWarehouse/pages/optOutStorage/optOutStorage'
    },
    quality_control: {
      title: '品控', //品控
      url: '/packageWarehouse/pages/optQualityControl/optQualityControl'
    }
  },
  //入库类型
  INVENTORY_TYPES: (type)=>{
    let data = [
      { key: 'global_pur', value: '统采入库' },
      { key: 'local_pur', value: '地采入库' },
      { key: 'distribute', value: '调拨入库' },
      { key: 'allocate', value: '场地入库' },
      { key: 'refund', value: '场地入库' }
    ];
    return handleKeyValue(type, data);
  },
  //入库类型(颜色)
  INVENTORY_TYPES_TYPE: {
    global_pur: 'info',
    local_pur: 'info',
    distribute: 'info',
    allocate: 'info',
    refund: 'info'
  },
  //变动类型
  // { key: 'damage', value: '报损' },
  //     { key: 'damage_sale', value: '报损销售' },
  //     { key: 'sale_offline', value: '线下销售' },
  //     { key: 'refund', value: '退货入库' },
  //     { key: 'stocked_qa', value: '库内品控' },
  //     { key: 'refund_to_supplier', value: '退货给供应商' }
  SUP_OPT_TYPES: (type)=>{
    let data = [
      { key: 'damage', value: '移动到残损区' },
      { key: 'sale_offline', value: '线下销售' },
      { key: 'qa_sample', value: '品控试样' },
      { key: 'live_video_use', value: '直播使用' },
      { key: 'retail', value: '零售使用' }
    ];
    return handleKeyValue(type, data);
  },
  //品控类型
  QUA_OPT_TYPES: (type)=>{
    let data = [
      { key: 'daily_qa', value: '日常品控' },
      { key: 'due_date_modify', value: '库期调整' },
    ];
    return handleKeyValue(type, data);
  },
  //售后退货类型
  SALE_BACK_TYPES: (type)=>{
    let data = [
      { key: 'init', value: '待处理' },
      { key: 'pick', value: '已取货' },
      { key: 'finish', value: '已完成' },
      { key: 'close', value: '已关闭' },
    ];
    return handleKeyValue(type, data);
  },
  //残损区来源类型
  DAMAGED_OPT_TYPES: (type)=>{
    let data = [
      { key: 'modify', value: '库内报损' },
      { key: 'refund', value: '退货商品' },
      { key: 'un_qa_dist', value: '调拨不合格' },
      { key: 'edit_allocate', value: '打货商品' },
    ];
    return handleKeyValue(type, data);
  },
  //残损区处理类型damaged
  DAMAGED_TYPES: (type)=>{
    let data = [
      { key: 'destroy', value: '销毁' },
      { key: 'offline_sale', value: '线下销售' },
      { key: 'back_to_supply', value: '退供' },
      { key: 'back_to_supply_for_sale', value: '退供代售' },

    ];
    return handleKeyValue(type, data);
  },
  //品控单状态
  Q_C_STATUS: (type)=>{
    let data = [
      { key: 'audit_success', value: '待收货' },
      { key: 'part_in', value: '部分收货' },
      { key: 'all_in', value: '已完成' },
      { key: 'closed', value: '关闭' }
    ];
    return handleKeyValue(type, data);
  },
  //品控单状态颜色
  Q_C_STATUS_TYPE: {
    audit_success: 'color-primary',
    part_in: 'color-orange',
    all_in: 'color-info',
    closed: 'color-info'
  },
  //采购订单状态（预采、反采）
  PURCHASE_STATUS: (type)=>{
    let data = [
      { key: 'init', value: '待审核' },
      { key: 'audit_success', value: '待收货' },
      { key: 'part_in', value: '部分收货' },
      { key: 'all_in', value: '已完成' },
      { key: 'audit_fail', value: '作废' },
      { key: 'closed', value: '关闭' }
    ];
    return handleKeyValue(type, data);
  },
  //采购订单状态(颜色)
  PURCHASE_STATUS_TYPE: {
    init: 'color-primary',
    audit_success: 'color-orange',
    part_in: 'color-green',
    all_in: 'color-grey',
    audit_fail: 'color-grey',
    closed: 'color-grey'
  },
  //审核状态(共用)
  AUDIT_STATUS: (type)=>{
    let data = [
      { key: 'init', value: '待审核' },
      { key: 'audit_success', value: '审核通过' },
      { key: 'audit_fail', value: '作废' }
    ];
    return handleKeyValue(type, data);
  },
  //审核状态(颜色)
  AUDIT_STATUS_TYPE: {
    init: 'primary',
    audit_success: 'regular',
    audit_fail: 'info'
  },
  // 调拨计划状态
  DISTRIBUTE_PLAN_STATUS: (type) => {
    let data = [
      { key: 'init', value: '待审核' },
      { key: 'audit_success', value: '已完成' },
      { key: 'audit_fail', value: '作废' },
      { key: 'closed', value: '关闭' }
    ];
    return handleKeyValue(type, data);
  },
  // 调拨计划状态(颜色)
  DISTRIBUTE_PLAN_STATUS_TYPE: {
    init: 'color-primary',
    audit_success: 'color-grey',
    audit_fail: 'color-grey',
    closed: 'color-grey'
  },
  // 商品 - 调拨 - 调拨单状态
  DISTRIBUTE_WAYBILL_STATUS: (type) => {
    let data = [
      { key: 'init', value: '待装车' },
      { key: 'wait_delivery', value: '待发车' },
      { key: 'deliveried', value: '待收货' },
      { key: 'part_in', value: '部分收货' },
      { key: 'all_in', value: '已完成' },
      { key: 'closed', value: '关闭' }
    ];
    return handleKeyValue(type, data);
  },
  // 调拨单状态(颜色)
  DISTRIBUTE_WAYBILL_STATUS_TYPE: {
    init: 'primary',
    wait_delivery: 'warning',
    deliveried: 'regular',
    all_in: 'success',
    part_in: 'info',
    closed: 'info'
  },
  // 场地 - 品控收货 - 调拨
  DISTRIBUTE_RECEIVE_STATUS: (type) => {
    let data = [
      { key: 'init', value: '待收货' },
      { key: 'all_in', value: '已收货' }
    ];
    return handleKeyValue(type, data);
  },
  // 商城-零售切换
  CUSTOM_TYPE_STATUS: (type) => {
    let data = [
      { key: 'B', value: '商城' },
      { key: 'C', value: '零售' }
    ];
    return handleKeyValue(type, data);
  },
  //仓库 - 残损区 - 处理记录类型
  DAMAGED_LOG_TYPES: (type) => {
    let data = [
      { key: 'second_choose', value: '二次挑拣' },
      { key: 'destroy', value: '销毁' },
      { key: 'offline_sale', value: '线下销售' },
      { key: 'back_to_supply', value: '退供' },
      { key: 'back_to_supply_for_sale', value: '退供代售' },
    ];
    return handleKeyValue(type, data);
  },
  //库龄
  STOCK_AGE_LIST: (type) => {
    let arr = []
    for (let i = 1; i < 100; i++) {
      arr.push(i < 10 ? '0'+i : ''+i,)
    }
    return handleKeyValue(
      type, arr
    );
  },
  //采购地
  PURCHASE_PLACE_TYPE: (type) => {
    let data = [
      { key:'local', value: '本地' },
      { key:'origin', value: '异地' },
    ]
    return handleKeyValue(type, data);
  },
  //存储环境
  STORAGE_TYPE: (type) => {
    let data = [
        { key: 'freeze', value: '冷冻' },
        { key: 'cold', value: '冷藏' },
        { key: 'normal', value: '常温' },
    ]
    return handleKeyValue(type, data);
  },

  //产品外包装
  PRODUCT_PACKAGING: (type) => {
    let data = [
      { key: 'paper', value: '纸箱' },
      { key: 'material', value: '料框' },
      { key: 'none', value: '无' },
      { key: 'other', value: '其他' },
    ]
    return handleKeyValue(type, data);
  }
}

//处理key value
const handleKeyValue = (type, data) => {
  let d = {};
  //list
  if(type === 'list'){
    return data;
  }
  //value_key
  if(type === 'value_key'){
    data.map(item => { 
      d[item.value] = item.key;
    });
    return d;
  }
  //key_value
  data.map(item => { 
    d[item.key] = item.value;
  });
  return d;
}