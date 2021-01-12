const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//返回价格
const returnPrice = (data) => {
  let pr = data ? (data/100).toFixed(2) : '0';
  let index = pr.indexOf(".");
  if (index > 0) {
    pr = pr.substring(0, index + 3);
  }
  index = pr.indexOf('.00');
  if (index > 0) {
      pr = pr.substring(0, index);
  }
  return pr;
}

//处理价格(元转为分)
const handlePrice = (price) =>{
  if (!price) return 0;
  let v = price * 100;
  return Math.round(v);
}

//数字前面自动补零(num传入的数字，n需要的字符长度)
const prefixInteger = (num, n) => {
  return (Array(n).join(0) + num).slice(-n);
}

//返回date字符串
const returnDateStr = (dateObj) => {
  var t = this;
  var myDate = dateObj || (new Date());
  return (myDate.getFullYear() + ("-")
    + (prefixInteger(myDate.getMonth() + 1, 2)) + ("-")
    + (prefixInteger(myDate.getDate(), 2)) + " "
    + (prefixInteger(myDate.getHours(), 2)) + ":"
    + (prefixInteger(myDate.getMinutes(), 2)) + ":"
    + (prefixInteger(myDate.getSeconds(), 2)));
}

//时间倒计时（结束时间）
const returnSurplusNum = (endDateStr) => {
  //结束时间
  let endDate = new Date(endDateStr.replace(/-/g, "/"));
  //当前时间
  let nowDate = new Date();
  //相差的总秒数
  let totalSeconds = parseInt((endDate - nowDate) / 1000);
  //天数
  let days = Math.floor(totalSeconds / (60 * 60 * 24));
  //取模（余数）
  let modulo = totalSeconds % (60 * 60 * 24);
  //小时数
  let hours = Math.floor(modulo / (60 * 60));
  modulo = modulo % (60 * 60);
  //分钟
  let minutes = Math.floor(modulo / 60);
  //秒
  let seconds = modulo % 60;

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  }
}

  //日期格式化
  /**
    *
    yyyy：年
    MM：月
    dd：日
    hh：1~12小时制(1-12)
    HH：24小时制(0-23)
    mm：分
    ss：秒
    S：毫秒
    E：星期几
    D：一年中的第几天
    F：一月中的第几个星期(会把这个月总共过的天数除以7)
    w：一年中的第几个星期
    W：一月中的第几星期(会根据实际情况来算)
    a：上下午标识
    k：和HH差不多，表示一天24小时制(1-24)。
    K：和hh差不多，表示一天12小时制(0-11)。
    z：表示时区
  */
 const returnDateFormat = (dateStr, format) => {
  if (!dateStr){
    return ''
  }else if (format === 'yyyy-MM-dd') {
    return dateStr.substring(0, 10);
  } else if (format === 'MM-dd') {
    return dateStr.substring(5, 10);
  } else if (format === 'HH:mm:ss') {
    return dateStr.substring(11, 19);
  } else {
    return dateStr;
  }
}
//计算日期
const returnDateCalc = (dateStr, num) => {
  var dd = new Date(dateStr.replace(/-/g, "/"));
  dd.setDate(dd.getDate() + num);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
  var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();//获取当前几号，不足10补0
  return y + "-" + m + "-" + d;
}

const selectedLabel = (name) => {
   return '已选 ' + name
}
//日期时间计算相差 type day, hours, 
const returnDateTimeCalc = (begintime, endtime, type) => {
  var begintime_ms = new Date(begintime.replace(/-/g, "/")); //begintime 为开始时间
  var endtime_ms = new Date(endtime.replace(/-/g, "/"));   // endtime 为结束时间
  var difference = endtime_ms.getTime() - begintime_ms.getTime();//时间差的毫秒数
  //计算出相差小时数
  if(type === 'hours'){
    var hours = Math.floor(difference / (3600 * 1000));
    return hours;
  }
  
  //计算出相差天数
  var days = Math.floor(difference / (24 * 3600 * 1000));
  return days;
}
/**
 * 对Date对象进行格式化
 * @param date 要格式化的Date对象
 * @param fmt 格式，例如 yyyy-MM-dd
 * @returns 格式化后的字符串
 */
const formatDate = (date, fmt) => {
    let o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 获取固定时间段选项
 * @param type 时间段类型
 * @returns {*[]}
 */
const getFixDateRange = (type) => {
    let startDate, endDate;
    switch (type) {
        case 1: {
            //最近30天
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            startDate = start;
            endDate = end;
            break;
        }
        case 2: {
            //本周
            const today = new Date();
            const nowDay = today.getDate();
            const nowDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
            startDate = new Date(today.getFullYear(), today.getMonth(), nowDay - nowDayOfWeek + 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), nowDay + (6 - nowDayOfWeek + 1));
            break;
        }
        case 3: {
            //上周
            const today = new Date();
            const nowDay = today.getDate();
            const nowDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
            startDate = new Date(today.getFullYear(), today.getMonth(), nowDay - nowDayOfWeek - 7 + 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), nowDay - nowDayOfWeek - 1 + 1);
            break;
        }
        case 4: {
            //本月
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            let end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const interval = (end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            endDate = new Date(today.getFullYear(), today.getMonth(), interval);
            break;
        }
        case 5: {
            //上月
            const start = new Date();
            start.setDate(1);
            start.setMonth(start.getMonth() - 1);
            const endTime = new Date(start.getFullYear(), start.getMonth() + 1, 1);
            startDate = new Date(start.getFullYear(), start.getMonth(), 1);
            const interval = endTime.getTime() - startDate.getTime();
            endDate = new Date(start.getFullYear(), start.getMonth(), interval / (1000 * 60 * 60 * 24));
            break;
        }
        case 6: {
            //本年
            const today = new Date();
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            break;
        }
        case 7: {
            //上一年
            const today = new Date();
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            endDate = new Date(today.getFullYear(), 0, 0);
            break;
        }
        case 8: {
            //今日
            let today = new Date();
            startDate = endDate = today;
            break;
        }
        case 9: {
            //昨日
            let today = new Date();
            let yesterday = new Date(today.setDate(today.getDate() - 1));
            startDate = endDate = yesterday;
            break;
        }
    }
    return [formatDate(startDate, 'yyyy-MM-dd'), formatDate(endDate, 'yyyy-MM-dd')];
}

//数据中keys转为Number并返回
const mapToNumbers = (mapData, keys) => {
  let d = JSON.parse(JSON.stringify(mapData));
  keys.forEach(item => {
    if(d[item] || d[item] === '0') d[item] = Number(d[item]);
  });
  return d;
}

var returnPercentage = function (item_num, sun) {
    var d = item_num / sun * 100;
    d = d.toFixed(2);
    if (d.substring(d.length - 3, d.length) === '.00') {
        return d.substring(0, d.length - 3);
    }
    if (d.substring(d.length - 1, d.length) === '0') {
        return d.substring(0, d.length - 1);
    }
    return d;
}

module.exports = {
  formatTime: formatTime,
  returnPrice: returnPrice,
  handlePrice: handlePrice,
  returnDateStr: returnDateStr,
  returnSurplusNum: returnSurplusNum,
  returnDateFormat: returnDateFormat,
  returnDateCalc: returnDateCalc,
  selectedLabel: selectedLabel,
  formatDate: formatDate,
  getFixDateRange: getFixDateRange,
  prefixInteger: prefixInteger,
  mapToNumbers: mapToNumbers,
  returnPercentage: returnPercentage,
  returnDateTimeCalc: returnDateTimeCalc,
}
