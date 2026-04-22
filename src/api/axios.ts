import axios from 'axios'

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000
})

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Unknown error'
    console.error('[API Error]', message)
    return Promise.reject(new Error(message))
  }
)

export default api
