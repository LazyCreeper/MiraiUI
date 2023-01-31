import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "root",
    component: () => import("../views/Root.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/main",
    name: "main",
    component: () => import("../views/Main.vue"),
  },
  {
    path: "/contacts",
    name: "contacts",
    component: () => import("../views/Contacts.vue"),
  },
  {
    path: "/chat/friend/:id",
    name: "chatWithFriend",
    component: () => import("../views/chat/Friend.vue"),
  },
  {
    path: "/chat/group/:id",
    name: "chatWithFriend",
    component: () => import("../views/chat/Group.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
