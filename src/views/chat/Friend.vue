<template>
  <div>
    <!-- 与 {{ $route.params.id }} {{ $route.params.name }} 聊天 -->
    <v-list-item
      three-line
      :class="($route.params.id) ? 'float-left': ''"
      v-for="(mList, i) in msgList"
      :key="i"
      style="width: 100%"
    >
      <v-list-item-avatar>
        <v-img
          :src="($route.params.id) ? 'https://q1.qlogo.cn/g?b=qq&nk='+$route.params.id+'&s=160' : 'https://q1.qlogo.cn/g?b=qq&nk='+localStorage.qq+'&s=160' "
        />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title v-html="processMsg(mList.messageChain)"></v-list-item-title>
        <v-list-item-subtitle>{{ new Date(Number(mList.messageChain[0].time+"000")).toLocaleString() }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </div>
</template>

<script>
export default {
  name: "ChatWithFriend",
  data: () => ({
    socket: null,
    msgList: []
  }),

  created() {
    this.launchWs();
  },

  updated() {
    this.updateWindow();
    // 关闭原有的ws连接
    // if (this.socket) return this.socket.onclose;
    // 启动新的
    // this.launchWs();
  },

  destroyed() {
    // 关闭窗口时销毁相关信息
    const obj = {
      id: null,
      name: null
    };
    this.$store.commit("chat", obj);

    // 关闭ws连接
    // this.socket.onclose;
  },

  methods: {
    // 更新窗口信息
    updateWindow() {
      const obj = {
        id: this.$route.params.id,
        name: this.$route.params.name
      };
      this.$store.commit("chat", obj);
    },

    // 启动 WebSocket 连接，用于接收消息
    launchWs() {
      this.socket = true;
      this.socket = new WebSocket(
        "ws://" +
          localStorage.addr.split("//")[1] +
          "/all?verifyKey=" +
          localStorage.verifyKey +
          "&qq=" +
          localStorage.qq +
          "&sessionKey=" +
          localStorage.sessionKey
      );
      // 监听 socket 连接
      this.socket.onopen = this.wsOpen;

      // 监听 socket 错误信息
      this.socket.onerror = this.wsError;

      // 监听 socket 消息
      this.socket.onmessage = this.onMsg;
    },

    wsOpen() {
      console.log("Websocket 连接成功");
    },

    wsError() {
      console.error("Websocket 连接错误");
    },

    onMsg(raw) {
      var msg = JSON.parse(raw.data);
      //   判断是不是好友消息
      if (msg.data.type != "FriendMessage") return;
      if (msg.data.sender.id != this.$route.params.id) return;
      this.msgList.push(msg.data);
      console.log(msg);
    },

    // 处理收到的消息
    /** 此处有Bug
     * 对方发送多行消息时，只能处理第一行
     **/
    processMsg(msg) {
      var 合并の = [];
      for (var i = 1; i < msg.length; i++) {
        switch (msg[i].type) {
          case "Plain":
            合并の.push(msg[i].text.replace("\n","<br>"));
            break;
          case "Image":
            合并の.push("<a target='_blank' href=" + msg[i].url + ">[ 图片 ]</a>");
            break;
          case "Face":
            合并の.push("[" + msg[i].name + "]");
            break;
        }
      }
      return 合并の.join();
    }
  }
};
</script>