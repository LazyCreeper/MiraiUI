import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    addr: null,
    verifyKey: null,
    sessionKey: null,
    sessionInfo: {
      qq: {
        id: null,
        nickname: null,
        remark: null,
      }
    },
    friendList: [
      {
        id: "",
        nickname: "",
        remark: "",
      }
    ]
  },
  getters: {},
  mutations: {
    addr(state, data) {
      state.addr = data
    },
    verifyKey(state, data) {
      state.verifyKey = data
    },
    sessionKey(state, data) {
      state.sessionKey = data
    },
    sessionInfo(state, data) {
      state.sessionInfo = data
    }
  },
  actions: {},
  modules: {},
});
