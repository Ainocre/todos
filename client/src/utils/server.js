import axios from 'axios'

const server = {
    query({ route, fields }) {
        return axios.post(`${process.env.API}${route}`, {
            token: localStorage.todoToken,
            ...fields
        })
    },
    ql({ service, method, data }) {
        return axios.post(`${process.env.API}/api`, {
            token: localStorage.todoToken,
            service,
            method,
            data,
        })
    },
}

export default server
