const express = require('express')
const formidableMiddleware = require('express-formidable')
const Datastore = require('nedb-promises')
const { omit } = require('lodash')
const bcrypt = require('bcrypt')
const jwtraw = require('jsonwebtoken')
const cors = require('cors')

const secret = 'ainocretodos'
const round = 10
const app = express()

app
    .use(formidableMiddleware())
    .use(cors())

const usersDB = Datastore.create('./db/users.db')
const todosDB = Datastore.create('./db/todos.db')
const categoriesDB = Datastore.create('./db/categories.db')

// promessify jwt
const jwt = ({
    encode(payload) {
        return new Promise((res, rej) => {
            jwtraw.sign(payload, secret, (err, token) => {
                if (err) return rej(err)
                res(token)
            })
        })
    },
    decode(token) {
        return new Promise((res, rej) => {
            jwtraw.verify(token, secret, (err, payload) => {
                if (err) return rej(err)
                res(payload)
            })
        })
    },
})

app
    .post('/signin', async (req, res) => {
        const { email, pwd } = req.fields

        const user = await usersDB.findOne({ email })

        if (!user || !(await bcrypt.compare(pwd, user.pwd))) {
            return res.status(401).send('Combinaison login / mot de passe incorrect')
        }

        res.send(await jwt.encode(omit(user, ['pwd'])))
    })
    .post('/signup', async (req, res) => {
        const { email, pwd } = req.fields

        // Vérification que le compte n'est pas déjà prit
        if (await usersDB.findOne({ email })) {
            return res.status(400).send('Un compte existe déjà avec cet email')
        }

        const user = await usersDB.insert({ email, pwd: await bcrypt.hash(pwd, round) })

        res.send(await jwt.encode(omit(user, ['pwd'])))
    })
    .post('/api', async (req, res) => {
        const { token } = req.fields

        // Connection
        if (!token) {
            return res.status(401).send('Unauthorized')
        }

        const user = await jwt.decode(token)
            .catch((err) => {
                res.status(401).send('Unauthorized')
                throw err
            })

        // Connecté
        const { service, method, data } = req.fields

        if (service === 'fetchStart') {
            const fetchedUser = omit(await usersDB.findOne({ _id: user._id }), ['pwd'])

            if (!fetchedUser) {
                return res.status(401).send('Not authenticated')
            }

            return res.send({
                user: fetchedUser,
                categories: await categoriesDB.find({ userId: user._id, $not: { removed: true } }),
            })
        }
        if (service === 'changePwd') {
            usersDB.update({ _id: user._id }, { $set: { pwd: await bcrypt.hash(data.pwd, round) } })
            return res.send('ok')
        }
        if (service === 'tasks') {
            if (method === 'read') {
                return res.send(await todosDB.find({
                    userId: user._id,
                    categoryId: data.categoryId,
                    $not: { removed: true },
                }))
            }
            if (method === 'create') {
                return res.send(await todosDB.insert({
                    ...data.task,
                    _createdAt: Date.now(),
                    userId: user._id,
                }))
            }
            if (method === 'update') {
                await todosDB.update({ userId: user._id, _id: data.task._id }, { $set: omit(data.task, ['userId']) })
                return res.send('ok')
            }
            if (method === 'delete') {
                await todosDB.update({ userId: user._id, _id: data._id }, { $set: { removed: true} })
                return res.send('ok')
            }
        }
        if (service === 'categories') {
            if (method === 'read') {
                return res.send(await categoriesDB.find({
                    ...data,
                    $not: { removed: true },
                    userId: user._id,
                }))
            }
            if (method === 'create') {
                return res.send(await categoriesDB.insert({
                    ...data.category,
                    _createdAt: Date.now(),
                    userId: user._id,
                }))
            }
            if (method === 'update') {
                await categoriesDB.update({ userId: user._id, _id: data.category._id }, { $set: omit(data.category, ['userId']) })
                return res.send('ok')
            }
            if (method === 'delete') {
                await categoriesDB.update({ userId: user._id, _id: data.category._id }, { $set: { removed: true } })
                return res.send('ok')
            }
        }

        return res.status(400).send('Bad request')
    })

app.listen(3535)
console.log('Listening on port :3535')
