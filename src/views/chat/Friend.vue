<template>
  <div>
    <v-menu v-model="rMenu.open" :position-x="rMenu.x" :position-y="rMenu.y">
      <v-list>
        <v-list-item
          @click="sQuote.dialog = true;sQuote.msgId = tSender.msgId,sQuote.targetId = tSender.id"
        >回复</v-list-item>
        <!-- 添加其他菜单项 -->
      </v-list>
    </v-menu>
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
            @contextmenu.prevent="handleContextMenu(mList.sender,mList.messageChain[0].id,$event)"
            :src="(Number($route.params.id) === mList.sender.id) ? 'https://q1.qlogo.cn/g?b=qq&nk='+$route.params.id+'&s=160' : 'https://q1.qlogo.cn/g?b=qq&nk='+mList.sender.id+'&s=160' "
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title v-html="processMsg(mList.messageChain)"></v-list-item-title>
          <v-list-item-subtitle>{{ new Date(Number(mList.messageChain[0].time+"000")).toLocaleString() }} | MsgID: {{ mList.messageChain[0].id }}</v-list-item-subtitle>
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
                <v-btn @click="sPoke.dialog = true">
                  <v-icon v-bind="attrs" v-on="on">mdi-hand-pointing-right</v-icon>
                </v-btn>
              </template>
              <span>戳一戳</span>
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

    <!-- 发送戳一戳对话框 -->
    <v-dialog v-model="sPoke.dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">选择戳一戳类型</span>
          <small>（目前只有戳一戳和放大招可用）</small>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="sPoke.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-select
            label="选择类型"
            outlined
            v-model="sPoke.name"
            :items="sPoke.items"
            item-text="name"
            item-value="type"
            return-object
            class="pt-4"
          ></v-select>
          <v-btn elevation="2" block x-large :loading="sPoke.btnLoading" @click="sendPoke">发送</v-btn>
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

    <!-- 回复消息 -->
    <v-dialog v-model="sQuote.dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">回复</span>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="sQuote.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field label="Message ID" outlined v-model="sQuote.msgId"></v-text-field>
          <v-text-field label="要说的话" v-model="sQuote.msg" outlined counter></v-text-field>
          <v-btn
            elevation="2"
            block
            x-large
            :loading="sQuote.btnLoading"
            @click="sendQuote(sQuote.msgId)"
          >发送</v-btn>
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
          <v-row>
            <v-col cols="10" class="mt-1">
              <v-subheader>有新消息时是否滚动到最底部</v-subheader>
            </v-col>
            <v-col cols="2">
              <v-switch dense v-model="autoScroll"></v-switch>
            </v-col>
          </v-row>
          <v-btn
            elevation="2"
            color="green"
            @click="saveToIndex"
            v-if="$route.path.split('/')[1] === 'chat'"
          >保存到会话列表</v-btn>
          <v-btn elevation="2" color="red" @click="removeFromIndex" v-else>从会话列表中移除</v-btn>
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
import { ws } from "@/service/tools";
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
      url: ""
    },
    sPoke: {
      dialog: null,
      btnLoading: false,
      name: { name: "戳一戳", type: "Poke" },
      items: [
        { name: "戳一戳", type: "Poke" },
        { name: "比心", type: "ShowLove" },
        { name: "点赞", type: "Like" },
        { name: "心碎", type: "Heartbroken" },
        { name: "666", type: "SixSixSix" },
        { name: "放大招", type: "FangDaZhao" }
      ]
    },
    sXml: {
      dialog: null,
      btnLoading: false,
      xml: ""
    },
    sQuote: {
      dialog: null,
      btnLoading: false,
      targetId: null,
      msgId: null,
      msg: ""
    },
    msgDialog: null,
    maxMsgLog: 64,
    autoScroll: true,
    snackbar: {
      status: false,
      text: null,
      timeout: 2000
    },
    rMenu: {
      open: false,
      x: 0,
      y: 0
    },
    tSender: {}
  }),

  created() {
    this.launchWs();
    if (localStorage.maxMsgLog) this.maxMsgLog = Number(localStorage.maxMsgLog);
  },

  mounted() {},

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
      // 窗口聊天对象改变时，清空原有的聊天记录
      this.msgList = [];

      // 然后再读取新的
      this.loadLocalChatRecords();
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

      // 将保存数据到浏览器
      localStorage.setItem(
        "friend" + this.$route.params.id,
        JSON.stringify(this.msgList)
      );
    }
  },

  methods: {
    // 启动 WebSocket 连接，用于接收消息
    launchWs() {
      this.socket = true;
      this.socket = ws("message");
      // 监听 socket 连接
      this.socket.onopen = this.wsOpen;

      // 监听 socket 错误信息
      this.socket.onerror = this.wsError;

      // 监听 socket 消息
      this.socket.onmessage = this.onMsg;
    },

    wsOpen() {
      console.log("Websocket 连接成功");

      // 连上了再加载本地记录
      this.loadLocalChatRecords();
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
          case "Quote": {
            let 哎 = `<blockquote style="padding-left: 10px;margin-bottom: 10px;border-left: 4px solid #1fffeba1"><span>${msg[i].origin[0].text}</span><footer style="color: #818181;font-size:13px">来自： ${msg[i].senderId} | MsgID: ${msg[i].id}</footer></blockquote>`;
            合并の.push(哎);
            break;
          }
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
    async sendMsgg(chain, quote = null) {
      let mChain = [];
      const res = await axios.post(localStorage.addr + "/sendFriendMessage", {
        sessionKey: localStorage.sessionKey,
        target: this.$route.params.id,
        quote: quote ? quote[0].msgId : null,
        messageChain: [chain]
      });

      quote ? (mChain = [quote[1], quote[2]]) : (mChain[0] = chain);

      mChain.unshift({
        id: res.data.messageId,
        time: Date.now()
          .toString()
          .slice(0, 10),
        type: "Source"
      });

      // 万一发不出去呢
      if (res.data.code != 0) {
        this.snackbar.text = res.data.msg;
        this.snackbar.color = "red accent-2";
        this.snackbar.status = true;
        return;
      }

      //   伪造一条假的
      var obj = {
        type: "FriendMessage",
        sender: {
          id: localStorage.qq
        },
        messageChain: mChain
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

    // 发送戳一戳
    async sendPoke() {
      this.sPoke.btnLoading = true;
      const chain = {
        type: "Poke",
        name: this.sPoke.name.type
      };
      this.sendMsgg(chain);
      (this.sPoke.dialog = false), (this.sPoke.btnLoading = false);
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

    // 回复消息
    async sendQuote(msgId) {
      if (this.sQuote.msg === "") return;
      this.sQuote.btnLoading = true;
      const chain = { type: "Plain", text: this.sQuote.msg };
      const q = [
        { msgId: msgId },
        {
          type: "Quote",
          id: this.sQuote.msgId,
          senderId: localStorage.qq,
          targetId: this.sQuote.targetId,
          group: 0,
          origin: [{ type: "Plain", text: `Source: ${this.sQuote.msgId}` }]
        },
        { type: "Plain", text: this.sQuote.msg }
      ];
      this.sendMsgg(chain, q);
      this.sQuote = {
        dialog: null,
        btnLoading: false,
        msgId: null,
        msg: ""
      };
    },

    // 设置最大聊天记录长度
    setMaxMsgLog() {
      localStorage.setItem("maxMsgLog", this.maxMsgLog);
      this.snackbar.text = "保存成功";
      this.snackbar.status = true;
    },

    // 读取本地聊天记录
    loadLocalChatRecords() {
      if (!localStorage.getItem("friend" + this.$route.params.id)) return;
      this.msgList = JSON.parse(
        localStorage.getItem("friend" + this.$route.params.id)
      );
    },

    // 保存到会话列表
    saveToIndex() {
      if (this.$store.state.chat.id === null) {
        this.snackbar.text = "保存失败，请从左侧菜单重新进入聊天窗口";
        this.snackbar.color = "red accent-2";
        this.snackbar.status = true;
        return;
      }

      // 字符串转数组
      const arr = JSON.parse(localStorage.saveFList);

      if (
        arr.some(
          obj => JSON.stringify(obj) === JSON.stringify(this.$store.state.chat)
        )
      ) {
        this.snackbar.text = "该会话已存在";
        this.snackbar.color = "red accent-2";
        this.snackbar.status = true;
      } else {
        // 添加
        arr.push(this.$store.state.chat);
        localStorage.setItem("saveFList", JSON.stringify(arr));
        this.$store.commit("changeList", new Date());
        this.snackbar.text = "保存成功";
        this.snackbar.color = "green";
        this.snackbar.status = true;
      }
    },

    // 从会话列表中移除
    removeFromIndex() {
      if (this.$store.state.chat.id === null) {
        this.snackbar.text = "保存失败，请从左侧菜单重新进入聊天窗口";
        this.snackbar.color = "red accent-2";
        this.snackbar.status = true;
        return;
      }
      const arr = JSON.parse(localStorage.saveFList);

      const newArr = arr.filter(
        obj => JSON.stringify(obj) !== JSON.stringify(this.$store.state.chat)
      );
      localStorage.setItem("saveFList", JSON.stringify(newArr));

      this.snackbar.text = "移除成功";
      this.snackbar.color = "blue";
      this.snackbar.status = true;
      this.$store.commit("changeList", new Date());

      this.msgDialog = false;
    },

    /**
     * 右键菜单部分
     * 屎山+1好耶！
     */
    handleContextMenu(sender, msgId, $event) {
      this.rMenu = {
        open: true,
        x: $event.clientX,
        y: $event.clientY
      };
      this.tSender = sender;
      this.tSender.msgId = msgId;
    }
  }
};
</script>