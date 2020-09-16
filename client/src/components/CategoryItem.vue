<template>
  <div>
    <div v-for="(item, itemIndex) in tree" :key="itemIndex">
      <q-expansion-item
        :icon="iconDict[item.type]"
        :label="item.title"
        expand-separator
        v-if="item.type === 'folder'"
      >
        <CategoryItem :tree="item.items" />
      </q-expansion-item>

      <q-item :to="{ name: 'Category', params: { categoryId: item._id} }" v-else clickable v-ripple>
        <q-item-section avatar>
          <q-icon :name="iconDict[item.type]" />
        </q-item-section>

        <q-item-section>{{ item.title }}</q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryItem',
  props: ['tree'],
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
