// components/form/avatar/avatar.js
import UpCos from "../../../utils/upload-tencent-cos";
import Config from "../../../utils/config";

Component({
  externalClasses: ['pg-picker'],
  relations: {
    '../form-item/form-item': {
      type: 'parent',
      linked(target) {
        this.setData({
          form_item: target,
          detail_module: target.data.form && target.data.form.properties && target.data.form.properties.detail
        });
      }
    },
  },

  properties: {
    module: {
      type: String,
      value: 'operator'
    },
    value: {
      type: String,
      value: '',
      observer(next, prev) {
        if (!next && !prev) { // 表示初始化时，是空值的情况
          return;
        }
        let timer = setTimeout(() => {
          this.data.form_item.sync && this.data.form_item.sync(next);
          clearTimeout(timer);
        }, 20);
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    form_item: {},
    detail_module: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange() {
      let that = this;
      wx.chooseImage({
        count: 1,
        success(res) {
          that.avatarTencentUploadFile(res.tempFiles[0], res.tempFilePaths[0]);
        }
      })
    },

    // 上传单张图片
    avatarTencentUploadFile(file, filePath) {
      let that = this;
      UpCos.upload({
        module: that.properties.module,
        filePath: filePath
      }).then((resData)=>{
        this.triggerEvent('change', {value: resData.data.key});
      }).catch((res)=>{
        wx.showModal({
          title: '提示',
          content: res.message,
          confirmText: '我知道了',
          confirmColor: '#00AE66',
          showCancel: false
        });
      });
    },

    onDelete() {
      this.triggerEvent('change', {value: ''});
    }
  }
})
