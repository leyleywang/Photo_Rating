<template>
  <div class="app-container">
    <nav class="navbar">
      <router-link to="/" class="navbar-brand">
        <div class="navbar-logo">P</div>
        <span class="navbar-title">Photo Rating</span>
      </router-link>
      <div class="navbar-nav">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          首页
        </router-link>
        <router-link to="/deai" class="nav-link" :class="{ active: $route.path === '/deai' }">
          去AI味
        </router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
