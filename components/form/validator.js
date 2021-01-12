const rules = {
  required: {
    validate: function (v) {

      switch (typeof v) {
        case 'undefined':
          return false;
        case 'boolean':
          return true;
        case 'number':
          return true;
        case 'string':
          return v !== '';
        case 'object': // 包括 null、array、object
          if (v === null) return false;
          if (Array.isArray(v)) return v.length > 0;
          return Object.keys(v).length > 0;
      }
      return false;
    },
    getMsg: function (l) {
      return l + '不能为空';
    },
  },
  //值必须大于等于
  min_value: {
    validate: function (v, n) {
      return parseFloat(v) >= parseFloat(n[0]);
    },
    getMsg: function (l, n) {
      return l + '必须大于等于' + n[0];
    }
  },
  //值必须小于等于
  max_value: {
    validate: function (v, n) {
      return parseFloat(v) <= parseFloat(n[0]);
    },
    getMsg: function (l, n) {
      return l + '必须小于等于' + n[0];
    }
  },
  //最小字符长度
  min_length: {
    validate: function (v, n) {
      v = v + '';
      return v.length >= n[0];
    },
    getMsg: function (l, n) {
      return l + '不能小于' + n[0] + '个字符';
    }
  },
  //最大字符长度
  max_length: {
    validate: function (v, n) {
      v = v + '';
      return v.length <= n[0];
    },
    getMsg: function (l, n) {
      return l + '不能超过' + n[0] + '个字符';
    }
  },
  // 必须是数字
  number: {
    validate: function (v, n) {
      return !isNaN(v);
    },
    getMsg: function (l, n) {
      return l + '必须是数字';
    },
  },
  //必须是数字，且少于等于？位小数
  decimal: {
    validate: function (v, n) {
      n = isNaN(n[0]) ? 0 : Number(n[0]);
      let s = '^(([1-9][0-9]*)|(([0]\\.\\d{1,2}|[1-9][0-9]*\\.\\d{0,' + n +
        '})))$';
      return new RegExp(s).test(v);
    },
    getMsg: function (l, n) {
      return l + '必须是数字，且最多只能保留' + n[0] + '位小数';
    },
  },
  // 手机号码
  phone: {
    validate: value => {
      return /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(value);
    },
    getMsg: '手机号码格式不正确',
  },
};

class Validator {

  label = '';
  key = '';
  params = [];
  blur = false;
  rule;

  /**
   * validator constructor
   * @param label: msg 提示所需的 标签签名
   * @param key: rule = rules[key]
   * @param params：rule 所需要的 suffix 参数
   * @param blur：是否在失焦后 开启校验
   * @param options: 自定义 rule 对象：包含两个参数 validate、getMsg
   */
  constructor(label, key, params = [], blur = false, options = null) {
    this.label = label;
    this.key = key;
    this.params = params;
    this.blur = blur;
    this.rule = options || rules[key];
  }

  // 如果校验出现错误，则返回错误对象，否则返回 null。
  // 在调用执行validate方法时，判断到null值，则表示校验通过
  validate = (v) => {

    let result = this.rule && typeof this.rule.validate === 'function' ? this.rule.validate(v, this.params) : null;
    if (!result) {
      return {
        key: this.key,
        msg: this.rule && typeof this.rule.getMsg === 'function' ? this.rule.getMsg(this.label, this.params) : this.rule.getMsg,
      };
    }
    return null;
  };

}

/**
 * validator 实例创建函数
 *
 * rulesText 参数：规则模板，支持 string 和 object 类型
 *           string 类型实例 'required|decimal:2:blur' => 转换结果 ['required', 'decimal:2:blur']
 *           object 类型实例 { 'decimal:2:blur': true, logic: {validate, getMsg} } 转换结果 [ ["decimal:2:blur", true], ["logic", {...}] ]
 *
 * 如果不满足上述类型，或者 规则输入格式错误  则返回 []
 */

const createValidator = function (rulesText, label = '') {

  if (!rulesText) {
    return [];
  }

  let list = [];

  switch (typeof rulesText) {
    case 'object':
      list = Object.entries(rulesText).filter(item => item[1]);
      break;
    case 'string':
      list = rulesText.split('|');
      break;
    default:
      return list;
  }

  list = list.map(item => {

    let s, length, blur, options;

    if (typeof item === 'string') {
      s = item.split(':');

    } else if (Array.isArray(item)) {
      s = item[0].split(':');
      options = typeof item[1] === 'object' && item[1].validate && item[1].getMsg ? item[1] : null;
    } else {
      return null;
    }

    length = s.length;
    blur = s[length - 1] === 'blur';

    switch (length) {
      case 1:
        return new Validator(label, s[0], [], false, options);
      case 2:
      case 3:
      case 4:
        if (blur) {
          return new Validator(label, s[0], s.slice(1, s.length - 1), true,
            options);
        }
        return new Validator(label, s[0], s.slice(1, s.length), false, options);
      case 5:
        console.warn('[pg-ui] Rules accept up to two parameters！');
        return null;
      default:
        console.warn('[pg-ui] No matching rules found！');
        return null;
    }

  });

  return list.filter(item => item);

};

export default createValidator;
