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
        :breakpoint="500"
        bordered
        content-class="bg-grey-3"
        show-if-above
        v-model="drawer"
      >
        <q-scroll-area class="fit">
          <q-list separator class="bg-white">
            <q-item @click="changePassword" clickable>
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>Changer mon mot de passe</q-item-section>
            </q-item>
            <q-item @click="signout" clickable>
              <q-item-section avatar>
                <q-icon name="exit_to_app" />
              </q-item-section>
              <q-item-section>Se déconnecter</q-item-section>
            </q-item>
          </q-list>

          <q-list separator>
            <q-item
              :active="currentCategory._id === category._id"
              :key="index"
              @click="changeCurrentCategory(category)"
              clickable
              v-for="(category, index) in categories"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="toc" />
              </q-item-section>
              <q-item-section>
                {{ category.title }}
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
            outlined
            autofocus
            v-model="newTaskInput"
            class="q-mb-md"
            placeholder="Nouvelle tâche..."
            @keydown.enter="addTask"
          />

          <q-banner v-if="!todoTasks.length" rounded class="bg-grey-2">
            Vide
          </q-banner>
          <q-list v-else>
            <q-item
              :key="index"
              class="rounded-borders q-mb-xs"
              style="background: #fff1f6;"
              clickable
              dense
              v-for="(task, index) in todoTasks"
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
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-btn
            @click="showDoneTasks = !showDoneTasks"
            :label="`${showDoneTasks ? 'Cacher' : 'Afficher'} les tâches terminées`"
            class="q-my-md full-width"
            color="grey-8"
          />

          <div v-if="showDoneTasks">
            <q-banner v-if="!doneTasks(quantity).length" rounded class="bg-grey-2">
                Vide
            </q-banner>
            <q-list v-else>
              <q-item
                :key="index"
                class="bg-grey-3 rounded-borders q-mb-xs"
                clickable
                dense
                v-for="(task, index) in doneTasks(quantity)"
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
        </q-page>
      </q-page-container>
    </q-layout>
    <Login v-if="isReady && !isConnected" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import Login from './Login.vue'

export default {
  name: 'Tasks',
  components: { Login },
  data () {
    return {
      drawer: false,
      newTaskInput: '',
      showDoneTasks: false,
      quantity: 10,
    }
  },
  methods: {
    ...mapActions(['fetchTasks', 'signout']),
    addTask() {
      this.$store.dispatch('createTask', {
        title: this.newTaskInput,
        categoryId: this.currentCategory._id,
      })
        .then(() => {
          this.newTaskInput = ''
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
      this.$store.dispatch('fetchTasks', { category })
        .then(() => {
          this.$store.commit('changeCurrentCategory', category)
        })
    },
    checkTask(task) {
      this.$store.dispatch('updateTask', {
        ...task,
        done: true,
      })
    },
    uncheckTask(task) {
      this.$store.dispatch('updateTask', {
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
    ...mapGetters(['todoTasks', 'doneTasks', 'doCurrentCategoryExists']),
  }
}
</script>
