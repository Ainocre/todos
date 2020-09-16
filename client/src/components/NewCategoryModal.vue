<template>
  <q-dialog ref="modal">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Nouvelle catégorie</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-tabs
          @click="focusInput"
          no-caps
          v-model="type"
        >
          <q-tab name="todos" label="Todos" />
          <q-tab name="folder" label="Dossier" />
          <q-tab name="calc" label="Calcule" />
          <q-tab name="docs" label="Documents" />
          <q-tab name="memos" label="Mémos" />
        </q-tabs>

        <q-input autofocus ref="input" @keyup.enter="save" class="full-width q-my-sm" filled label="Titre" v-model="title" />

        <q-btn @click="save" label="Ajouter" unelevated color="positive" class="full-width" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { uid } from 'quasar'

export default {
  name: 'NewCategoryModal',
  data () {
    return {
      type: 'todos',
      title: '',
    }
  },
  methods: {
    initModal () {
      this.type = 'todos'
      this.title = ''

      this.$refs.modal.show()
    },
    focusInput () {
      this.$refs.input.focus()
    },
    save () {
      this.$emit('save', {
        _id: uid(),
        items: [],
        title: this.title,
        type: this.type,
      })

      this.$refs.modal.hide()
    },
  },
}
</script>
