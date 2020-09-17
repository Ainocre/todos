import feathers from '@feathersjs/client'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'

const app = feathers()
const restClient = rest('http://localhost:3030')
app.configure(restClient.fetch(window.fetch))

app.configure(auth())

export default app
