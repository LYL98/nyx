Component({

  /**
   * 组件的属性列表
   */
  properties: {
    value: { type: String | Array, value: ''},
    change: { type: Function }, //选择改变
    cancel: { type: Function }, //取消
  },

  /**
   * 页面的初始数据
   */
  data: {
    selectTime: [0, 0, 0],
    hours: (()=>{
      let h = [];
      for(let i = 0; i < 24; i++){
        h.push(i);
      }
      return h;
    })(),
    minutes: (()=>{
      let m = [];
      for(let i = 0; i < 60; i++){
        m.push(i);
      }
      return m;
    })(),
    seconds: (()=>{
      let s = [];
      for(let i = 0; i < 60; i++){
        s.push(i);
      }
      return s;
    })()
  },
  
  //组件生命周期
	lifetimes: {
		attached() {
      let { value } = this.properties;
      if(value){
        let { selectTime } = this.data;
        let ts = value.split(':');
        selectTime[0] = Number(ts[0]);
        selectTime[1] = Number(ts[1]);
        selectTime[2] = Number(ts[2]);
        this.setData({ selectTime });
      }
		}
  },
  methods: {
    //数字前面自动补零(num传入的数字，n需要的字符长度)
    prefixInteger(num, n){
      return (Array(n).join(0) + num).slice(-n);
    },
    //改变时间
    changeTime(e){
      this.setData({ selectTime: e.detail.value });
    },
    //选择时间
    selectTime(){
      let { selectTime } = this.data;
      let time = `${this.prefixInteger(selectTime[0], 2)}:${this.prefixInteger(selectTime[1], 2)}:${this.prefixInteger(selectTime[2], 2)}`;
      this.triggerEvent('change', time);//触发回调事件
    },
    //隐藏
    hideTime(){
      this.triggerEvent('cancel');//触发回调事件
    }
  },
})