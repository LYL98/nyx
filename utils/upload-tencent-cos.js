var COS = require('./cos-wx-sdk-v5.js');
var Http = require('./http.js');
var Config = require('./config.js');

var mod = ''; //图片前缀

var cos = new COS({
    //打开后手机上传失败，后续研究
    ForcePathStyle: false, // 如果使用了很多存储桶，可以通过打开后缀式，减少配置白名单域名数量，请求时会用地域域名
    getAuthorization: function (options, callback) {
        Http.get(Config.api.tencentTmpSecret, {
            module: mod
        }).then((res)=>{
            var rd = res.data;
            callback({
                TmpSecretId: rd.tmp_secret_id,
                TmpSecretKey: rd.tmp_secret_key,
                XCosSecurityToken: rd.token,
                ExpiredTime: rd.expired_timestamp, // SDK 在 ExpiredTime 时间前，不会再次调用 getAuthorization
            });
        });
    }
});

//生成key
var createKey = function(){
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    
    var uuid = s.join("");
    return uuid;
}

var upload = function(data){
    mod = data.module; //返回key
    let key = mod + '/' + createKey();
    return new Promise((resolve, reject) => {
        cos.postObject({
            Bucket: Config.tencentBucket,
            Region: Config.tencentRegion,
            Key: key,
            FilePath: data.filePath,
            onProgress: function (info) {
                //进度
                //var rd = JSON.stringify(info);
                //console.log(rd);
            }
        }, function (err, resData) {
            if(resData && resData.statusCode === 200){
                resolve({
                    code: 0,
                    data: {
                        key: key
                    }
                });
            }
            /*else if(err && err.error){
                reject({
                    code: 520,
                    message: err.error
                });
            }*/
            else{
                reject({
                    code: 520,
                    message: '上传失败，请重试'
                });
            }
        });
    });
}

module.exports = {
    upload: function(data) {
      return upload(data);
    }
}