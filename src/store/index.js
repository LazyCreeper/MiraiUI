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
        id: 2211717435,
        nickname: 'Lazy',
        remark: '',
      }
    },
    friendList: [
      {
        id: 1,
        nickname: "Lazy",
        remark: "Master",
      }
    ],
    drawer: null,
    router: null,
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
    },
    friendList(state, data) {
      state.friendList = data
    },
    router(state, data) {
      state.router = data
    },
    drawer(state, data) {
      state.drawer = data
    },
  },
  actions: {},
  modules: {},
});
