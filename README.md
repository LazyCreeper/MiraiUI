# WebQQ
一个基于[Mirai-http-api](https://docs.mirai.mamoe.net/mirai-api-http/)的WebQQ

## 这有啥用
能在网页操作QQ。少占用一个通道

# WARNING | 警告
项目还在开发，请耐心等待~

## 运行环境
任意http服务器，无需php，mysql环境

## 如何使用
1. 按照如下配置好[Mirai-http-api](https://docs.mirai.mamoe.net/mirai-api-http/)插件
```yaml
## 必须开启http和ws
adapters:
  - http
  - ws

## 开启认证，并设置key
enableVerify: true
verifyKey: 1234567890

adapterSettings:
 http:
    ## http服务器地址
    host: localhost
    port: 2345
    cors: [*]
  ws:
    ## 保持与http一致
    host: localhost
    port: 2345
    reservedSyncId: -1
```
2. 从release页面下载编译好的压缩包，上传到任意网站服务器
3. 访问网站，输入相关信息，点击验证即可

#### 搭建开发环境
```bash
# 克隆仓库到本地
git clone https://github.com/LazyCreeper/WebQQ
# 安装依赖
npm i
# 启动运行环境
npm run serve
# 编译
npm run build
```

## 安全性
本项目开发之时并没考虑部署在公网，所以仅限http访问不支持ssl加密（说白了其实就是写死了，懒得加判断）。所以更推荐在本地上手动搭建http服务器运行。

## 一些话
本项目代码仅作为vue练手，可能会出现大量能跑但是屎山💩的代码或者一些魔法🔮。请不要介意，如果你想的话可以提交`pr`😘。

## 开源协议
根据 Apache 协议开源

## 要饭
~~0.01也是爱~~
![QR CODE](https://qn-store-pub-tx.seewo.com/676b69a1b8ad4f9391555c127a2331c7165760252223383)

