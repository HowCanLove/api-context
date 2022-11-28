## 第一步

安装依赖

```bash
$ cnpm i api-context -D
```

## 第二步

在 build.json 或 build.js 将插件引入进去

```javascript
// 在plugins里增加 api-context
{
  "plugins": [
    "api-context",
    // 如果需要增加日志的话，可以不填
    {
      host: 'text-hangzhou.log.aliyuncs.com', // 所在地域的服务入口。例如cn-hangzhou.log.aliyuncs.com
      project: 'project', // Project名称。
      logstore: 'store', // Logstore名称。
    }
  ]
}
```

## 更新备注

1.0.8 ---------- 2022-11-28 10:36:54  
更新内容: 增加 slsLog
