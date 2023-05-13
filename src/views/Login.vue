<template>
  <div>
    <div class="bg"></div>
    <v-card elevation="0" outlined class="login-card mt-6">
      <v-card-title>
        <v-spacer></v-spacer>登录
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-form v-if="!useBackendLogin" ref="form" v-model="valid" lazy-validation>
          <v-text-field v-model="addr" :rules="addrRules" label="http-api 地址" required outlined></v-text-field>
          <v-text-field v-model="qq" :rules="qqRules" label="QQ号" required outlined></v-text-field>

          <v-text-field v-model="password" :rules="passwordRules" label="sessionKey" type="password" required
            outlined></v-text-field>

          <div class="loginbtn">
            <v-btn :disabled="!valid" color="success" class="mr-4" @click="validate" :loading="btnLoading">验证</v-btn>

            <v-btn color="error" class="mr-4" @click="reset">重置</v-btn>
            <v-btn color="orange" class="mr-4" @click="loginBackendBtn(true)">使用后端登录</v-btn>

          </div>
        </v-form>
        <!-- 使用后端登录 -->
        <div class="usebackendlogin" v-if="useBackendLogin">
          <div class="usebackendlogin-tips">
            注意：使用该功能需要在打包前配置项目根目录下的.env文件，在文件中配置后端地址，否则无法使用！
          </div>
          <div class="usebackendlogin-ipt" v-if="!loginsuccessful">
            <v-text-field v-model="pwd" :rules="pwdRules" label="登录密码" required outlined></v-text-field>
            <p v-if="pwderr">密码错误，请重新输入</p>
            <span v-if="knowerr">发生未知错误</span>
          </div>
          <div class="usebackendlogin-btns" v-if="!loginsuccessful">
            <v-btn color="success" class="mr-4" @click="loginBackend" :loading="btnLoading">验证</v-btn>
            <v-btn color="orange" class="mr-4" @click="loginBackendBtn(false)">返回正常登录</v-btn>
          </div>
          <div class="usebackendloginseleteList" v-if="loginsuccessful">
            <br>
            <p>请选择需要登录的账号</p>
            <ul>
              <li v-for="item in qqlist" :key="item.id">
                <a href="javascript:;" @click="seleteQQ(item)">[{{ item.id }}]{{ item.name }}({{ item.qq }})</a>
              </li>
            </ul>
          </div>
        </div>
        <span>
          Copyright © {{ new Date().getFullYear() }}
          <a href="https://lazy.ink" target="_blank">Lazy</a> all right reserved
        </span>
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
import backendAxios from "@/utils/request"

export default {
  data: () => ({
    valid: null,
    addr: "",
    addrRules: [v => !!v || "请输入http-api地址"],
    pwdRules: [v => !!v || "请输入登录密码地址"],
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
    btnLoading: false,
    useBackendLogin: false,
    pwd: '',
    pwderr: false,
    knowerr: false,
    loginsuccessful: false,
    qqlist: ''
  }),

  created() {
    if (localStorage.getItem("sessionKey")) {
      window.location.href = "/main";
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

      // 先试下认证地址6不6
      try {
        await axios.post(this.addr + "/verify", {
          verifyKey: this.password
        });
      } catch (err) {
        this.snackbar.text = err.message;
        this.snackbar.status = true;
        this.btnLoading = false;
        return;
      }

      //  6的，那就再来一次认证
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
      localStorage.setItem("addr", this.addr);
      localStorage.setItem("sessionKey", verify.session);
      localStorage.setItem("verifyKey", this.password);
      localStorage.setItem("qq", this.qq);

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
      await getSessionInfo();

      this.$store.commit("isLogin", true);
      // window.location.href = "/#/main"
      this.$router.push("main");
    },
    reset() {
      this.$refs.form.reset();
      this.btnLoading = false;
    },
    // 使用后端登录
    loginBackendBtn(val) {
      if (val) {
        this.useBackendLogin = true
      } else {
        this.useBackendLogin = false
      }
    },
    async loginBackend() {
      this.btnLoading = true
      this.pwderr = false
      const { data } = await backendAxios.get(`/api/getUsers?pwd=${this.pwd}`)
      this.btnLoading = false
      // console.log(data);
      // 判断
      if (data.status == 403) {
        // 密码错误
        return this.pwderr = true
      }
      if (data.status == 200) {
        // 获取数据成功
        this.qqlist = data.data
        return this.loginsuccessful = true
      }
      this.knowerr = true
    },
    async seleteQQ(i) {
      // console.log(i);
      const newAxios = axios.create()
      const { data } = await newAxios.post(`${i.http}/verify`, {
        verifyKey: i.sessionKey
      });
      // console.log(data);
      localStorage.setItem("addr", i.http);
      localStorage.setItem("sessionKey", data.session);
      localStorage.setItem("verifyKey", i.sessionKey);
      localStorage.setItem("qq", i.qq);

      //   绑定
      const { data: bind } = await newAxios.post(`${i.http}/bind`, {
        sessionKey: data.session,
        qq: i.qq
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
      await getSessionInfo();

      this.$store.commit("isLogin", true);
      this.$router.push("main");
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

.loginbtn {
  position: relative;
  margin-bottom: 15px;
}

.loginbtn button:nth-child(3) {
  position: absolute;
  right: 0;
  top: 0;
  margin: 0 !important;
}

/* .usebackendlogin {
  height: 500px;
} */

.usebackendlogin-ipt {
  margin-top: 25px;
}

.usebackendlogin-ipt p,
.usebackendlogin-ipt span {
  color: lightcoral;
}

.usebackendlogin-btns {
  position: relative;
  margin-bottom: 15px;
}
</style>