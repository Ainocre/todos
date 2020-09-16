
<template>
  <q-layout view="hHh LpR fFf">

    <q-header reveal bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/logo.png">
          </q-avatar>
          Simple todos
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-scroll-area class="fit">
        <q-list>
          <CategoryItem :tree="tree" />
        </q-list>

        <div class="q-pa-md">
          <q-btn @click="$refs.newCategoryModalRef.initModal()" no-caps label="Nouveau" class="full-width" unelevated color="primary" />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <div class="column q-col-gutter-sm">
          <div class="q-mb-sm">
            <q-input
              @keyup.enter="addTodo"
              filled
              label="Nouvelle tâche"
              v-model="currentTodoInput"
            />
          </div>

          <div v-for="(item, itemIndex) in currentItems" :key="itemIndex">
            <q-card bordered flat class="q-pa-xs cursor-pointer">
              <q-checkbox :value="false" />
              {{item.title}}
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <new-category-modal @save="addCategory" ref="newCategoryModalRef" />
  </q-layout>
</template>

<script>
import NewCategoryModal from 'components/NewCategoryModal.vue'
import CategoryItem from 'components/CategoryItem.vue'

const getNode = (_id, tree) => {
  for (const node of tree) {
    if (node._id === _id) return node
    else if (node.items) getNode(_id, node.items)
  }
}

export default {
  name: 'Todos',
  components: { NewCategoryModal, CategoryItem },
  data () {
    return {
      currentTodoInput: '',
      drawer: true,
      tree: [],
    }
  },
  computed: {
    currentNode () {
      return getNode(this.$route.params.categoryId, this.tree)
    },
    currentItems () {
      return this.currentNode?.items || []
    },
  },
  methods: {
    addTodo () {
      this.currentNode.items.push({
        title: this.currentTodoInput,
      })
      this.currentTodoInput = ''
    },
    addCategory (category) {
      this.tree.push(category)
    },
  },
}
</script>
