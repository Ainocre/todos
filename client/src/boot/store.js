import Vue from 'vue'
import { model, type, store, collection } from './storeUtils'


const UserModel = model('User', {
    email: { type: type.email, required: true },
})

const commonRules = (rules) => ({ all: [rules.mine()] })

const TaskModel = model('Task', {
    title: { type: type.string, required: true, input: { type: 'text', label: 'Nom de la tâche' } },
    checked: { type: type.boolean, default: false },
    starred: { type: type.boolean, default: false },
    notes: { type: type.string, input: { type: 'textarea', label: 'Notes de la tâche' } },
    userId: { type: type.string, required: true, refTo: { user: 'users' } },
    categoryId: { type: type.string, required: true, refTo: { category: 'categories' } },
})

const CategoryModel = model('Category', {
    title: { type: type.string, required: true, input: { type: 'text', label: 'Nom de la catégorie' } },
    userId: { type: type.string, required: true, refTo: { user: 'users' } },
})

const MessagesModel = model('Message', {
    content: type.string,
    userId: { type: type.string, default: ({ store }) => store.user?.id, refTo: { user: 'users' } },
})

const Store = store({
    selectedTask: null,
    users: collection('users', UserModel, commonRules),
    tasks: collection('tasks', TaskModel, commonRules),
    categories: collection('categories', CategoryModel, commonRules),
    messages: collection('messages', MessagesModel, null, { subscribe: true })
})

Store.auth()

if (process.env.NODE_ENV === 'development') {
    window.store = Store
}

Vue.prototype.store = Store
