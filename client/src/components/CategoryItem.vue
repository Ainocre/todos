<template>
  <draggable :animation="150" :value="value" @input="$emit('input', $event)">
    <div v-for="(item, itemIndex) in value" :key="itemIndex">
      <q-expansion-item
        :icon="iconDict[item.type]"
        :label="item.title"
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

export default {
  name: 'CategoryItems',
  props: ['value'],
  components: { draggable },
  data () {
    return {
      iconDict: {
        todos: 'reorder',
        folder: 'folder',
        calc: 'calculate',
        docs: 'menu_book',
        memos: 'sensor_door',
      },
    }
  },
}
</script>
