<template>
  <draggable
    :animation="150"
    :value="value"
    @input="$emit('input', $event)"
    v-bind="dragOptions"
  >
    <div
      :class="{ dragOverCursor: item.type !== 'folder' && dragOverId === item._id }"
      :itemType="item.type"
      :key="item._id"
      @dragenter="dragOverId = item._id"
      @dragleave="dragleave"
      @drop="drop"
      class="category"
      v-for="item in value"
    >
      <q-expansion-item
        :content-inset-level="0.5"
        :icon="iconDict[item.type]"
        :label="item.title"
        :ref="item._id"
        @dragenter="expenseItemOnDragOver(item._id)"
        expand-separator
        v-if="item.type === 'folder'"
      >
        <CategoryItems @drop="moveItem" v-model="item.items" />
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
      dragOverId: null,
    }
  },
  methods: {
    dragleave ({ fromElement }) {
      const parent = fromElement.closest('.category')
      if (!parent || parent.getAttribute('itemType') === 'folder') this.dragOverId = null
    },
    drop (evt) {
      this.$emit('drop', this.dragOverId)
      this.dragOverId = null
    },
    expenseItemOnDragOver (id) {
      this.$refs[id][0].showing = true
    },
  },
}
</script>

<style lang="stylus" scoped>
.dragOverCursor
  background lightblue
</style>
