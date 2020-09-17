<template>
  <div class="flex flex-center bg-grey-3" style="height: 100vh;">
    <div
      class="q-pa-md shadow-15 rounded-borders"
      rounded
      style="width: 450px;max-width: 90%; max-height:80vh; overflow: auto; background: rgba(255,255,255,0.9);"
    >
      <div class="soulmate text-h4 text-primary text-center q-my-md">
        Simple todos
      </div>
      <div class="q-mb-lg text-center text-grey-7 text-bold">
        {{mode === 'signin' ? 'Connexion' : 'Création de compte'}}
      </div>

      <div v-if="isLoading" class="text-center">
        <q-spinner
          color="primary"
          size="3em"
        />
      </div>
      <div v-else>
        <q-tabs
          class="bg-blue-grey-1 rounded-borders q-my-md"
          dense
          v-model="mode"
        >
          <q-tab name="signin" label="Se connecter" />
          <q-tab name="signup" label="Créer un compte" />
        </q-tabs>

        <q-form @submit="submit" v-if="mode === 'signin' || !!user.role">
          <div v-if="mode === 'signup'">
            <q-input
              class="q-mb-sm"
              label="Prénom"
              outlined
              required
              v-model="user.firstName"
            />

            <q-input
              class="q-mb-sm"
              label="Nom"
              outlined
              required
              v-model="user.lastName"
            />
          </div>

          <q-input
            autofocus
            class="q-mb-sm"
            label="Votre email"
            outlined
            required
            v-model="user.email"
          />

          <q-input
            class="q-mb-sm"
            label="Votre mot de passe"
            outlined
            required
            type="password"
            v-model="user.password"
          />
          <q-input
            class="q-mb-sm"
            label="Répétez votre mot de passe"
            outlined
            required
            type="password"
            v-if="mode === 'signup'"
            v-model="rpassword"
          />

          <q-btn
            class="full-width"
            color="secondary"
            label="Valider"
            type="submit"
            unelevated
          />
        </q-form>
      </div>
    </div>
  </div>
</template>

<script>
import { noop } from 'lodash'

export default {
  name: 'Login',
  data () {
    return {
      isLoading: false,
      mode: 'signin', // signin - signup
      user: {
        role: 'user', // user - of
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      },
      rpassword: '',
    }
  },
  methods: {
    submit () {
      this.$store[this.mode](this.user)
        .then(() => {
          this.$router.push({ name: 'Todos' })
        })
        .catch(noop)
    },
  },
}

</script>
