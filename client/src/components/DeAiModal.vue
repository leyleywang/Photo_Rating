<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="close">&times;</button>
        
        <div class="modal-body">
          <h2 class="modal-title">去AI味处理</h2>
          
          <div v-if="image?.deaiVersion" class="deai-images-container">
            <div class="deai-images-grid">
              <div class="deai-image-box">
                <div class="deai-image-label">原图</div>
                <img :src="imagePreview" alt="Original" />
              </div>
              <div class="deai-image-box">
                <div class="deai-image-label">去AI味后</div>
                <img :src="deaiPreview" alt="DeAI Version" />
              </div>
            </div>
          </div>
          
          <div v-else class="deai-modal-content">
            <div class="deai-preview">
              <img :src="imagePreview" alt="Uploaded image" />
            </div>
            
            <div class="deai-actions">
              <button 
                class="btn btn-primary" 
                @click="handleDeai"
                :disabled="processing || !image?.id"
              >
                {{ processing ? 'AI优化中...' : '去AI味' }}
              </button>
              <button class="btn btn-secondary" @click="close">关闭</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { imageApi } from '../api/image'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  image: {
    type: Object,
    default: null
  },
  imagePreview: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'close', 'deai-complete'])

const processing = ref(false)

const deaiPreview = ref('')

const close = () => {
  emit('update:visible', false)
  emit('close')
}

const handleDeai = async () => {
  if (!props.image?.id || processing.value) return
  
  processing.value = true
  try {
    const response = await imageApi.deaiImage(props.image.id)
    if (response.data?.deaiVersion) {
      props.image.deaiVersion = response.data.deaiVersion
      deaiPreview.value = props.imagePreview
      emit('deai-complete', props.image)
    }
  } catch (error) {
    console.error('去AI味处理失败:', error)
  } finally {
    processing.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    processing.value = false
    if (props.image?.deaiVersion) {
      deaiPreview.value = props.imagePreview
    } else {
      deaiPreview.value = ''
    }
  }
})
</script>
