
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
          <div v-for="(item, itemIndex) in tree" :key="itemIndex">
            <q-expansion-item
              :icon="iconDict[item.type]"
              :label="item.title"
              expand-separator
              v-if="item.title === 'folder'"
            >
              <q-card>
                <q-card-section>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
                  commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
                  eveniet doloribus ullam aliquid.
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-item :to="{ name: 'Category', params: { categoryId: item._id} }" v-else clickable v-ripple>
              <q-item-section avatar>
                <q-icon :name="iconDict[item.type]" />
              </q-item-section>

              <q-item-section>{{ item.title }}</q-item-section>
            </q-item>
          </div>
        </q-list>

        <div class="q-pa-md">
          <q-btn no-caps label="Nouveau" class="full-width" unelevated color="primary" />
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

  </q-layout>
</template>

<script>
const tree = [
  {
    _id: 'main',
    type: 'todos',
    title: 'Principale',
    items: [],
  },
]

const getNode = (_id, tree) => {
  for (const node of tree) {
    if (node._id === _id) return node
    else if (node.items) getNode(_id, node.items)
  }
}

export default {
  name: 'Todos',
  data () {
    return {
      currentTodoInput: '',
      drawer: true,
      tree,
      iconDict: {
        todos: 'reorder',
      },
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
  },
}
</script>
