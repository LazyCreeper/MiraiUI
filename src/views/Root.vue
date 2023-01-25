<template>
  <div>
    <v-container style="height: 400px;">
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col class="text-subtitle-1 text-center" cols="12">Loading...</v-col>
        <v-col cols="6">
          <v-progress-linear indeterminate rounded height="6"></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
  <script>
export default {
  data: function() {
    return {};
  },
  methods: {
    init() {
      try {
        if (localStorage.getItem("sessionKey")) return this.$router.push("/main");
        this.$router.push("/login");
      } catch (error) {
        console.log("Root.vue err:");
        console.log(error);
        this.$router.push("/login");
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
  