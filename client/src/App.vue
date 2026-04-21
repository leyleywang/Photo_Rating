<template>
  <div class="app-container">
    <main class="main-content">
      <router-view />
    </main>
    <nav class="tab-bar">
      <router-link to="/" class="tab-item" :class="{ active: $route.path === '/' }">
        <span class="tab-icon">🏠</span>
        <span class="tab-label">首页</span>
      </router-link>
      <router-link to="/deai" class="tab-item" :class="{ active: $route.path === '/deai' }">
        <span class="tab-icon">✨</span>
        <span class="tab-label">去AI味</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
</script>
