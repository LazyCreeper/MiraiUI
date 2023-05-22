<template>
  <v-app>
    <v-system-bar app dark height="30">
      <span>Mirai</span>
      <v-spacer></v-spacer>
      <v-icon>mdi-wifi-strength-4</v-icon>
      <v-icon>mdi-signal-cellular-outline</v-icon>
      <v-icon>mdi-battery</v-icon>
      <span>{{ time }}</span>
    </v-system-bar>
    <v-app-bar app dark clipped-right flat height="60">
      <v-app-bar-nav-icon @click="drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ ($store.state.chat.name) ? $store.state.chat.name : "Mirai" }} {{ ($store.state.chat.remark) ? " (" + $store.state.chat.remark + ")" : "" }} {{ ($route.params.id) ? " 『" + $route.params.id + "』" : "" }}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <Drawer v-if="$store.state.isLogin" />

    <v-main>
      <v-container>
        <v-overlay :value="!$store.state.isLogin">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// import axios from "axios";
import Drawer from "@/components/Drawer";
import { getSessionInfo } from "@/service/tools";
export default {
  name: "App",
  components: {
    Drawer
  },

  data: () => ({
    time: null,
    isLogin: false
  }),

  created() {
    if (!localStorage.getItem("sessionKey")) {
      this.$router.push("login");
      return;
    } else {
      getSessionInfo();
    }
  },

  mounted() {
    setInterval(() => {
      this.time = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(11, 8);
    }, 1000);
  },

  methods: {
    drawer() {
      this.$store.commit("drawer", !this.$store.state.drawer);
    }
  }
};
</script>
