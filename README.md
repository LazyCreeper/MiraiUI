# Mirai UI

一个基于[Mirai-http-api](https://docs.mirai.mamoe.net/mirai-api-http/)的 WebQQ

## 这有啥用

能在网页操作 QQ。少占用一个通道

## 运行环境

任意 http 服务器，无需 php，mysql 环境

## 如何使用

1. 按照如下配置好[Mirai-http-api](https://docs.mirai.mamoe.net/mirai-api-http/)插件（仅供参考，请勿直接复制粘贴此文本）

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

2. 从`release`页面下载编译好的压缩包，上传到任意网站服务器
3. 访问网站，输入相关信息，点击验证即可

#### 手动编译

```bash
# 克隆仓库到本地
git clone https://github.com/LazyCreeper/MiraiUI
# 安装依赖
npm i
# 编译
npm run build
```

## 目前已经实现的功能

1. 和好友、群聊天
2. 发送文字、图片、@
3. 查看闪照、撤回的消息
4. 额，反正够日常聊天就对了

## BUG 列表

1. 发送的消息的符号会反过来
2. 移动端访问不友好
3. 戳一戳消息好像失效（但是能用放大招

## HTTPS

通过 nginx 反代`mirai-http-api`地址即可实现 SSL 加密。

## 一些话

本项目代码仅作为 vue 练手，可能会出现大量能跑但是屎山 💩 的代码或者一些魔法 🔮。请不要介意，如果你想的话可以提交`pr`😘。

## 开源协议

根据 Apache 协议开源

## 要饭

~~0.01 也是爱~~

![QR CODE](https://cdn.imlazy.ink:233/img/20220924.jpg)
