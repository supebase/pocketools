import type { AuthRecord } from 'pocketbase'

export const useAuth = () => {
  const { $pb } = useNuxtApp()

  const user = useState<AuthRecord | null>('pb_user', () => null)
  const isReady = useState('pb_auth_ready', () => false)

  const init = () => {
    if (import.meta.server || !$pb || isReady.value) return

    // 同步获取当前状态
    user.value = $pb.authStore.record as AuthRecord

    // 监听变化
    $pb.authStore.onChange((_token, record) => {
      user.value = record as AuthRecord
    }, true)

    isReady.value = true
  }

  const logout = () => {
    $pb?.authStore.clear()
    user.value = null
  }

  return {
    user,
    isLoggedIn: computed(() => !!user.value),
    isReady,
    init,
    logout,
  }
}
