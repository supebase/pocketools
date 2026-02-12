import { useStorage, useIntervalFn } from '@vueuse/core'

// 定义存储结构：{ [postId]: expiresAt }
const COOLDOWN_STORAGE_KEY = 'app_cooldown_registry'

export const useCooldown = (id: string, duration = 30) => {
  // 所有组件共享同一个存储对象
  const registry = useStorage<Record<string, number>>(COOLDOWN_STORAGE_KEY, {})

  const remainingSeconds = ref(0)

  const updateRemaining = () => {
    const expiresAt = registry.value[id] || 0
    const diff = Math.ceil((expiresAt - Date.now()) / 1000)
    remainingSeconds.value = Math.max(0, diff)
  }

  const { pause, resume } = useIntervalFn(updateRemaining, 1000, {
    immediate: true,
    immediateCallback: true,
  })

  const startCooldown = () => {
    // 局部更新对象中的某个 key
    registry.value = {
      ...registry.value,
      [id]: Date.now() + duration * 1000
    }
    updateRemaining()
    resume()
  }

  watch(remainingSeconds, (val) => {
    if (val <= 0) {
      pause()
      // 如果冷却结束，从 registry 中删除该项以保持对象精简
      if (registry.value[id]) {
        const newRegistry = { ...registry.value }
        delete newRegistry[id]
        registry.value = newRegistry
      }
    } else {
      resume()
    }
  }, { immediate: true })

  return {
    remainingSeconds,
    startCooldown,
    isReady: computed(() => remainingSeconds.value <= 0),
  }
}