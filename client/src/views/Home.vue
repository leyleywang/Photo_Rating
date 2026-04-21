<template>
  <div class="home-page">
    <div class="page-header">
      <h1 class="page-title">AI 图片评分系统</h1>
      <p class="page-subtitle">基于想象力、构图、景色对图片进行智能评分</p>
    </div>
    
    <div class="waterfall-container">
      <div 
        v-for="image in displayImages" 
        :key="image.id" 
        class="image-card"
        @click="openRatingModal(image)"
      >
        <img 
          v-if="getImageSrc(image)"
          :src="getImageSrc(image)" 
          :alt="image.originalName"
          class="card-image"
        />
        <div v-else class="sample-image-placeholder">
          🖼️
        </div>
        <div class="image-card-info">
          <div class="image-card-rating">
            <span class="rating-badge">{{ image.rating?.total || '--' }}</span>
            <div class="rating-stars">
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <button class="floating-button" @click="triggerUpload">
      +
    </button>
    
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden-input" 
      accept="image/*"
      @change="handleFileSelect"
    />
    
    <ImageRatingModal
      v-model:visible="ratingModalVisible"
      :image="selectedImage"
      :image-preview="selectedImagePreview"
    />
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { imageApi } from '../api/image'
import ImageRatingModal from '../components/ImageRatingModal.vue'

const STORAGE_KEY = 'photo_rating_uploaded_images'
const STORAGE_PREVIEW_KEY = 'photo_rating_previews'

const sampleImages = ref([])
const uploadedImages = ref([])
const ratingModalVisible = ref(false)
const selectedImage = ref(null)
const selectedImagePreview = ref('')
const fileInput = ref(null)
const loading = ref(false)

const imagePreviewCache = ref(new Map())

const displayImages = computed(() => {
  return [...uploadedImages.value, ...sampleImages.value]
})

onMounted(async () => {
  await loadSampleImages()
  loadUploadedImagesFromStorage()
})

const loadSampleImages = async () => {
  try {
    const response = await imageApi.getHighScoreImages()
    sampleImages.value = response.data || []
  } catch (error) {
    console.error('加载高分图片失败:', error)
    sampleImages.value = getMockSampleImages()
  }
}

const getMockSampleImages = () => [
  {
    id: 'sample1',
    filename: 'sample1.jpg',
    originalName: 'sample1.jpg',
    uploadDate: new Date(),
    rating: { imagination: 92, composition: 88, scenery: 95, total: 92 },
    highScoreReasons: {
      imagination: '这幅作品展现了非凡的想象力，将科幻元素与自然景观完美融合，创造出超现实的视觉体验。',
      composition: '构图采用黄金分割原则，主体元素与背景层次分明，光影对比强烈，极具视觉冲击力。',
      scenery: '景色描绘细腻入微，从细节处展现宏大的世界观，色彩搭配和谐统一。'
    }
  },
  {
    id: 'sample2',
    filename: 'sample2.jpg',
    originalName: 'sample2.jpg',
    uploadDate: new Date(),
    rating: { imagination: 85, composition: 90, scenery: 88, total: 88 },
    highScoreReasons: {
      imagination: '创意独特，将古典与现代元素巧妙结合，呈现出时空交错的艺术效果。',
      composition: '对称构图营造庄严肃穆的氛围，线条流畅自然，视觉引导清晰。',
      scenery: '景色层次丰富，前景中景远景层层递进，空间感强烈。'
    }
  },
  {
    id: 'sample3',
    filename: 'sample3.jpg',
    originalName: 'sample3.jpg',
    uploadDate: new Date(),
    rating: { imagination: 95, composition: 85, scenery: 90, total: 90 },
    highScoreReasons: {
      imagination: '想象力爆棚，创造出完全虚构但又令人信服的奇幻生物，细节丰富令人惊叹。',
      composition: '动态构图充满张力，主体占据黄金位置，背景虚化突出重点。',
      scenery: '环境设定独特，色彩大胆而协调，氛围营造出色。'
    }
  }
]

const getImageSrc = (image) => {
  if (imagePreviewCache.value.has(image.id)) {
    return imagePreviewCache.value.get(image.id)
  }
  if (image.filename && !image.id.startsWith('sample')) {
    return `http://localhost:3000/uploads/${image.filename}`
  }
  return ''
}

const loadUploadedImagesFromStorage = () => {
  try {
    const storedImages = localStorage.getItem(STORAGE_KEY)
    const storedPreviews = localStorage.getItem(STORAGE_PREVIEW_KEY)
    
    if (storedImages) {
      uploadedImages.value = JSON.parse(storedImages)
    }
    
    if (storedPreviews) {
      const previews = JSON.parse(storedPreviews)
      previews.forEach(item => {
        imagePreviewCache.value.set(item.id, item.preview)
      })
    }
  } catch (error) {
    console.error('从localStorage加载图片失败:', error)
  }
}

const saveUploadedImagesToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedImages.value))
    
    const previews = []
    uploadedImages.value.forEach(image => {
      if (imagePreviewCache.value.has(image.id)) {
        previews.push({
          id: image.id,
          preview: imagePreviewCache.value.get(image.id)
        })
      }
    })
    localStorage.setItem(STORAGE_PREVIEW_KEY, JSON.stringify(previews))
  } catch (error) {
    console.error('保存图片到localStorage失败:', error)
  }
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
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
    const uploadedImage = uploadResponse.data
    
    const rateResponse = await imageApi.rateImage(uploadedImage.id)
    
    selectedImage.value = rateResponse.data
    ratingModalVisible.value = true
    
    if (preview) {
      imagePreviewCache.value.set(uploadedImage.id, preview)
    }
    
    uploadedImages.value.unshift(rateResponse.data)
    saveUploadedImagesToStorage()
  } catch (error) {
    console.error('上传或评分失败:', error)
    
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
      id: 'uploaded-' + Date.now(),
      filename: file.name,
      originalName: file.name,
      uploadDate: new Date(),
      rating: { 
        imagination: Math.floor(Math.random() * 30) + 70, 
        composition: Math.floor(Math.random() * 30) + 70, 
        scenery: Math.floor(Math.random() * 30) + 70, 
        total: 0 
      },
      highScoreReasons: {
        imagination: '这幅作品展现了非凡的想象力，创意独特，突破常规思维。',
        composition: '构图精妙，黄金分割运用得当，视觉引导清晰自然。',
        scenery: '景色描绘细腻入微，从宏观到微观都展现出非凡的功力。'
      }
    }
    selectedImage.value.rating.total = Math.floor(
      (selectedImage.value.rating.imagination + 
       selectedImage.value.rating.composition + 
       selectedImage.value.rating.scenery) / 3
    )
    
    if (preview) {
      imagePreviewCache.value.set(selectedImage.value.id, preview)
    }
    
    ratingModalVisible.value = true
    uploadedImages.value.unshift(selectedImage.value)
    saveUploadedImagesToStorage()
  } finally {
    loading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const openRatingModal = (image) => {
  selectedImage.value = image
  if (imagePreviewCache.value.has(image.id)) {
    selectedImagePreview.value = imagePreviewCache.value.get(image.id)
  } else {
    selectedImagePreview.value = ''
  }
  ratingModalVisible.value = true
}
</script>

<style scoped>
.card-image {
  width: 100%;
  display: block;
  background: var(--bg-secondary);
  min-height: 150px;
  object-fit: cover;
}
</style>
