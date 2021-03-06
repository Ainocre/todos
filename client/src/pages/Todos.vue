
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

        <q-btn outline label="Se déconnecter" @click="signout" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-scroll-area class="fit">
        <q-list>
          <CategoryItem @drop="moveItem" v-model="tree" />
        </q-list>

        <div class="q-pa-md">
          <q-btn @click="$refs.newCategoryModalRef.initModal()" no-caps label="Nouveau" class="full-width" unelevated color="primary" />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding v-if="$route.params.categoryId">
        <div class="column">
          <div class="q-mb-md">
            <q-input
              @keyup.enter="addTodo"
              filled
              label="Nouvelle tâche"
              v-model="currentTodoInput"
            />
          </div>

          <draggable :animation="150" v-model="currentItems">
            <q-card
              @dragstart="itemToMove = item"
              :key="item._id"
              bordered
              class="q-pa-xs cursor-pointer q-mb-sm"
              flat
              v-for="item in currentItems"
            >
              <q-checkbox :value="false" />
              {{item.title}}
            </q-card>
          </draggable>
        </div>
      </q-page>
    </q-page-container>

    <new-category-modal @save="addCategory" ref="newCategoryModalRef" />
  </q-layout>
</template>

<script>
import { uid } from 'quasar'
import draggable from 'vuedraggable'
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
  components: { NewCategoryModal, CategoryItem, draggable },
  data () {
    return {
      currentTodoInput: '',
      drawer: true,
      tree: [],
      itemToMove: null,
    }
  },
  computed: {
    currentNode () {
      return getNode(this.$route.params.categoryId, this.tree)
    },
    currentItems: {
      get () {
        return this.currentNode?.items || []
      },
      set (newItems) {
        this.currentNode.items = newItems
      },
    },
  },
  methods: {
    moveItem (toCategoryId) {
      const fromNode = this.currentNode
      const toNode = getNode(toCategoryId, this.tree)

      toNode.items.push({ ...this.itemToMove })
      fromNode.items.splice(fromNode.items.findIndex((i) => i._id === this.itemToMove._id), 1)
    },
    addTodo () {
      this.currentNode.items.push({
        _id: uid(),
        title: this.currentTodoInput,
      })
      this.currentTodoInput = ''
    },
    addCategory (category) {
      this.tree.push(category)
    },
    async signout () {
      await this.$store.signout()
      this.$router.push({ name: 'Login' })
    },
  },
}
</script>
