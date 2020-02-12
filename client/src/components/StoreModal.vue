<template>
    <q-dialog v-model="isOpen">
        <q-card>
            <q-form @submit=save>
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">{{modalTitle}}</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section style="width: 400px;">
                    <div v-for="(field, key) in schema" :key="key">
                        <q-input
                            :label="field.input.label || key"
                            v-if="field.input.type === 'text'"
                            v-model="data.element.staging[key]"
                        />
                        <q-input
                            :label="field.input.label || key"
                            type="number"
                            v-if="field.input.type === 'number'"
                            v-model="data.element.staging[key]"
                        />
                        <q-input
                            :label="field.input.label || key"
                            type="textarea"
                            v-if="field.input.type === 'textarea'"
                            v-model="data.element.staging[key]"
                        />
                        <q-checkbox
                            :label="field.input.label || key"
                            v-if="field.input.type === 'checkbox'"
                            v-model="data.element.staging[key]"
                        />
                        <q-toggle
                            :label="field.input.label || key"
                            v-if="field.input.type === 'toggle'"
                            v-model="data.element.staging[key]"
                        />
                        <q-select
                            :label="field.input.label || key"
                            :options="field.input.options"
                            v-if="field.input.type === 'select'"
                            v-model="data.element.staging[key]"
                        />
                        <q-option-group
                            :label="field.input.label || key"
                            :options="field.input.options"
                            type="radio"
                            v-if="field.input.type === 'radio'"
                            v-model="data.element.staging[key]"
                        />
                    </div>
                </q-card-section>

                <q-card-section class="text-right">
                    <q-btn color="positive" @click="save" label="Enregistrer" />
                </q-card-section>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script>
import { pick, pickBy, forEach, isArray, isObject } from 'lodash'

export default {
    name: 'StoreModal',
    created() {
        this.store.Modal = this
    },
    data() {
        return {
            isOpen: false,
            mode: null,
            modalTitle: null,
            data: {
                fields: [],
                element: null,
                doc: {},
            },
        }
    },
    computed: {
        schema() {
            if (!this.data.fields) return pickBy(this.data.element?.schema, ({ input }) => input)
            return pick(this.data.element?.schema, this.data.fields)
        },
    },
    methods: {
        show(mode, fields, element, defaultValues = {}, collectionName) {
            this.mode = mode
            this.collectionName = collectionName
            this.modalTitle = `${this.mode === 'create' ? 'Création' : 'Modification'} ${element.modelName}`
            this.data.fields = fields
            if (mode === 'create') {
                const ele = new element({ state: defaultValues, options: { temp: true } })
                ele.initStaging()
                this.data.element = ele
            } else {
                this.data.element = element
            }
            this.isOpen = true
            forEach(this.schema, (field, fieldName) => {
                if (field.input.type === 'select' && isObject(field.input.options[0])) {
                    this.data.element.staging[fieldName] = field.input.options.find(option => option.value === this.data.element.staging[fieldName])
                }
            })
        },
        save() {
            forEach(this.schema, (field, fieldName) => {
                if (field.input.type === 'number') {
                    this.data.element.staging[fieldName] = parseInt(this.data.element.staging[fieldName])
                }
                if (field.input.type === 'select' && isObject(field.input.options[0])) {
                    this.data.element.staging[fieldName] = this.data.element.staging[fieldName]
                }
            })
            this.data.element.saveStaging()
            if (this.mode === 'create') {
                this.store[this.collectionName].add(this.data.element.state)
            }
            this.isOpen = false
        },
    },
}
</script>
