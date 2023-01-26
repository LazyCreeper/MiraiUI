<template>
  <div>
    <v-list-item
      three-line
      v-for="(mList, i) in msgList"
      :class="(Number($route.params.id) === mList.sender.id) ? 'wtf': 'dir-rtl'"
      :key="i"
      style="width: 100%"
    >
      <v-list-item-avatar>
        <v-img
          :src="(Number($route.params.id) === mList.sender.id) ? 'https://q1.qlogo.cn/g?b=qq&nk='+$route.params.id+'&s=160' : 'https://q1.qlogo.cn/g?b=qq&nk='+mList.sender.id+'&s=160' "
        />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title v-html="processMsg(mList.messageChain)"></v-list-item-title>
        <v-list-item-subtitle>{{ new Date(Number(mList.messageChain[0].time+"000")).toLocaleString() }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <!-- 先丢在这能用先，再美化 -->
    <div inputArea>
      <v-row>
        <v-col sm="9">
          <v-textarea
            label="说点什么吧"
            v-model="sMsg"
            outlined
            clearable
            auto-grow
            counter
            width="100"
            rows="3"
          ></v-textarea>
        </v-col>
        <v-col sm="3">
          <v-btn elevation="2" x-large @click="sendMsg">发送</v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
[inputArea] {
  position: fixed;
  bottom: 0;
  width: 60%;
}

.dir-rtl {
  direction: rtl;
}
.dir-rtl > .v-list-item__avatar {
  margin-left: 15px;
}
</style>

<script>
import axios from "axios";
import xmlConvert from "xml-js";
export default {
  name: "ChatWithFriend",
  data: () => ({
    socket: null,
    msgList: [],
    sMsg: null
  }),

  created() {
    this.launchWs();
  },

  updated() {
    this.updateWindow();
  },

  destroyed() {
    // 关闭窗口时销毁相关信息
    const obj = {
      id: null,
      name: null
    };
    this.$store.commit("chat", obj);
    this.msgList = [];
  },

  watch: {
    "$route.params.id": function() {
      // 窗口聊天对象改变时，清空聊天记录
      this.msgList = [];
    },
    "msgList.length": function(val) {
      // 有新消息时，自动滚到最底（待优化
      this.$vuetify.goTo(9999)

      // 窗口内有超过一组消息时，清空聊天记录（待优化
      if (val > 64) this.msgList = [];
    }
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
            合并の.push(msg[i].text.replace("\n", "<br>"));
            break;
          case "Image":
            合并の.push(
              "<a target='_blank' href=" + msg[i].url + ">[图片]</a>"
            );
            break;
          case "Face":
            合并の.push("[" + msg[i].name + "]");
            break;
          case "Voice":
            合并の.push(
              "<a target='_blank' href=" + msg[i].url + ">[语音]</a>"
            );
            break;
          case "Xml": {
            // 我日，第一次见还要花括号的
            const xJson = JSON.parse(
              xmlConvert.xml2json(msg[i].xml, { compact: true })
            );
            let 哎 = `【${xJson.msg.item.title._text}】${xJson.msg.item.summary._text}<br><a href="${xJson.msg.source._attributes.url}" target="_blank">点击跳转</a>`;
            合并の.push(哎);
            break;
          }
          case "App":
            合并の.push(msg[i].content);
            break;
          case "Poke":
            合并の.push("[" + msg[i].name + "]");
            break;
          case "MarketFace":
            合并の.push("[" + msg[i].name + "]");
            break;
          case "MusicShare": {
            let 哎 = `<span>【分享】《${msg[i].title}》 · ${msg[i].summary}</span><br><img src="${msg[i].pictureUrl}"><br><a href="${msg[i].jumpUrl}" target="_blank">前往播放页</a>  |  <a href="${msg[i].musicUrl}" target="_blank">点击收听</a>`;
            合并の.push(哎);
            break;
          }
        }
      }
      return 合并の.join();
    },

    // 发送消息
    async sendMsg() {
      const res = await axios.post(localStorage.addr + "/sendFriendMessage", {
        sessionKey: localStorage.sessionKey,
        target: this.$route.params.id,
        messageChain: [
          {
            type: "Plain",
            text: this.sMsg
          }
        ]
      });
      //   伪造一条假的
      var obj = {
        type: "FriendMessage",
        sender: {
          id: localStorage.qq
        },
        messageChain: [
          {
            id: res.messageId,
            time: Date.now()
              .toString()
              .slice(0, 10),
            type: "Source"
          },
          {
            type: "Plain",
            text: this.sMsg
          }
        ]
      };
      this.msgList.push(obj);
      this.sMsg = "";
    }
  }
};
</script>