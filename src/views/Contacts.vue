<template>
  <div>
    联系人
  </div>
</template>

<script>
export default {
  name: "Contacts",

  data: () => ({

  }),

  mounted() {
    this.$store.commit("router", "contacts");
  }
};
</script>
