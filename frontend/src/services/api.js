import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/register pages to avoid loops
      if (!window.location.pathname.match(/^\/(login|register)/)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => client.post('/Auth/Login.php', credentials),
  register: (userData) => client.post('/Auth/Register.php', userData),
  logout: () => client.post('/Auth/Logout.php'),
}

export const transactionAPI = {
  getAll: () => client.get('/transactions'),
  getById: (id) => client.get(`/transactions/${id}`),
  create: (data) => client.post('/transactions', data),
  update: (id, data) => client.put(`/transactions/${id}`, data),
  delete: (id) => client.delete(`/transactions/${id}`),
  getBalance: () => client.get('/transactions/balance'),
}

export const categoryAPI = {
  getAll: () => client.get('/categories'),
  getSubcategories: (categoryId) => client.get(`/categories/${categoryId}/subcategories`),
}

export const importAPI = {
  uploadTransactions: (file) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/import/transactions', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  importText: (text) => client.post('/import/text', { text }),
}

export default client
