import Vue from 'vue'
import { uid } from 'quasar' 
import { forEach, isNil, isFunction, cloneDeep, isArray, keys, get } from 'lodash'
import { db } from './firebase'
import type from './type'

const fixSchema = {
    _createdAt: { type: type.date, default: Date.now },
    _updatedAt: { type: type.date, default: Date.now },
    _createdBy: { type: type.string, default: ({ store }) => store?.user?.id || null },
    _updatedBy: { type: type.string, default: ({ store }) => store?.user?.id || null },
    _removed: { type: type.boolean, default: false },
}

export default (modelName, rawSchema) => {
    const schema = rawSchema.state ? cloneDeep(rawSchema) : { state: cloneDeep(rawSchema) }
    schema.state = { ...schema.state, ...fixSchema }

    forEach(schema.state, (fieldSchema, fieldName) => {
        if (isFunction(fieldSchema)) {
            schema.state[fieldName] = { type: fieldSchema }
        }
    })

    return class Model {
        constructor(data) {
            this.id = data?.id || data?.load || uid()
            this.modelName = modelName
            this.collectionName = data?.collection
            this.store = data?.store
            this.options = data?.options
            this.loading = !!data?.load

            // Setup initiastate observables
            const initiatedState = this.initState({ mode: data.load ? 'load' : 'init', doc: data?.state || data})
            this.state = Vue.observable(initiatedState)
            this.staging = Vue.observable(cloneDeep(initiatedState))
            this.baseState = cloneDeep(this.state)

            if (data.load && this.collectionName) {
                db.collection(this.collectionName).doc(data.load).get()
                    .then((item) => {
                        this.update(item.data(), { local: true })
                        this.loading = false
                    })
            }

            // Setup computed
            const that = this
            forEach(schema.computed, (computed, computedName) => {
                Object.defineProperty(this, computedName, {
                    get: function () {
                        return computed(that)
                    },
                })
            })

            // Setup methods
            forEach(schema.methods, (method, methodName) => {
                this[methodName] = method.bind(this)
            })
        }

        static type = 'StoreModel'
        schema = schema.state
        static schema = schema.state
        type = 'StoreModelInstance'
        static modelName = modelName
        static isInstanceOf(ele) {
            return ele instanceof this
        }

        reset() {
            this.state = cloneDeep(this.baseState)
        }

        initState({ mode, doc }) {
            const temp = {}

            // All fields are in schema
            if (mode === 'init') {
                forEach(doc, (field, fieldName) => {
                    if (!this.schema[fieldName]) throw `${fieldName} is missing in ${this.modelName} schema`
                })
            }

            forEach(this.schema, (fieldSchema, fieldName) => {
                const field = doc[fieldName]

                if (mode === 'init') {
                    // isRequired
                    if (isNil(field) && !this.options?.temp) {
                        if (fieldSchema.required) {
                            if (isNil(fieldSchema.default)) throw `${fieldName} is required`
                            temp[fieldName] = isFunction(fieldSchema.default) ? fieldSchema.default({ store: this.store }) : fieldSchema.default
                            return
                        }
                        if (isFunction(fieldSchema.default)) {
                            temp[fieldName] = fieldSchema.default({ store: this.store })
                            return
                        }
                        temp[fieldName] = fieldSchema.default ?? null
                        return
                    }
                
                    // TypeValidation
                    if (!fieldSchema.type) throw `Type is missing in ${fieldName} schema`
                    if (fieldSchema.type === 'StoreModel') {
                        if (!fieldSchema.isInstanceOf(field)) throw `${fieldName} is in wrong type`
                    } else {
                        if (!fieldSchema.type(field)) throw `${fieldName} is in wrong type`
                    }
                
                    // Validation du oneOf
                    if (fieldSchema.oneOf) {
                        if ((isNil(field) && fieldSchema.required) || (field && !fieldSchema.oneOf.includes(field)))
                            throw `${fieldName} must be on of these : ${fieldSchema.oneOf.join(', ')}`
                    }
                
                    // Validation
                    if (fieldSchema.validation) {
                        temp[fieldName] = fieldSchema.validation(doc)
                        return
                    }
                }
            
                temp[fieldName] = field
            })

            const that = this
            forEach(temp, (field, fieldName) => {
                Object.defineProperty(this, fieldName, {
                    set: function (value) {
                        that.update({ [fieldName]: cloneDeep(value) })
                    },
                    get: function () {
                        if (this.loading) return 'Chargement...'
                        return that.state[fieldName]
                    },
                })

                if (this.schema[fieldName].refTo) {
                    const { refTo } = this.schema[fieldName]
                    const key = keys(refTo)[0]

                    Object.defineProperty(this, key, {
                        get: function () {
                            return this.schema[fieldName].type([])
                                ? this.state[fieldName].map(id => that.store[refTo[key]].doc(id))
                                : that.store[refTo[key]].doc(this.state[fieldName])
                        },
                    })
                }
            })

            return temp
        }

        update(fields, { local, force } = {}) {
            if (this.options?.preventUpdate && !force) throw 'Update interdit sur cet item'
            const temp = {}

            forEach(fields, (field, fieldName) => {
                const fieldSchema = this.schema[fieldName]
                // Exists in schema
                if (!fieldSchema) throw `${fieldName} is missing in ${this.modelName} schema`

                // TypeValidation
                if (fieldSchema.type === 'StoreModel') {
                    if (!fieldSchema.isInstanceOf(field)) {
                        field = new fieldSchema(field)
                        if (!fieldSchema.isInstanceOf(field)) {
                            throw `${fieldName} is in wrong type`
                        }
                    }
                } else {
                    if (fieldSchema.type.type === 'StoreModel') {
                        new fieldSchema.type(field)
                    } else if (!fieldSchema.type(field))
                        throw `${fieldName} is in wrong type`
                }

                // Validation du oneOf
                if (fieldSchema.oneOf) {
                    if ((isNil(field) && fieldSchema.required) || (field && !fieldSchema.oneOf.includes(field)))
                        throw `${fieldName} must be on of these : ${fieldSchema.oneOf.join(', ')}`
                }

                // Validation
                if (fieldSchema.validation) {
                    field = fieldSchema.validation(fields)
                }
            
                temp[fieldName] = field
            })

            const document = { ...this.toJS(), ...temp, _updatedAt: Date.now(), _updatedBy: this.store?.user?.id }

            const updateRule = get(this.store, [this.collectionName, 'rules', 'update'])
            if (local || this.store?.isLocal || !updateRule || updateRule.some(rule => rule.update(document))) {
                forEach(temp, (field, fieldName) => {
                    this.state[fieldName] = field
                })
                
                if (this.collectionName && !this.store?.isLocal && !local) {
                    return db.collection(this.collectionName).doc(this.id).set(document)
                }
            } else {
                throw "N'a pas passé les tests d'update"
            }
        }

        editModal(fields) {
            const Modal = this.ModelModal || this.store?.StoreModal
            if (!Modal) throw 'Pas de modal lié au store'
            this.initStaging()
            Modal.show('update', fields, this)
        }

        delete() {
            // Todo
            this.removed = true
        }

        toJS(ele) {
            ele = cloneDeep(ele || this.state)
            forEach(ele, (field, fieldName) => {
                if (field?.type === 'StoreModel') {
                    ele[fieldName] = field.toJS()
                }
                if (isArray(field) && field.length && field[0].type === 'StoreModelInstance') {
                    ele[fieldName] = field.map(subEle => subEle.toJS())
                }
            })

            return ele
        }

        initStaging() {
            this.staging = cloneDeep(this.state)
        }

        saveStaging() {
            return this.update(cloneDeep(this.staging))
        }

        softRemove() {
            this._removed = true
        }

        hardRemove() {
            this._removed = true
            db.collection(this.collectionName).doc(this.id).delete()
        }
    }
}
