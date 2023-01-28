<template>
  <div>
    <div class="bg"></div>
    <v-card elevation="0" outlined class="login-card mt-6">
      <v-card-title>
        <v-spacer></v-spacer>登录
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field v-model="addr" :rules="addrRules" label="http-api 地址" required outlined></v-text-field>
          <v-text-field v-model="qq" :rules="qqRules" label="QQ号" required outlined></v-text-field>

          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="sessionKey"
            type="password"
            required
            outlined
          ></v-text-field>

          <br />
          <v-btn
            :disabled="!valid"
            color="success"
            class="mr-4"
            @click="validate"
            :loading="btnLoading"
          >验证</v-btn>

          <v-btn color="error" class="mr-4" @click="reset">重置</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar.status" :timeout="snackbar.timeout" top text>
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar.status = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";
import { getSessionInfo } from "@/service/tools";

export default {
  data: () => ({
    valid: null,
    addr: "http://127.0.0.1:2345",
    addrRules: [v => !!v || "请输入http-api地址"],
    qq: null,
    qqRules: [v => !!v || "请输入QQ号"],
    password: null,
    passwordRules: [v => !!v || "请输入sessionKey"],
    checkbox: false,
    snackbar: {
      status: false,
      text: null,
      timeout: 2000
    },
    btnLoading: false
  }),

  created() {
    if (localStorage.getItem("sessionKey")) {
      window.location.href = "/main"
    }
  },

  methods: {
    async validate() {
      this.$refs.form.validate();
      if (!this.$refs.form.validate()) {
        this.snackbar.text = "请填写表单完整";
        this.snackbar.status = true;
        return;
      }
      this.btnLoading = true;

      //   认证
      const { data: verify } = await axios.post(this.addr + "/verify", {
        verifyKey: this.password
      });
      //   如果认证失败
      if (verify.code != 0) {
        this.snackbar.text = verify.msg;
        this.snackbar.status = true;
        this.btnLoading = false;
        return;
      }

      // 即使有Vuex但我还是要把重要信息丢你浏览器
      localStorage.setItem("addr",this.addr)
      localStorage.setItem("sessionKey",verify.session)
      localStorage.setItem("verifyKey",this.password)
      localStorage.setItem("qq",this.qq)

      //   绑定
      const { data: bind } = await axios.post(this.addr + "/bind", {
        sessionKey: verify.session,
        qq: this.qq
      });
      //   如果绑定不上
      if (bind.code != 0) {
        this.snackbar.text = bind.msg;
        this.snackbar.status = true;
        this.btnLoading = false;
        return;
      }
      this.btnLoading = false;

      // 绑定成功，获取会话信息
      await getSessionInfo()

      this.$store.commit("isLogin", true);
      // window.location.href = "/#/main"
      this.$router.push('main')
    },
    reset() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style scoped>
.login-card {
  z-index: 7;
  width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.bg {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 6;
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  top: 0;
  left: 0;
}
</style>