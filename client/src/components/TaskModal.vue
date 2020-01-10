<template>
    <q-dialog
      v-model="isModalOpen"
    >
      <q-card style="width: 450px; max-width: 100vw;">
        <q-card-section>
          <div class="text-h6">Ma tâche</div>
        </q-card-section>

        <q-card-section>
          <q-input filled class="q-mb-sm" v-model="title" placeholder="Nom de la tâche" />
          <q-input filled v-model="notes" type="textarea" placeholder="Notes" />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn color="negative" label="Annuler" @click="isModalOpen = false" />
          <q-btn color="positive" label="Enregistrer" @click="updateTask" v-if="!task.done" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'TaskModal',
    data() {
      return {
        isModalOpen: false,
        task: {},
        title: '',
        notes: '',
      }
    },
    methods: {
      init(task) {
        this.task = task
        this.isModalOpen = true
        this.title = task.title
        this.notes = task.notes
      },
      updateTask() {
        this.$store.dispatch('updateTask', {
          ...this.task,
          title: this.title,
          notes: this.notes,
        })
          .then(() => {
            this.task = {}
            this.isModalOpen = false
          })
      },
  },
}
</script>
