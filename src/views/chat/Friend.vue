<template>
  <div>与 {{ $route.params.id }} {{ $route.params.name }} 聊天</div>
</template>

<script>
export default {
    name: "ChatWithFriend",
    data: () => ({
        
    }),

    created() {
        
    },

    updated() {
        this.updateWindow()
    },

    destroyed() {
        const obj = {
                id: null,
                name: null
            }
        this.$store.commit("chat", obj);
    },

    methods: {
        updateWindow() {
            const obj = {
                id: this.$route.params.id,
                name: this.$route.params.name
            }
            this.$store.commit("chat", obj);
        }
    }
}
</script>