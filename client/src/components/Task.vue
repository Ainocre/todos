<template>
    <q-item
        @dblclick="$emit('dblclick')"
        class="rounded-borders q-mb-xs items-center"
        :style="taskStyle"
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
        taskStyle() {
            if (!this.$store.getters.background) {
                if (this.task.done) {
                    return 'background: #cecece;'
                } else {
                    return 'background: #f7e9e9;'
                }
            } else {
                if (this.task.done) {
                    return 'background: rgba(255,255,255,0.55);'
                } else {
                    return 'background: rgba(255,255,255,0.8);'
                }
            }
        }
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