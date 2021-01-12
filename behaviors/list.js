import { Constant } from './../utils/index';

module.exports = Behavior({
    //数据
    data: {
        loading: false,
        query: {
            page: 1,
            page_size: Constant.PAGE_SIZE
        },
        dataItem: {
            items: [],
            num: 0
        },
        dataList: []
    },
    //方法
    methods: {
        //处理返回的数据
        handleResData(resData, callback){
            let { query, dataItem } = this.data;
            if (query.page === 1){
                dataItem = resData;
            }else{
                dataItem.items = dataItem.items.concat(resData.items);
            }
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh(); //下拉回弹
            this.setData({ dataItem }, ()=>{
                typeof callback === 'function' && callback(dataItem);
            });
            setTimeout(()=>{
                this.setData({ loading: false });
            }, 1000);
        },
        //处理返回错误
        handleResError(error){
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh(); //下拉回弹
            let { query } = this.data;
            if(query.page > 1){
                this.setData({'query.page': query.page - 1 });
            }
            setTimeout(()=>{
                this.setData({ loading: false });
            }, 1000);
        },
        //搜索
        searchInputConfirm(){
            this.setData({
                'query.page': 1
            }, ()=>{
                this.getData();
            });
        },
        //下拉刷新方法
        pullDownRefresh(fn){
            this.setData({
                'query.page': 1
            }, () => {
                if(typeof fn === 'function'){
                    fn();
                }else{
                    this.getData();
                }
            });
        },
        //页面触底方法
        reachBottom(fn){
            let { query, dataItem, loading } = this.data;
            if(loading) return;
            if (dataItem.num / query.page_size > query.page) {
                this.setData({
                    'query.page': query.page + 1
                }, () => {
                    if(typeof fn === 'function'){
                        fn();
                    }else{
                        this.getData();
                    }
                });
            }
        }
    }
});