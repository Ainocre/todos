<template>
  <q-page padding v-if="currentCategory || currentCategoryId === 'starred'">
    <div v-if="currentCategoryId === 'starred'">
      <q-list>
        <q-expansion-item
          :label="getCategoryNameById(key)"
          default-opened
          header-class="text-bold"
          v-for="(categoryTasks, key) in starredTasks"
          :key="key"
        >
          <Task
            :key="task.id"
            :task="task"
            v-for="task in categoryTasks"
          />
        </q-expansion-item>
      </q-list>
    </div>
    <div v-else>
      <q-input
        @keydown.enter="addTask"
        autofocus
        class="q-mb-md"
        outlined
        placeholder="Nouvelle tâche..."
        v-model="newTaskInput"
      />

      <q-banner v-if="!categoryTasks.length" rounded class="bg-grey-2">
        Vide
      </q-banner>
      <q-list v-else>
        <Task
          :key="task.id"
          :task="task"
          v-for="task in categoryTasks"
        />
      </q-list>
    </div>
  </q-page>
</template>

<script>
import Task from 'components/Task.vue'
import { groupBy } from 'lodash'

export default {
  name: 'TodoCategory',
  components: { Task },
  data() {
    return {
      newTaskInput: '',
    }
  },
  methods: {
    addTask() {
      this.store.tasks.add({
        createdAt: Date.now(),
        userId: this.store.user.id,
        title: this.newTaskInput,
        categoryId: this.currentCategoryId
      })

      this.newTaskInput = ''
    },
    getCategoryNameById(key) {
      return this.store.categories.all.find(({ id }) => id === key)?.title
    },
  },
  computed: {
    currentCategoryId() {
      return this.$route.params.categoryId
    },
    currentCategory() {
      return this.store.categories.all.find(({ id }) => id === this.currentCategoryId)
    },
    categoryTasks() {
      return this.store.tasks.all.filter(({ categoryId, checked }) => categoryId === this.currentCategoryId && !checked)
    },
    starredTasks() {
      return groupBy(this.store.tasks.all.filter(({ starred, checked }) => starred && !checked), 'categoryId')
    }
  },
}
</script>
