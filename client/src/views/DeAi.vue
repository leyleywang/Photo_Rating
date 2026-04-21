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
    
    <div v-if="deaiImages.length > 0" class="image-list-section">
      <h2 class="image-list-title">
        <span>📚</span> 已处理图片
      </h2>
      <div class="image-list-grid">
        <div 
          v-for="image in deaiImages" 
          :key="image.id" 
          class="image-list-item"
          @click="openDeaiModal(image)"
        >
          <div class="image-list-preview">
            <div class="sample-image-placeholder" style="height: 150px;">
              🖼️
            </div>
            <div class="sample-image-placeholder" style="height: 150px;">
              ✨
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
import { ref, onMounted } from 'vue'
import { imageApi } from '../api/image'
import DeAiModal from '../components/DeAiModal.vue'

const deaiImages = ref([])
const deaiModalVisible = ref(false)
const selectedImage = ref(null)
const selectedImagePreview = ref('')
const fileInput = ref(null)
const loading = ref(false)
const dragover = ref(false)

onMounted(async () => {
  await loadDeaiImages()
})

const loadDeaiImages = async () => {
  try {
    const response = await imageApi.getDeaiImages()
    deaiImages.value = response.data || []
  } catch (error) {
    console.error('加载去AI味图片失败:', error)
    deaiImages.value = []
  }
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
    reader.onload = (e) => {
      selectedImagePreview.value = e.target?.result
    }
    reader.readAsDataURL(file)
    
    const formData = new FormData()
    formData.append('image', file)
    
    const uploadResponse = await imageApi.uploadImage(formData)
    selectedImage.value = uploadResponse.data
    deaiModalVisible.value = true
  } catch (error) {
    console.error('上传失败:', error)
    
    selectedImage.value = {
      id: 'deai-' + Date.now(),
      filename: file.name,
      originalName: file.name,
      uploadDate: new Date()
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
  selectedImagePreview.value = ''
  deaiModalVisible.value = true
}

const handleDeaiComplete = (image) => {
  const exists = deaiImages.value.find(img => img.id === image.id)
  if (!exists) {
    deaiImages.value.unshift(image)
  }
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
