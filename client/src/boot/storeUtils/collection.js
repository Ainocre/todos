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
    
    async add(state, id, { local, force } = {}) {
        if (this.options?.preventCreate && !force) throw 'Création interdite sur cette collection'

        const newItem = new this.ItemsModel({ id, state, collection: this.collectionName, store: this.store, options: this.options })
        const document = newItem.toJS()

        if (this.store.isLocal || !this.rules?.create || this.rules.create.some(rule => rule.create(document))) {
            if (!local && this.collectionName && !this.store?.options?.local) {
                if (id) {
                    await db.collection(this.collectionName).doc(id).set(document)
                } else {
                    const { id } = await db.collection(this.collectionName).add(document)
                    newItem.id = id
                }
            }
            
            if (!this.options?.subscribe || local) {
                this.state.data.push(newItem)
            }
        }

        return newItem
    }

    addModal(fields, defaultValues) {
        if (!this.store.StoreModal) throw 'Pas de modal lié au store'
        this.store.StoreModal.show('create', fields, this.ItemsModel, defaultValues, this.collectionName)
    }

    async docAsync(id) {
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

    doc(id) {
        const user = this.state.data.find(item => item.id === id)
        if (user) return user

        if (this.collectionName && !this.store?.options?.local) {
            const item = new this.ItemsModel({ load: id, collection: this.collectionName, store: this.store, options: this.options })
            this.state.data.push(item)
            return item
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
                this.alreadyFetchAll = true

                if (this.options?.subscribe) {
                    req.where('_removed', '==', false)
                        .onSnapshot((snapshot) => {
                            snapshot.docChanges().forEach((change) => {
                                if (change.type === "added") {
                                    this.add(change.doc.data(), change.doc.id, { local: true })
                                }
                                if (change.type === "modified") {
                                    const localItem = this.state.data.find(({ id }) => id === change.doc.id)
                                    if (!localItem) return
                                    localItem.update(change.doc.data(), { local: true })
                                }
                                if (change.type === "removed") {
                                    const localItem = this.state.data.find(({ id }) => id === change.doc.id)
                                    if (!localItem) return
                                    localItem.update({ _removed: true }, { local: true })
                                }
                            })
                        })
                } else {
                    req.where('_removed', '==', false).get()
                        .then((items) => {
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
        }
        return this.state.data
            .filter(item => !item._removed)
    }
}
