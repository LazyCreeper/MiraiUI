<template>
  <v-app>
    <v-system-bar app dark height="30">
      <span>WebQQ</span>
      <v-spacer></v-spacer>
      <v-icon>mdi-wifi-strength-4</v-icon>
      <v-icon>mdi-signal-cellular-outline</v-icon>
      <v-icon>mdi-battery</v-icon>
      <span>{{ time }}</span>
    </v-system-bar>
    <v-app-bar app dark clipped-right flat height="60">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>WebQQ</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app width="300">
      <v-navigation-drawer v-model="drawer" absolute mini-variant>
        <v-avatar class="d-block text-center mx-auto mt-4" color="grey darken-1" size="36">
          <v-img :src="'https://q1.qlogo.cn/g?b=qq&nk='+$store.state.sessionInfo.qq.id+'&s=160'" />
        </v-avatar>

        <v-divider class="mx-3 my-5"></v-divider>

        <v-avatar
          v-for="n in 6"
          :key="n"
          class="d-block text-center mx-auto mb-9"
          color="grey lighten-1"
          size="28"
        ></v-avatar>
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

      <v-list class="pl-14" shaped>
        <v-list-item v-for="n in 5" :key="n" link>
          <v-list-item-content>
            <v-list-item-title>Item {{ n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer app clipped right>
      <v-list>
        <v-list-item v-for="n in 5" :key="n" link>
          <v-list-item-content>
            <v-list-item-title>Item {{ n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  name: "App",

  data: () => ({
    time: null,
    drawer: null
  }),

  created() {
    if (!localStorage.getItem("sessionKey")) {
      this.$router.push("login");
    }
    this.getSessionInfo();
  },

  mounted() {
    setInterval(() => {
      this.time = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(11, 8);
    }, 1000);
  },

  methods: {
    async getSessionInfo() {
      const { data: info } = await axios.get(
        localStorage.addr + "/sessionInfo?sessionKey=" + localStorage.sessionKey
      );
      this.$store.commit("sessionInfo", info.data);
    }
  }
};
</script>
