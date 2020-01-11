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
                    Simple todos {{getCategory($route.params.categoryId).title ? ` - ${getCategory($route.params.categoryId).title}` : ''}}
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
                        @click="handleDrawer"
                        :active="$route.params.categoryId === 'starred'"
                        to="/starred"
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
                        @click="handleDrawer"
                        :active="$route.params.categoryId === category._id"
                        :key="category._id"
                        :to="`/${category._id}`"
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
            <router-view />
        </q-page-container>
    </q-layout>
    <Login v-if="isReady && !isConnected" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import Login from 'pages/Login.vue'


export default {
  name: 'Tasks',
  components: { Login },
  data () {
    return {
      drawer: false,
    }
  },
  methods: {
    ...mapActions(['signout']),
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
    handleDrawer(category) {
      if (this.$q.screen.lt.md) {
        this.drawer = false
      }
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
    ...mapState(['categories', 'isConnected', 'user', 'isReady']),
    ...mapGetters(['starredTodos', 'categorySizes', 'getCategory']),
  },
}
</script>

<style lang="stylus">
.star
  opacity 0.5

.star:hover
  opacity 0.8
</style>
