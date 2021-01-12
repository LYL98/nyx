/***
 * 导入配置
 */
import {
  Conn,
  RequestHttpDev,
  RequestHttpTest,
  RequestHttpPre,
  RequestHttpPro,
  ApolloRequestHttpDev,
  ApolloRequestHttpTest,
  ApolloRequestHttpPre,
  ApolloRequestHttpPro,
  JunoRequestHttpDev,
  JunoRequestHttpTest,
  JunoRequestHttpPre,
  JunoRequestHttpPro,
  ApiOriginMercuryDev,
  ApiOriginMercuryTest,
  ApiOriginMercuryPre,
  ApiOriginMercuryPro,
  TencentBucketDev,
  TencentRegionDev,
  TencentBucketPro,
  TencentRegionPro,
  TencentPathDev,
  TencentPathPro,
  Version
} from './../config';

//config
let requestHttp = '', apolloRequestHttp = '', junoRequestHttp = '', mercuryRequestHttp = '', tencentBucket = '', tencentRegion = '', tencentPath = '';
switch(Conn){
  case 'dev':
    requestHttp = RequestHttpDev;
    apolloRequestHttp = ApolloRequestHttpDev;
    junoRequestHttp = JunoRequestHttpDev;
    mercuryRequestHttp = ApiOriginMercuryDev;
    tencentBucket = TencentBucketDev;
    tencentRegion = TencentRegionDev;
    tencentPath = TencentPathDev;
    break;
  case 'test':
    requestHttp = RequestHttpTest;
    apolloRequestHttp = ApolloRequestHttpTest;
    junoRequestHttp = JunoRequestHttpTest;
    mercuryRequestHttp = ApiOriginMercuryTest;
    tencentBucket = TencentBucketDev;
    tencentRegion = TencentRegionDev;
    tencentPath = TencentPathDev;
    break;
  case 'pre':
    requestHttp = RequestHttpPre;
    apolloRequestHttp = ApolloRequestHttpPre;
    junoRequestHttp = JunoRequestHttpPre;
    mercuryRequestHttp = ApiOriginMercuryPre;
    tencentBucket = TencentBucketPro;
    tencentRegion = TencentRegionPro;
    tencentPath = TencentPathPro;
    break;
  default:
    requestHttp = RequestHttpPro;
    apolloRequestHttp = ApolloRequestHttpPro;
    junoRequestHttp = JunoRequestHttpPro;
    mercuryRequestHttp = ApiOriginMercuryPro;
    tencentBucket = TencentBucketPro;
    tencentRegion = TencentRegionPro;
    tencentPath = TencentPathPro;
}

module.exports = {
  api: {
    signLogin: apolloRequestHttp + '/m/login',//登录
    signUpdateOUID: apolloRequestHttp + '/m/update_ouid', //更新用户的oid和uid
    signIsLogin: apolloRequestHttp + '/m/sign/is_login',//判断是否登录
    baseCommonOperatorList: apolloRequestHttp + '/m/common/operator/list', //运营人员列表（组件共用）
    baseCommonBuyerList: apolloRequestHttp + '/m/common/buyer/list', //采购员列表（组件共用）

    roleList: apolloRequestHttp + '/m/system/role/list',//查询权限角色

    //运营人员
    operatorAdd: apolloRequestHttp + '/m/operator/add', //运营人员新增
    operatorQuery: apolloRequestHttp + '/m/operator/query', //运营人员列表，带分页
    operatorList: apolloRequestHttp + '/m/operator/list', //运营人员列表，可以根据条件 过滤出对应的人员。post = salesman(业务员)
    operatorEdit: apolloRequestHttp + '/m/operator/edit', //运营人员修改
    operatorDetail: apolloRequestHttp + '/m/operator/detail', //运营人员详情
    operatorPwdReset: apolloRequestHttp + '/m/operator/password_reset', //运营人员重置密码
    operatorPwdModify: apolloRequestHttp + '/m/operator/password_modify', //运营人员修改密码（自己密码）
    operatorFreeze: apolloRequestHttp + '/m/operator/freeze', //运营人员冻结
    operatorUnFreeze: apolloRequestHttp + '/m/operator/unfreeze', //运营人员解冻


    baseProvinceListMy: apolloRequestHttp + '/m/common/my_province', // 我的省份列表

    basicdataProvinceAdd: requestHttp + '/m/basicdata/province/add', //省新增
    basicdataProvinceEdit: requestHttp + '/m/basicdata/province/edit', //省修改
    basicdataProvinceList: requestHttp + '/m/basicdata/province/list', //省列表
    basicdataProvinceDelete: requestHttp + '/m/basicdata/province/delete', //省删除

    basicdataZoneAdd: requestHttp + '/m/basicdata/zone/add', //片区新增
    basicdataZoneEdit: requestHttp + '/m/basicdata/zone/edit', //片区修改
    basicdataZoneList: requestHttp + '/m/basicdata/zone/list', //片区列表
    basicdataZoneDelete: requestHttp + '/m/basicdata/zone/delete', //片区删除

    basicdataCityAdd: requestHttp + '/m/basicdata/city/add', //县区新增
    basicdataCityEdit: requestHttp + '/m/basicdata/city/edit', //县区修改
    basicdataCityList: requestHttp + '/m/basicdata/city/list', //县区列表
    basicdataCityDelete: requestHttp + '/m/basicdata/city/delete', //县区删除

    baseMerchantGradeList: requestHttp + '/m/common/grade/list', //商户级别列表（组件共用）
    baseMerchantInnerTagsList: requestHttp + '/m/common/merchant_inner_tags/list', //商户内标签列表（组件共用）
    baseMerchantOuterTagsList: requestHttp + '/m/common/merchant_outer_tags/list', //商户外标签列表（组件共用）
    baseStoreTagList: requestHttp + '/m/common/store_tag/list', //门店标签列表（组件共用）

    baseDisplayClassList: requestHttp + '/m/common/display_class/list', //展示分类列表（组件共用）

    baseProvinceList: mercuryRequestHttp + '/m/common/province/list', //省列表 (组件共用）
    baseZoneList: mercuryRequestHttp + '/m/common/zone/list', //片区列表（组件共用）
    baseCityList: mercuryRequestHttp + '/m/common/city/list', //县区列表（组件共用）
    baseLineList: mercuryRequestHttp + '/m/common/my_line', //线路列表（组件共用）（运营时用）
    baseLineListOperator: mercuryRequestHttp + '/m/common/line/list', //线路列表（组件共用）(新增运营人员时用)

    baseDistributorList: mercuryRequestHttp + '/m/common/distributor/list', //司机列表
    baseStoreList: requestHttp + '/m/common/store/list', // 门店列表(组件共用)
    // 意向客户
    intentionMerchantQuery: requestHttp + '/m/intention_merchant/query', // 查询
    intentionMerchantAdd: requestHttp + '/m/intention_merchant/add', // 新增
    intentionMerchantEdit: requestHttp + '/m/intention_merchant/edit', // 修改
    intentionMerchantDetail: requestHttp + '/m/intention_merchant/detail', // 详情
    intentionMerchantAudit: requestHttp + '/m/intention_merchant/audit', // 激活 id: intention_merchant_id
    intentionMerchantDelete: requestHttp + '/m/intention_merchant/delete', // 删除

    // 客户管理
    storeQuery: requestHttp + '/m/store/query', // 所有门店的查询结果

    merchantList: requestHttp + '/m/merchant/list', //商户列表
    merchantAdd: requestHttp + '/m/merchant/add', //新增商户
    merchantEdit: requestHttp + '/m/merchant/edit', //修改商户
    merchantDetail: requestHttp + '/m/merchant/detail', //商户详情
    merchantApprove: requestHttp + '/m/merchant/approve', //商户审核
    merchantFreeze: requestHttp + '/m/merchant/freeze', //商户冻结
    merchantUnFreeze: requestHttp + '/m/merchant/unfreeze', //商户解冻
    merchantGradeTagsEdit: requestHttp + '/m/merchant/grade_tags/edit', //商户内标签修改
    merchantBalanceEdit: requestHttp + '/m/merchant/balance/edit',  // 商户充值 / 扣款
    merchantBalanceLogQuery: requestHttp + '/m/merchant/balance/log/query', // 商户充值/扣款记录查询
    merchantRefundListEdit: requestHttp + '/m/store/frame/edit', // 修改多个门店的退框信息
    merchantRefundEdit: requestHttp + '/m/store/frame/edit', //修改门店的退框信息
    merchantRefundLogQuery: requestHttp + '/m/store/frame/log/query', // 退框日志查询
    merchantExport: requestHttp + '/m/store/export', // 商户导出

    storeList: requestHttp + '/m/store/list', //单商户下的门店列表
    storeDetail: requestHttp + '/m/store/detail', //门店详情
    storeAdd: requestHttp + '/m/store/add', //添加门店
    storeEdit: requestHttp + '/m/store/edit', //修改门店
    storeFreeze: requestHttp + '/m/store/freeze', //门店冻结
    storeUnFreeze: requestHttp + '/m/store/unfreeze', //门店解冻
    storeDelete: requestHttp + '/m/store/delete', //删除门店
    storeApprove: requestHttp + '/m/store/approve',//门店审核
    storeTagEdit: requestHttp + '/m/store/store_tag_relation/edit', //门店标签修改

    memberAdd: requestHttp + '/m/member/add', //新用户资料添加
    memberEdit: requestHttp + '/m/member/edit', // 用户资料修改
    memberDelete: requestHttp + '/m/member/delete', // 删除用户
    memberList: requestHttp + '/m/member/list', //用户列表
    memberDetail: requestHttp + '/m/member/detail', //用户详情
    memberPasswordReset: requestHttp + '/m/member/password_reset', //重置密码
    memberFreeze: requestHttp + '/m/member/freeze', //冻结用户账号
    memberUnFreeze: requestHttp + '/m/member/unfreeze', //解冻用户账号
    memberUnBindWechat: requestHttp + '/m/member/unbind_wechat', //解除微信绑定

    storeByProvince: requestHttp + '/m/store/by_province', //地图模式-区域级别的总览
    storeByZone: requestHttp + '/m/store/by_zone', //地图模式-片区级别的总览
    storeByCity: requestHttp + '/m/store/by_city', //地图模式-县域级别的总览
    storeLocationDetail: requestHttp + '/m/store/location_detail', //地图模式-县域级别的门店具体位置分布
    storeNoDistance: requestHttp + '/m/store/no_distance', //地图模式-没有距离的门店
    storeFiveMiles: requestHttp + '/m/store/five_miles', //返回5公里内的全部门店

    // 商品
    //采购 预采、反采
    fromSupplierOrderQuery: mercuryRequestHttp + '/m/from_supplier/order/query', //订单列表
    fromSupplierOrderAdd: mercuryRequestHttp + '/m/from_supplier/order/batch_add', //订单新增(批量)
    fromSupplierOrderEdit: mercuryRequestHttp + '/m/from_supplier/order/edit', //订单修改
    fromSupplierOrderAudit: mercuryRequestHttp + '/m/from_supplier/order/audit', //预采采购单审核
    fromSupplierOrderClose: mercuryRequestHttp + '/m/from_supplier/order/close', //订单关闭
    fromSupplierOrderDetail: mercuryRequestHttp + '/m/from_supplier/order/detail', //采购单详情
    fromSupplierPItemPriceBuy: mercuryRequestHttp + '/m/from_supplier/p_item_price_buy', //获取最近一次该商品的报价
    fromSupplierOrderUpgradePrice: mercuryRequestHttp + '/m/from_supplier/order/upgrade_price', //采购单改价

    //调拨计划
    supDistributePlanAdd: mercuryRequestHttp + '/m/sup_distribute_plan/add', //调拨计划新增
    supDistributePlanEdit: mercuryRequestHttp + '/m/sup_distribute_plan/edit', //调拨计划修改
    supDistributePlanQuery: mercuryRequestHttp + '/m/sup_distribute_plan/query', //调拨计划查询
    supDistributePlanDetail: mercuryRequestHttp + '/m/sup_distribute_plan/detail', //调拨计划详情
    supDistributePlanAudit: mercuryRequestHttp + '/m/sup_distribute_plan/audit', //调拨计划审核
    supDistributePlanClose: mercuryRequestHttp + '/m/sup_distribute_plan/close', //调拨计划关闭

    // 订单管理
    orderQuery: requestHttp + '/m/order/query', //订单列表
    orderDetail: requestHttp + '/m/order/detail', //订单详情
    orderCancel: requestHttp + '/m/order/cancel', //取消订单

    afterSaleQuery: requestHttp + '/m/aftersale/query', //获取负责处理的售后单
    afterSaleDetail: requestHttp + '/m/aftersale/detail', //获取售后单详情
    afterSaleDirectDone: requestHttp + '/m/aftersale/direct_handle_done', //处理完成售后单


    tencentUploadToken: requestHttp + '/common/tencent/upload_token',//获取腾讯token
    tencentTmpSecret: requestHttp + '/common/tencent/tmp_secret',//获取腾讯上传配置

    // 零售统计
    clsStatisticalOrderClassSum: junoRequestHttp + '/m/statistics/order/class_sum', // 统计分析 - 商品分类统计
    clsStatisticalOrderItemSum: junoRequestHttp + '/m/statistical/order/item_sum', // 统计分析 - 商品分类统计
    clsStatisticalOrderRanklist: junoRequestHttp + '/m/statistical/order/item_ranklist', // 统计分析 - 商品排行统计
    clsStatisticalOrderSale: junoRequestHttp + '/m/statistics/order/sale', // 统计分析 - 商品销售统计

    //统计
    statisticalOrderClassSum: requestHttp + '/m/statistical/order/class_sum', //统计分析 - 商品销售统计 - 分类别统计
    statisticalOrderItemSum: requestHttp + '/m/statistical/order/item_sum', //统计分析 - 商品销售统计 - 商品别统计
    statisticalOrderItemSaleStores: requestHttp + '/m/statistical/order/item_sale_stores/query', //统计分析 - 商品 - 商品门店销售统计
    statisticalSumBusinessDelivery: requestHttp + '/m/statistical/sum/business_delivery', //统计分析 - 运营统计
    statisticalCurrent: requestHttp + '/m/statistical/current_gmv', //统计分析 - 实时统计

    statisticalOrderProvinceSum: requestHttp + '/m/statistical/order/province_sum', //统计分析 - 客户订单统计 - 区域级别汇总
    statisticalOrderGradeSum: requestHttp + '/m/statistical/order/zone_sum', //统计分析 - 客户订单统计 - 片区级别汇总
    statisticalOrderCitySum: requestHttp + '/m/statistical/order/city_sum', //统计分析 - 客户订单统计 - 县域级别汇总
    statisticalOrderMerchantSum: requestHttp + '/m/statistical/order/store_sum', //统计分析 - 客户订单统计 - 商户别汇总
    statisticalOrderStoreSaleItems: requestHttp + '/m/statistical/order/store_sale_items/query', //统计分析 - 订单 - 客户销售商品明细

    //场地品控收货(采购)
    supPurchaseQueryForAccept: mercuryRequestHttp + '/m/sup_purchase/query_for_accept', //场地收货专用反采订单查询
    supQualityPurAdd: mercuryRequestHttp + '/m/sup_quality/pur/add', //场地品控(采购)
    supAcceptPurAdd: mercuryRequestHttp + '/m/sup_accept/pur/add', //场地收货(采购)
    supFromSupplierInClose: mercuryRequestHttp + '/m/sup_from_supplier/in_close', //品控单关闭

    //场地品控收货(调拨)
    supDistributeQueryForAccept: mercuryRequestHttp + '/m/sup_distribute/query_for_accept', //场地调拨列表
    supQualityDistributeAdd: mercuryRequestHttp + '/m/sup_quality/distribute/add', //场地品控(调拨)
    supAcceptDistributeAdd: mercuryRequestHttp + '/m/sup_accept/distribute/add', //场地收货(调拨)
    supAcceptDistDetail: mercuryRequestHttp + '/m/sup_accept/dist_detail', //场地的调拨品控收货详情

    //场地品控收货(共用)
    supPItemDetail: mercuryRequestHttp + '/m/sup_p_item/detail', //商品信息，用于入库 时候查看其一级科学分类，库存期，保质期
    supAcceptAndInstockPurAdd: mercuryRequestHttp + '/m/sup_accept_and_instock/pur/add', //采购单收货并入库，并上架
    supAcceptAndInstockDistributeAdd: mercuryRequestHttp + '/m/sup_accept_and_instock/distribute/add', //调拨的收货>入库>上架

    //场地 - 场地商品
    operateItemSupStockQuery:mercuryRequestHttp + '/m/sup_accept/stock/query',
    operateItemSupStockItemBatchDetail: mercuryRequestHttp + '/m/sup_accept/stock/item_batch_detail', // 详情
    operateItemSupStockGetDistributes: mercuryRequestHttp + '/m/sup_distribute_allocate/get_distributes', // 调拨时，获取该商品关联的调拨单信息
    operateItemSupStockDistribute: mercuryRequestHttp + '/m/sup_distribute/allocate_num', // 调拨
    operateItemSupStockInStock: mercuryRequestHttp + '/m/sup_accept/in_stock', // 入库
    operateItemSupStockAllocate: mercuryRequestHttp + '/m/sup_accept/allocate', // 分配
    operateItemSupStockRecord: mercuryRequestHttp + '/m/sup_accept/stock/record/query', // 变动记录

    //仓管待入库
    supInStockShMonitorQuery: requestHttp + '/m/sup_in_stock/sh_monitor_query', //待入库
    supInStockShMonitorAdd: requestHttp + '/m/sup_in_stock/sh_monitor_add', //确认入库
    supInStockDetail: requestHttp + '/m/sup_in_stock/detail', //品控单详情

    supDistributeDetail: mercuryRequestHttp + '/m/sup_distribute/detail', //调拨单详情

    supWareTrayDetail: mercuryRequestHttp + '/m/sup_ware_tray/detail', //获取托盘详情
    
    wareTrayQeruy: mercuryRequestHttp + '/m/sup_stock/query', //查询库存
    wareTrayItemQuery: mercuryRequestHttp + '/m/ware_tray_item/query', //查询具体托盘的库存
    wareTrayItemList: mercuryRequestHttp + '/m/ware_tray_item/list', //查询具体托盘的库存(不翻页)
    wareTrayItemDetail: mercuryRequestHttp + '/m/ware_tray_item/detail', //具体托盘的库存,以及附加信息(品控信息)

    supRelationCheck: mercuryRequestHttp + '/m/sup_relation/check', //关系校验

    supModifyAdd: mercuryRequestHttp + '/m/sup_modify/add', //添加变动
    supModifyStockQa: mercuryRequestHttp + '/m/sup_modify/stock_qa', //变动(库内品控)

    supDistributeAdd: mercuryRequestHttp + '/m/sup_distribute/add', //添加调拨单
    supDistributeQuery: mercuryRequestHttp + '/m/sup_distribute/query', //调拨单查询

    supOutAdd: mercuryRequestHttp + '/m/sup_out/add', //添加出库


    stockItemList: mercuryRequestHttp + '/m/stock_item/list', //某个仓曾经入库过的商品列表
    stockItemBatchList: mercuryRequestHttp + '/m/stock_item/batch_list', //某个仓曾经入库过的商品的批次列表
    wareTrayItemAddCheck: mercuryRequestHttp + '/m/ware_tray_item/add_check', //新增盘点
    //品控
    supQualityAdd: mercuryRequestHttp + '/m/sup_quality/ware_tray_item/add', // 对托盘上的商品进行品控(品控)
    //品控记录
    supQualityWareTrayItem: mercuryRequestHttp + '/m/sup_quality/ware_tray_item/query', // 库内品控查询
    //售后退货
    saleBackDriverList: mercuryRequestHttp + '/m/saleback/driver/list', //  退货单列表
    saleBackFinish: mercuryRequestHttp + '/m/saleback/finish', //  退货收货
    //残损区
    trashQuery: mercuryRequestHttp + '/m/trash/query', //  残损区列表
    trashDetail: mercuryRequestHttp + '/m/trash/detail', //  残损区详情
    trashSecondChoose: mercuryRequestHttp + '/m/trash/second_choose', //  二次挑拣
    trashHandle: mercuryRequestHttp + '/m/trash/handle', //  处理
    trashLogQuery: mercuryRequestHttp + '/m/trash_log/query', //  仓库残损区处理记录列表
    trashLogDetail: mercuryRequestHttp + '/m/trash_log/detail', //  残损区处理记录详情
    trashLogEditSaleAmount: mercuryRequestHttp + '/m/trash_log/edit_sale_amount', //  提交线下销售的货款







    //出库计划
    supOutPlanQuery: mercuryRequestHttp + '/m/sup_out_plan/query', //出库计划查询
    supDistributeOutPlanQuery: mercuryRequestHttp + '/m/sup_distribute_out_plan/query', //调拨计划
    supOutAddWithSalePlan: mercuryRequestHttp + '/m/sup_out/add_with_sale_out_plan', //根据销售出库计划进行出库的操作
    supOutAddWithDistPlan: mercuryRequestHttp + '/m/sup_out/add_with_dist_plan', //根据出库计划出库

    supAcceptAdd: requestHttp + '/m/sup_accept/add', //场地的收货

    supCheckAdd: mercuryRequestHttp + '/m/sup_check/add', //盘点

    supMoveAdd: mercuryRequestHttp + '/m/sup_move/add', //移库

    baseSupStorehouseList: mercuryRequestHttp + '/m/sup_storehouse/list', //根据登陆账号权限，返回仓列表
    baseStorehouseList: mercuryRequestHttp + '/m/common/storehouse/list', //获取仓列表（组件共用）
    baseWarehouseList: mercuryRequestHttp + '/m/common/warehouse/list', //获取库列表（组件共用）
    baseWareTrayList: mercuryRequestHttp + '/m/common/ware_tray/list', //获取托盘列表（组件共用）

    baseItemListTemp: requestHttp + '/m/common/sup_item/list', //商品列表（组件共用）
    baseMerchantList: requestHttp + '/m/common/merchant/list', //商品列表（组件共用）
    baseSupplierList: mercuryRequestHttp + '/m/common/supplier/list', // 供应商列表(组件共用)
    baseGItemList: mercuryRequestHttp + '/m/common/p_item/list', //商品池列表（组件共用）
  },
  //腾讯Bucket、Region
  tencentBucket: tencentBucket, //Bucket
  tencentRegion: tencentRegion, //Region

  tencentPath: tencentPath, //腾讯下载地址
  version: Version
}

