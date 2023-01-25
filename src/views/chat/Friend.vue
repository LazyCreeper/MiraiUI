<template>
    <div>
        与 {{ $route.params.id }} {{ $route.params.name }} 聊天
    </div>
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
        console.log( this.$route)
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