<template>
  <draggable :animation="150" :value="value" @input="$emit('input', $event)" v-bind="dragOptions">
    <div v-for="item in value" :key="item._id">
      <q-expansion-item
        :content-inset-level="0.5"
        :icon="iconDict[item.type]"
        :label="item.title"
        :ref="item._id"
        @dragenter="dragenter(item._id)"
        expand-separator
        v-if="item.type === 'folder'"
      >
        <CategoryItems v-model="item.items" />
      </q-expansion-item>

      <q-item :to="{ name: 'Category', params: { categoryId: item._id} }" v-else clickable v-ripple>
        <q-item-section avatar>
          <q-icon :name="iconDict[item.type]" />
        </q-item-section>

        <q-item-section>{{ item.title }}</q-item-section>

        <q-item-section v-if="item.items.length" side>
          <q-badge color="primary" text-color="white" :label="item.items.length" />
        </q-item-section>
      </q-item>
    </div>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'

const dragOptions = {
  animation: 0,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
}

const iconDict = {
  todos: 'reorder',
  folder: 'folder',
  calc: 'calculate',
  docs: 'menu_book',
  memos: 'sensor_door',
}

export default {
  name: 'CategoryItems',
  props: ['value', 'list'],
  components: { draggable },
  data () {
    return {
      iconDict,
      dragOptions,
    }
  },
  methods: {
    dragenter (id) {
      this.$refs[id][0].showing = true
    },
  },
}
</script>
