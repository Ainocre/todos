import feathers from '@feathersjs/client'
import rest from '@feathersjs/rest-client'

const app = feathers()
const restClient = rest('http://localhost:3030')
app.configure(restClient.fetch(window.fetch))

export default app
