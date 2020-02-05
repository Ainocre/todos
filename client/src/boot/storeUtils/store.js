import Vue from 'vue'
import { forEach, cloneDeep, omit } from 'lodash'
import firebase from './firebase'

class Store {
    constructor(rawSchema) {
        const that = this

        const schema = rawSchema.state ? cloneDeep(rawSchema) : { state: cloneDeep(rawSchema) }
        this.schema = schema.state
        this.options = Vue.observable({
            local: true,
            isReady: false,
        })

        Object.defineProperty(this, 'isReady', {
            get: function () {
                return that.options.isReady
            },
        })
        Object.defineProperty(this, 'isLocal', {
            get: function () {
                return that.options.local
            },
        })

        // Set internal observed variables
        this.internalState = Vue.observable({ user: null })
        Object.defineProperty(this, 'user', {
            get: function () {
                return that.internalState.user
            },
            set: function (data) {
                that.internalState.user = data
            },
        })

        // Setup initiastate observables
        this.state = Vue.observable(this.initState(schema.state))

        // Setup computed
        let computeds = {}
        forEach(schema.computed && schema.computed(this), (computed, computedName) => {
            computeds = {
                ...computeds,
                get [computedName]() { return computed(that) },
            }
        })
        this.computed = computeds

        // Setup methods
        forEach(schema.methods && schema.methods(this), (method, methodName) => {
            this[methodName] = method.bind(this)
        })
    }

    initState() {
        const temp = {}

        forEach(this.schema, (fieldSchema, fieldName) => {
            temp[fieldName] = null
            if (fieldSchema.type === 'StoreModel') {
                temp[fieldName] = null
            }
            if (fieldSchema.type === 'StoreCollection') {
                temp[fieldName] = new fieldSchema(this)
            }
        })

        const that = this
        forEach(Vue.observable(temp), (field, fieldName) => {
            const that = this
            Object.defineProperty(this, fieldName, {
                set: function (value) {
                    that.state[fieldName] = value
                },
                get: function () {
                    return that.state[fieldName]
                },
            })
        })

        return temp
    }

    setState(newState) {
        forEach(newState, (field, fieldName) => {
            const fieldSchema = this.schema[fieldName]

            // Exists in schema
            if (!fieldSchema) throw `${fieldName} is missing in Store schema`

            // fieldSchema is a StoreModel
            if (fieldSchema.type !== 'StoreModel') throw `${fieldName} is not a StoreModel and cannot be updated`

            // field is an instance of StoreModel
            if (field !== null && !(field instanceof fieldSchema)) throw `${fieldName} must be null of an instance of ${fieldSchema.modelName} Model`
        
            this[fieldName] = field
        })
    }

    ready() {
        this.options.isReady = true
    }

    auth(userCollectionName = 'users') {
        this.options.local = false
        this.authCollection = userCollectionName

        if (!this[userCollectionName]) throw 'The auth collection doesn\'t exists'
        if (!this[userCollectionName].collectionName) throw 'The auth collection must have a collectionName to be online'

        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                this.options.isReady = true
                return
            }
          
            const localUser = await this[userCollectionName].doc(user.uid)
            this.options.isReady = true
          
            this.internalState.user = localUser
        })
    }

    resetStore() {
        this.user = null
        forEach(this.schema, (_, fieldName) => this[fieldName].reset())
    }

    signin(data) {
        return firebase.auth().signInWithEmailAndPassword(data.email, data.pwd)
    }

    signup(data) {
        return firebase.auth().createUserWithEmailAndPassword(data.email, data.pwd)
            .then(({ user }) => {
                return this[this.authCollection].add(omit(data, ['pwd']), user.uid)
            })
    }

    signout() {
        return firebase.auth().signOut()
            .then(() => this.resetStore())
    }
}

export default (schema, options) => {
    return new Store(schema, options)
}
