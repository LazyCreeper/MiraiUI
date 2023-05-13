<template>
  <div>
    <v-dialog v-model="dialog" transition="dialog-top-transition" max-width="500" persistent>
      <v-card class="red">
        <v-card-title>
          严重错误
          <v-spacer></v-spacer>:(
        </v-card-title>
        <v-card-text>
          <div class="pt-5 white--text">
            <p>{{ $store.state.error.msg ? $store.state.error.msg : "未知错误" }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text class="mr-4" @click="refresh">刷新页面</v-btn>
          <v-btn color @click="reset">清除现有数据并返回登录</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.status" :timeout="snackbar.timeout" top text>
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar.status = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
// import axios from "axios";

export default {
  name: "ErrorPage",
  data: () => ({
    dialog: true,
    snackbar: {
      status: false,
      text: null,
      timeout: 2000
    },
    btnLoading: false
  }),

  created() {
    if (!this.$store.state.error.msg) location.href = "/";
  },

  methods: {
    refresh() {
      location.reload();
    },
    reset() {
      localStorage.clear();
      this.$router.push("login");
    }
  }
};
</script>