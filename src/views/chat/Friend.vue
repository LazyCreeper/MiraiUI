<template>
  <div >
    <!-- 与 {{ $route.params.id }} {{ $route.params.name }} 聊天 -->
    <v-list-item :class="($route.params.id) ? 'float-left': ''" v-for="(mList, i) in msgList"
    :key="i" style="width: 100%">
     <v-list-item-avatar>
        <v-img :src="($route.params.id) ? 'https://q1.qlogo.cn/g?b=qq&nk='+$route.params.id+'&s=160' : 'https://q1.qlogo.cn/g?b=qq&nk='+localStorage.qq+'&s=160' " />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>{{ mList.sender.remark }}</v-list-item-title>
        <v-list-item-subtitle>{{ mList.messageChain }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </div>
</template>

<script>
export default {
  name: "ChatWithFriend",
  data: () => ({
    socket: null,
    msgList: [
    //   {
    //     type: "FriendMessage",
    //     sender: {
    //       id: 123,
    //       nickname: "123",
    //       remark: "321"
    //     },
    //     messageChain: []
    //   }
    ]
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
    }
  }
};
</script>