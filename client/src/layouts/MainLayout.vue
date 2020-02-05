<template>
  <div>
    <div class="bg-white flex flex-center window-height" v-if="!$store.isReady">
        <div class="column items-center">
            <div class="text-h4 text-pink-6" style="margin-bottom: 30px;">Simple todos</div>
            <q-spinner
                color="pink-6"
                size="4em"
            />
        </div>
    </div>
    <q-layout view="hHh Lpr fFf" v-if="$store.user">
        <q-header class="bg-pink-6" elevated>
            <q-toolbar>
                <q-btn dense round flat color="white" @click.left="leftMenu = !leftMenu">
                    <q-avatar size="md" color="pink-3" text-color="white">{{$store.user.email[0]}}</q-avatar>
                </q-btn>

                <q-toolbar-title>
                  Simple todos {{currentCategoryName}}
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-drawer
            :breakpoint="500"
            :width="300"
            bordered
            content-class="bg-grey-2"
            show-if-above
            v-model="leftMenu"
        >
            <q-scroll-area class="fit">
                <q-list separator>
                    <q-item
                        @click="$store.signout()"
                        class="text-bold"
                        clickable
                        v-ripple
                    >
                        <q-item-section avatar>
                            <q-icon name="exit_to_app" />
                        </q-item-section>
                        <q-item-section>
                            Se déconnecter
                        </q-item-section>
                    </q-item>
                    <q-item
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
                        :active="$route.params.categoryId === category.id"
                        :key="category.id"
                        :to="`/${category.id}`"
                        clickable
                        v-for="category in $store.categories.all"
                        v-ripple
                    >
                        <q-item-section avatar>
                            <q-icon name="toc" />
                        </q-item-section>
                        <q-item-section>
                            {{ category.title }}
                        </q-item-section>
                        <q-item-section class="col-shrink" v-if="tasksByCategory[category.id]">
                            <q-badge color="pink-3">
                                {{tasksByCategory[category.id].length}}
                            </q-badge>
                        </q-item-section>

                        <q-menu
                            touch-position
                            context-menu
                        >
                            <q-list dense style="min-width: 130px">
                                <q-item @click="category.editModal()" clickable v-close-popup>
                                    <q-item-section>Modifier</q-item-section>
                                </q-item>
                                <!-- <q-item @click="deleteCategory(category)" clickable v-close-popup>
                                    <q-item-section>Supprimer</q-item-section>
                                </q-item> -->
                            </q-list>
                        </q-menu>
                    </q-item>

                </q-list>

                <div class="q-pa-md">
                    <q-btn @click="$store.categories.addModal(null, { userId: $store.user.id })" color="pink-5" label="Créer une catégorie" class="full-width" />
                </div>
            </q-scroll-area>
        </q-drawer>

        <q-page-container class="page-container">
            <router-view />
        </q-page-container>
    </q-layout>
    <Login v-if="$store.isReady && !$store.user" />
    <StoreModal />
  </div>
</template>

<script>
import Login from 'pages/Login.vue'
import StoreModal from 'components/StoreModal'
import { groupBy } from 'lodash'

export default {
  name: 'MainLayout',
  components: { Login, StoreModal },
  data() {
    return {
      leftMenu: true,
    }
  },
  computed: {
    starredTodos() {
      return this.$store.tasks.all.filter(({ starred, checked }) => starred && !checked)
    },
    tasksByCategory() {
      return groupBy(this.$store.tasks.all.filter(({ checked }) => !checked), 'categoryId')
    },
    currentCategoryName() {
      const title = this.$store.categories.all.find(({ id }) => id === this.$route.params.categoryId)?.title
      return title ? ` - ${title}` : ''
    },
  },
}
</script>

<style lang="stylus">
.page-container
  background-size cover
  background-attachment fixed
</style>
