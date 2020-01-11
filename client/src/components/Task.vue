<template>
    <q-item
        @dblclick="$emit('dblclick')"
        class="rounded-borders q-mb-xs items-center"
        :class="task.done ? 'bg-grey-3' : ''"
        :style="!task.done ? 'background: #fff1f6;' : ''"
        clickable
        dense
    >
        <q-checkbox
            style="display: inline-block"
            @input="task.done ? uncheckTask(task) : checkTask(task)"
            :value="task.done || false"
        />
        <div style="word-break: break-word;" class="col">
            <component
                :href="chunk.tag === 'a' ? chunk.content : undefined"
                :is="chunk.tag"
                :key="index"
                target="_blank"
                v-for="(chunk, index) in taskTitle"
            >
                {{chunk.content}}
            </component>
        </div>

        <q-icon
            class="q-mr-sm"
            color="grey-6"
            name="notes"
            size="sm"
            v-if="task.notes"
        />

        <q-icon
            @click.stop="starTask(task)"
            :color="task.starred ? 'red' : 'black'"
            :name="task.starred ? 'star' : 'star_border'"
            class="star"
            size="sm"
            v-if="!task.done"
        />
    </q-item>
</template>

<script>
export default {
    name: 'Task',
    props: ['task'],
    computed: {
        taskTitle() {
            const url = this.task.title.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
            if (!url) return [{ tag: 'span', content: this.task.title }]

            const before = this.task.title.slice(0, url.index)
            const after = this.task.title.slice(url.index + url[0].length)
            return [
                { tag: 'span', content: before },
                { tag: 'a', content: url[0]},
                { tag: 'span', content: after },
            ]
        },
    },
    methods: {
        checkTask(task) {
            this.$store.dispatch('checkTask', {
                ...task,
                done: true,
                doneAt: Date.now(),
            })
        },
        uncheckTask(task) {
            this.$store.dispatch('uncheckTask', {
                ...task,
                done: false,
                doneAt: null,
            })
        },
        starTask(task) {
            this.$store.dispatch('updateTask', {
                ...task,
                starred: !task.starred,
            })
        },
    },
}
</script>