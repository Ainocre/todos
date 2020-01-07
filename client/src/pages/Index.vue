<template>
  <q-layout view="hHh Lpr fFf" v-if="isConnected">
    <q-header class="bg-pink-6" elevated>
      <q-toolbar>
        <q-btn dense round icon="menu" flat color="white" @click="drawer = !drawer" />

        <q-toolbar-title>
          Simple todos {{currentCategory.title ? ` - ${currentCategory.title}` : ''}}
        </q-toolbar-title>

        <q-btn round flat>
          <q-avatar color="pink-3" text-color="white">{{user.email && user.email[0]}}</q-avatar>

          <q-menu>
            <q-list>
              <q-item @click="changePassword" clickable v-close-popup>
                <q-item-section>Changer mon mot de passe</q-item-section>
              </q-item>
              <q-item @click="signout" clickable v-close-popup>
                <q-item-section>Se déconnecter</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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

        <div class="text-h6">A faire</div>
        <q-banner v-if="!todoTasks.length" rounded class="bg-grey-2">
          Vide
        </q-banner>
        <q-list v-else>
          <q-item clickable v-for="(task, index) in todoTasks" :key="index">
            <q-item-section>
              <div class="row items-center">
                <q-checkbox style="display: inline-block" @input="checkTask(task)" :value="false" />
                {{task.title}}
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- <div class="text-h6">Terminées</div>
        <q-banner v-if="!dones.length" rounded class="bg-grey-2">
            Vide
        </q-banner>
        <q-list v-else>
            <q-item v-for="(task, index) in dones" :key="index">
                <q-item-section>
                    <q-checkbox v-model="task.checked" :label="task.title" />
                </q-item-section>
            </q-item>
        </q-list> -->
      </q-page>
    </q-page-container>
  </q-layout>
  <Login v-else />
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
    ...mapState(['categories', 'isConnected', 'user', 'currentCategory']),
    ...mapGetters(['todoTasks', 'doCurrentCategoryExists']),
  }
}
</script>
