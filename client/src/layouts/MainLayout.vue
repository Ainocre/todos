<template>
  <div>
    <div class="bg-white flex flex-center window-height" v-if="!isReady || connectionLoader">
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
                <q-btn dense round flat color="white" @click.left="drawer = !drawer" @click.right.prevent="showBottomMenu">
                    <q-avatar size="md" color="pink-3" text-color="white">{{user.email && user.email[0]}}</q-avatar>
                </q-btn>

                <q-toolbar-title>
                  Simple todos {{getCategory($route.params.categoryId).title ? ` - ${getCategory($route.params.categoryId).title}` : ''}}
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-drawer
            :breakpoint="500"
            :width="300"
            bordered
            content-class="bg-grey-2"
            show-if-above
            v-model="drawer"
        >
            <q-scroll-area class="fit">
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

        <q-page-container class="page-container" :style="`background-image: url(${background});` ">
            <router-view />
        </q-page-container>

        <q-dialog v-model="themeModal">
          <q-card style="width: 650px;">
            <q-card-section class="row items-center">
              <div class="text-h6">Thèmes</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
              <q-btn label="Thème blanc" class="full-width q-my-md" @click="setBackground(null)" />
              <div class="row">
                <q-btn
                  :key="bg"
                  @click="setBackground(index)"
                  class="col-xs-12 col-sm-6"
                  flat
                  v-for="(bg, index) in bgs"
                >
                  <img class="fit" :src="bg" />
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
    </q-layout>
    <Login v-if="isReady && !isConnected && !connectionLoader" />
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
      themeModal: false,
    }
  },
  computed: {
    ...mapState(['categories', 'isConnected', 'user', 'isReady', 'connectionLoader']),
    ...mapGetters(['starredTodos', 'categorySizes', 'getCategory', 'bgs', 'background']),
  },
  methods: {
    ...mapActions(['signout', 'setBackground']),
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
    },
    showBottomMenu() {
      this.$q.bottomSheet({
        dark: true,
        message: 'Mon compte',
        actions: [
          {
            label: 'Thème',
            icon: 'color_lens',
            onClick: () => {
              this.themeModal = true
            },
          },
          {
            label: 'Modifier mon mot de passe',
            icon: 'account_circle',
            onClick: () => {
              this.changePassword()
            },
          },
          {
            label: 'Se déconnecter',
            icon: 'exit_to_app',
            onClick: () => {
              this.signout()
            },
          },
        ]
      }).onOk((action) => {
        action.onClick()
      })
    },
  },
}
</script>

<style lang="stylus">
.page-container
  background-size cover
  background-attachment fixed
</style>
