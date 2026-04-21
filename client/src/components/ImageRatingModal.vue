<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="close">&times;</button>
        
        <div class="modal-image-container">
          <div v-if="isSampleImage" class="sample-image-placeholder">
            🖼️
          </div>
          <img 
            v-else
            :src="imagePreview" 
            :alt="image?.originalName || 'Image'" 
            class="modal-image"
          />
        </div>
        
        <div class="modal-body">
          <h2 class="modal-title">图片评分详情</h2>
          
          <div v-if="image?.rating" class="rating-section">
            <div class="rating-item">
              <span class="rating-label">想象力</span>
              <div class="rating-value">
                <div class="rating-bar">
                  <div class="rating-bar-fill" :style="{ width: image.rating.imagination + '%' }"></div>
                </div>
                <span class="rating-number">{{ image.rating.imagination }}</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">构图</span>
              <div class="rating-value">
                <div class="rating-bar">
                  <div class="rating-bar-fill" :style="{ width: image.rating.composition + '%' }"></div>
                </div>
                <span class="rating-number">{{ image.rating.composition }}</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">景色</span>
              <div class="rating-value">
                <div class="rating-bar">
                  <div class="rating-bar-fill" :style="{ width: image.rating.scenery + '%' }"></div>
                </div>
                <span class="rating-number">{{ image.rating.scenery }}</span>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">总分</span>
              <span class="rating-number" style="font-size: 1.5rem;">{{ image.rating.total }}</span>
            </div>
          </div>
          
          <div v-if="image?.highScoreReasons" class="reasons-section">
            <h3 style="margin-bottom: 1rem; font-weight: 600;">高分原因</h3>
            <div class="reason-item">
              <div class="reason-title">🎨 想象力</div>
              <div class="reason-text">{{ image.highScoreReasons.imagination }}</div>
            </div>
            <div class="reason-item">
              <div class="reason-title">📐 构图</div>
              <div class="reason-text">{{ image.highScoreReasons.composition }}</div>
            </div>
            <div class="reason-item">
              <div class="reason-title">🌄 景色</div>
              <div class="reason-text">{{ image.highScoreReasons.scenery }}</div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              class="btn btn-primary" 
              @click="handleGeneratePrompt"
              :disabled="generatingPrompt || !image?.id"
            >
              {{ generatingPrompt ? '生成中...' : '生成提示词' }}
            </button>
            <button class="btn btn-secondary" @click="close">关闭</button>
          </div>
          
          <div v-if="image?.prompt" class="prompt-section">
            <span class="prompt-label">📝 生成的提示词</span>
            <div class="prompt-text">{{ image.prompt }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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

const emit = defineEmits(['update:visible', 'close'])

const generatingPrompt = ref(false)

const isSampleImage = computed(() => {
  return props.image?.id?.startsWith('sample')
})

const close = () => {
  emit('update:visible', false)
  emit('close')
}

const handleGeneratePrompt = async () => {
  if (!props.image?.id || generatingPrompt.value) return
  
  generatingPrompt.value = true
  try {
    const response = await imageApi.generatePrompt(props.image.id)
    if (response.data?.prompt) {
      props.image.prompt = response.data.prompt
    }
  } catch (error) {
    console.error('生成提示词失败:', error)
  } finally {
    generatingPrompt.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.image) {
    generatingPrompt.value = false
  }
})
</script>
