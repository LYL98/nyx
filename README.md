### nyx 希腊神话-尼克斯：运营助手小程序

### 安装vscode扩展插件
```
1、minapp
2、Live Sass Compiler

在.vscode -> settings.json添加

{
    "liveSassCompile.settings.formats": [
        {
            "format": "expanded",
            "extensionName": ".wxss",
            "savePath": null
        }
    ],
    "liveServer.settings.donotShowInfoMsg": true,
    "liveSassCompile.settings.generateMap":false
}
```

### 在根目录添加config.js文件，内容为configSample.js的内容

### 开发日志
```
    2018.12.21
    
    新增：
        全局css类：
            位置：app.wxss .card 
            功能：用于显示单项的阴影块，
            示例代码：pages/merchant/merchant-modify-tags/merchant-modify-tags.wxml
            
            位置: app.wxss .btn-submit .btn-submit-hover
            功能: 统一表单提交按钮的显示样式，和点击后的样式
            示例代码：pages/merchant/merchant-modify-tags/merchant-modify-tags.wxml
        
        封装http请求模块：
            位置: utils/http.js
            功能: 支持promise的请求方式，
            示例代码: pages/merchant/merchant-modify-tags/merchangt-modify-tags.js
            
```