import { Util } from './../../utils/index';

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    value: { type: String | Array, value: ''},
    type: { type: String, value: 'date' }, //date、daterange
    change: { type: Function }, //选择改变
    cancel: { type: Function }, //取消
    idShowLastNextMonth: { type: Boolean, value: true }, //是否显示上下个月
  },

  /**
   * 页面的初始数据
   */
  data: {
    header: '',
    heads: ["日", "一", "二", "三", "四", "五", "六"],
    show: [],
    dateRangeValue: [], //选择日期段的值
  },
  
  //组件生命周期
	lifetimes: {
		attached() {
      let { value, type } = this.properties;
      let d = '';
      //日期段
      if(type === 'daterange'){
        if(value.length === 2){
          d = value[0];
        }
      }
      //日期
      else if(type === 'date'){
        d = value;
      }

      if(!d){
        d = Util.returnDateStr();
        d = Util.returnDateFormat(d, 'yyyy-MM-dd');
      }
      this.setCalender(new Date(d.replace(/-/g, "/")));
		}
  },
  methods: {
    initline() {
      this.datas = new Array();
      this.show = new Array();
    },
    //这个月有多少天
    getcurrentDates(calender_Date) {
      //传入正常的Date（）类型数据
      this.initline();
      var months = calender_Date.getMonth();
      var year = calender_Date.getYear();
      months = months + 1;
      var d = new Date(year, months, 0);
      return d.getDate();
    },
    //上一月有多少天
    getlastDates(calenderdDate) {
      //传入正常的Date（）类型数据
      var months = calenderdDate.getMonth();
      var year = calenderdDate.getYear();
      months = months + 1;
      var d = new Date(year, months, 0);
      return d.getDate();
    },
    //上个月
    left() {
      this.initline();
      var yy = this.currentYear;
      var mm = this.currentMonth;
      var dd = 1;
      if (yy == new Date().getFullYear() && mm == new Date().getMonth() + 1) {
        dd = new Date().getDate();
      }
      if (mm == 0) {
        mm = 12;
        yy = yy - 1;
        this.currentMonth = mm;
        this.currentYear = yy;
      }
      var calenderrDate = yy + "-" + Util.prefixInteger(mm, 2) + "-" + Util.prefixInteger(dd, 2);
      this.setCalender(new Date(calenderrDate.replace(/-/g, "/")));
    },
    //下个月
    right() {
      this.initline();
      var yy = this.currentYear;
      var mm = this.currentMonth + 2;
      var dd = 1;
      if (yy == new Date().getFullYear() && mm == new Date().getMonth() + 1) {
        dd = new Date().getDate();
      }
      if (mm > 12) {
        mm = 1;
        yy++;
        this.currentMonth = mm;
        this.currentYear = yy;
      }
      var calenderrDate = yy + "-" + Util.prefixInteger(mm, 2) + "-" + Util.prefixInteger(dd, 2);
      this.setCalender(new Date(calenderrDate.replace(/-/g, "/")));
    },
    //显示日历部分
    setCalender(sDate) {
      this.sDate = sDate; //保存备用
      //显示日历部分
      var firstday;
      //今日
      var today = Util.returnDateStr();
      today = Util.returnDateFormat(today, 'yyyy-MM-dd');

      var yy = sDate.getFullYear();
      this.currentYear = yy;
      var mm = sDate.getMonth() + 1; //sDate=2;mm=3
      this.currentMonth = mm - 1; //this.curr=2
      firstday = yy + "-" + mm + "-1"; //2018-3-1
      //本月第一天是星期几,也表示前面有几个空的天数
      var firstday_day = new Date(firstday.replace(/-/g, "/")).getDay();
      //日历头
      this.header = yy + "年" + mm + "月";
      var cur_days = this.getcurrentDates(sDate);
      //上一月有多少天
      var last_days = this.getlastDates(sDate);
  
      //上个月从哪天开始出现
      var last_first_day = last_days - firstday_day + 1;

      //判断是否选中
      var isSelect = (date)=>{
        let { type, value, dateRangeValue } = this.data;
        //单个日期
        if(type === 'date'){
          if(value === date){
            return 'select';
          }else{
            return '';
          }
        }
        //日期段
        else if(type === 'daterange'){
          if(dateRangeValue.length > 0){
            if(date === dateRangeValue[0] || date === dateRangeValue[1]){
              return 'select';
            }
          }else if(value.length > 0){
            if(date === value[0]){
              return 'select begin-select';
            }
            if(date === value[1]){
              return 'select end-select';
            }
            if(date >= value[0] && date <= value[1]){
              return 'half-select';
            }
          }
        }
      }

      //存上个月的日期
      for (var i = last_first_day; i <= last_days; i++) {
        var myY = yy;
        var myM = mm;
        var myD = i;
        if (myM === 1) {
          myY = myY - 1;
          myM = 12;
        } else {
          myM = myM - 1;
        }
        var date = new Object();
        date.num = i;
        date.attr = "last-month";
        date.date = myY + '-' + (Util.prefixInteger(myM, 2)) + '-' + Util.prefixInteger(myD, 2);
        date.now = false;
        date.select = isSelect(date.date);
        this.datas.push(date);
      }

      //存本月日期
      for (var i = 1; i <= cur_days; i++) {
        var myY = yy;
        var myM = mm;
        var myD = i;
        var date = new Object();
        date.num = i;
        date.attr = "this-month";
        date.date = myY + '-' + (Util.prefixInteger(myM, 2)) + '-' + Util.prefixInteger(myD, 2);
  
        if (date.date === today) {
          date.now = true;
        } else {
          date.now = false;
        }
        date.select = isSelect(date.date);
        this.datas.push(date);
      }

      //存放下一个月
      for (
        var i = 1;
        i <= 42 - cur_days - (last_days - last_first_day + 1);
        i++
      ) {
        var myY = yy;
        var myM = mm;
        var myD = i;
        if (myM === 12) {
          myY = myY + 1;
          myM = 1;
        } else {
          myM = myM + 1;
        }
        var date = new Object();
        date.num = i;
        date.attr = "next-month";
        date.date = myY + '-' + (Util.prefixInteger(myM, 2)) + '-' + Util.prefixInteger(myD, 2);
        date.select = isSelect(date.date);
        this.datas.push(date);
      }
  
      var k = 0;
      for (var i = 0; i < 6; i++) {
        var line = new Array();
        for (var j = 0; j < 7; j++) {
          line.push(this.datas[k++]);
        }
        //不显示最下面空行，临时解决
        if (line[0].attr !== 'next-month'){
          this.show.push(line);
        }
      }
  
      this.setData({
        show: this.show,
        header: this.header
      });
    },
    //选择日期
    selectDate(e){
      let { type, dateRangeValue } = this.data;
      let date = e.currentTarget.dataset.date;
      //如果是日期段
      if(type === 'daterange'){
        dateRangeValue.push(date);
        dateRangeValue.sort(); //排序
        this.setData({ dateRangeValue }, ()=>{
          if(dateRangeValue.length >= 2){
            this.triggerEvent('change', dateRangeValue);//触发回调事件
          }else{
            this.setCalender(this.sDate); //重画日历
          }
        });
      }
      //单个日期
      else{
        this.triggerEvent('change', date);//触发回调事件
      }
    },
    //隐藏
    hideCalender(){
      this.triggerEvent('cancel');//触发回调事件
    }
  },
})