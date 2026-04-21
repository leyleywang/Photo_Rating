<template>
  <div class="deai-page">
    <div class="page-header">
      <h1 class="page-title">去AI味</h1>
      <p class="page-subtitle">上传图片，使用AI优化去除AI生成感</p>
    </div>
    
    <div 
      class="upload-area" 
      :class="{ dragover }"
      @click="triggerUpload"
      @dragover.prevent="dragover = true"
      @dragleave="dragover = false"
      @drop.prevent="handleDrop"
    >
      <div class="upload-icon">📤</div>
      <div class="upload-text">点击或拖拽图片到此处上传</div>
      <div class="upload-hint">支持 JPG、PNG、GIF、WebP 格式</div>
    </div>
    
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden-input" 
      accept="image/*"
      @change="handleFileSelect"
    />
    
    <div v-if="sortedDeaiImages.length > 0" class="image-list-section">
      <h2 class="image-list-title">
        <span>📚</span> 已处理图片
      </h2>
      <div class="image-list-grid">
        <div 
          v-for="image in sortedDeaiImages" 
          :key="image.id" 
          class="image-list-item"
          @click="openDeaiModal(image)"
        >
          <div class="image-list-preview">
            <div class="deai-image-box">
              <div class="image-label-small">原图</div>
              <img 
                v-if="getImageSrc(image, 'original')"
                :src="getImageSrc(image, 'original')" 
                alt="Original"
                class="deai-preview-image"
              />
              <div v-else class="image-placeholder">🖼️</div>
            </div>
            <div class="deai-image-box">
              <div class="image-label-small">去AI味</div>
              <img 
                v-if="getImageSrc(image, 'deai')"
                :src="getImageSrc(image, 'deai')" 
                alt="DeAI"
                class="deai-preview-image"
              />
              <div v-else-if="!image.deaiVersion" class="image-placeholder pending">⏳</div>
              <div v-else class="image-placeholder">🖼️</div>
            </div>
          </div>
          <div class="image-list-info">
            <div class="image-list-name">{{ image.originalName }}</div>
            <div class="image-list-date">{{ formatDate(image.uploadDate) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-state-icon">📁</div>
      <div class="empty-state-text">还没有处理过的图片，上传一张试试吧！</div>
    </div>
    
    <DeAiModal
      v-model:visible="deaiModalVisible"
      :image="selectedImage"
      :image-preview="selectedImagePreview"
      @deai-complete="handleDeaiComplete"
    />
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { imageApi } from '../api/image'
import DeAiModal from '../components/DeAiModal.vue'

const STORAGE_KEY = 'photo_rating_deai_images'
const STORAGE_PREVIEW_KEY = 'photo_rating_deai_previews'

const deaiImages = ref([])
const deaiModalVisible = ref(false)
const selectedImage = ref(null)
const selectedImagePreview = ref('')
const fileInput = ref(null)
const loading = ref(false)
const dragover = ref(false)

const imagePreviewCache = ref(new Map())

const sortedDeaiImages = computed(() => {
  return [...deaiImages.value].sort((a, b) => {
    const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0
    const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0
    return dateB - dateA
  })
})

onMounted(async () => {
  await loadDeaiImages()
  loadDeaiImagesFromStorage()
})

const loadDeaiImages = async () => {
  try {
    const response = await imageApi.getDeaiImages()
    if (response.data && response.data.length > 0) {
      response.data.forEach(img => {
        const exists = deaiImages.value.find(localImg => localImg.id === img.id)
        if (!exists) {
          deaiImages.value.push(img)
        }
      })
    }
  } catch (error) {
    console.error('加载去AI味图片失败:', error)
  }
}

const loadDeaiImagesFromStorage = () => {
  try {
    const storedImages = localStorage.getItem(STORAGE_KEY)
    const storedPreviews = localStorage.getItem(STORAGE_PREVIEW_KEY)
    
    if (storedImages) {
      const localImages = JSON.parse(storedImages)
      localImages.forEach(localImg => {
        const exists = deaiImages.value.find(img => img.id === localImg.id)
        if (!exists) {
          deaiImages.value.push(localImg)
        }
      })
    }
    
    if (storedPreviews) {
      const previews = JSON.parse(storedPreviews)
      previews.forEach(item => {
        imagePreviewCache.value.set(item.key, item.preview)
      })
    }
  } catch (error) {
    console.error('从localStorage加载去AI味图片失败:', error)
  }
}

const saveDeaiImagesToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deaiImages.value))
    
    const previews = []
    deaiImages.value.forEach(image => {
      const originalKey = `${image.id}-original`
      const deaiKey = `${image.id}-deai`
      
      if (imagePreviewCache.value.has(originalKey)) {
        previews.push({
          key: originalKey,
          preview: imagePreviewCache.value.get(originalKey)
        })
      }
      if (imagePreviewCache.value.has(deaiKey)) {
        previews.push({
          key: deaiKey,
          preview: imagePreviewCache.value.get(deaiKey)
        })
      }
    })
    localStorage.setItem(STORAGE_PREVIEW_KEY, JSON.stringify(previews))
  } catch (error) {
    console.error('保存去AI味图片到localStorage失败:', error)
  }
}

const getImageSrc = (image, type = 'original') => {
  const cacheKey = `${image.id}-${type}`
  if (imagePreviewCache.value.has(cacheKey)) {
    return imagePreviewCache.value.get(cacheKey)
  }
  if (type === 'original' && image.filename) {
    return `http://localhost:3000/uploads/${image.filename}`
  }
  if (type === 'deai' && image.deaiVersion) {
    return `http://localhost:3000/uploads/${image.deaiVersion}`
  }
  return ''
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleDrop = (event) => {
  dragover.value = false
  const files = event.dataTransfer?.files
  if (files?.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file) => {
  loading.value = true
  
  try {
    const reader = new FileReader()
    const previewPromise = new Promise((resolve) => {
      reader.onload = (e) => {
        selectedImagePreview.value = e.target?.result
        resolve(e.target?.result)
      }
    })
    reader.readAsDataURL(file)
    const preview = await previewPromise
    
    const formData = new FormData()
    formData.append('image', file)
    
    const uploadResponse = await imageApi.uploadImage(formData)
    selectedImage.value = uploadResponse.data
    
    if (preview) {
      const originalKey = `${selectedImage.value.id}-original`
      const deaiKey = `${selectedImage.value.id}-deai`
      imagePreviewCache.value.set(originalKey, preview)
      imagePreviewCache.value.set(deaiKey, preview)
    }
    
    const exists = deaiImages.value.find(img => img.id === selectedImage.value.id)
    if (!exists) {
      deaiImages.value.unshift(selectedImage.value)
      saveDeaiImagesToStorage()
    }
    
    deaiModalVisible.value = true
  } catch (error) {
    console.error('上传失败:', error)
    
    const reader = new FileReader()
    const previewPromise = new Promise((resolve) => {
      reader.onload = (e) => {
        selectedImagePreview.value = e.target?.result
        resolve(e.target?.result)
      }
    })
    reader.readAsDataURL(file)
    const preview = await previewPromise
    
    selectedImage.value = {
      id: 'deai-' + Date.now(),
      filename: file.name,
      originalName: file.name,
      uploadDate: new Date()
    }
    
    if (preview) {
      const originalKey = `${selectedImage.value.id}-original`
      const deaiKey = `${selectedImage.value.id}-deai`
      imagePreviewCache.value.set(originalKey, preview)
      imagePreviewCache.value.set(deaiKey, preview)
    }
    
    const exists = deaiImages.value.find(img => img.id === selectedImage.value.id)
    if (!exists) {
      deaiImages.value.unshift(selectedImage.value)
      saveDeaiImagesToStorage()
    }
    
    deaiModalVisible.value = true
  } finally {
    loading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const openDeaiModal = (image) => {
  selectedImage.value = image
  const originalSrc = getImageSrc(image, 'original')
  if (originalSrc && imagePreviewCache.value.has(`${image.id}-original`)) {
    selectedImagePreview.value = imagePreviewCache.value.get(`${image.id}-original`)
  } else {
    selectedImagePreview.value = originalSrc
  }
  deaiModalVisible.value = true
}

const handleDeaiComplete = (image) => {
  const exists = deaiImages.value.findIndex(img => img.id === image.id)
  if (exists === -1) {
    deaiImages.value.unshift(image)
  } else {
    deaiImages.value[exists] = image
  }
  saveDeaiImagesToStorage()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.deai-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: var(--bg-secondary);
}

.image-label-small {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 1;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--bg-secondary);
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.image-placeholder.pending {
  opacity: 0.5;
}
</style>
