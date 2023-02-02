<template>
  <div>
    <div id="chatArea">
      <v-list-item
        three-line
        v-for="(mList, i) in msgList"
        :class="(Number($route.params.id) === mList.sender.group.id) ? 'wtf': 'dir-rtl'"
        :key="i"
        style="width: 100%"
      >
        <v-list-item-avatar>
          <v-img
            :src="(Number($route.params.id) === mList.sender.group.id) ? 'https://q1.qlogo.cn/g?b=qq&nk='+mList.sender.id+'&s=160' : 'https://q1.qlogo.cn/g?b=qq&nk='+qq+'&s=160' "
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="pb-1">
            <v-chip
              label
              x-small
              class="mr-1 caption"
              color="orange"
              v-if="mList.sender.permission === 'OWNER'"
            >群主</v-chip>
            <v-chip
              label
              x-small
              class="mr-1 caption"
              color="green"
              v-else-if="mList.sender.permission === 'ADMINISTRATOR'"
            >管理员</v-chip>
            <v-chip
              label
              x-small
              class="mr-1 caption"
              color="purple"
              v-if="mList.sender.specialTitle"
            >{{ mList.sender.specialTitle }}</v-chip>
            {{ mList.sender.memberName }}
          </v-list-item-title>
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

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="sXml.dialog = true">
                  <v-icon v-bind="attrs" v-on="on">mdi-file-xml-box</v-icon>
                </v-btn>
              </template>
              <span>XML</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="sAt.dialog = true">
                  <v-icon v-bind="attrs" v-on="on">mdi-at</v-icon>
                </v-btn>
              </template>
              <span>At</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="msgDialog = true">
                  <v-icon v-bind="attrs" v-on="on">mdi-cog-outline</v-icon>
                </v-btn>
              </template>
              <span>聊天框设置</span>
            </v-tooltip>
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
            @keyup.ctrl.enter="sendMsg"
          ></v-textarea>
        </v-col>
        <v-col sm="2">
          <v-btn elevation="2" block x-large @click="sendMsg">发送</v-btn>(Ctrl+Enter) 也可发送
        </v-col>
      </v-row>
    </div>

    <!-- 发送图片对话框 -->
    <v-dialog v-model="sImg.dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">发送图片</span>
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
          <v-text-field
            label="音频URL"
            prepend-icon="mdi-web"
            outlined
            v-model="sVoice.url"
            class="pt-4"
          ></v-text-field>
          <v-btn elevation="2" block x-large :loading="sVoice.btnLoading" @click="sendVoice">发送</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 发送XML -->
    <v-dialog v-model="sXml.dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">发送XML消息</span>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="sXml.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-textarea
            label="xml"
            v-model="sXml.xml"
            outlined
            clearable
            auto-grow
            counter
            width="100"
            rows="5"
            class="pt-4"
          ></v-textarea>
          <v-btn elevation="2" block x-large :loading="sXml.btnLoading" @click="sendXml">发送</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 发送At -->
    <v-dialog v-model="sAt.dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">@</span>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="sAt.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-select
            label="选择类型"
            outlined
            v-model="sAt.name"
            :items="sAt.items"
            item-text="name"
            item-value="type"
            return-object
            class="pt-4"
          ></v-select>
          <v-text-field v-if="sAt.name.type === 'At'" label="对方QQ号" outlined v-model="sAt.target"></v-text-field>
          <v-btn elevation="2" block x-large :loading="sAt.btnLoading" @click="sendAt">发送</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 聊天框设置 -->
    <!-- 这里UI难看，但是能用 -->
    <v-dialog v-model="msgDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">聊天框设置</span>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="msgDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-subheader class="pl-0">显示的聊天记录长度，超出后自动删除之前的。默认一组(64)</v-subheader>
          <v-slider v-model="maxMsgLog" thumb-label min="2">
            <template v-slot:append>
              <v-text-field
                v-model="maxMsgLog"
                class="mt-0 pt-0"
                hide-details
                single-line
                type="number"
                style="width: 60px"
              ></v-text-field>
              <v-btn elevation="2" @click="setMaxMsgLog">保存</v-btn>
            </template>
          </v-slider>
          <v-switch v-model="autoScroll" label="有新消息时是否滚动到最底部"></v-switch>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.status" :timeout="snackbar.timeout" top :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.status = false">关闭</v-btn>
      </template>
    </v-snackbar>
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
  name: "ChatWithGroup",
  data: () => ({
    qq: null,
    dialog: null,
    tab: null,
    socket: null,
    socketForMsg: null,
    msgList: [],
    sMsg: null,
    sAt: {
      dialog: null,
      btnLoading: false,
      name: { name: "@", type: "At" },
      items: [
        { name: "谁？", type: "At" },
        { name: "全体成员", type: "AtAll" }
      ],
      target: ""
    },
    sImg: {
      dialog: null,
      btnLoading: false,
      url: ""
    },
    sVoice: {
      dialog: null,
      btnLoading: false,
      url: ""
    },
    sXml: {
      dialog: null,
      btnLoading: false,
      xml: ""
    },
    msgDialog: null,
    maxMsgLog: 64,
    autoScroll: true,
    snackbar: {
      status: false,
      text: null,
      timeout: 2000
    }
  }),

  created() {
    this.qq = localStorage.qq;
    this.launchWs();
    if (localStorage.maxMsgLog) this.maxMsgLog = Number(localStorage.maxMsgLog);
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
      // 有新消息时，自动滚到最底
      this.autoScroll &&
        this.$nextTick(() => {
          var chatArea = document.getElementById("chatArea");
          chatArea.scrollTop = chatArea.scrollHeight;
        });

      // 窗口内有超过一组消息时，删除第一条消息
      if (val > this.maxMsgLog) this.msgList.shift();
    }
  },

  methods: {
    // 启动 WebSocket 连接，用于接收消息
    launchWs() {
      this.socket = true;
      this.socket = new WebSocket(
        "ws://" +
          localStorage.addr.split("//")[1] +
          "/message?verifyKey=" +
          localStorage.verifyKey +
          "&qq=" +
          localStorage.qq +
          "&sessionKey=" +
          localStorage.sessionKey
      );

      this.socketForMsg = true;
      this.socketForMsg = new WebSocket(
        "ws://" +
          localStorage.addr.split("//")[1] +
          "/event?verifyKey=" +
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

      // 监听事件
      this.socketForMsg.onmessage = this.onEvent;
    },

    wsOpen() {
      console.log("Websocket 连接成功");
    },

    wsError() {
      console.error("Websocket 连接错误");
    },

    onEvent(raw) {
      var evt = JSON.parse(raw.data);
      // 判断事件类型
      switch (evt.data.type) {
        case "BotGroupPermissionChangeEvent": {
          if (evt.data.group.id != this.$route.params.id) return;
          this.snackbar.text = `你已从原来的${evt.data.origin}更改为${evt.data.current}`;
          this.snackbar.color = "primary";
          this.snackbar.status = true;
          break;
        }
        case "BotMuteEvent": {
          this.snackbar.text = `你已被${evt.data.operator.memberName}禁言 ${evt
            .data.durationSeconds / 60} 分钟`;
          this.snackbar.color = "red accent-2";
          this.snackbar.status = true;
          break;
        }
        case "BotUnmuteEvent": {
          this.snackbar.text = `你已被${evt.data.operator.memberName}取消禁言`;
          this.snackbar.color = "success";
          this.snackbar.status = true;
          break;
        }
      }
    },

    onMsg(raw) {
      var msg = JSON.parse(raw.data);
      //   判断是不是群消息
      if (msg.data.type != "GroupMessage") return;
      if (msg.data.sender.group.id != this.$route.params.id) return;
      // console.log(msg)
      // console.log(this.$route.params.id)
      this.msgList.push(msg.data);
    },

    // 处理收到的消息
    processMsg(msg) {
      var 合并の = [];
      for (var i = 1; i < msg.length; i++) {
        switch (msg[i].type) {
          case "Quote": {
            let 哎 = `<blockquote style="padding-left: 10px;margin-bottom: 10px;border-left: 4px solid #1fffeba1"><span>${msg[i].origin[0].text}</span><footer style="color: #818181;font-size:13px">来自： ${msg[i].senderId} | MsgID: ${msg[i].id}</footer></blockquote>`;
            合并の.push(哎);
            break;
          }
          case "At":
            合并の.push("@" + msg[i].target + " ");
            break;
          case "AtAll":
            合并の.push("@全体成员 ");
            break;
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
              "<img src=" +
                msg[i].url +
                " referrerPolicy='no-referrer' style='max-width: 15%'>"
            );
            break;
          case "FlashImage":
            合并の.push(
              "<img src=" +
                msg[i].url +
                " referrerPolicy='no-referrer' style='max-width: 15%'>"
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
          case "App": {
            const content = JSON.parse(msg[i].content);
            let 哎 = `【APP消息】${content.meta.messages.title}<br>
                Desc: ${content.meta.messages.desc}<br>
                Tag: ${content.meta.messages.tag}<br>
                Url: <a href="${content.meta.messages.jumpUrl}" target="_blank">点击跳转</a>
            `;
            合并の.push(哎);
            break;
          }
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
          case "Forward": {
            // 我承认这里有我懒和不会的成分，但是是真的处于性能考虑
            let 哎 = `[转发的聊天记录] <small>（出于性能原因暂不支持浏览，请在浏览器控制台查看）</small>`;
            合并の.push(哎);
            console.log(msg[i].nodeList);
            break;
          }
        }
      }
      return 合并の.join("");
    },

    // 发送消息
    async sendMsgg(chain) {
      const res = await axios.post(localStorage.addr + "/sendGroupMessage", {
        sessionKey: localStorage.sessionKey,
        target: this.$route.params.id,
        messageChain: [chain]
      });

      // 万一发不出去呢
      if (res.data.code != 0) {
        this.snackbar.text = res.data.msg;
        this.snackbar.color = "red accent-2";
        this.snackbar.status = true;
        return
      }
      
      //   伪造一条假的
      var obj = {
        type: "GroupMessage",
        sender: {
          group: {
            id: this.$route.params.id
          },
          id: this.qq
        },
        messageChain: [
          {
            id: res.messageId,
            time: Date.now()
              .toString()
              .slice(0, 10),
            type: "Source"
          },
          chain
        ]
      };
      this.msgList.push(obj);
    },

    // 发送文本消息
    sendMsg() {
      const chain = {
        type: "Plain",
        text: this.sMsg
      };
      this.sendMsgg(chain);
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
      const chain = {
        type: "Image",
        url: this.sImg.url
      };
      this.sendMsgg(chain);
      this.sImg = {
        dialog: null,
        btnLoading: false,
        file: ""
      };
    },

    // 发送烂掉的语音
    async sendVoice() {
      if (this.sVoice.url === "") return;
      if (this.sVoice.url.split("http")[0] != "") return;
      this.sVoice.btnLoading = true;
      const chain = {
        type: "Voice",
        url: this.sVoice.url
      };
      this.sendMsgg(chain);
      this.sVoice = {
        dialog: null,
        btnLoading: false,
        file: ""
      };
    },

    // 发送At
    async sendAt() {
      this.sAt.btnLoading = true;
      const chain = {
        type: this.sAt.name.type,
        target: this.sAt.target
      };
      this.sendMsgg(chain);
      this.sAt.dialog = false;
      this.sAt.btnLoading = false;
      this.sAt.target = "";
    },

    // 发送XML
    async sendXml() {
      if (this.sXml.xml === "") return;
      this.sXml.btnLoading = true;
      const chain = {
        type: "Xml",
        xml: this.sXml.xml
      };
      this.sendMsgg(chain);
      this.sXml = {
        dialog: null,
        btnLoading: false,
        xml: ""
      };
    },

    // 设置最大聊天记录长度
    setMaxMsgLog() {
      localStorage.setItem("maxMsgLog", this.maxMsgLog);
      this.snackbar.text = "保存成功";
      this.snackbar.color = "success";
      this.snackbar.status = true;
    }
  }
};
</script>