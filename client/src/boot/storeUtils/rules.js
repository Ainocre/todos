import { constant, pick } from 'lodash'

const error = () => {
    throw 'Vous n\'avez pas les droits'
}

const rules = store => ({
    asserts: (storeKey, field, value) => {
        const assertsFunction = () => store[storeKey] && store[storeKey][field] === value || error()
        return {
            list: assertsFunction,
            create: assertsFunction,
            update: assertsFunction,
            remove: assertsFunction,
        }
    },
    mine: (field = 'userId') => ({
        list: () => store.user && [field, '==', store.user.id] || error(),
        create: (newDoc) => newDoc[field] === store.user?.id || error(),
        update: (newDoc) => newDoc[field] === store.user?.id || error(),
        remove: (doc) => doc[field] === store.user?.id || error(),
    })
})

export default (rulesManifest, store) => {
    if (!rulesManifest) return
    const res = rulesManifest(rules(store))

    return {
        ...res.all ? {
            list: res.all,
            create: res.all,
            update: res.all,
            remove: res.all,
        } : {},
        ...res.read ? {
            list: res.read,
        } : {},
        ...res.write ? {
            create: res.write,
            update: res.write,
            remove: res.write,
        } : {},
        ...pick(res, ['getDoc', 'list', 'create', 'update', 'remove']),
    }
}
