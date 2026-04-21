import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const imageApi = {
  getHighScoreImages() {
    return apiClient.get('/images/high-score')
  },

  getImageById(id) {
    return apiClient.get(`/images/${id}`)
  },

  uploadImage(formData) {
    return apiClient.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  rateImage(id) {
    return apiClient.post(`/images/${id}/rate`)
  },

  generatePrompt(id) {
    return apiClient.post(`/images/${id}/generate-prompt`)
  },

  deaiImage(id) {
    return apiClient.post(`/images/${id}/deai`)
  },

  getDeaiImages() {
    return apiClient.get('/images/deai/list')
  }
}
