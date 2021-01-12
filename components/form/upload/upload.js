// components/form/avatar/avatar.js
import UpCos from '../../../utils/upload-tencent-cos';
import Config from '../../../utils/config';

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
      },
    },
  },

  properties: {
    limit: { type: Number, default: 5 },
    module: {
      type: String,
      value: 'operator',
    },
    value: {
      type: Array,
      value: [],
      observer(next, prev) {

        if (!Array.isArray(next)) {
          console.error('The select component properties value must be array type');
          return;
        }

        this.setData({ limit_count: this.properties.limit - next.length });

        if (next.length === 0 && prev.length === 0) {
          // 表示初始化时，是空值的情况
          return;
        }
        
        let timer = setTimeout(() => {
          this.data.form_item.sync && this.data.form_item.sync(next);
          clearTimeout(timer);
        }, 20);
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    form_item: {},
    detail_module: false,
    limit_count: 5
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange() {
      let that = this;
      let count = that.data.limit_count;
      wx.chooseImage({
        count: count,
        success(res) {
          that.imagesTencentUploadFileList(res.tempFiles, res.tempFilePaths);
        },
      });
    },

    // 上传图片列表
    imagesTencentUploadFileList(files, filePaths) {
    
      Promise.all(
        files.map((file, index) => {
          return new Promise((resolve, reject) => {
            UpCos.upload({
              module: this.properties.module,
              filePath: filePaths[index],
            })
              .then((resData) => {
                resolve(resData.data.key);
              })
              .catch((res) => {
                wx.showModal({
                  title: '提示',
                  content: res.message,
                  confirmText: '我知道了',
                  confirmColor: '#00AE66',
                  showCancel: false,
                });
              });
          });
        })
      ).then((resList) => {
        let iamges = this.properties.value;
        iamges.push(...resList.map((item) => item));
        this.triggerEvent('change', { value: iamges });
      });
    },

    onDelete(event) {
      let item = event.currentTarget.dataset.item;
      let images = this.properties.value.filter((image) => image !== item);
      this.triggerEvent('change', { value: images });
    },
  },
});
