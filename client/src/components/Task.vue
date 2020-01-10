<template>
    <q-item
        @dblclick="$emit('dblclick')"
        class="rounded-borders q-mb-xs items-center"
        :class="task.done ? 'bg-grey-3' : ''"
        :style="!task.done ? 'background: #fff1f6;' : ''"
        clickable
        dense
    >
        <q-checkbox style="display: inline-block" @input="checkTask(task)" :value="false" />
        <div style="word-break: break-word;" class="col">
            <div v-if="!task.title.match(/https?:\/\//)">{{task.title}}</div>
            <div v-else>
                <a target="_blank" :href="task.title">{{task.title}}</a>
            </div>
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
    methods: {
        checkTask(task) {
            this.$store.dispatch('checkTask', {
                ...task,
                done: true,
            })
        },
        uncheckTask(task) {
            this.$store.dispatch('uncheckTask', {
                ...task,
                done: false,
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