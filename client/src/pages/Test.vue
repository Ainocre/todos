<template>
    <div class="q-pa-md">
        <q-input @keydown.enter="sendMessage" placeholder="Nouveau message" autofocus v-model="message" />
        <ul>
            <li
                v-for="message in store.messages.all"
                :key="message.id"
            >
                {{message.content}}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'Test',
    data() {
        return {
            message: '',
        }
    },
    methods: {
        sendMessage() {
            this.store.messages.add({ content: this.message })
            this.message = ''
        },
    },
}
</script>