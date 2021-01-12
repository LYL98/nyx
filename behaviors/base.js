import { Config } from './../utils/index';
module.exports = Behavior({
    data: {
        tencentPath: Config.tencentPath, //腾讯cdn地址
        appError: '', //fail 程序错误；timeout 网络超时；netfail 网络错误
    },
    //方法
    methods: {
        //获取系统信息
        getSystemInfo(){
            const sysInfo = wx.getSystemInfoSync();
            const screenWidth = sysInfo.screenWidth;
            let factor = screenWidth / 750;       // 获取比例
            const toPx = (rpx) => Math.round(rpx * factor);   // rpx转px
            const toRpx = (px) => Math.round(px / factor);    // px转rpx
            return {
            ...sysInfo,
            factor: factor,
            toPx: toPx,
            toRpx: toRpx,
            custom_version: 'V1.0.0'
            }
        },
        //获取页面（页面路由）
        getPage(route){
            if(!route) return null;
            //获取页面的数据===
            let pages = getCurrentPages();
            pages = pages.filter(item => item.route === route);
            return pages.length > 0 ? pages[0] : null;
            //===============
        },
        //获取页面组件（页面，组件id）
        getPageComponent(page, comId){
            if(!page || !comId) return null;
            let com = page.selectComponent('#' + comId); //获取页面的组件，在页面上给组件设置id
            return com ? com : null;
        },
        //深拷贝json
        copyJson(json) {
            return JSON.parse(JSON.stringify(json));
        },
        //输入框事件
        inputChange(e, callback) {
            let mainData = e.target.dataset.maindata;
            let fieldkey = e.target.dataset.fieldkey;
            let value = e.detail.value;
            let key = `${mainData}.${fieldkey}`;
            this.setData({
               [key]: value
            }, ()=>{
                typeof callback === 'function' && callback(value);
            });
        },
        //输入框获取焦点事件
        inputFocus(e){
            let mainData = e.target.dataset.maindata;
            let fieldkey = e.target.dataset.fieldkey;
            let key = `${mainData}.${fieldkey}_error`;
            this.setData({
               [key]: ''
            });
        },
        //查看图片
        previewImg(e){
            let current = e.currentTarget.dataset.current;
            let urls = e.currentTarget.dataset.urls;
            let { tencentPath } = this.data;
            current = tencentPath + current;
            urls = urls.map(item => item = tencentPath + item);
            wx.previewImage({
                current: current,
                urls: urls
            })
        },
        //将list中的转为数值(列表，要转的keys)
        listFieldkeyToNumber(listData, keys){
            for(let i = 0; i < listData.length; i++){
                for(let j = 0; j < keys.length; j++){
                    listData[i][keys[j]] = Number(listData[i][keys[j]]);
                }
            }
            return listData;
        }
    }
});