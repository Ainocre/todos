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

    helpers = {
        push(ele, key, newValue) {
            ele[key] = [...ele[key], newValue]
        },
        pop(ele, key) {
            ele[key] = ele.slice(0, -1)
        },
        shift(ele, key) {
            ele[key] = ele.slice(1)
        },
        unshift(ele, key, newValue) {
            ele[key] = [newValue, ...ele]
        },
        splice(ele, key, ...params) {
            const temp = cloneDeep(ele[key])
            temp.splice(...params)
            ele[key] = temp
        },
    }

    initState() {
        const temp = {}

        forEach(this.schema, (fieldSchema, fieldName) => {
            if (fieldSchema?.type === 'StoreModel') {
                temp[fieldName] = null
                Object.defineProperty(this, fieldName, {
                    set: (value) => {
                        this.state[fieldName] = new fieldSchema(value)
                    },
                    get: () => this.state[fieldName],
                })
                return
            }
            if (fieldSchema?.type === 'StoreCollection') {
                temp[fieldName] = new fieldSchema(this)
                Object.defineProperty(this, fieldName, {
                    set: () => {
                        throw 'Impossible de réassigner une collection'
                    },
                    get: () => this.state[fieldName],
                })
                return
            }

            temp[fieldName] = fieldSchema
            Object.defineProperty(this, fieldName, {
                set: (value) => this.state[fieldName] = value,
                get: () => this.state[fieldName],
            })
        })

        return temp
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
          
            const localUser = await this[userCollectionName].docAsync(user.uid)
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
