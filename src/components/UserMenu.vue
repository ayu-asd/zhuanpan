<template>
  <div class="user-menu">
    <button v-if="!user" class="btn btn-ghost btn-sm" @click="$emit('login')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      登录
    </button>

    <div v-else class="user-menu-logged">
      <img
        class="user-avatar"
        :src="user.avatar_url"
        :alt="user.login"
        @click="menuOpen = !menuOpen"
      />
      <transition name="dropdown">
        <div v-if="menuOpen" class="user-dropdown" @click.self="menuOpen = false">
          <div class="user-dropdown-info">
            <img class="user-dropdown-avatar" :src="user.avatar_url" />
            <div>
              <div class="user-dropdown-name">{{ user.name }}</div>
              <div class="user-dropdown-login">@{{ user.login }}</div>
            </div>
          </div>
          <div class="user-dropdown-cloud">
            <span class="cloud-dot"></span>
            云端已同步
          </div>
          <button class="user-dropdown-item danger" @click="$emit('logout'); menuOpen = false">
            退出登录
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  user: { type: Object, default: null }
})

defineEmits(['login', 'logout'])

const menuOpen = ref(false)
</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu-logged {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid var(--border-color);
  transition: border-color 0.2s ease;
}

.user-avatar:hover {
  border-color: var(--accent-1);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px;
  z-index: 100;
  box-shadow: var(--shadow-lg);
}

.user-dropdown-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.user-dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-dropdown-name {
  font-weight: 600;
  font-size: 0.85rem;
}

.user-dropdown-login {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.user-dropdown-cloud {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--accent-4);
  padding: 6px 0;
}

.cloud-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-4);
  animation: pulse 2s infinite;
}

.user-dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--text-primary);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.8rem;
  transition: background 0.2s ease;
}

.user-dropdown-item:hover {
  background: var(--input-bg);
}

.user-dropdown-item.danger:hover {
  color: var(--accent-2);
  background: rgba(255, 0, 0, 0.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
