import axios from 'axios'
const backendAxios = axios.create({
    baseURL: process.env.VUE_APP_Backend_BaseUrl
})
export default backendAxios
