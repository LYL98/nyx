import { Config, Http } from './../../utils/index';

Component({
	options: {
		addGlobalClass: true
	},
	data: {
		loading: false,
		loginRes: {}
	},
	//组件生命周期
	lifetimes: {
		attached() {
			this.getLoginCode();
		},
	},
	methods: {
		//获取logincode
		getLoginCode() {
			let that = this;
			//调用登录接口
			wx.login({
				success: function (loginRes) {
					that.setData({ loginRes });
				},
				fail: function (res) {
					wx.showModal({
						title: "提示",
						content: res.errMsg,
						confirmText: "我知道了",
						confirmColor: "#00AE66",
						showCancel: false
					});
				}
			});
		},
		/**
		 * 获取用户信息
		 */
		onGetUserInfo(e) {
			let that = this;
			let code = that.data.loginRes.code;
			let ed = e.detail.encryptedData;
			let iv = e.detail.iv;
			if(!code || !ed || !iv){
				that.getError();
				return;
			}
			that.setData({loading: true}, ()=>{
				Http.post(Config.api.signUpdateOUID, {
					code: code,
					encryptedData: ed,
					iv: iv,
					is_no_prompt: true
				}).then((res)=>{
					that.setData({ loading: false});
					that.triggerEvent('callback', res.data);
				}).catch(()=>{
					that.setData({ loading: false});
					that.getError();
				});
			});
			
		},
		//获取失败
		getError(){
			this.getLoginCode(); //重新取code
			wx.showModal({
				title: "提示",
				content: "授权失败，请重新授权",
				confirmText: "我知道了",
				confirmColor: "#00AE66",
				showCancel: false
			});
		}
	}
})