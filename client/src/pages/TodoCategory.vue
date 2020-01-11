<template>
  <q-page padding v-if="doCurrentCategoryExists">
    <q-input
      @keydown.enter="addTask"
      autofocus
      class="q-mb-md"
      outlined
      placeholder="Nouvelle tâche..."
      v-if="$route.params.categoryId !== 'starred'"
      v-model="newTaskInput"
    />

    <q-banner v-if="!todoTasks.length" rounded class="bg-grey-2">
      Vide
    </q-banner>
    <q-list v-else>
      <Task
        :key="task._id"
        :task="task"
        @dblclick="showModal(task)"
        v-for="task in todoTasks"
      />
    </q-list>

    <div v-if="$route.params.categoryId !== 'starred'">
      <q-btn
        @click="showDoneTasks"
        :label="`${areDoneTasksVisible ? 'Cacher' : 'Afficher'} les tâches terminées`"
        class="q-my-md full-width"
        color="grey-8"
      />

      <div v-if="areDoneTasksVisible">
        <q-banner v-if="!doneTasks.length" rounded class="bg-grey-2">
            Vide
        </q-banner>
        <q-list v-else>
          <Task
            :key="task._id"
            :task="task"
            @dblclick="showModal(task)"
            v-for="task in doneTasks"
          />
        </q-list>

        <div class="q-mt-md row">
          <div class="q-pa-sm col-6">
            <q-btn
              @click="quantity += 10"
              label="Voir plus"
              class="full-width"
              color="grey-5"
            />
          </div>
          <div class="q-pa-sm col-6">
            <q-btn
              @click="quantity = 3000"
              label="Voir tout"
              class="full-width"
              color="grey-5"
            />
          </div>
        </div>
      </div>
    </div>

    <TaskModal ref="taskModal" />
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import TaskModal from 'components/TaskModal.vue'
import Task from 'components/Task.vue'

export default {
  name: 'TodoCategory',
  components: { Task, TaskModal },
  data() {
    return {
      areDoneTasksVisible: false,
      newTaskInput: '',
      quantity: 10,
    }
  },
  methods: {
    showModal(task) {
      this.$refs.taskModal.init(task)
    },
    addTask() {
      this.$store.dispatch('createTask', {
        title: this.newTaskInput,
        categoryId: this.currentCategory._id,
      })
        .then(() => {
          this.newTaskInput = ''
        })
    },
    showDoneTasks() {
      if (this.areDoneTasksVisible) {
        this.areDoneTasksVisible = false
        this.quantity = 10
      } else {
        this.areDoneTasksVisible = true
      }
    },
  },
  computed: {
    ...mapState(['tasks', 'doneTasks']),
    ...mapGetters(['getCategory', 'todoTasks', 'doneTasks']),
    doneTasks() {
      return this.$store.getters.doneTasks.slice(0, this.quantity)
    },
    doCurrentCategoryExists() {
      return this.$route.params.categoryId === 'starred' || this.getCategory(this.$route.params.categoryId).title
    },
    currentCategory() {
      return this.getCategory(this.$route.params.categoryId)
    },
    todoTasks(state, getters) {
      const todos = this.currentCategory._id === 'starred'
        ? this.tasks.filter(todo => todo.starred && !todo.done)
        : this.tasks.filter(task => !task.done && task.categoryId === this.currentCategory._id)
      return [
        ...todos.filter(todo => todo.starred),
        ...todos.filter(todo => !todo.starred),
      ]
    },
    doneTasks(state, getters) {
      return this.doneTasks.filter(task => task.done && task.categoryId === this.currentCategory._id)
    },
  },
}
</script>
