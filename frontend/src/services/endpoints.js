import client from './api'

export const authAPI = {
  login: (credentials) => client.post('/Auth/Login.php', credentials),
  register: (userData) => client.post('/Auth/Register.php', userData),
  logout: () => client.post('/Auth/Logout.php')
}

export const transactionsAPI = {
  getAll: () => client.get('/transactions'),
  getById: (id) => client.get(`/transactions/${id}`),
  create: (data) => client.post('/transactions', data),
  update: (id, data) => client.put(`/transactions/${id}`, data),
  delete: (id) => client.delete(`/transactions/${id}`),
  getBalance: () => client.get('/transactions/balance')
}

export const categoriesAPI = {
  getAll: () => client.get('/categories'),
  getSubcategories: (categoryId) => client.get(`/categories/${categoryId}/subcategories`)
}

export const importAPI = {
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/import/transactions', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
