import { useStorage, useIntervalFn } from '@vueuse/core'

export const useCooldown = (key: string, duration = 30) => {
  const expiresAt = useStorage<number>(`cd_timestamp_${key}`, 0)
  const remainingSeconds = ref(0)

  // 计算剩余秒数的函数
  const updateRemaining = () => {
    const diff = Math.ceil((expiresAt.value - Date.now()) / 1000)
    remainingSeconds.value = Math.max(0, diff)
  }

  // 每秒执行一次
  const { pause, resume } = useIntervalFn(updateRemaining, 1000, {
    immediate: true,
    immediateCallback: true,
  })

  // 开始冷却
  const startCooldown = () => {
    expiresAt.value = Date.now() + duration * 1000
    updateRemaining()
    resume()
  }

  // 监听剩余时间，如果归零则停止定时器节省资源
  watch(remainingSeconds, (val) => {
    if (val <= 0) pause()
    else resume()
  }, { immediate: true })

  return {
    remainingSeconds,
    startCooldown,
    isReady: computed(() => remainingSeconds.value <= 0),
  }
}
