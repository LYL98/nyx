module.exports = {
  /*
   * 用途：检查输入手机号码是否正确 输入： s：字符串 返回： 如果通过验证返回true,否则返回false
   *
   */
  checkMobile: function(s) {
    var regu = /^1\d{10}$/; ///^1[3|4|5|7|8|9][0-9]{9}$/;
    var re = new RegExp(regu);
    if (re.test(s)) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * 判断是否输入金额
   * @param str
   */
  isPrice: function (str) {
    // var regu=/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
    // var regu=/^[1-9]*\.*[0-9]{0,2}$/;
    var regu = /^[0-9]*\.*[0-9]{0,2}$/;
    return regu.test(str);
  },
  /**
   * 判断是否正整数
   * @param str
   */
  isNumber: function (str) {
    var regu = /^[0-9]+$/;
    return regu.test(str);
  },
}