<template>
  <div>
    <v-navigation-drawer v-model="$store.state.drawer" app width="300">
      <!--最左侧菜单 -->
      <v-navigation-drawer v-model="$store.state.drawer" absolute mini-variant>
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
          to="addFriend"
          text
          fab
          small
          active-class="yellow--text"
        >
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </v-navigation-drawer>

      <v-sheet color="grey lighten-5" width="100%">
        <v-img src="https://cdn.imlazy.ink:233/img/background/72731287_p0.png" max-height="100">
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
        <v-list-item v-for="n in 5" :key="n" link>
          <v-list-item-content>
            <v-list-item-title>会话 {{ n }}</v-list-item-title>
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
                <v-list-item-subtitle>{{ (gList.permission === "MEMBER") ? "🤴" : "" }} {{ gList.id }}</v-list-item-subtitle>
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
            <v-list-item-subtitle>群成员列表（{{ groupMemberList.length }}）</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="groupMemberList[groupMemberList.length-1].permission === 'OWNER'">
          <v-list-item-content>
            <v-list-item-title>{{groupMemberList[groupMemberList.length-1].memberName}}</v-list-item-title>
            <v-list-item-subtitle>【群主】{{ groupMemberList[groupMemberList.length-1].id }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-for="(gMList, i) in groupMemberList" :key="i">
          <v-list-item-content v-if="gMList.permission != 'OWNER'">
            <v-list-item-title>{{gMList.memberName}}</v-list-item-title>
            <v-list-item-subtitle>{{ (gMList.permission === "ADMINISTRATOR") ? "【管理员】" : "" }} {{ gMList.id }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
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
    }
  }
};
</script>
