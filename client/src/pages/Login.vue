<template>
    <div class="flex flex-center bg-grey-10 full-width" style="height: 100vh;">
        <div class="Login bg-white q-pa-md">
            <div class="text-center text-h6">Simple todos</div>
            <div class="text-center text-grey-6">
                {{mode === 'signin' ? 'Connexion' : 'Créer un compte'}}
            </div>

            <q-form @submit="onSubmit">
                <q-input
                    autofocus
                    class="q-mt-md"
                    label="Email"
                    v-model="email"
                />
                <q-input
                    class="q-mt-md"
                    label="Mot de passe"
                    type="password"
                    v-model="pwd"
                />
                <q-input
                    class="q-mt-md"
                    label="Répétez le mot de passe"
                    type="password"
                    v-if="mode === 'signup'"
                    v-model="rpwd"
                />
            
                <q-btn
                    :label="mode === 'signin' ? 'Créer un compte' : 'Se connecter'"
                    @click="switchMode"
                    class="full-width q-mt-md"
                    color="grey-6"
                />
                <q-btn
                    :label="mode === 'signin' ? 'Se connecter' : 'Créer un compte'"
                    class="full-width q-mt-sm"
                    color="pink-6"
                    type="submit"
                />
            </q-form>
        </div>
    </div>
</template>

<script>
import emailRegex from 'email-regex'

export default {
    name: 'Login',
    data() {
        return {
            mode: 'signin', // signin - signup
            email: '',
            pwd: '',
            rpwd: '',
        }
    },
    methods: {
        emailValidation() {
            return emailRegex({exact: true}).test(this.email) || 'Email invalide'
        },
        switchMode() {
            this.mode = this.mode === 'signin' ? 'signup' : 'signin'
        },
        onSubmit() {
            if (!emailRegex({exact: true}).test(this.email)) {
                return this.$q.notify({
                    message: 'Email invalide',
                    position: 'top-right',
                    color: 'negative',
                })
            }
            if (this.mode === 'signup' && this.pwd !== this.rpwd) {
                return this.$q.notify({
                    message: 'Les mots de passe ne correspondent pas',
                    position: 'top-right',
                    color: 'negative',
                })
            }
            if (!this.pwd) {
                return this.$q.notify({
                    message: 'Mot de passe manquant',
                    position: 'top-right',
                    color: 'negative',
                })
            }

            this.$store.dispatch(this.mode, {
                email: this.email,
                pwd: this.pwd
            })
                .catch((err) => {
                    return this.$q.notify({
                        message: err.response.data,
                        position: 'top-right',
                        color: 'negative',
                    })
                    this.pwd = ''
                })
        },
    },
}
</script>

<style lang="stylus">
.Login
  border-radius 6px
  max-width 100%
  width 300px
</style>
