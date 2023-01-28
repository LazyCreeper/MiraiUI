<template>
  <div>
    <div id="chatArea">
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
    </div>

    <!-- 先丢在这能用先，再美化 -->
    <div>
      <v-row>
        <v-col cols="12">
          <v-btn-toggle>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="sVoice.dialog = true">
                  <v-icon v-bind="attrs" v-on="on">mdi-microphone</v-icon>
                </v-btn>
              </template>
              <span>发送音频</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="sImg.dialog = true">
                  <v-icon v-bind="attrs" v-on="on">mdi-image-plus</v-icon>
                </v-btn>
              </template>
              <span>发送图片</span>
            </v-tooltip>

            <v-btn>
              <v-icon>mdi-cog-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col sm="10">
          <v-textarea
            label="说点什么吧"
            v-model="sMsg"
            outlined
            clearable
            auto-grow
            counter
            width="100"
            rows="1"
          ></v-textarea>
        </v-col>
        <v-col sm="2">
          <v-btn elevation="2" block x-large @click="sendMsg">发送</v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- 发送图片对话框 -->
    <v-dialog v-model="sImg.dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">上传图片</span>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="sImg.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-tabs fixed-tabs dark v-model="tab">
            <v-tab disabled>本地上传</v-tab>
            <v-tab>网络URL</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab" class="pt-5">
            <v-tab-item disabled>
              <v-file-input label="选择文件" outlined @change="handleFiles"></v-file-input>
              <v-btn elevation="2" block x-large>上传并发送</v-btn>
            </v-tab-item>
            <v-tab-item>
              <v-text-field label="图片URL" prepend-icon="mdi-web" outlined v-model="sImg.url"></v-text-field>
              <v-btn elevation="2" block x-large :loading="sImg.btnLoading" @click="sendImg">发送</v-btn>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 发送语音对话框 -->
    <v-dialog v-model="sVoice.dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">发送语音</span>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="sVoice.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field label="音频URL" prepend-icon="mdi-web" outlined v-model="sVoice.url"></v-text-field>
          <v-btn elevation="2" block x-large :loading="sVoice.btnLoading" @click="sendVoice">发送</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
#chatArea {
  height: 68vh;
  overflow-y: auto;
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
    dialog: null,
    tab: null,
    socket: null,
    msgList: [],
    sMsg: null,
    sImg: {
      dialog: null,
      btnLoading: false,
      url: ""
    },
    sVoice: {
      dialog: null,
      btnLoading: false,
      file: ""
    }
  }),

  created() {
    this.launchWs();
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
      this.$nextTick(() => {
        var chatArea = document.getElementById("chatArea");
        chatArea.scrollTop = chatArea.scrollHeight;
      });

      // 窗口内有超过一组消息时，清空聊天记录（待优化
      if (val > 64) this.msgList = [];
    }
  },

  methods: {
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
    },

    // 处理收到的消息
    processMsg(msg) {
      var 合并の = [];
      for (var i = 1; i < msg.length; i++) {
        switch (msg[i].type) {
          case "Plain":
            合并の.push(
              msg[i].text
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")
            );
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
    },

    // 图片转Base64
    handleFiles(e) {
      var reader = new FileReader();
      reader.readAsDataURL(e);
      reader.onload = f => {
        this.sImg = f.target.result;
      };
    },

    // 发送图片（目前只弄了发送单张）
    async sendImg() {
      if (this.sImg.url === "") return;
      if (this.sImg.url.split("http")[0] != "") return;
      this.sImg.btnLoading = true;

      const res = await axios.post(localStorage.addr + "/sendFriendMessage", {
        sessionKey: localStorage.sessionKey,
        target: this.$route.params.id,
        messageChain: [
          {
            type: "Image",
            url: this.sImg.url
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
            type: "Image",
            url: this.sImg.url
          }
        ]
      };
      this.msgList.push(obj);
      this.sImg.url = {
        dialog: null,
        btnLoading: false,
        file: ""
      };
    },

    // 发送语音
    async sendVoice() {
      if (this.sVoice.url === "") return;
      if (this.sVoice.url.split("http")[0] != "") return;
      this.sVoice.btnLoading = true;
      const res = await axios.post(localStorage.addr + "/sendFriendMessage", {
        sessionKey: localStorage.sessionKey,
        target: this.$route.params.id,
        messageChain: [
          {
            type: "Voice",
            url: this.sVoice.url
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
            type: "Voice",
            url: this.sVoice.url
          }
        ]
      };
      this.msgList.push(obj);
      this.sVoice = {
        dialog: null,
        btnLoading: false,
        file: ""
      };
    }
  }
};
</script>