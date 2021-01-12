import { Constant } from './../utils/index';

module.exports = Behavior({
    //数据
    data: {
        id: 0,
        detail: {},
        loading: false,
        submitLoading: false
    },
    //方法
    methods: {
        //处理返回的数据
        handleResData(detail, callback){
            wx.hideNavigationBarLoading();
            this.setData({ detail, loading: false }, ()=>{
                typeof callback === 'function' && callback(detail);
            });
        },
        //处理返回错误
        handleResError(error){
            wx.hideNavigationBarLoading();
            this.setData({ loading: false });
        },
    }
});