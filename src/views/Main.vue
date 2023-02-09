<template>
  <div>
    <v-container style="height: 250px;">
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col class="display-4 text-center" cols="12">MiraiUI</v-col>
        <v-col cols="12" class="text-center">欢迎使用MiraiUI，从左侧联系人列表随便挑一个即可发起聊天</v-col>
        <v-col cols="12" class="text-center">
          <a href="https://github.com/LazyCreeper/MiraiUI/" target="_blank">
            <img
            alt="GitHub Repo stars"
            src="https://img.shields.io/github/stars/LazyCreeper/miraiui?color=yellow&style=for-the-badge"
          />
          </a>
          <img
            alt="GitHub commit activity"
            src="https://img.shields.io/github/commit-activity/m/LazyCreeper/miraiui?style=for-the-badge"
            class="ml-2 mr-2"
          />
          <a href="https://qn-store-pub-tx.seewo.com/676b69a1b8ad4f9391555c127a2331c7165760252223383" target="_blank">
            <img
            alt="Donate"
            src="https://img.shields.io/badge/$-donate-ff69b4.svg?style=for-the-badge"
          />
          </a>
        </v-col>
      </v-row>
      <v-row align-content="center" justify="center">
        <v-col cols="12">
          <v-card class="mx-auto" max-width="344" outlined>
            <v-list-item three-line>
              <v-list-item-content>
                <div class="text-overline mb-2">{{ botProfile.nickname }}</div>
                <v-list-item-title>基本信息</v-list-item-title>
                <v-list-item-subtitle v-if="botProfile.email">邮箱：{{ botProfile.email }}</v-list-item-subtitle>
                <v-list-item-subtitle>性别：{{ (botProfile.sex === "MALE") ? "男♂" : (botProfile.sex === "FEMALE") ? "女♀" : "未知"}}</v-list-item-subtitle>
                <v-list-item-subtitle>年龄：{{ botProfile.age }}</v-list-item-subtitle>
                <v-list-item-subtitle>等级：{{ botProfile.level }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-avatar size="80" color="grey">
                <v-img :src="'https://q1.qlogo.cn/g?b=qq&nk='+qq+'&s=160'"></v-img>
              </v-list-item-avatar>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" class="text-center">
          Copyright © {{ new Date().getFullYear() }} Lazy all right reserved
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Main",

  data: () => ({
    qq: null,
    botProfile: {
      nickname: "nickname",
      email: "email",
      age: 18,
      level: 1,
      sign: "mirai",
      sex: "UNKNOWN"
    }
  }),

  mounted() {
    this.$store.commit("router", "main");
    this.qq = localStorage.qq;
    this.getBotProfile();
  },

  methods: {
    // 获取Bot自身信息
    async getBotProfile() {
      const { data: bProfile } = await axios.get(
        localStorage.addr + "/botProfile?sessionKey=" + localStorage.sessionKey
      );
      this.botProfile = bProfile;
    }
  }
};
</script>
