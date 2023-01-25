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
          color=""
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
          color=""
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
        <v-img src="https://api.imlazy.ink/img" max-height="100">
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
      <v-list class="pl-14" shaped v-if="this.$store.state.router === 'contacts'">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>好友</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item-group>
          <v-list-item v-for="(fList, i) in friendList" :key="i" link>
            <v-list-item-avatar>
              <v-img :src="'https://q1.qlogo.cn/g?b=qq&nk='+fList.id+'&s=160'" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ fList.nickname }} ({{ fList.remark }})</v-list-item-title>
              <v-list-item-subtitle>{{ fList.id }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>群聊</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer app clipped right>
      <v-list>
        <v-list-item v-for="n in 5" :key="n" link>
          <v-list-item-content>
            <v-list-item-title>TODO: 群成员 {{ n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: "Drawer",
  data: () => ({
    drawer: null,
    friendList: [
      {
        id: 1,
        nickname: "Lazy",
        remark: "Master",
      }
    ]
  }),

  watch: {
    
  },

  mounted() {
    // console.log(this.$router.history)
  },

  methods: {
    async getFriendList() {
      // const { data: fList } = await axios.get(
      //   localStorage.addr + "/friendList?sessionKey=" + localStorage.sessionKey
      // );
      // console.log(fList);
      // this.friendList = fList.data;
      // this.$store.commit("friendList", fList.data);
      // console.log("done");
    }
  }
};
</script>
