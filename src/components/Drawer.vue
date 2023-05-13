<template>
  <div>
    <v-navigation-drawer
      v-model="$store.state.drawer"
      app
      width="300"
      :disable-route-watcher="true"
    >
      <!--最左侧菜单 -->
      <div class="left-drawer">
        <v-avatar class="d-block text-center mx-auto mt-4" color="grey darken-1" size="36">
          <v-img :src="'https://q1.qlogo.cn/g?b=qq&nk='+$store.state.sessionInfo.qq.id+'&s=160'" />
        </v-avatar>

        <v-divider class="mx-3 my-5"></v-divider>

        <v-btn
          class="d-flex text-center mx-auto mb-5"
          color
          active-class="blue--text"
          to="/main"
          text
          fab
          small
        >
          <v-icon dark>mdi-message-text</v-icon>
        </v-btn>
        <v-btn
          class="d-flex text-center mx-auto mb-5"
          color
          active-class="pink--text"
          to="/contacts"
          text
          fab
          small
        >
          <v-icon dark>mdi-account-heart-outline</v-icon>
        </v-btn>
        <v-btn
          class="d-flex text-center mx-auto mb-5"
          @click="logout.dialog = true"
          text
          fab
          small
          active-class="yellow--text"
        >
          <v-icon dark>mdi-logout-variant</v-icon>
        </v-btn>
      </div>

      <v-sheet color="grey darken-2" width="100%" hide-overla>
        <v-img src="https://api.imlazy.ink/img/" max-height="100">
          <template v-slot:default>
            <v-row
              class="fill-height ma-0"
              align="center"
              justify="center"
              style="backdrop-filter: brightness(0.5)"
            >
              <p>Hi, {{ $store.state.sessionInfo.qq.nickname }}</p>
            </v-row>
          </template>
        </v-img>
      </v-sheet>

      <!-- 消息列表 -->
      <v-list class="pl-14" shaped v-if="this.$store.state.router === 'main'">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>会话列表</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>这个功能没做</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>因为我群少</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>其次我不会</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>！你说你会？</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>去Github提交Pr~</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- 联系人 -->
      <v-list
        class="pl-14"
        shaped
        v-if="this.$store.state.router === 'contacts' || $route.path.split('/')[1] === 'chat'"
      >
        <v-list-group prepend-icon="mdi-account-circle">
          <template v-slot:activator>
            <v-list-item-title>好友 ({{ friendList.length }})</v-list-item-title>
          </template>
          <v-list-item-group>
            <v-list-item
              v-for="(fList, i) in friendList"
              :key="i"
              link
              :to="'/chat/friend/'+fList.id"
              @click="toChat(fList)"
            >
              <v-list-item-avatar>
                <v-img :src="'https://q1.qlogo.cn/g?b=qq&nk='+fList.id+'&s=160'" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ fList.nickname }} ({{ fList.remark }})</v-list-item-title>
                <v-list-item-subtitle>{{ fList.id }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list-group>

        <v-list-group prepend-icon="mdi-account-group-outline">
          <template v-slot:activator>
            <v-list-item-title>群聊 ({{ groupList.length }})</v-list-item-title>
          </template>
          <v-list-item-group>
            <v-list-item
              v-for="(gList, i) in groupList"
              :key="i"
              link
              :to="'/chat/group/'+gList.id"
              @click="toChat(gList)"
            >
              <v-list-item-avatar>
                <v-img :src="'https://p.qlogo.cn/gh/'+gList.id+'/'+gList.id+'/100'" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ gList.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ (gList.permission === "MEMBER") ? "" : "🤴" }} {{ gList.id }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- 群成员列表 -->
    <v-navigation-drawer app clipped right v-if="$route.path.split('/')[2] === 'group'">
      <v-list dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>群成员（{{ groupMemberList.length+1 }}）</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-pagination
          v-model="page"
          :length="Math.ceil(groupMemberList.length/perPage)"
          :total-visible="3"
        ></v-pagination>

        <v-list-item v-if="groupMemberList[groupMemberList.length-1].permission === 'OWNER'">
          <v-list-item-content>
            <v-list-item-title
              :title="'入群时间：'+new Date(Number(groupMemberList[groupMemberList.length-1].joinTimestamp+'000')).toLocaleString()+' | 上次发言：'+new Date(Number(groupMemberList[groupMemberList.length-1].lastSpeakTimestamp+'000')).toLocaleString()"
            >{{groupMemberList[groupMemberList.length-1].memberName}}</v-list-item-title>
            <v-list-item-subtitle>【群主】{{ groupMemberList[groupMemberList.length-1].id }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          v-for="(gMList, i) in groupMemberList.slice((this.page - 1)* this.perPage, this.page* this.perPage)"
          :key="i"
        >
          <v-list-item-content
            v-if="gMList.permission != 'OWNER'"
            :title="'入群时间：'+new Date(Number(gMList.joinTimestamp+'000')).toLocaleString()+' | 上次发言：'+new Date(Number(gMList.lastSpeakTimestamp+'000')).toLocaleString()+' | 禁言剩余：'+gMList.muteTimeRemaining+'分钟'"
          >
            <v-list-item-title>{{gMList.memberName}}</v-list-item-title>
            <v-list-item-subtitle>{{ (gMList.permission === "ADMINISTRATOR") ? "【管理员】" : "" }} {{ gMList.id }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-pagination
        v-model="page"
        :length="Math.ceil(groupMemberList.length/perPage)"
        :total-visible="3"
      ></v-pagination>
    </v-navigation-drawer>

    <!-- 好友信息 -->
    <v-navigation-drawer app clipped right v-if="$route.path.split('/')[2] === 'friend'">
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>好友信息</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="friendProfile.sign">
          <v-list-item-content>
            <v-list-item-title>个性签名</v-list-item-title>
            <v-list-item-subtitle>{{ friendProfile.sign }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="friendProfile.email">
          <v-list-item-content>
            <v-list-item-title>邮箱</v-list-item-title>
            <v-list-item-subtitle>{{ friendProfile.email }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="friendProfile.sex">
          <v-list-item-content>
            <v-list-item-title>性别</v-list-item-title>
            <v-list-item-subtitle>{{ (friendProfile.sex === "MALE") ? "男♂" : (friendProfile.sex === "FEMALE") ? "女♀" : "未知"}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="friendProfile.age">
          <v-list-item-content>
            <v-list-item-title>年龄</v-list-item-title>
            <v-list-item-subtitle>{{ friendProfile.age }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="friendProfile.level">
          <v-list-item-content>
            <v-list-item-title>等级</v-list-item-title>
            <v-list-item-subtitle>{{ friendProfile.level }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 登出确认对话框 -->
    <v-dialog v-model="logout.dialog" max-width="400px">
      <v-card>
        <v-card-title class="red darken-1">
          <span class="text-h5">警告</span>
          <v-spacer></v-spacer>
          <v-btn icon plain @click="logout.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-subtitle-1 mt-4">是否登出？</v-card-text>
        <v-card-actions>
          <v-btn elevation="2" @click="logout.dialog = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn elevation="2" color="red" :loading="logout.btnLoading" @click="toLogout">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Drawer",
  data: () => ({
    drawer: null,
    friendList: [
      {
        id: 1,
        nickname: "Lazy",
        remark: "Master"
      }
    ],
    groupList: [
      {
        id: 123456789,
        name: "群名1",
        permission: "MEMBER"
      }
    ],
    groupMemberList: [
      {
        id: 1234567890,
        memberName: "",
        permission: "MEMBER",
        specialTitle: "群头衔",
        joinTimestamp: 12345678,
        lastSpeakTimestamp: 8765432,
        muteTimeRemaining: 0,
        group: {
          id: 12345,
          name: "群名1",
          permission: "MEMBER"
        }
      },
      {
        id: 9876543210,
        memberName: "",
        specialTitle: "群头衔",
        permission: "OWNER",
        joinTimestamp: 12345678,
        lastSpeakTimestamp: 8765432,
        muteTimeRemaining: 0,
        group: {
          id: 54321,
          name: "群名2",
          permission: "MEMBER"
        }
      }
    ],
    friendProfile: {
      email: "email",
      age: 18,
      level: 1,
      sign: "mirai",
      sex: "UNKNOWN" // UNKNOWN, MALE, FEMALE
    },
    page: 1,
    perPage: 14,
    logout: {
      dialog: null,
      btnLoading: null
    }
  }),

  watch: {},

  mounted() {
    this.getFriendList();
    this.getGroupList();
  },

  updated() {
    // console.log(this.)
  },

  methods: {
    // 获取好友列表
    async getFriendList() {
      const { data: fList } = await axios.get(
        localStorage.addr + "/friendList?sessionKey=" + localStorage.sessionKey
      );
      this.friendList = fList.data;
      // this.$store.commit("friendList", fList.data);
    },

    // 获取群列表
    async getGroupList() {
      const { data: gList } = await axios.get(
        localStorage.addr + "/groupList?sessionKey=" + localStorage.sessionKey
      );
      this.groupList = gList.data;
    },

    // 进入聊天窗口
    toChat(d) {
      const obj = {
        id: d.id,
        name: d.nickname || d.name,
        remark: d.remark
      };
      this.$store.commit("chat", obj);
      this.getFriendProfile(obj);
      this.getGroupmemberList(obj);
    },

    // 获取好友信息
    async getFriendProfile(o) {
      const { data: fProfile } = await axios.get(
        localStorage.addr +
          "/friendProfile?sessionKey=" +
          localStorage.sessionKey +
          "&target=" +
          o.id
      );
      this.friendProfile = fProfile;
    },

    // 获取群成员列表
    async getGroupmemberList(o) {
      const { data: gMemberList } = await axios.get(
        localStorage.addr +
          "/memberList?sessionKey=" +
          localStorage.sessionKey +
          "&target=" +
          o.id
      );
      this.groupMemberList = gMemberList.data.sort(function(a, b) {
        var x = a.permission.toLowerCase();
        var y = b.permission.toLowerCase();
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      });
    },

    // 登出
    async toLogout() {
      this.logout.btnLoading = true;

      // 释放 sessionKey
      axios
        .post(localStorage.addr + "/release", {
          sessionKey: localStorage.sessionKey,
          qq: localStorage.qq
        })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.error(err.message);
        });

      // 清除本地数据
      localStorage.removeItem("addr");
      localStorage.removeItem("qq");
      localStorage.removeItem("sessionKey");
      localStorage.removeItem("verifyKey");

      // 刷新页面
      this.logout.btnLoading = false;
      window.location.reload();
    }
  }
};
</script>

<style scoped>
.left-drawer {
  position: absolute;
  padding: 3px 7px;
  height: 100%;
  border-right: 1px solid #585858;
  z-index: 1;
  background: #363636;
}
</style>