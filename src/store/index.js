import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    verifyKey: null,
    sessionKey: null,
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
    verifyKey(state, data) {
      state.verifyKey = data
    },
    sessionKey(state, data) {
      state.sessionKey = data
    }
  },
  actions: {},
  modules: {},
});
