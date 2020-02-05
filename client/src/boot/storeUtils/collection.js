import Vue from 'vue'
import { isBoolean, isArray } from 'lodash'
import { db } from './firebase'
import initRules from './rules'

export default (collectionName, ItemsModel, rules, options) => class Collection {
    constructor(store) {
        this.alreadyFetchAll = false
        this.collectionName = collectionName
        this.ItemsModel = ItemsModel
        this.rules = initRules(rules, store)
        this.store = store
        this.options = options

        this.state = Vue.observable({ data: [] })
    }

    reset() {
        this.state.data = []
    }

    static type = 'StoreCollection'
    type = 'StoreCollectionInstance'
    
    async add(state, id, force) {
        if (this.options?.preventCreate && !force) throw 'Création interdite sur cette collection'

        const newItem = new this.ItemsModel({ id, state, collection: this.collectionName, store: this.store, options: this.options })
        const document = newItem.toJS()

        if (this.store.isLocal || !this.rules?.create || this.rules.create.some(rule => rule.create(document))) {
            if (this.collectionName && !this.store?.options?.local) {
                if (id) {
                    await db.collection(this.collectionName).doc(id).set(document)
                } else {
                    const { id } = await db.collection(this.collectionName).add(document)
                    newItem.id = id
                }
            }
    
            this.state.data.push(newItem)
        }

        return newItem
    }

    addModal(fields, defaultValues) {
        if (!this.store.StoreModal) throw 'Pas de modal lié au store'
        this.store.StoreModal.show('create', fields, this.ItemsModel, defaultValues, this.collectionName)
    }

    async doc(id) {
        const user = this.state.data.find(item => item.id === id)
        if (user) return user

        if (this.collectionName && !this.store?.options?.local) {
            const dbUser = await db.collection(this.collectionName).doc(id).get()
            const localUser = new this.ItemsModel({ id, collection: this.collectionName, state: dbUser.data(), store: this.store, options: this.options })
            this.state.data.push(localUser)
            return localUser
        }

        return null
    }

    get all() {
        if (!this.alreadyFetchAll && this.collectionName && !this.store?.options?.local) {
            let req = null

            if (this.rules?.list) {
                for (let rule of this.rules.list) {
                    const res = rule.list()
                    if (!res) continue
                    if (isBoolean(res)) req = db.collection(this.collectionName)
                    if (isArray(res)) req = db.collection(this.collectionName).where(...res)
                }
            } else req = db.collection(this.collectionName)

            if (req) {
                req.get()
                    .then((items) => {
                        this.alreadyFetchAll = true
                        this.state.data = items.docs.map((doc) => new this.ItemsModel({
                            id: doc.id,
                            collection: this.collectionName,
                            state: doc.data(),
                            store: this.store,
                            options: this.options,
                        }))
                    })
            }
        }
        return this.state.data
    }
}
