<template>
  <div>
    <div class="bg-white flex flex-center window-height" v-if="!isReady">
      <div class="column items-center">
        <div class="text-h4 text-pink-6" style="margin-bottom: 30px;">Simple todos</div>
        <q-spinner
          color="pink-6"
          size="4em"
        />
      </div>
    </div>
    <q-layout view="hHh Lpr fFf" v-if="isReady && isConnected">
      <q-header class="bg-pink-6" elevated>
        <q-toolbar>
          <q-btn dense round flat color="white" @click="drawer = !drawer">
            <q-avatar size="md" color="pink-3" text-color="white">{{user.email && user.email[0]}}</q-avatar>
          </q-btn>

          <q-toolbar-title>
            Simple todos {{currentCategory.title ? ` - ${currentCategory.title}` : ''}}
          </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer
        :breakpoint="400"
        :width="350"
        bordered
        content-class="bg-grey-3"
        show-if-above
        v-model="drawer"
      >
        <q-scroll-area class="fit">
          <q-list separator class="bg-grey-1 text-grey-8">
            <q-item dense @click="changePassword" clickable>
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>Changer mon mot de passe</q-item-section>
            </q-item>
            <q-item dense @click="signout" clickable>
              <q-item-section avatar>
                <q-icon name="exit_to_app" />
              </q-item-section>
              <q-item-section>Se déconnecter</q-item-section>
            </q-item>
          </q-list>

          <q-list separator>
            <q-item
              @click="changeCurrentCategory({ _id: 'starred' })"
              :active="currentCategory._id === 'starred'"
              class="text-bold"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="star" />
              </q-item-section>
              <q-item-section>
                Prioritaires
              </q-item-section>
              <q-item-section class="col-shrink" v-if="starredTodos.length">
                <q-badge color="pink-3">
                  {{starredTodos.length}}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item
              :active="currentCategory._id === category._id"
              :key="category._id"
              @click="changeCurrentCategory(category)"
              clickable
              v-for="category in categories"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="toc" />
              </q-item-section>
              <q-item-section>
                {{ category.title }}
              </q-item-section>
              <q-item-section class="col-shrink" v-if="categorySizes[category._id]">
                <q-badge color="pink-3">
                  {{categorySizes[category._id]}}
                </q-badge>
              </q-item-section>

              <q-menu
                touch-position
                context-menu
              >
                <q-list dense style="min-width: 130px">
                  <q-item @click="updateCategory(category)" clickable v-close-popup>
                    <q-item-section>Modifier</q-item-section>
                  </q-item>
                  <q-item @click="deleteCategory(category)" clickable v-close-popup>
                    <q-item-section>Supprimer</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

          </q-list>

          <div class="q-pa-md">
            <q-btn @click="createCategory" color="pink-5" label="Créer une catégorie" class="full-width" />
          </div>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page padding v-if="doCurrentCategoryExists">
          <q-input
            @keydown.enter="addTask"
            autofocus
            class="q-mb-md"
            outlined
            placeholder="Nouvelle tâche..."
            v-if="currentCategory._id !== 'starred'"
            v-model="newTaskInput"
          />

          <q-banner v-if="!todoTasks.length" rounded class="bg-grey-2">
            Vide
          </q-banner>
          <q-list v-else>
            <q-item
              :key="task._id"
              class="rounded-borders q-mb-xs"
              style="background: #fff1f6;"
              clickable
              dense
              v-for="task in todoTasks"
              @dblclick="showModal(task)"
            >
              <q-item-section>
                <div class="row items-center">
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
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="currentCategory._id !== 'starred'">
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
                <q-item
                  :key="task._id"
                  class="bg-grey-3 rounded-borders q-mb-xs"
                  clickable
                  dense
                  v-for="task in doneTasks"
                >
                  <q-item-section>
                    <div class="row items-center">
                      <q-checkbox style="display: inline-block" @input="uncheckTask(task)" :value="true" />
                      <div style="word-break: break-word;" class="col">
                        <div v-if="!task.title.match(/https?:\/\//)">{{task.title}}</div>
                        <div v-else>
                          <a target="_blank" :href="task.title">{{task.title}}</a>
                        </div>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
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
        </q-page>
      </q-page-container>

      <TaskModal ref="taskModal" />
    </q-layout>
    <Login v-if="isReady && !isConnected" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import Login from './Login.vue'
import TaskModal from 'components/TaskModal.vue'

export default {
  name: 'Tasks',
  components: { Login, TaskModal },
  data () {
    return {
      areDoneTasksVisible: false,
      drawer: false,
      newTaskInput: '',
      quantity: 10,
      selectedTask: null,
    }
  },
  methods: {
    ...mapActions(['signout']),
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
    starTask(task) {
      this.$store.dispatch('updateTask', {
        ...task,
        starred: !task.starred,
      })
    },
    createCategory() {
      this.$q.dialog({
        title: 'Quel nom donner à la catégorie ?',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true,
      }).onOk((categoryName) => {
       this.$store.dispatch('createCategory', { title: categoryName })
      })
    },
    changeCurrentCategory(category) {
      if (this.$q.screen.lt.md) {
        this.drawer = false
      }
      this.$store.commit('changeCurrentCategory', category)
    },
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
    updateCategory(category) {
      this.$q.dialog({
        title: 'Modifier la catégorie',
        prompt: {
          model: category.title,
          type: 'text'
        },
        cancel: true,
      }).onOk((categoryName) => {
        this.$store.dispatch('updateCategory', {
          ...category,
          title: categoryName,
        })
      })
    },
    deleteCategory(category) {
      this.$q.dialog({
        title: 'Êtes-vous sûr de vouloir supprimer la catégorie ?',
        cancel: true,
      }).onOk((res) => {
        this.$store.dispatch('deleteCategory', category)
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
    changePassword() {
      this.$q.dialog({
        title: 'Nouveau mot de passe',
        prompt: {
          model: '',
          type: 'password'
        },
        cancel: true,
      }).onOk((pwd) => {
        this.$q.dialog({
          title: 'Répétez le mot de passe',
          prompt: {
            model: '',
            type: 'password'
          },
          cancel: true,
        }).onOk((rpwd) => {
          if (pwd !== rpwd) {
            return this.$q.notify({
              message: 'Les mots de passe ne correspondent pas.',
              color: 'negative',
              position: 'top-right',
            })
          }

          this.$store.dispatch('changePwd', pwd)
            .then(() => {
              this.$q.notify({
                message: 'Mot de passe changé',
                color: 'positive',
                position: 'top-right',
              })
            })
            .catch(() => {
              this.$q.notify({
                message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
                color: 'negative',
                position: 'top-right',
              })
            })
        })
      })
    }
  },
  computed: {
    ...mapState(['categories', 'isConnected', 'user', 'currentCategory', 'isReady']),
    ...mapGetters(['todoTasks', 'starredTodos', 'doCurrentCategoryExists', 'getNumberOfTodos', 'categorySizes']),
    doneTasks() {
      return this.$store.getters.doneTasks.slice(0, this.quantity)
    },
  },
}
</script>

<style lang="stylus">
.star
  opacity 0.5

.star:hover
  opacity 0.8
</style>